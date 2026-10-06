const Enquiry = require('./models/Enquiry');
const Partner = require('./models/Partner');
const { getSettings, deliveryFee } = require('./models/Settings');
const { HttpError } = require('./middleware/errors');
const live = require('./live');
const { haversineKm, route } = require('./maps');

// Who may move a request from one status to the next.
// Actors: customer, vendor (hotel/restaurant/pharmacy on the request), rider, driver, admin.
const FLOWS = {
  basket: {
    new: { accepted: ['vendor'], rejected: ['vendor'], cancelled: ['customer', 'admin'] },
    accepted: { preparing: ['vendor'], cancelled: ['admin'] },
    preparing: { ready: ['vendor'], cancelled: ['admin'] },
    ready: { picked_up: ['rider', 'admin'], cancelled: ['admin'] },
    picked_up: { delivered: ['rider', 'admin'] },
  },
  medicine: {
    // "new" -> "accepted" happens when a pharmacy claims it with a price (see claim()).
    accepted: { preparing: ['vendor'], cancelled: ['admin'] },
    preparing: { ready: ['vendor'], cancelled: ['admin'] },
    ready: { picked_up: ['rider', 'admin'], cancelled: ['admin'] },
    picked_up: { delivered: ['rider', 'admin'] },
    new: { cancelled: ['customer', 'admin'] },
  },
  stay: {
    new: { confirmed: ['vendor'], rejected: ['vendor'], cancelled: ['customer', 'admin'] },
    confirmed: { checked_in: ['vendor'], cancelled: ['vendor', 'admin'] },
    checked_in: { completed: ['vendor', 'admin'] },
  },
  cab: {
    // "new" -> "accepted" happens when a driver claims it (see claim()).
    new: { cancelled: ['customer', 'admin'] },
    accepted: { arrived: ['driver'], cancelled: ['customer', 'admin'] },
    arrived: { started: ['driver'], cancelled: ['admin'] },
    started: { completed: ['driver', 'admin'] },
  },
  'food-custom': {
    new: { closed: ['admin'] },
  },
};

const SUCCESS = ['delivered', 'completed', 'closed'];
const FINAL = [...SUCCESS, 'rejected', 'cancelled'];
const DELIVERY_TYPES = ['basket', 'medicine'];
const FRESH_LOCATION_MS = 15 * 60 * 1000;

const isFinal = (status) => FINAL.includes(status);
const allowedNext = (e, actor) =>
  Object.entries(FLOWS[e.type]?.[e.status] || {})
    .filter(([, actors]) => actors.includes(actor))
    .map(([next]) => next);

const near = (a, b, km) => !a || !b || haversineKm(a, b) <= km;
const fresh = (p) => p.lastLocation?.at && Date.now() - new Date(p.lastLocation.at).getTime() < FRESH_LOCATION_MS;

function notify(e, event = 'request') {
  const keys = ['admin', e.partner, e.rider, e.driver].filter(Boolean).map(String);
  live.publish(keys, event, { id: String(e._id), code: e.code, type: e.type, status: e.status, riderStage: e.riderStage });
}

// ----- Who gets alerted -----

async function candidatesFor(e) {
  const s = await getSettings();
  if (e.type === 'medicine' && e.status === 'new' && !e.partner) {
    const shops = await Partner.find({ type: 'pharmacy', status: 'approved', isOpen: true });
    return shops.filter((p) => near(p.location, e.location, s.delivery.medicineMaxKm));
  }
  if (e.type === 'cab' && e.status === 'new' && !e.driver) {
    const drivers = await Partner.find({ type: 'cab', status: 'approved', online: true, 'vehicle.type': e.cab.vehicleKey });
    return drivers.filter((p) => fresh(p) && near(p.lastLocation, e.cab.pickup, s.cab.dispatchRadiusKm));
  }
  if (DELIVERY_TYPES.includes(e.type) && ['accepted', 'preparing', 'ready'].includes(e.status) && !e.rider) {
    const store = e.partner ? await Partner.findById(e.partner) : null;
    const riders = await Partner.find({ type: 'delivery', status: 'approved', online: true });
    return riders.filter((p) => fresh(p) && near(p.lastLocation, store?.location, s.delivery.dispatchRadiusKm));
  }
  return [];
}

