const mongoose = require('mongoose');
const config = require('./config');
const User = require('./models/User');
const Partner = require('./models/Partner');
const Listing = require('./models/Listing');

const DEMO_PASSWORD = 'demo123';

const img = (id) => `https://images.unsplash.com/photo-${id}?w=600`;

// Demo businesses and listings, matching the Primebookin app demo video.
const ROOMS = {
  bed: img('1611892440504-42a792e24d32'),
  suite: img('1590490360182-c33d57733427'),
  cosy: img('1618773928121-c32242e63f39'),
  twin: img('1631049307264-da0ec9d70304'),
  white: img('1578683010236-d716f9a3f461'),
  bright: img('1566665797739-1674de7a421a'),
  bath: img('1595576508898-0ad5c879a061'),
  wood: img('1505693416388-ac5ce068fe85'),
  loft: img('1522771739844-6a9f6d5f14af'),
};

const DEMO = [
  {
    owner: { name: 'Prime Stays Owner', phone: '9000000001' },
    partner: { type: 'hotel', businessName: 'Prime Stays Mahabaleshwar', city: 'Mahabaleshwar', address: 'Mahabaleshwar, Maharashtra', location: { lat: 17.9237, lng: 73.656 } },
    listings: [
      { name: 'Le Méridien Mahabaleshwar Resort', category: 'Hotels', price: 16500, description: '5-Star Luxury • Deep Forest Escape Valley', images: [img('1566073771259-6a8506099945'), ROOMS.suite, ROOMS.bed, ROOMS.bath], details: { amenities: ['Pool', 'Forest View', 'Spa', 'Breakfast'], extraBedPrice: 1500 } },
      { name: 'Brightland Resort & Spa', category: 'Hotels', price: 9500, description: "Overlooking Kate's Point Cliff side lines", images: [img('1582719478250-c89cae4dc85b'), ROOMS.white, ROOMS.twin, ROOMS.bath], details: { amenities: ['Cliff View', 'Spa', 'WiFi'], extraBedPrice: 1000 } },
      { name: 'Evershine Grand Palace Resort', category: 'Hotels', price: 8200, description: 'Palatial stone architecture design', images: [img('1571896349842-33c89424de2d'), ROOMS.bright, ROOMS.cosy], details: { amenities: ['Pool', 'Restaurant', 'Parking'], extraBedPrice: 900 } },
      { name: 'Cloud-Nine Cliffside Glasshouse', category: 'Villas', price: 14000, description: '2 BHK isolated Glass Structure Over valleys', images: [img('1613490493576-7fde63acd811'), img('1584132967334-10e028bd69f7'), ROOMS.loft, ROOMS.bed], details: { amenities: ['Private Pool', 'Valley View', 'Kitchen'], extraBedPrice: 1200 } },
      { name: 'Stone Wood Heritage Homestead', category: 'Bungalow', price: 5500, description: 'Traditional old stone bungalow frame layout', images: [img('1449844908441-8829872d2607'), ROOMS.wood, ROOMS.cosy], details: { amenities: ['Garden', 'Home Food', 'Bonfire'], extraBedPrice: 600 } },
    ],
  },
  {
    owner: { name: "Peter's Cafe Owner", phone: '9000000002' },
    partner: { type: 'restaurant', businessName: "Peter's Cafe", description: 'Continental • Steaks • Desserts', image: img('1517248135467-4c7edcad34c4'), city: 'Mahabaleshwar', address: 'Main Market, Mahabaleshwar', location: { lat: 17.9249, lng: 73.6568 } },
    listings: [
      { name: "Peter's Sizzling Chicken Steak", category: 'Non-Veg', price: 480, description: 'Tossed veggies & pepper sauce', images: [img('1544025162-d76694265947')], details: { isVeg: false } },
      { name: "Peter's Classic Strawberry Cream Bowl", category: 'Desserts', price: 240, description: 'Local strawberry crush layers', images: [img('1488477181946-6428a0291777')], details: { isVeg: true } },
      { name: 'Artisanal Loaded Cheese Flatbread', category: 'Fast Food', price: 390, description: 'Woodfired thin crust', images: [img('1513104890138-7c749659a591')], details: { isVeg: true } },
    ],
  },
  {
    owner: { name: 'Valley Spice Owner', phone: '9000000006' },
    partner: { type: 'restaurant', businessName: 'Valley Spice Kitchen', description: 'North Indian • Biryani • Tandoor', image: img('1555396273-367ea4eb4db5'), city: 'Mahabaleshwar', address: 'Panchgani Road, Mahabaleshwar', location: { lat: 17.9176, lng: 73.6612 } },
    listings: [
      { name: 'Hyderabadi Chicken Biryani', category: 'Non-Veg', price: 340, description: 'Slow-cooked dum biryani with raita', images: [img('1631515243349-e0cb75fb8d3a')], details: { isVeg: false } },
      { name: 'Paneer Tikka Platter', category: 'Veg', price: 290, description: 'Smoky tandoor paneer with mint chutney', images: [img('1567188040759-fb8a883dc6d8')], details: { isVeg: true } },
      { name: 'Royal Veg Thali', category: 'Veg', price: 260, description: 'Dal, two sabzi, rice, rotis and sweet', images: [img('1585937421612-70a008356fbe')], details: { isVeg: true } },
      { name: 'Crispy Samosa (2 pcs)', category: 'Snacks', price: 60, description: 'With tamarind and green chutney', images: [img('1601050690597-df0568f70950')], details: { isVeg: true } },
    ],
  },
  {
    owner: { name: 'Strawberry Hill Owner', phone: '9000000007' },
    partner: { type: 'restaurant', businessName: 'Strawberry Hill Cafe', description: 'Cafe • Pizza • Healthy Bowls', image: img('1552566626-52f8b828add9'), city: 'Mahabaleshwar', address: 'Venna Lake Road, Mahabaleshwar', location: { lat: 17.933, lng: 73.663 } },
    listings: [
      { name: 'Margherita Wood-fired Pizza', category: 'Fast Food', price: 350, description: 'San Marzano tomato, fresh mozzarella', images: [img('1565299624946-b28f40a0ae38')], details: { isVeg: true } },
      { name: 'Garden Fresh Salad Bowl', category: 'Healthy', price: 220, description: 'Greens, quinoa, seasonal veggies', images: [img('1546069901-ba9599a7e63c')], details: { isVeg: true } },
      { name: 'Strawberries & Cream', category: 'Desserts', price: 180, description: 'Farm-fresh Mahabaleshwar strawberries', images: [img('1488477181946-6428a0291777')], details: { isVeg: true } },
    ],
  },
  {
    owner: { name: 'City Medicals Owner', phone: '9000000003' },
    partner: { type: 'pharmacy', businessName: 'City Medicals', city: 'Mahabaleshwar', address: 'Bus Stand Road, Mahabaleshwar', location: { lat: 17.9255, lng: 73.655 } },
    listings: [
      { name: 'Essential Multi-Vitamins & Minerals', category: 'Wellness', price: 160, description: 'Standard over-the-counter wellness capsule box', images: [img('1584308666744-24d5c474f2ae')], details: { requiresPrescription: false } },
    ],
  },
  {
    owner: { name: 'Santosh Jadhav', phone: '9000000004' },
    partner: { type: 'cab', businessName: 'Santosh (Hill Cabs)', city: 'Mahabaleshwar', address: 'Mahabaleshwar Taxi Stand', vehicle: { type: 'sedan', number: 'MH 11 AB 1234', model: 'Swift Dzire' } },
    listings: [
      { name: 'Mahabaleshwar Sightseeing Complete Tour', category: 'Sightseeing', price: 3200, priceUnit: 'day', description: 'Full day private tour vehicle matching all tourist point grids', images: [img('1549317661-bd32c8ce0db2')], details: { tripType: 'full-day' } },
      { name: 'Panchgani Tableland Day Excursion Run', category: 'Sightseeing', price: 2400, priceUnit: 'day', description: 'Point to point group sightseeing day route allocation', images: [img('1549317661-bd32c8ce0db2')], details: { tripType: 'full-day' } },
    ],
  },
  {
    owner: { name: 'Sunil Pawar', phone: '9000000008' },
    partner: { type: 'cab', businessName: 'Sunil (Taxi)', city: 'Mahabaleshwar', vehicle: { type: 'hatchback', number: 'MH 11 CD 5678', model: 'Wagon R' } },
    listings: [],
  },
  {
    owner: { name: 'Ravi Rider', phone: '9000000005' },
    partner: { type: 'delivery', businessName: 'Ravi (Delivery)', city: 'Mahabaleshwar' },
    listings: [],
  },
  {
    owner: { name: 'Amit Rider', phone: '9000000009' },
    partner: { type: 'delivery', businessName: 'Amit (Delivery)', city: 'Mahabaleshwar' },
    listings: [],
  },
];

