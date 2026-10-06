const express = require('express');
const { z } = require('zod');
const User = require('../models/User');
const Partner = require('../models/Partner');
const Listing = require('../models/Listing');
const { getSettings } = require('../models/Settings');
const live = require('../live');
const { signToken, requireAuth } = require('../middleware/auth');
const { HttpError, validate } = require('../middleware/errors');

const router = express.Router();
const { SERVICE_BY_TYPE, DOCUMENTS_BY_TYPE } = Partner;

const point = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });

const profileFields = {
  businessName: z.string().trim().min(2, 'Enter the business / your name'),
  description: z.string().trim().max(1000).optional(),
  phone: z.string().trim().max(15).optional(),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(60).optional(),
  mapUrl: z.string().trim().url().optional().or(z.literal('')),
  image: z.string().max(3_000_000).optional(), // data URL or https link
  location: point.optional(),
  prepTimeMin: z.number().int().min(5).max(180).optional(),
  vehicle: z
    .object({ type: z.string(), number: z.string().trim().max(20), model: z.string().trim().max(60).optional() })
    .optional(),
};

const documents = z
  .array(
    z.object({
      label: z.string().trim().min(2).max(80),
      number: z.string().trim().max(40).optional(),
      // Photo or PDF as a data URL, about 2 MB each.
      file: z
        .string()
        .regex(/^data:(image\/(jpeg|png|webp)|application\/pdf);base64,/, 'Upload a photo or PDF')
        .max(2_800_000, 'Each document must be under 2 MB'),
    }),
  )
  .max(8);

const application = z.object({
  type: z.enum(Object.keys(SERVICE_BY_TYPE)),
  ...profileFields,
  documents,
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Please accept the Partner Terms & Conditions' }) }),
});

async function checkVehicle(body) {
  if (body.type !== 'cab') return;
  const { cab } = await getSettings();
  if (!body.vehicle || !cab.vehicles.some((v) => v.key === body.vehicle.type)) {
    throw new HttpError(400, 'Choose your vehicle type and enter the vehicle number');
  }
}

// Documents are stored inside the partner record for now (MongoDB caps a record at 16 MB).
const MAX_DOCUMENTS_BYTES = 12_000_000;
function checkDocumentsSize(body) {
  const total = (body.documents || []).reduce((sum, d) => sum + d.file.length, 0);
  if (total > MAX_DOCUMENTS_BYTES) throw new HttpError(400, 'Documents are too large in total. Upload photos instead of PDFs.');
}

async function createApplication(user, body) {
  checkDocumentsSize(body);
  await checkVehicle(body);
  const existing = await Partner.findOne({ owner: user._id, type: body.type });
  if (existing && existing.status !== 'rejected') {
    throw new HttpError(409, `You already have a ${body.type} application (${existing.status})`);
  }
  const partner = existing || new Partner({ owner: user._id });
  const { acceptTerms, ...fields } = body;
  Object.assign(partner, fields, { status: 'pending', statusNote: undefined, termsAcceptedAt: new Date() });
  if (!partner.phone) partner.phone = user.phone;
  await partner.save();
  live.publish(['admin'], 'application', { id: String(partner._id), type: partner.type, businessName: partner.businessName });
  return partner;
}

// Documents each partner type is asked for at registration.
router.get('/requirements', async (_req, res) => {
  const { cab } = await getSettings();
  res.json({ documents: DOCUMENTS_BY_TYPE, vehicles: cab.vehicles.map(({ key, label }) => ({ key, label })) });
});

// New partner: creates the account and the application in one step.
router.post(
  '/register',
  validate(
    application.extend({
      name: z.string().trim().min(2, 'Enter your full name'),
      ownerPhone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
    }),
  ),
  async (req, res) => {
    const { name, ownerPhone, password, email, ...app } = req.body;
    checkDocumentsSize(app); // before creating anything
    await checkVehicle(app);
    if (await User.exists({ phone: ownerPhone })) {
      throw new HttpError(409, 'This mobile number is already registered. Sign in and apply from your account.');
    }
    const user = new User({ name, phone: ownerPhone, email: email || undefined });
    await user.setPassword(password);
    await user.save();
    const partner = await createApplication(user, app);
    res.status(201).json({ token: signToken(user), user, partner });
  },
);

// Existing account applies for (another) partner type.
router.post('/apply', requireAuth, validate(application), async (req, res) => {
  const partner = await createApplication(req.user, req.body);
  res.status(201).json({ partner, message: 'Application submitted. You can start once an admin approves it.' });
});

// All of the signed-in user's partner accounts (any status).
router.get('/mine', requireAuth, async (req, res) => {
  const partners = await Partner.find({ owner: req.user._id }).sort('createdAt');
  res.json({ partners });
});

router.patch(
  '/mine/:id',
  requireAuth,
  validate(z.object({ ...profileFields, isOpen: z.boolean() }).partial()),
  async (req, res) => {
    const partner = await Partner.findOne({ _id: req.params.id, owner: req.user._id });
    if (!partner) throw new HttpError(404, 'Partner account not found');
    if (req.body.vehicle) await checkVehicle({ type: partner.type, vehicle: req.body.vehicle });
    Object.assign(partner, req.body);
    await partner.save();
    res.json({ partner });
  },
);

// Public: approved businesses, e.g. /api/partners?type=restaurant
router.get('/', async (req, res) => {
  const filter = { status: 'approved', type: { $nin: ['delivery', 'cab'] } };
  if (req.query.type && !['delivery', 'cab'].includes(String(req.query.type))) filter.type = String(req.query.type);
  if (req.query.city) filter.city = new RegExp(`^${escapeRegex(String(req.query.city))}$`, 'i');
  const partners = await Partner.find(filter)
    .select('type businessName description address city image location isOpen rating ratingCount prepTimeMin')
    .sort('createdAt');
  res.json({ partners });
});

router.get('/:id', async (req, res) => {
  const partner = await Partner.findOne({ _id: req.params.id, status: 'approved', type: { $nin: ['delivery'] } }).select(
    'type businessName description address city image location isOpen rating ratingCount prepTimeMin',
  );
  if (!partner) throw new HttpError(404, 'Business not found');
  const listings = await Listing.find({ partner: partner._id, isAvailable: true }).sort('category createdAt');
  res.json({ partner, listings });
});

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = router;
module.exports.escapeRegex = escapeRegex;