// Rings the panels of everyone who can take this job.
async function dispatch(e) {
  const who = await candidatesFor(e);
  if (!who.length) return 0;
  await Enquiry.updateOne({ _id: e._id }, { $addToSet: { alerted: { $each: who.map((p) => p._id) } } });
  live.publish(who.map((p) => p._id), 'job', { id: String(e._id), code: e.code, type: e.type });
  return who.length;
}

// Jobs this partner could claim right now.
async function openJobsFor(partner) {
  const s = await getSettings();
  if (partner.type === 'pharmacy') {
    if (!partner.isOpen) return [];
    const jobs = await Enquiry.find({ type: 'medicine', status: 'new', partner: null }).sort('createdAt').limit(50);
    return jobs.filter((e) => near(partner.location, e.location, s.delivery.medicineMaxKm));
  }
  if (partner.type === 'cab') {
    if (!partner.online) return [];
    const jobs = await Enquiry.find({ type: 'cab', status: 'new', driver: null, 'cab.vehicleKey': partner.vehicle?.type }).sort('createdAt').limit(50);
    return jobs.filter((e) => near(partner.lastLocation, e.cab.pickup, s.cab.dispatchRadiusKm));
  }
  if (partner.type === 'delivery') {
    if (!partner.online) return [];
    const jobs = await Enquiry.find({ type: { $in: DELIVERY_TYPES }, status: { $in: ['accepted', 'preparing', 'ready'] }, rider: null })
      .populate('partner', 'businessName address location')
      .sort('createdAt')
      .limit(50);
    return jobs.filter((e) => near(partner.lastLocation, e.partner?.location, s.delivery.dispatchRadiusKm));
  }
  return [];
}

// ----- Changing state -----

function addTimeline(e, status, by) {
  e.timeline.push({ status, by });
}

async function settle(e) {
  const s = await getSettings();
  const pct = (n) => (100 - n) / 100;
  const earnings = { partner: 0, rider: 0, driver: 0, platform: 0 };
  if (DELIVERY_TYPES.includes(e.type)) {
    earnings.partner = Math.round(e.subtotal * pct(s.commission[e.type === 'basket' ? 'food' : 'medicine']));
    earnings.rider = Math.round((e.deliveryFee * s.delivery.riderSharePct) / 100);
  } else if (e.type === 'stay') {
    earnings.partner = Math.round(e.subtotal * pct(s.commission.stay));
  } else if (e.type === 'cab') {
    earnings.driver = Math.round(e.total * pct(s.commission.cab));
  }
  earnings.platform = e.total - earnings.partner - earnings.rider - earnings.driver;
  e.earnings = earnings;
}

async function setStatus(e, next, by) {
  e.status = next;
  addTimeline(e, next, by);
  if (isFinal(next)) {
    e.finishedAt = new Date();
    if (SUCCESS.includes(next)) await settle(e);
  }
}

// Moves a request along its flow. `actor` is one of the FLOWS roles.
async function transition(e, actor, next, { otp, by } = {}) {
  if (!allowedNext(e, actor).includes(next)) {
    throw new HttpError(400, `Cannot change from "${e.status}" to "${next}"`);
  }
  // The customer's code proves the rider is at the door / the driver has the right passenger.
  if ((next === 'delivered' && actor === 'rider') || (next === 'started' && actor === 'driver')) {
    const withOtp = await Enquiry.findById(e._id).select('+otp');
    if (String(otp || '').trim() !== withOtp.otp) throw new HttpError(400, 'Wrong OTP. Ask the customer for the 4-digit code.');
  }
  await setStatus(e, next, by || actor);
  if (next === 'picked_up') e.riderStage = 'picked_up';
  if (next === 'delivered') e.riderStage = 'delivered';
  await e.save();
  notify(e);
  // Food/medicine accepted by the store: find a rider.
  if (DELIVERY_TYPES.includes(e.type) && next === 'accepted') await dispatch(e);
  return e;
}

