const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');
const Partner = require('../models/Partner');
const Enquiry = require('../models/Enquiry');
const { requireAuth } = require('../middleware/auth');
const { HttpError, validate } = require('../middleware/errors');
const live = require('../live');
const jobs = require('../jobs');
const { sendDataUrl } = require('./enquiries');

// Partner panels: hotels, restaurants, pharmacies (vendors), cab drivers and
// delivery riders. Every route works on one of the signed-in user's approved
// partner accounts: /api/panel/:pid/...
const router = express.Router();

router.use('/:pid', requireAuth, async (req, _res, next) => {
  if (!mongoose.isValidObjectId(req.params.pid)) throw new HttpError(404, 'Partner account not found');
  const partner = await Partner.findOne({ _id: req.params.pid, owner: req.user._id });
  if (!partner) throw new HttpError(404, 'Partner account not found');
  if (partner.status !== 'approved') {
    throw new HttpError(403, partner.status === 'pending' ? 'Your application is waiting for admin approval' : `Your account is ${partner.status}`);
  }
  req.partner = partner;
  next();
});

// What partners may see about the customer. Contact details only once the job is theirs.
function view(e, partner, { full }) {
  const out = e.toJSON();
  if (!full) {
    delete out.customerName;
    delete out.contactPhone;
    delete out.address;
    if (out.location) out.location = { label: out.location.label };
  }
  out.role = jobs.roleOf(e, partner);
  out.actions = out.role ? jobs.allowedNext(e, out.role) : [];
  return out;
}

const populateAll = (q) =>
  q
    .populate('partner', 'businessName phone address location')
    .populate('rider', 'businessName phone')
    .populate('driver', 'businessName phone vehicle');

// Live alerts (Server-Sent Events). The panel keeps this open.
router.get('/:pid/stream', (req, res) => {
  live.subscribe([String(req.partner._id)], res);
});

router.get('/:pid', (req, res) => res.json({ partner: req.partner }));

// Go online/offline (riders, drivers) or open/closed (stores, hotels), with position.
router.post(
  '/:pid/presence',
  validate(z.object({ online: z.boolean().optional(), isOpen: z.boolean().optional(), lat: z.number().optional(), lng: z.number().optional() })),
  async (req, res) => {
    const p = req.partner;
    if (req.body.online !== undefined) {
      if (!['cab', 'delivery'].includes(p.type)) throw new HttpError(400, 'Use open/closed for businesses');
      if (req.body.online && p.type === 'cab' && !p.vehicle?.type) throw new HttpError(400, 'Add your vehicle details first');
      p.online = req.body.online;
    }
    if (req.body.isOpen !== undefined) p.isOpen = req.body.isOpen;
    if (req.body.lat != null && req.body.lng != null) p.lastLocation = { lat: req.body.lat, lng: req.body.lng, at: new Date() };
    await p.save();
    live.publish(['admin'], 'presence', { id: String(p._id), type: p.type, online: p.online, isOpen: p.isOpen });
    res.json({ partner: p });
  },
);

// Jobs this partner can accept now (nearby rides, deliveries, medicine requests).
router.get('/:pid/jobs', async (req, res) => {
  const open = await jobs.openJobsFor(req.partner);
  res.json({ jobs: open.map((e) => view(e, req.partner, { full: false })) });
});

// Orders / bookings / rides that are this partner's.
router.get('/:pid/orders', async (req, res) => {
  const id = req.partner._id;
  const mine = { $or: [{ partner: id }, { rider: id }, { driver: id }] };
  const scope = req.query.scope === 'history' ? { status: { $in: jobs.FINAL } } : { status: { $nin: jobs.FINAL } };
  const orders = await populateAll(Enquiry.find({ ...mine, ...scope }))
    .sort(req.query.scope === 'history' ? '-updatedAt' : 'createdAt')
    .limit(req.query.scope === 'history' ? 100 : 50);
  res.json({ orders: orders.map((e) => view(e, req.partner, { full: true })) });
});

async function mineOrThrow(req) {
  const e = await populateAll(Enquiry.findById(req.params.id));
  if (!e || !jobs.roleOf(e, req.partner)) throw new HttpError(404, 'Order not found');
  return e;
}

router.post('/:pid/jobs/:id/accept', validate(z.object({ subtotal: z.number().positive().optional() })), async (req, res) => {
  const e = await jobs.claim(req.partner, req.params.id, req.body);
  res.json({ order: view(await populateAll(Enquiry.findById(e._id)), req.partner, { full: true }) });
});

router.post(
  '/:pid/orders/:id/status',
  validate(z.object({ status: z.string(), otp: z.string().optional() })),
  async (req, res) => {
    const e = await mineOrThrow(req);
    const role = jobs.roleOf(e, req.partner);
    await jobs.transition(e, role, req.body.status, { otp: req.body.otp, by: `${role}:${req.partner.businessName}` });
    res.json({ order: view(e, req.partner, { full: true }) });
  },
);

router.post(
  '/:pid/orders/:id/rider',
  validate(z.object({ stage: z.enum(['at_store', 'picked_up', 'at_customer', 'delivered']), otp: z.string().optional() })),
  async (req, res) => {
    const e = await mineOrThrow(req);
    await jobs.riderStep(e, req.partner, req.body.stage, req.body.otp);
    res.json({ order: view(e, req.partner, { full: true }) });
  },
);

// Prescription photo: for pharmacies that were alerted about it or accepted it.
router.get('/:pid/orders/:id/prescription', async (req, res) => {
  const e = await Enquiry.findById(req.params.id).select('+image +alerted');
  const p = req.partner;
  const allowed =
    e?.type === 'medicine' &&
    p.type === 'pharmacy' &&
    (String(e.partner) === String(p._id) || (!e.partner && (e.alerted || []).some((a) => String(a) === String(p._id))) || (!e.partner && e.status === 'new'));
  if (!allowed || !e.image) throw new HttpError(404, 'No prescription');
  sendDataUrl(res, e.image);
});

router.get('/:pid/earnings', async (req, res) => {
  const id = req.partner._id;
  const field = { delivery: '$earnings.rider', cab: '$earnings.driver' }[req.partner.type] || '$earnings.partner';
  const match = { status: { $in: jobs.SUCCESS }, $or: [{ partner: id }, { rider: id }, { driver: id }] };
  const since = (days) => new Date(Date.now() - days * 86400000);
  const sum = async (extra = {}) => {
    const [row] = await Enquiry.aggregate([
      { $match: { ...match, ...extra } },
      { $group: { _id: null, amount: { $sum: field }, count: { $sum: 1 }, km: { $sum: { $ifNull: ['$distanceKm', '$cab.distanceKm'] } } } },
    ]);
    return { amount: row?.amount || 0, count: row?.count || 0, km: Math.round((row?.km || 0) * 10) / 10 };
  };
  res.json({ today: await sum({ finishedAt: { $gte: since(1) } }), week: await sum({ finishedAt: { $gte: since(7) } }), all: await sum() });
});

module.exports = router;
