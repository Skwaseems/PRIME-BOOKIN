const crypto = require('crypto');
const express = require('express');
const { z } = require('zod');
const config = require('../config');
const Enquiry = require('../models/Enquiry');
const Listing = require('../models/Listing');
const { getSettings, deliveryFee } = require('../models/Settings');
const { optionalAuth } = require('../middleware/auth');
const { HttpError, validate } = require('../middleware/errors');
const live = require('../live');
const maps = require('../maps');
const jobs = require('../jobs');
const { anonymize } = require('../privacy');

const router = express.Router();
const DAY = 24 * 60 * 60 * 1000;

// Room options offered when reserving a stay, as a multiplier of the listed rate.
const ROOM_TYPES = {
  'Standard Room': 1,
  'Deluxe Room': 1.25,
  'Super Deluxe Suite': 1.6,
};
// Each room sleeps 2, plus 1 more on an extra bed ("2+1").
const PER_ROOM = 2;
const EXTRA_PER_ROOM = 1;
const DEFAULT_EXTRA_BED_PRICE = 800;

const indianMobile = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s-]/g, '').replace(/^(\+?91)(?=\d{10}$)/, ''))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'));

const place = z.object({
  label: z.string().trim().min(1).max(200),
  address: z.string().trim().max(400).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const consent = z.literal(true, { errorMap: () => ({ message: 'Please accept the Terms & Privacy Policy' }) });
const name = z.string().trim().min(2, 'Enter your name').max(80);
const text = z.string().trim().min(2, 'Please type your request').max(2000);

// Customer and delivery details needed for anything delivered to a door.
const deliveryTo = {
  customerName: name,
  phone: indianMobile,
  address: z.string().trim().min(5, 'Enter the delivery address / landmark').max(300),
  location: place,
  consent,
};

const basketItems = z
  .array(z.object({ listing: z.string(), quantity: z.number().int().min(1).max(50) }))
  .min(1, 'Your basket is empty')
  .max(50);

const body = z.discriminatedUnion('type', [
  z.object({ type: z.literal('basket'), items: basketItems, ...deliveryTo }),
  z.object({
    type: z.literal('medicine'),
    text: z.string().trim().max(2000).default(''),
    // Compressed photo from the app, as a data URL (about 3 MB max).
    image: z.string().regex(/^data:image\/(jpeg|png|webp);base64,/, 'Unsupported image').max(4_000_000).optional(),
    ...deliveryTo,
  }),
  z.object({
    type: z.literal('stay'),
    listing: z.string(),
    roomType: z.enum(Object.keys(ROOM_TYPES)),
    rooms: z.number().int().min(1).max(10),
    guests: z.number().int().min(1).max(30),
    guestNames: z.array(z.string().trim().max(80)).max(30),
    phone: indianMobile,
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    consent,
  }),
  z.object({
    type: z.literal('cab'),
    pickup: place,
    drop: place,
    vehicle: z.string(),
    customerName: name,
    phone: indianMobile,
    consent,
  }),
  z.object({ type: z.literal('food-custom'), text, phone: indianMobile.optional() }),
]);

router.get('/options', async (_req, res) => {
  const s = await getSettings();
  res.json({
    roomTypes: ROOM_TYPES,
    perRoom: PER_ROOM,
    extraPerRoom: EXTRA_PER_ROOM,
    defaultExtraBedPrice: DEFAULT_EXTRA_BED_PRICE,
    delivery: {
      baseKm: s.delivery.baseKm,
      baseFare: s.delivery.baseFare,
      perKm: s.delivery.perKm,
      foodMaxKm: s.delivery.foodMaxKm,
      medicineMaxKm: s.delivery.medicineMaxKm,
    },
    cabVehicles: s.cab.vehicles,
    retentionDays: s.privacy.retentionDays,
  });
});

// Prices a basket from the database. One store per basket; distance from the store
// to the customer's pin decides the delivery charge (and whether it's in range).
async function priceBasket(items, location) {
  const s = await getSettings();
  const ids = [...new Set(items.map((i) => i.listing))];
  const listings = await Listing.find({ _id: { $in: ids }, isAvailable: true }).populate('partner', 'businessName status isOpen location type');
  const byId = new Map(listings.map((l) => [l.id, l]));
  const lines = items.map((i) => {
    const l = byId.get(i.listing);
    if (!l || l.partner?.status !== 'approved') throw new HttpError(400, 'Some items in your basket are no longer available');
    if (!['food', 'medicine'].includes(l.service)) throw new HttpError(400, 'Only food and medicines can be delivered');
    return { l, quantity: i.quantity };
  });
  const stores = new Set(lines.map(({ l }) => String(l.partner._id)));
  if (stores.size > 1) throw new HttpError(400, 'Your basket can only have items from one restaurant or store at a time');
  const store = lines[0].l.partner;
  if (!store.isOpen) throw new HttpError(400, `${store.businessName} is closed right now`);

  const subtotal = lines.reduce((sum, { l, quantity }) => sum + l.price * quantity, 0);
  let distance = null;
  let fee = null;
  if (location && store.location?.lat != null) {
    distance = await maps.route(store.location, location);
    const maxKm = lines[0].l.service === 'food' ? s.delivery.foodMaxKm : s.delivery.medicineMaxKm;
    if (distance.distanceKm > maxKm) {
      throw new HttpError(400, `${store.businessName} delivers within ${maxKm} km. Your address is ${distance.distanceKm} km away.`);
    }
    fee = deliveryFee(distance.distanceKm, s.delivery);
  }
  return {
    store,
    items: lines.map(({ l, quantity }) => ({ listing: l._id, name: l.name, service: l.service, price: l.price, quantity, partnerName: store.businessName })),
    subtotal,
    distanceKm: distance?.distanceKm ?? null,
    approximate: distance?.approximate ?? false,
    deliveryFee: fee,
  };
}

// Checkout preview: totals and delivery charge for the pinned address.
router.post('/quote', validate(z.object({ items: basketItems, location: place.optional() })), async (req, res) => {
  const q = await priceBasket(req.body.items, req.body.location);
  res.json({
    storeName: q.store.businessName,
    subtotal: q.subtotal,
    distanceKm: q.distanceKm,
    approximate: q.approximate,
    deliveryFee: q.deliveryFee,
    total: q.deliveryFee == null ? null : q.subtotal + q.deliveryFee,
  });
});

// Records the request, alerts whoever should handle it, and returns it with
// server-calculated totals. The app then opens WhatsApp with the message.
router.post('/', optionalAuth, validate(body), async (req, res) => {
  const b = req.body;
  const s = await getSettings();
  const e = new Enquiry({ type: b.type, customer: req.user?._id, consentAt: b.consent ? new Date() : undefined });

  if (b.type === 'basket' || b.type === 'medicine') {
    Object.assign(e, { customerName: b.customerName, contactPhone: b.phone, address: b.address, location: b.location });
  }

  if (b.type === 'basket') {
    const q = await priceBasket(b.items, b.location);
    if (q.deliveryFee == null) throw new HttpError(400, 'This store has not set its location yet. Please order on WhatsApp.');
    Object.assign(e, { items: q.items, partner: q.store._id, subtotal: q.subtotal, distanceKm: q.distanceKm, deliveryFee: q.deliveryFee });
  } else if (b.type === 'medicine') {
    if (!b.text && !b.image) throw new HttpError(400, 'Type your medicines or add a prescription photo');
    e.text = b.text;
    if (b.image) {
      e.image = b.image;
      e.hasImage = true;
    }
    // Price and delivery charge are added when a pharmacy accepts it.
  } else if (b.type === 'stay') {
    const listing = await Listing.findOne({ _id: b.listing, service: 'stay', isAvailable: true });
    if (!listing) throw new HttpError(400, 'This stay is no longer available');
    const nights = Math.round((Date.parse(b.checkOut) - Date.parse(b.checkIn)) / DAY);
    if (nights < 1) throw new HttpError(400, 'Check-out must be after check-in');
    if (Date.parse(b.checkIn) < Date.now() - DAY) throw new HttpError(400, 'Check-in cannot be in the past');
    if (b.guests > b.rooms * (PER_ROOM + EXTRA_PER_ROOM)) {
      throw new HttpError(400, `Up to ${PER_ROOM}+${EXTRA_PER_ROOM} guests per room. Add another room.`);
    }
    const guestNames = b.guestNames.filter(Boolean);
    if (!guestNames.length) throw new HttpError(400, 'Enter the main guest name');
    const extraBeds = Math.max(0, b.guests - b.rooms * PER_ROOM);
    const extraBedPrice = Number(listing.details?.extraBedPrice ?? DEFAULT_EXTRA_BED_PRICE);
    e.stay = { listing: listing._id, name: listing.name, roomType: b.roomType, rooms: b.rooms, guests: b.guests, extraBeds, guestNames, checkIn: b.checkIn, checkOut: b.checkOut, nights };
    e.partner = listing.partner;
    e.customerName = guestNames[0];
    e.contactPhone = b.phone;
    e.subtotal = Math.round(listing.price * ROOM_TYPES[b.roomType] * b.rooms * nights + extraBedPrice * extraBeds * nights);
  } else if (b.type === 'cab') {
    const vehicle = maps.vehicleOrThrow(b.vehicle, s.cab.vehicles);
    const r = await maps.route(b.pickup, b.drop);
    if (r.distanceKm < 0.5) throw new HttpError(400, 'Pickup and drop are the same place');
    e.cab = { pickup: b.pickup, drop: b.drop, vehicle: vehicle.label, vehicleKey: vehicle.key, distanceKm: r.distanceKm, durationMin: r.durationMin, approximate: r.approximate };
    e.customerName = b.customerName;
    e.contactPhone = b.phone;
    e.subtotal = maps.fareFor(vehicle, r.distanceKm);
  } else {
    e.text = b.text;
    e.contactPhone = b.phone;
  }

  e.total = e.subtotal + e.deliveryFee;
  await e.save();

  jobs.notify(e);
  if (e.partner) live.publish([e.partner], 'job', { id: String(e._id), code: e.code, type: e.type });
  else await jobs.dispatch(e); // medicine -> pharmacies, cab -> nearby drivers

  const secrets = await Enquiry.findById(e._id).select('+otp +accessKey');
  res.status(201).json({ enquiry: e, accessKey: secrets.accessKey, otp: secrets.otp, whatsapp: config.supportWhatsapp });
});

// Requests for the Bookings screen on the device that sent them.
// Body: { keys: ["<id>:<accessKey>", ...] }. Unknown or wrong keys are skipped.
const keyPair = z.string().regex(/^[a-f0-9]{24}:[a-f0-9]{32}$/);

router.post('/lookup', validate(z.object({ keys: z.array(keyPair).max(100) })), async (req, res) => {
  const wanted = new Map(req.body.keys.map((k) => k.split(':')));
  if (!wanted.size) return res.json({ enquiries: [] });
  const found = await Enquiry.find({ _id: { $in: [...wanted.keys()] } })
    .select('+accessKey +otp -customer')
    .populate('partner', 'businessName phone address')
    .populate('rider', 'businessName phone')
    .populate('driver', 'businessName phone vehicle')
    .sort('-createdAt');
  res.json({
    enquiries: found
      .filter((e) => wanted.get(e.id) === e.accessKey)
      .map((e) => ({ ...e.toJSON(), otp: jobs.isFinal(e.status) ? undefined : e.otp })),
  });
});

const keyBody = z.object({ key: z.string().regex(/^[a-f0-9]{32}$/, 'Invalid key') });

async function ownEnquiry(req) {
  const e = await Enquiry.findById(req.params.id).select('+accessKey');
  if (!e || !crypto.timingSafeEqual(Buffer.from(e.accessKey), Buffer.from(req.body.key))) {
    throw new HttpError(404, 'Request not found');
  }
  return e;
}

router.post('/:id/cancel', validate(keyBody), async (req, res) => {
  const e = await ownEnquiry(req);
  await jobs.transition(e, 'customer', 'cancelled', { by: 'customer' });
  res.json({ enquiry: e });
});

// "Delete my data": removes the customer's personal details from a finished request.
router.post('/:id/forget', validate(keyBody), async (req, res) => {
  const e = await ownEnquiry(req);
  if (!jobs.isFinal(e.status)) throw new HttpError(400, 'Cancel or finish this request before deleting your details');
  await anonymize([e._id]);
  res.json({ ok: true });
});

// The prescription photo, linked from the WhatsApp message (needs the request's key).
router.get('/:id/image', async (req, res) => {
  const e = await Enquiry.findById(req.params.id).select('+image +accessKey');
  if (!e?.image || String(req.query.key || '') !== e.accessKey) throw new HttpError(404, 'No image');
  sendDataUrl(res, e.image);
});

function sendDataUrl(res, dataUrl) {
  const [, mime, data] = String(dataUrl).match(/^data:([\w/+.-]+);base64,(.*)$/s) || [];
  if (!data) throw new HttpError(404, 'No file');
  res.set('Cache-Control', 'private, max-age=3600');
  res.type(mime).send(Buffer.from(data, 'base64'));
}

module.exports = router;
module.exports.sendDataUrl = sendDataUrl;
