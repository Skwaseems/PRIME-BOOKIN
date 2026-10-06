process.env.NODE_ENV = 'test';
// Unreachable on purpose: distances use the offline straight-line fallback (x1.3).
process.env.OSRM_URL = 'http://127.0.0.1:9';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const db = require('../src/db');
const app = require('../src/app');
const { seed } = require('../src/seed');
const config = require('../src/config');
const Enquiry = require('../src/models/Enquiry');
const { deliveryFee, DEFAULTS } = require('../src/models/Settings');
const { runRetention } = require('../src/privacy');

const api = request(app);
const auth = (token) => ({ Authorization: `Bearer ${token}` });
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

// Near Peter's Cafe (17.9249, 73.6568) in Mahabaleshwar.
const NEAR = { label: 'Near Main Market', lat: 17.93, lng: 73.66 };
const TWO_KM = { label: 'Venna Lake side', lat: 17.94, lng: 73.67 };
const PUNE = { label: 'Pune', lat: 18.5204, lng: 73.8567 };

let adminToken;
const sessions = {};

async function login(phone, password = 'demo123') {
  const res = await api.post('/api/auth/login').send({ phone, password });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const partners = (await api.get('/api/partners/mine').set(auth(res.body.token))).body.partners;
  return { token: res.body.token, pid: partners[0]?._id };
}

const panel = (who, path) => `/api/panel/${who.pid}${path}`;
const customer = { customerName: 'Asha Patil', phone: '9876543210', address: 'Room 4, Lake View Lodge', consent: true };

before(async () => {
  await db.connect({ dbName: 'primebookin_test' });
  await mongoose.connection.dropDatabase();
  await seed();
  adminToken = (await login(config.adminPhone, config.adminPassword)).token;
  const phones = { peters: '9000000002', valley: '9000000006', hotel: '9000000001', pharmacy: '9000000003', sedan: '9000000004', hatch: '9000000008', ravi: '9000000005', amit: '9000000009' };
  for (const [key, phone] of Object.entries(phones)) sessions[key] = await login(phone);
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await db.disconnect();
});

test('delivery charge: ₹60 for the first km, then ₹20 per started km', () => {
  const d = DEFAULTS.delivery;
  assert.equal(deliveryFee(0.4, d), 60);
  assert.equal(deliveryFee(1, d), 60);
  assert.equal(deliveryFee(1.1, d), 80);
  assert.equal(deliveryFee(2.84, d), 100);
});

test('customers browse stays and restaurants; riders and drivers are never listed', async () => {
  const stays = await api.get('/api/listings?service=stay&maxPrice=6000');
  assert.deepEqual(stays.body.listings.map((l) => l.name), ['Stone Wood Heritage Homestead']);
  const restaurants = (await api.get('/api/partners?type=restaurant')).body.partners;
  assert.ok(restaurants.length >= 3 && restaurants.every((r) => r.image));
  const all = (await api.get('/api/partners')).body.partners;
  assert.ok(all.every((p) => !['delivery', 'cab'].includes(p.type)));
  assert.ok((await api.get('/api/partners?type=delivery')).body.partners.every((p) => p.type !== 'delivery'));
});

