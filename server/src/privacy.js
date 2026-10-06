const Enquiry = require('./models/Enquiry');
const Partner = require('./models/Partner');
const { getSettings } = require('./models/Settings');

// Personal data is kept only as long as needed (DPDP Act 2023: storage limitation).
// After the retention period, finished requests keep only what's needed for
// accounts (type, items, amounts, dates) and lose names, phones, addresses,
// locations, guest lists, free text and prescription photos.

const PERSONAL_FIELDS = {
  customerName: 1,
  contactPhone: 1,
  address: 1,
  location: 1,
  text: 1,
  image: 1,
  'stay.guestNames': 1,
  'cab.pickup.address': 1,
  'cab.drop.address': 1,
};

const FINISHED = ['delivered', 'completed', 'closed', 'rejected', 'cancelled'];

async function anonymize(ids) {
  if (!ids.length) return 0;
  const res = await Enquiry.updateMany(
    { _id: { $in: ids } },
    {
      $unset: PERSONAL_FIELDS,
      $set: {
        anonymizedAt: new Date(),
        // Keep the town-level labels for cab rides but drop exact coordinates.
        'cab.pickup.lat': null,
        'cab.pickup.lng': null,
        'cab.drop.lat': null,
        'cab.drop.lng': null,
      },
    },
  );
  return res.modifiedCount;
}

async function runRetention(now = new Date()) {
  const { retentionDays } = (await getSettings({ fresh: true })).privacy;
  const cutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);

  const old = await Enquiry.find({
    anonymizedAt: null,
    status: { $in: FINISHED },
    $or: [{ finishedAt: { $lt: cutoff } }, { finishedAt: null, updatedAt: { $lt: cutoff } }],
  }).distinct('_id');
  const requests = await anonymize(old);

  // Documents of rejected partner applications are not needed after the same period.
  const docs = await Partner.updateMany(
    { status: 'rejected', updatedAt: { $lt: cutoff }, 'documents.0': { $exists: true } },
    { $set: { documents: [] } },
  );

  if (requests || docs.modifiedCount) {
    console.log(`Privacy: removed personal data from ${requests} request(s) and ${docs.modifiedCount} rejected application(s)`);
  }
  return { requests, applications: docs.modifiedCount, retentionDays };
}

let timer = null;
function schedule(everyMs = 6 * 60 * 60 * 1000) {
  const run = () => runRetention().catch((err) => console.error('Privacy retention failed', err));
  run();
  timer = setInterval(run, everyMs);
  timer.unref();
}

module.exports = { anonymize, runRetention, schedule, PERSONAL_FIELDS };