// Pharmacy / driver / rider takes an open job. Atomic: only the first one wins.
async function claim(partner, id, { subtotal } = {}) {
  const s = await getSettings();
  let filter;
  let update;
  if (partner.type === 'pharmacy') {
    if (!(subtotal > 0)) throw new HttpError(400, 'Enter the total price of the medicines');
    filter = { _id: id, type: 'medicine', status: 'new', partner: null };
    update = { partner: partner._id, status: 'accepted', subtotal: Math.round(subtotal) };
  } else if (partner.type === 'cab') {
    if (!partner.online) throw new HttpError(400, 'Go online to accept rides');
    filter = { _id: id, type: 'cab', status: 'new', driver: null };
    update = { driver: partner._id, status: 'accepted' };
  } else if (partner.type === 'delivery') {
    if (!partner.online) throw new HttpError(400, 'Go online to accept deliveries');
    const busy = await Enquiry.exists({ rider: partner._id, status: { $in: ['accepted', 'preparing', 'ready', 'picked_up'] } });
    if (busy) throw new HttpError(409, 'Finish your current delivery first');
    filter = { _id: id, type: { $in: DELIVERY_TYPES }, status: { $in: ['accepted', 'preparing', 'ready'] }, rider: null };
    update = { rider: partner._id, riderStage: 'assigned' };
  } else {
    throw new HttpError(400, 'Nothing to accept here');
  }

  const e = await Enquiry.findOneAndUpdate(filter, update, { new: true });
  if (!e) throw new HttpError(409, 'Someone else already accepted this, or it was cancelled.');

  if (partner.type === 'pharmacy') {
    // Price is known now: add delivery from this pharmacy to the customer.
    if (partner.location && e.location) {
      const r = await route(partner.location, e.location);
      e.distanceKm = r.distanceKm;
    }
    e.deliveryFee = e.distanceKm != null ? deliveryFee(e.distanceKm, s.delivery) : s.delivery.baseFare;
    e.total = e.subtotal + e.deliveryFee;
    addTimeline(e, 'accepted', `pharmacy:${partner.businessName}`);
  } else if (partner.type === 'cab') {
    addTimeline(e, 'accepted', `driver:${partner.businessName}`);
  } else {
    addTimeline(e, 'rider_assigned', `rider:${partner.businessName}`);
  }
  await e.save();

  // Tell everyone else who got the alert that it's gone.
  const others = await Enquiry.findById(e._id).select('+alerted');
  live.publish((others.alerted || []).filter((p) => String(p) !== String(partner._id)), 'job-taken', { id: String(e._id) });
  notify(e);
  if (partner.type === 'pharmacy') await dispatch(e); // now find a rider
  return e;
}

const RIDER_NEXT = { assigned: 'at_store', at_store: 'picked_up', picked_up: 'at_customer', at_customer: 'delivered' };

// Rider progress: Reached store -> Picked up -> Reached customer -> Delivered (OTP).
async function riderStep(e, partner, stage, otp) {
  if (String(e.rider?._id || e.rider) !== String(partner._id)) throw new HttpError(403, 'This delivery is not yours');
  if (RIDER_NEXT[e.riderStage] !== stage) throw new HttpError(400, `Next step is "${RIDER_NEXT[e.riderStage] || 'none'}"`);
  if (stage === 'picked_up') {
    if (e.status !== 'ready') throw new HttpError(400, 'The store has not marked this order ready yet');
    return transition(e, 'rider', 'picked_up', { by: `rider:${partner.businessName}` });
  }
  if (stage === 'delivered') return transition(e, 'rider', 'delivered', { otp, by: `rider:${partner.businessName}` });
  e.riderStage = stage;
  addTimeline(e, stage, `rider:${partner.businessName}`);
  await e.save();
  notify(e);
  return e;
}

// Which role this partner plays on a request, if any.
function roleOf(e, partner) {
  const id = String(partner._id);
  if (e.partner && String(e.partner._id || e.partner) === id) return 'vendor';
  if (e.rider && String(e.rider._id || e.rider) === id) return 'rider';
  if (e.driver && String(e.driver._id || e.driver) === id) return 'driver';
  return null;
}

module.exports = { FLOWS, FINAL, SUCCESS, isFinal, allowedNext, dispatch, openJobsFor, transition, claim, riderStep, roleOf, notify, settle, setStatus };