async function makeUser({ name, phone, role, password }) {
  const user = new User({ name, phone, role });
  await user.setPassword(password);
  return user.save();
}

// Creates the admin account and demo data if they don't exist yet. Safe to run on every start.
async function seed() {
  if (!(await User.exists({ role: 'admin' }))) {
    await makeUser({ name: 'Primebookin Admin', phone: config.adminPhone, role: 'admin', password: config.adminPassword });
    console.log(`Seeded admin account (phone ${config.adminPhone})`);
  }

  if (config.isProd || (await Partner.exists({}))) return;

  for (const demo of DEMO) {
    const owner = await makeUser({ ...demo.owner, role: 'partner', password: DEMO_PASSWORD });
    const partner = await Partner.create({ ...demo.partner, owner: owner._id, phone: owner.phone, status: 'approved', termsAcceptedAt: new Date() });
    const unit = { stay: 'night', cab: 'trip' }[partner.service] || 'item';
    await Listing.insertMany(demo.listings.map((l) => ({ priceUnit: unit, ...l, partner: partner._id, service: partner.service })));
  }
  console.log(`Seeded demo businesses (owner phones 9000000001-9, password ${DEMO_PASSWORD})`);
}

// `npm run seed` wipes the database and re-seeds it.
if (require.main === module) {
  const db = require('./db');
  (async () => {
    await db.connect();
    if (process.argv.includes('--reset')) {
      await mongoose.connection.dropDatabase();
      console.log('Database cleared');
    }
    await seed();
    await db.disconnect();
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { seed, DEMO_PASSWORD };
