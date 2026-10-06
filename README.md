# Primebookin

One platform for **Stays, Food, Medicines and Cabs** in Mahabaleshwar, Panchgani, Bhilar,
Medha and nearby. It is a single web app (installable on phones) with:

| Who | Where | What they do |
|---|---|---|
| Customers | `/` | Browse and order without an account. Every request is also sent as a WhatsApp message to Primebookin |
| Hotels / villas | `/partner/<id>` | Confirm bookings, check guests in and out, manage rooms and photos |
| Restaurants | `/partner/<id>` | New orders ring. Accept, prepare, mark ready, manage the menu and stock |
| Medical stores | `/partner/<id>` | Prescription requests ring. First pharmacy to send a price gets the order |
| Cab drivers | `/partner/<id>` | Go online. Nearby rides of their vehicle type ring, first to accept gets it. Customer OTP starts the ride |
| Delivery partners | `/partner/<id>` | Go online. Nearby deliveries ring. Reached store → picked up → reached customer → delivered (OTP) |
| Admin | `/admin` | Approve partners (with documents), all orders, live map, fares, commissions, privacy |

New partners register at `/partner/register` with their documents (FSSAI, drug licence,
GST, DL, RC, insurance, Aadhaar, PAN…) and accept the Partner Terms. **Nothing works until
an admin approves them.**

```
primebookin/
  client/   React + TypeScript web app
            src/pb/     customer screens (Explore, stay & restaurant pages, Cart/checkout, Bookings, Support, legal)
            src/panel/  partner registration, partner panels, admin panel
  server/   Express + MongoDB API
  docs/     Notes and the original HTML prototype (docs/legacy-prototype)
```

## Running locally

Requirements: Node.js 20+ and a MongoDB database. We use a free **MongoDB Atlas** cluster:

1. Sign up at https://www.mongodb.com/cloud/atlas/register and create a free **M0** cluster.
2. *Database Access*: add a database user with a password.
3. *Network Access*: add your IP address (or `0.0.0.0/0` while developing).
4. *Connect → Drivers*: copy the `mongodb+srv://...` string, put your password in it, and
   set it as `MONGO_URI` in `server/.env` (copy `server/.env.example` if `.env` doesn't exist).

The app uses the `primebookin` database and the tests use `primebookin_test`, which they
wipe on every run.

```bash
npm --prefix server install
npm --prefix server run dev        # API on http://localhost:5000
```

```bash
npm --prefix client install
npm --prefix client start          # app on http://localhost:3000
```

On first start the server creates (all demo passwords are `demo123`):

| Account | Phone |
|---|---|
| Admin | 9999999999 / admin123 (set `ADMIN_PHONE` / `ADMIN_PASSWORD` in `server/.env`) |
| Hotel (5 stays) | 9000000001 |
| Peter's Cafe | 9000000002 |
| City Medicals | 9000000003 |
| Cab driver Santosh (Sedan) | 9000000004 |
| Rider Ravi | 9000000005 |
| Valley Spice Kitchen | 9000000006 |
| Strawberry Hill Cafe | 9000000007 |
| Cab driver Sunil (Hatchback) | 9000000008 |
| Rider Amit | 9000000009 |

`npm run seed` in `server/` wipes the database and re-creates these.
`npm test` runs the API tests (10 suites covering every flow).

## How it works

**Requests** (`server/src/models/Enquiry.js`, lifecycle in `server/src/jobs.js`):

| Type | Goes to | Steps |
|---|---|---|
| Food / medicine basket | the store | new → accepted → preparing → ready → picked up → delivered. Nearby online riders are alerted once the store accepts |
| Medicine (text / prescription photo) | all open pharmacies in range | first to send a price takes it, then as above |
| Room booking | the hotel | new → confirmed → checked in → completed |
| Cab ride | online drivers within range with that vehicle type | first to accept → arrived → started (customer OTP) → completed |
| Custom dish | admin / WhatsApp | new → handled |

- **Prices** are always calculated on the server.
- **Delivery charge:** ₹60 for the first km + ₹20 per further km. The distance comes from the customer's map pin. Hot food only within 5 km of the restaurant.
- **Cab fares:** per km by vehicle, with a minimum fare.
- **Commissions:** taken per service.
- **Rider share:** a % of the delivery charge.
- All of these are editable in **Admin → Settings**.

**Live alerts**: panels keep a Server-Sent Events stream open (`/api/panel/:id/stream`,
`/api/admin/stream`). They ring and vibrate while there are new orders / open jobs, and
also refresh every 30 s as a fallback.

**Privacy** (DPDP Act 2023):
- **Consent:** checkboxes on every customer form, and Partner Terms at registration.
- **Limited sharing:** riders and drivers see contact details only after accepting.
- **Automatic deletion:** names, phones, addresses, locations, medicine notes and prescription photos are deleted automatically **90 days** after a request finishes (configurable). This runs every 6 h, or on demand from the admin dashboard.
- **Customer erasure:** customers can delete their details now from Bookings.
- **Secret keys:** requests are looked up only with a secret key kept on the customer's phone.
- **Policy pages:** see `/privacy`, `/terms` and `/partner-terms`.

## Next steps

1. Payments (Razorpay / Cashfree: UPI, cards, netbanking) and partner payouts
2. SMS OTP login (Fast2SMS / Twilio) and push notifications (Firebase) so phones ring even when the app is closed
3. Move photos and documents from the database to cloud storage (e.g. Cloudinary / S3)
4. Paid maps for production traffic (Google Maps / MapmyIndia; OpenStreetMap's free services are for light use)
5. Surge / night fees, town zones (Mahabaleshwar, Panchgani, Bhilar, Medha), ratings & reviews
6. AI features from the blueprint (prescription reader, recommendations, Marathi/Hindi search)
7. Deployment (server + database + domain + HTTPS), then Play Store app (wrap the web app or Flutter)
