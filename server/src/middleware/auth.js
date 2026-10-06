const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const Partner = require('../models/Partner');
const { HttpError } = require('./errors');

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

// Attaches req.user when a valid "Authorization: Bearer <token>" header is present.
async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    throw new HttpError(401, 'Session expired, please sign in again');
  }
  req.user = await User.findById(payload.sub);
  if (!req.user) throw new HttpError(401, 'Account no longer exists');
  next();
}

async function requireAuth(req, res, next) {
  await optionalAuth(req, res, () => {});
  if (!req.user) throw new HttpError(401, 'Please sign in');
  next();
}

const requireRole = (...roles) => async (req, res, next) => {
  await requireAuth(req, res, () => {});
  if (!roles.includes(req.user.role)) throw new HttpError(403, 'You do not have access to this');
  next();
};

// Loads the signed-in user's approved partner business of one of `types`
// into req.partner. Pass a ?partner=<id> query when a user owns several.
const requirePartner = (...types) => async (req, res, next) => {
  await requireAuth(req, res, () => {});
  const filter = { owner: req.user._id, status: 'approved' };
  if (types.length) filter.type = { $in: types };
  if (req.query.partner) filter._id = req.query.partner;
  const partner = await Partner.findOne(filter);
  if (!partner) throw new HttpError(403, 'No approved partner account found. Apply and wait for admin approval.');
  req.partner = partner;
  next();
};

module.exports = { signToken, optionalAuth, requireAuth, requireRole, requirePartner };