test('partner registration: documents + terms, admin approval required', async () => {
  const base = { name: 'Neha Shinde', ownerPhone: '8000000001', password: 'secret123', type: 'restaurant', businessName: 'Neha Kitchen', documents: [{ label: 'FSSAI Licence', number: '12345678901234', file: PNG }] };
  assert.equal((await api.post('/api/partners/register').send(base)).status, 400, 'terms required');
  const reg = await api.post('/api/partners/register').send({ ...base, acceptTerms: true });
  assert.equal(reg.status, 201, JSON.stringify(reg.body));
  assert.equal(reg.body.partner.status, 'pending');
  assert.equal(reg.body.partner.documents?.[0]?.file, undefined, 'files never echoed');
  const me = { token: reg.body.token, pid: reg.body.partner._id };

  // Pending partners cannot use the panel or publish.
  assert.equal((await api.get(panel(me, '')).set(auth(me.token))).status, 403);
  assert.equal((await api.post('/api/listings').set(auth(me.token)).send({ name: 'Misal Pav', price: 120 })).status, 403);

  // Admin sees the application and its document, then approves.
  const pending = (await api.get('/api/admin/partners?status=pending').set(auth(adminToken))).body.partners;
  const application = pending.find((p) => p._id === me.pid);
  assert.equal(application.documents[0].hasFile, true);
  const doc = await api.get(`/api/admin/partners/${me.pid}/documents/0`).set(auth(adminToken));
  assert.equal(doc.status, 200);
  assert.equal(doc.headers['content-type'], 'image/png');
  assert.equal((await api.get(`/api/admin/partners/${me.pid}/documents/0`).set(auth(me.token))).status, 403);

  await api.patch(`/api/admin/partners/${me.pid}`).set(auth(adminToken)).send({ status: 'approved' }).expect(200);
  assert.equal((await api.get(panel(me, '')).set(auth(me.token))).status, 200);
  // Saving the partner (approval, going online...) must not drop its documents.
  await api.post(panel(me, '/presence')).set(auth(me.token)).send({ isOpen: false }).expect(200);
  assert.equal((await api.get(`/api/admin/partners/${me.pid}/documents/0`).set(auth(adminToken))).status, 200);
  const dish = await api.post(`/api/listings?partner=${me.pid}`).set(auth(me.token)).send({ name: 'Misal Pav', price: 120 });
  assert.equal(dish.status, 201);
  assert.equal(dish.body.listing.service, 'food');

  // Cab drivers must give a valid vehicle.
  const cab = { ...base, ownerPhone: '8000000002', type: 'cab', businessName: 'Raju', acceptTerms: true };
  assert.equal((await api.post('/api/partners/register').send(cab)).status, 400);
  assert.equal((await api.post('/api/partners/register').send({ ...cab, vehicle: { type: 'suv', number: 'MH 11 ZZ 9999' } })).status, 201);
});

test('basket: one store, delivery charge by distance, food radius limit, consent', async () => {
  const menu = (await api.get(`/api/partners/${sessions.peters.pid}`)).body.listings;
  const valleyMenu = (await api.get(`/api/partners/${sessions.valley.pid}`)).body.listings;
  const items = [{ listing: menu[0]._id, quantity: 2 }];

  const near = await api.post('/api/enquiries/quote').send({ items, location: NEAR });
  assert.equal(near.status, 200, JSON.stringify(near.body));
  assert.equal(near.body.deliveryFee, 60);
  const farther = await api.post('/api/enquiries/quote').send({ items, location: TWO_KM });
  assert.equal(farther.body.deliveryFee, 100, `distance ${farther.body.distanceKm}`);

  assert.equal((await api.post('/api/enquiries/quote').send({ items, location: PUNE })).status, 400, 'outside 5 km');
  assert.equal((await api.post('/api/enquiries/quote').send({ items: [...items, { listing: valleyMenu[0]._id, quantity: 1 }] })).status, 400, 'two stores');
  assert.equal((await api.post('/api/enquiries').send({ type: 'basket', items, ...customer, location: NEAR, consent: false })).status, 400, 'consent');
});

