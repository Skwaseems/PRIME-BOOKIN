const express = require('express');
const { z } = require('zod');
const Listing = require('../models/Listing');
const Partner = require('../models/Partner');
const { requirePartner } = require('../middleware/auth');
const { HttpError, validate } = require('../middleware/errors');
const { escapeRegex } = require('./partners');

const router = express.Router();

const listingQuery = z.object({
  service: z.enum(Listing.SERVICES).optional(),
  category: z.string().optional(),
  partner: z.string().optional(),
  q: z.string().trim().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(['price', '-price', '-rating', 'name', 'createdAt', '-createdAt']).default('createdAt'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Public browse/search across all services. Only shows listings from approved,
// open businesses.
router.get('/', validate(listingQuery, 'query'), async (req, res) => {
  const { service, category, partner, q, minPrice, maxPrice, sort, page, limit } = req.validQuery;

  const partnerFilter = { status: 'approved', isOpen: true };
  if (partner) partnerFilter._id = partner;
  const partnerIds = await Partner.find(partnerFilter).distinct('_id');

  const filter = { isAvailable: true, partner: { $in: partnerIds } };
  if (service) filter.service = service;
  if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  if (minPrice != null || maxPrice != null) {
    filter.price = {};
    if (minPrice != null) filter.price.$gte = minPrice;
    if (maxPrice != null) filter.price.$lte = maxPrice;
  }
  if (q) filter.$or = [{ name: new RegExp(escapeRegex(q), 'i') }, { tags: new RegExp(escapeRegex(q), 'i') }, { category: new RegExp(escapeRegex(q), 'i') }];

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .populate('partner', 'businessName type city rating')
      // _id breaks ties so listings created together keep their order.
      .sort(`${sort} _id`)
      .skip((page - 1) * limit)
      .limit(limit),
    Listing.countDocuments(filter),
  ]);
  res.json({ listings, total, page, pages: Math.ceil(total / limit) });
});

// Categories in use for a service, e.g. Resorts/Villas for stays.
router.get('/categories', async (req, res) => {
  const filter = { isAvailable: true };
  if (req.query.service) filter.service = String(req.query.service);
  const categories = await Listing.distinct('category', filter);
  res.json({ categories: categories.filter(Boolean).sort() });
});

// Partner: own listings (including unavailable ones).
router.get('/mine/all', requirePartner('hotel', 'restaurant', 'pharmacy', 'cab'), async (req, res) => {
  const listings = await Listing.find({ partner: req.partner._id }).sort('-createdAt');
  res.json({ listings });
});

router.get('/:id', async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate('partner', 'businessName type city address mapUrl rating status');
  if (!listing || listing.partner?.status !== 'approved') throw new HttpError(404, 'Listing not found');
  res.json({ listing });
});

const listingBody = z.object({
  name: z.string().trim().min(2, 'Enter a name'),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().optional(),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  priceUnit: z.enum(['item', 'night', 'trip', 'day']).optional(),
  images: z.array(z.string()).max(10).optional(),
  details: z.record(z.any()).optional(),
  tags: z.array(z.string().trim()).optional(),
  isAvailable: z.boolean().optional(),
});

const DEFAULT_UNIT = { stay: 'night', food: 'item', medicine: 'item', cab: 'trip' };

router.post('/', requirePartner('hotel', 'restaurant', 'pharmacy', 'cab'), validate(listingBody), async (req, res) => {
  const service = req.partner.service;
  const listing = await Listing.create({
    priceUnit: DEFAULT_UNIT[service],
    ...req.body,
    partner: req.partner._id,
    service,
  });
  res.status(201).json({ listing });
});

async function ownListing(req) {
  const listing = await Listing.findOne({ _id: req.params.id, partner: req.partner._id });
  if (!listing) throw new HttpError(404, 'Listing not found');
  return listing;
}

router.patch('/:id', requirePartner('hotel', 'restaurant', 'pharmacy', 'cab'), validate(listingBody.partial()), async (req, res) => {
  const listing = await ownListing(req);
  Object.assign(listing, req.body);
  await listing.save();
  res.json({ listing });
});

router.delete('/:id', requirePartner('hotel', 'restaurant', 'pharmacy', 'cab'), async (req, res) => {
  const listing = await ownListing(req);
  await listing.deleteOne();
  res.json({ ok: true });
});

module.exports = router;
