const express = require('express');
const { z } = require('zod');
const User = require('../models/User');
const Partner = require('../models/Partner');
const Listing = require('../models/Listing');
const Enquiry = require('../models/Enquiry');
const { getSettings, updateSettings } = require('../models/Settings');
const { requireRole } = require('../middleware/auth');
const { HttpError, validate } = require('../middleware/errors');
const live = require('../live');
const jobs = require('../jobs');
const { runRetention } = require('../privacy');
const { sendDataUrl } = require('./enquiries');
const { escapeRegex } = require('./partners');

const router = express.Router();
router.use(requireRole('admin'));

router.get('/stream', (req, res) => live.subscribe(['admin'], res));

router.get('/stats', async (_req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [users, partners, listings, byType, today, active, money, online] = await Promise.all([
    User.countDocuments(),
    Partner.aggregate([{ $group: { _id: { type: '$type', status: '$status' }, count: { $sum: 1 } } }]),
    Listing.countDocuments(),
    Enquiry.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    Enquiry.countDocuments({ createdAt: { $gte: startOfDay } }),
    Enquiry.countDocuments({ status: { $nin: jobs.FINAL } }),
    Enquiry.aggregate([
      { $match: { status: { $in: jobs.SUCCESS } } },
      { $group: { _id: null, gross: { $sum: '$total' }, platform: { $sum: '$earnings.platform' } } },
    ]),
    Partner.aggregate([{ $match: { status: 'approved', online: true } }, { $group: { _id: '$type', count: { $sum: 1 } } }]),
  ]);
  const partnerCounts = {};
  for (const { _id, count } of partners) {
    partnerCounts[_id.type] ||= {};
    partnerCounts[_id.type][_id.status] = count;
  }
  res.json({
    users,
    listings,
    partners: partnerCounts,
    pendingApprovals: partners.filter((p) => p._id.status === 'pending').reduce((n, p) => n + p.count, 0),
    requestsByType: Object.fromEntries(byType.map((r) => [r._id, r.count])),
    requestsToday: today,
    activeRequests: active,
    grossValue: money[0]?.gross || 0,
    platformEarnings: money[0]?.platform || 0,
    online: Object.fromEntries(online.map((r) => [r._id, r.count])),
  });
});

// ----- Partner approvals -----

router.get('/partners', async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.type) filter.type = String(req.query.type);
  const partners = await Partner.find(filter).select('+documents').populate('owner', 'name phone email').sort('-createdAt').limit(500);
  res.json({ partners });
});

router.get('/partners/:id/documents/:index', async (req, res) => {
  const partner = await Partner.findById(req.params.id).select('+documents');
  const doc = partner?.documents?.[Number(req.params.index)];
  if (!doc?.file) throw new HttpError(404, 'Document not found');
  sendDataUrl(res, doc.file);
});

// Approve / reject / suspend. Approving promotes the owner to the 'partner' role.
router.patch(
  '/partners/:id',
  validate(z.object({ status: z.enum(['approved', 'rejected', 'suspended', 'pending']), statusNote: z.string().trim().max(500).optional() })),
  async (req, res) => {
    const partner = await Partner.findById(req.params.id);
    if (!partner) throw new HttpError(404, 'Partner not found');
    partner.status = req.body.status;
    partner.statusNote = req.body.statusNote;
    if (req.body.status !== 'approved') partner.online = false;
    await partner.save();

    const owner = await User.findById(partner.owner);
    if (owner && owner.role !== 'admin') {
      owner.role = (await Partner.exists({ owner: owner._id, status: 'approved' })) ? 'partner' : 'customer';
      await owner.save();
    }
    live.publish([String(partner._id)], 'account', { status: partner.status });
    res.json({ partner });
  },
);

// Riders and drivers on the live map, plus store locations.
router.get('/live', async (_req, res) => {
  const partners = await Partner.find({ status: 'approved' }).select('type businessName phone online isOpen location lastLocation vehicle');
  res.json({ partners });
});

// ----- Requests (orders, bookings, rides) -----

router.get('/requests', async (req, res) => {
  const filter = {};
  if (req.query.type) filter.type = String(req.query.type);
  if (req.query.status === 'active') filter.status = { $nin: jobs.FINAL };
  else if (req.query.status) filter.status = String(req.query.status);
  if (req.query.q) {
    const re = new RegExp(escapeRegex(String(req.query.q)), 'i');
    filter.$or = [{ code: re }, { customerName: re }, { contactPhone: re }];
  }
  const requests = await Enquiry.find(filter)
    .select('+otp')
    .populate('partner', 'businessName phone')
    .populate('rider', 'businessName phone')
    .populate('driver', 'businessName phone vehicle')
    .sort('-createdAt')
    .limit(300);
  res.json({ requests: requests.map((e) => ({ ...e.toJSON(), otp: e.otp, actions: jobs.allowedNext(e, 'admin') })) });
});