test('food order: restaurant accepts, nearest online rider takes it, OTP on delivery, earnings split', async () => {
  const { peters, valley, ravi, amit } = sessions;
  const menu = (await api.get(`/api/partners/${peters.pid}`)).body.listings;
  const placed = await api.post('/api/enquiries').send({ type: 'basket', items: [{ listing: menu[0]._id, quantity: 2 }], ...customer, location: NEAR });
  assert.equal(placed.status, 201, JSON.stringify(placed.body));
  const { enquiry, otp, accessKey } = placed.body;
  assert.match(otp, /^\d{4}$/);
  assert.equal(enquiry.otp, undefined);
  const subtotal = menu[0].price * 2;
  assert.equal(enquiry.total, subtotal + 60);

  // Only Peter's Cafe sees and can act on it.
  const orders = (await api.get(panel(peters, '/orders')).set(auth(peters.token))).body.orders;
  const mine = orders.find((o) => o._id === enquiry._id);
  assert.equal(mine.contactPhone, '9876543210');
  assert.deepEqual(mine.actions.sort(), ['accepted', 'rejected']);
  assert.equal((await api.post(panel(valley, `/orders/${enquiry._id}/status`)).set(auth(valley.token)).send({ status: 'accepted' })).status, 404);

  // Riders: Ravi online near the cafe, Amit offline.
  await api.post(panel(ravi, '/presence')).set(auth(ravi.token)).send({ online: true, lat: 17.925, lng: 73.657 }).expect(200);
  await api.post(panel(peters, `/orders/${enquiry._id}/status`)).set(auth(peters.token)).send({ status: 'accepted' }).expect(200);

  const jobs = (await api.get(panel(ravi, '/jobs')).set(auth(ravi.token))).body.jobs;
  const job = jobs.find((j) => j._id === enquiry._id);
  assert.ok(job, 'rider sees the job');
  assert.equal(job.contactPhone, undefined, 'no customer phone before accepting');
  assert.equal((await api.get(panel(amit, '/jobs')).set(auth(amit.token))).body.jobs.length, 0, 'offline rider sees nothing');

  await api.post(panel(ravi, `/jobs/${enquiry._id}/accept`)).set(auth(ravi.token)).send({}).expect(200);
  await api.post(panel(amit, '/presence')).set(auth(amit.token)).send({ online: true, lat: 17.925, lng: 73.657 });
  assert.equal((await api.post(panel(amit, `/jobs/${enquiry._id}/accept`)).set(auth(amit.token)).send({})).status, 409, 'first rider wins');

  const step = (stage, body = {}) => api.post(panel(ravi, `/orders/${enquiry._id}/rider`)).set(auth(ravi.token)).send({ stage, ...body });
  await step('at_store').expect(200);
  assert.equal((await step('picked_up')).status, 400, 'not ready yet');
  await api.post(panel(peters, `/orders/${enquiry._id}/status`)).set(auth(peters.token)).send({ status: 'preparing' }).expect(200);
  await api.post(panel(peters, `/orders/${enquiry._id}/status`)).set(auth(peters.token)).send({ status: 'ready' }).expect(200);
  await step('picked_up').expect(200);
  await step('at_customer').expect(200);
  assert.equal((await step('delivered', { otp: otp === '1111' ? '2222' : '1111' })).status, 400, 'wrong OTP');
  const done = await step('delivered', { otp });
  assert.equal(done.status, 200, JSON.stringify(done.body));
  assert.equal(done.body.order.status, 'delivered');

  const e = await Enquiry.findById(enquiry._id);
  assert.equal(e.earnings.partner, Math.round(subtotal * 0.88));
  assert.equal(e.earnings.rider, 48);
  assert.equal(e.earnings.platform, e.total - e.earnings.partner - e.earnings.rider);

  const earnings = (await api.get(panel(ravi, '/earnings')).set(auth(ravi.token))).body;
  assert.equal(earnings.all.amount, 48);

  // Customer sees the result; the OTP is no longer shown.
  const look = (await api.post('/api/enquiries/lookup').send({ keys: [`${enquiry._id}:${accessKey}`] })).body.enquiries[0];
  assert.equal(look.status, 'delivered');
  assert.equal(look.otp, undefined);
  assert.equal(look.rider.businessName, 'Ravi (Delivery)');

  await api.post(panel(ravi, '/presence')).set(auth(ravi.token)).send({ online: false });
  await api.post(panel(amit, '/presence')).set(auth(amit.token)).send({ online: false });
});

