const express = require('express');
const { z } = require('zod');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { signToken, requireAuth } = require('../middleware/auth');
const { HttpError, validate } = require('../middleware/errors');

const router = express.Router();

const phone = z.string().trim().regex(/^\+?\d{10,13}$/, 'Enter a valid mobile number');
const password = z.string().min(6, 'Password must be at least 6 characters');

router.post(
  '/register',
  validate(
    z.object({
      name: z.string().trim().min(2, 'Enter your name'),
      phone,
      password,
      email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
    }),
  ),
  async (req, res) => {
    const { name, phone: ph, password: pw, email } = req.body;
    if (await User.exists({ phone: ph })) throw new HttpError(409, 'This mobile number is already registered');
    const user = new User({ name, phone: ph, email: email || undefined });
    await user.setPassword(pw);
    await user.save();
    res.status(201).json({ token: signToken(user), user });
  },
);

router.post('/login', validate(z.object({ phone, password: z.string().min(1) })), async (req, res) => {
  const user = await User.findOne({ phone: req.body.phone }).select('+passwordHash');
  if (!user || !(await user.checkPassword(req.body.password))) {
    throw new HttpError(401, 'Wrong mobile number or password');
  }
  res.json({ token: signToken(user), user });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.patch(
  '/me',
  requireAuth,
  validate(
    z.object({
      name: z.string().trim().min(2).optional(),
      email: z.string().trim().email().optional().or(z.literal('')),
      location: z.string().trim().optional(),
      addresses: z
        .array(z.object({ label: z.string().optional(), line: z.string().min(3), city: z.string().optional(), pincode: z.string().optional() }))
        .optional(),
    }),
  ),
  async (req, res) => {
    Object.assign(req.user, req.body);
    await req.user.save();
    res.json({ user: req.user });
  },
);

router.post(
  '/me/password',
  requireAuth,
  validate(z.object({ currentPassword: z.string(), newPassword: password })),
  async (req, res) => {
    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!(await user.checkPassword(req.body.currentPassword))) throw new HttpError(400, 'Current password is wrong');
    await user.setPassword(req.body.newPassword);
    await user.save();
    res.json({ ok: true });
  },
);

router.get('/me/wishlist', requireAuth, async (req, res) => {
  const listings = await Listing.find({ _id: { $in: req.user.wishlist } }).populate('partner', 'businessName type city');
  res.json({ listings });
});

router.post('/me/wishlist/:listingId', requireAuth, async (req, res) => {
  if (!(await Listing.exists({ _id: req.params.listingId }))) throw new HttpError(404, 'Listing not found');
  await req.user.updateOne({ $addToSet: { wishlist: req.params.listingId } });
  res.json({ ok: true });
});

router.delete('/me/wishlist/:listingId', requireAuth, async (req, res) => {
  await req.user.updateOne({ $pull: { wishlist: req.params.listingId } });
  res.json({ ok: true });
});

module.exports = router;
