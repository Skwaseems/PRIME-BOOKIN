const mongoose = require('mongoose');

// Platform-wide settings, edited from the admin panel. A single document.
const DEFAULTS = {
  delivery: {
    baseKm: 1, // first km(s) are charged baseFare
    baseFare: 60,
    perKm: 20, // each further km (rounded up)
    foodMaxKm: 5, // hot food only within this distance of the restaurant
    medicineMaxKm: 25, // medicines / packaged items can go further
    riderSharePct: 80, // share of the delivery charge paid to the rider
    dispatchRadiusKm: 5, // riders this close to the store get the alert
  },
  commission: { food: 12, stay: 15, cab: 12, medicine: 10 }, // % kept by Primebookin
  cab: {
    dispatchRadiusKm: 5, // drivers this close to the pickup get the alert
    vehicles: [
      { key: 'bike', label: 'Bike Taxi', seats: 1, perKm: 7, minFare: 60 },
      { key: 'hatchback', label: 'Hatchback', seats: 4, perKm: 12, minFare: 300 },
      { key: 'sedan', label: 'Sedan', seats: 4, perKm: 14, minFare: 350 },
      { key: 'suv', label: 'SUV', seats: 6, perKm: 18, minFare: 450 },
    ],
  },
  privacy: { retentionDays: 90 },
};

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    delivery: { type: mongoose.Schema.Types.Mixed, default: () => DEFAULTS.delivery },
    commission: { type: mongoose.Schema.Types.Mixed, default: () => DEFAULTS.commission },
    cab: { type: mongoose.Schema.Types.Mixed, default: () => DEFAULTS.cab },
    privacy: { type: mongoose.Schema.Types.Mixed, default: () => DEFAULTS.privacy },
  },
  { timestamps: true, minimize: false },
);

settingsSchema.set('toJSON', { versionKey: false });

const Settings = mongoose.model('Settings', settingsSchema);

let cached = null;
let cachedAt = 0;

// Current settings with any missing keys filled from DEFAULTS. Cached briefly.
async function getSettings({ fresh = false } = {}) {
  if (!fresh && cached && Date.now() - cachedAt < 30_000) return cached;
  let doc = await Settings.findOne({ key: 'main' }).lean();
  if (!doc) doc = (await Settings.create({ key: 'main' })).toObject();
  cached = {
    delivery: { ...DEFAULTS.delivery, ...doc.delivery },
    commission: { ...DEFAULTS.commission, ...doc.commission },
    cab: { ...DEFAULTS.cab, ...doc.cab },
    privacy: { ...DEFAULTS.privacy, ...doc.privacy },
  };
  cachedAt = Date.now();
  return cached;
}

async function updateSettings(patch) {
  const current = await getSettings({ fresh: true });
  const next = {
    delivery: { ...current.delivery, ...patch.delivery },
    commission: { ...current.commission, ...patch.commission },
    cab: { ...current.cab, ...patch.cab },
    privacy: { ...current.privacy, ...patch.privacy },
  };
  await Settings.updateOne({ key: 'main' }, { $set: next }, { upsert: true });
  cached = null;
  return getSettings({ fresh: true });
}

// Delivery charge: baseFare for the first baseKm, then perKm for each further km (rounded up).
const deliveryFee = (km, d) => d.baseFare + Math.max(0, Math.ceil(km - d.baseKm - 1e-9)) * d.perKm;

module.exports = { Settings, getSettings, updateSettings, deliveryFee, DEFAULTS };