test('medicine request: pharmacies see it without contact details, first to quote gets it', async () => {
  const { pharmacy } = sessions;
  const placed = await api.post('/api/enquiries').send({ type: 'medicine', text: 'Dolo 650 x 10', image: PNG, ...customer, location: NEAR });
  assert.equal(placed.status, 201, JSON.stringify(placed.body));
  const id = placed.body.enquiry._id;

  const jobs = (await api.get(panel(pharmacy, '/jobs')).set(auth(pharmacy.token))).body.jobs;
  const job = jobs.find((j) => j._id === id);
  assert.equal(job.text, 'Dolo 650 x 10');
  assert.equal(job.contactPhone, undefined);
  assert.equal((await api.get(panel(pharmacy, `/orders/${id}/prescription`)).set(auth(pharmacy.token))).status, 200);
  assert.equal((await api.get(`/api/enquiries/${id}/image`)).status, 404, 'photo link needs the key');
  assert.equal((await api.get(`/api/enquiries/${id}/image?key=${placed.body.accessKey}`)).status, 200);

  assert.equal((await api.post(panel(pharmacy, `/jobs/${id}/accept`)).set(auth(pharmacy.token)).send({})).status, 400, 'needs a price');
  const accepted = await api.post(panel(pharmacy, `/jobs/${id}/accept`)).set(auth(pharmacy.token)).send({ subtotal: 85 });
  assert.equal(accepted.status, 200, JSON.stringify(accepted.body));
  assert.equal(accepted.body.order.subtotal, 85);
  assert.equal(accepted.body.order.total, 85 + accepted.body.order.deliveryFee);
  assert.equal(accepted.body.order.contactPhone, '9876543210');
});

test('cab: nearby online drivers of that vehicle type get it, first accepts, OTP to start', async () => {
  const { sedan, hatch } = sessions;
  const ride = { type: 'cab', pickup: { label: 'Mahabaleshwar', lat: 17.9237, lng: 73.656 }, drop: PUNE, vehicle: 'sedan', customerName: 'Ravi K', phone: '9123456789', consent: true };

  assert.equal((await api.post(panel(sedan, '/presence')).set(auth(sedan.token)).send({ online: true, lat: 17.924, lng: 73.657 })).status, 200);
  await api.post(panel(hatch, '/presence')).set(auth(hatch.token)).send({ online: true, lat: 17.924, lng: 73.657 });

  const placed = await api.post('/api/enquiries').send(ride);
  assert.equal(placed.status, 201, JSON.stringify(placed.body));
  const id = placed.body.enquiry._id;
  assert.ok((await api.get(panel(sedan, '/jobs')).set(auth(sedan.token))).body.jobs.some((j) => j._id === id));
  assert.equal((await api.get(panel(hatch, '/jobs')).set(auth(hatch.token))).body.jobs.length, 0, 'other vehicle type');

  await api.post(panel(sedan, `/jobs/${id}/accept`)).set(auth(sedan.token)).send({}).expect(200);
  const status = (s, body = {}) => api.post(panel(sedan, `/orders/${id}/status`)).set(auth(sedan.token)).send({ status: s, ...body });
  await status('arrived').expect(200);
  assert.equal((await status('started', { otp: '99999' })).status, 400);
  await status('started', { otp: placed.body.otp }).expect(200);
  const done = await status('completed');
  assert.equal(done.body.order.status, 'completed');
  const e = await Enquiry.findById(id);
  assert.equal(e.earnings.driver, Math.round(e.total * 0.88));

  await api.post(panel(sedan, '/presence')).set(auth(sedan.token)).send({ online: false });
  await api.post(panel(hatch, '/presence')).set(auth(hatch.token)).send({ online: false });
});