router.get('/requests/:id/prescription', async (req, res) => {
  const e = await Enquiry.findById(req.params.id).select('+image');
  if (!e?.image) throw new HttpError(404, 'No prescription');
  sendDataUrl(res, e.image);
});

router.post('/requests/:id/status', validate(z.object({ status: z.string(), note: z.string().max(300).optional() })), async (req, res) => {
  const e = await Enquiry.findById(req.params.id);
  if (!e) throw new HttpError(404, 'Request not found');
  if (req.body.note) e.statusNote = req.body.note;
  await jobs.transition(e, 'admin', req.body.status, { by: `admin:${req.user.name}` });
  res.json({ request: e });
});

// Manually give a job to a specific rider, driver or pharmacy.
router.post('/requests/:id/assign', validate(z.object({ partner: z.string() })), async (req, res) => {
  const e = await Enquiry.findById(req.params.id);
  const p = await Partner.findOne({ _id: req.body.partner, status: 'approved' });
  if (!e || !p) throw new HttpError(404, 'Request or partner not found');
  if (jobs.isFinal(e.status)) throw new HttpError(400, 'This request is already finished');

  if (p.type === 'delivery' && ['basket', 'medicine'].includes(e.type) && ['accepted', 'preparing', 'ready'].includes(e.status)) {
    e.rider = p._id;
    e.riderStage = 'assigned';
  } else if (p.type === 'cab' && e.type === 'cab' && e.status === 'new') {
    e.driver = p._id;
    await jobs.setStatus(e, 'accepted', `admin:${req.user.name}`);
  } else {
    throw new HttpError(400, `A ${p.type} partner cannot be assigned to this ${e.type} request now`);
  }
  e.timeline.push({ status: `assigned:${p.businessName}`, by: `admin:${req.user.name}` });
  await e.save();
  live.publish([String(p._id)], 'job', { id: String(e._id), code: e.code, type: e.type, assigned: true });
  jobs.notify(e);
  res.json({ request: e });
});

// ----- Settings, users, listings, privacy -----

router.get('/settings', async (_req, res) => res.json({ settings: await getSettings({ fresh: true }) }));

const num = (min, max) => z.number().min(min).max(max);
router.put(
  '/settings',
  validate(
    z.object({
      delivery: z
        .object({
          baseKm: num(0, 10),
          baseFare: num(0, 1000),
          perKm: num(0, 500),
          foodMaxKm: num(1, 50),
          medicineMaxKm: num(1, 200),
          riderSharePct: num(0, 100),
          dispatchRadiusKm: num(1, 50),
        })
        .partial()
        .optional(),
      commission: z.object({ food: num(0, 50), stay: num(0, 50), cab: num(0, 50), medicine: num(0, 50) }).partial().optional(),
      cab: z
        .object({
          dispatchRadiusKm: num(1, 50),
          vehicles: z
            .array(z.object({ key: z.string().regex(/^[a-z0-9-]+$/), label: z.string().min(2), seats: num(1, 20), perKm: num(1, 500), minFare: num(0, 10000) }))
            .min(1),
        })
        .partial()
        .optional(),
      privacy: z.object({ retentionDays: num(7, 3650) }).partial().optional(),
    }),
  ),
  async (req, res) => res.json({ settings: await updateSettings(req.body) }),
);

router.post('/privacy/run', async (_req, res) => res.json(await runRetention()));

router.get('/users', async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = String(req.query.role);
  if (req.query.q) {
    const re = new RegExp(escapeRegex(String(req.query.q)), 'i');
    filter.$or = [{ name: re }, { phone: re }, { email: re }];
  }
  const users = await User.find(filter).sort('-createdAt').limit(200);
  res.json({ users });
});

router.get('/listings', async (req, res) => {
  const filter = {};
  if (req.query.service) filter.service = String(req.query.service);
  const listings = await Listing.find(filter).populate('partner', 'businessName type status').sort('-createdAt').limit(500);
  res.json({ listings });
});

router.patch('/listings/:id', validate(z.object({ isAvailable: z.boolean() })), async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!listing) throw new HttpError(404, 'Listing not found');
  res.json({ listing });
});

module.exports = router;