test('stay booking goes to the hotel; customer can cancel only before confirmation', async () => {
  const { hotel } = sessions;
  const stay = (await api.get('/api/listings?service=stay&q=Stone')).body.listings[0];
  const day = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
  const booking = { type: 'stay', listing: stay._id, roomType: 'Deluxe Room', rooms: 2, guests: 5, guestNames: ['Asha Patil', 'Ravi Patil'], phone: '+91 98765 43210', checkIn: day(1), checkOut: day(3), consent: true };
  assert.equal((await api.post('/api/enquiries').send({ ...booking, guests: 7 })).status, 400);

  const a = await api.post('/api/enquiries').send(booking);
  assert.equal(a.status, 201, JSON.stringify(a.body));
  assert.equal(a.body.enquiry.total, Math.round(5500 * 1.25 * 2 * 2 + 600 * 2));
  await api.post(`/api/enquiries/${a.body.enquiry._id}/cancel`).send({ key: a.body.accessKey }).expect(200);

  const b = await api.post('/api/enquiries').send(booking);
  await api.post(panel(hotel, `/orders/${b.body.enquiry._id}/status`)).set(auth(hotel.token)).send({ status: 'confirmed' }).expect(200);
  assert.equal((await api.post(`/api/enquiries/${b.body.enquiry._id}/cancel`).send({ key: b.body.accessKey })).status, 400);
  assert.equal((await api.post(`/api/enquiries/${b.body.enquiry._id}/cancel`).send({ key: '0'.repeat(32) })).status, 404);
});

test('privacy: delete-my-data and automatic removal after the retention period', async () => {
  const placed = await api.post('/api/enquiries').send({ type: 'medicine', text: 'Crocin', ...customer, location: NEAR });
  const { _id } = placed.body.enquiry;
  const key = placed.body.accessKey;
  assert.equal((await api.post(`/api/enquiries/${_id}/forget`).send({ key })).status, 400, 'still active');
  await api.post(`/api/enquiries/${_id}/cancel`).send({ key }).expect(200);
  await api.post(`/api/enquiries/${_id}/forget`).send({ key }).expect(200);
  const wiped = await Enquiry.findById(_id).select('+image');
  assert.equal(wiped.contactPhone, undefined);
  assert.equal(wiped.address, undefined);
  assert.ok(wiped.anonymizedAt);

  // Everything finished more than 90 days ago loses personal data.
  const later = new Date(Date.now() + 91 * 86400000);
  const result = await runRetention(later);
  assert.ok(result.requests >= 2, JSON.stringify(result));
  const old = await Enquiry.find({ status: { $in: ['delivered', 'completed'] } });
  assert.ok(old.every((e) => !e.contactPhone && !e.customerName));
});

test('admin: stats, settings change the delivery charge, manual rider assignment', async () => {
  const stats = (await api.get('/api/admin/stats').set(auth(adminToken))).body;
  assert.ok(stats.requestsByType.basket >= 1);
  assert.equal(typeof stats.platformEarnings, 'number');

  await api.put('/api/admin/settings').set(auth(adminToken)).send({ delivery: { baseFare: 70 } }).expect(200);
  const menu = (await api.get(`/api/partners/${sessions.peters.pid}`)).body.listings;
  const q = await api.post('/api/enquiries/quote').send({ items: [{ listing: menu[0]._id, quantity: 1 }], location: NEAR });
  assert.equal(q.body.deliveryFee, 70);
  await api.put('/api/admin/settings').set(auth(adminToken)).send({ delivery: { baseFare: 60 } });

  const placed = await api.post('/api/enquiries').send({ type: 'basket', items: [{ listing: menu[0]._id, quantity: 1 }], ...customer, location: NEAR });
  const id = placed.body.enquiry._id;
  assert.equal((await api.post(`/api/admin/requests/${id}/assign`).set(auth(adminToken)).send({ partner: sessions.amit.pid })).status, 400, 'not accepted yet');
  await api.post(panel(sessions.peters, `/orders/${id}/status`)).set(auth(sessions.peters.token)).send({ status: 'accepted' });
  await api.post(`/api/admin/requests/${id}/assign`).set(auth(adminToken)).send({ partner: sessions.amit.pid }).expect(200);
  const amitOrders = (await api.get(panel(sessions.amit, '/orders')).set(auth(sessions.amit.token))).body.orders;
  assert.ok(amitOrders.some((o) => o._id === id));

  assert.equal((await api.get('/api/admin/stats').set(auth(sessions.amit.token))).status, 403);
});
