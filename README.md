# Prime Bookin — Web App

Premium multi-service ordering web app (cab, hotel, food, medical, grocery,
local shops) with Google sign-in, a multi-store cart, and checkout. Built
with Next.js (App Router), TypeScript, Tailwind CSS v4, Framer Motion,
Firebase Authentication and Firestore.

**Phase 1** (landing + Google sign-in) and **Phase 2** (browse, cart,
checkout, order confirmation) are done. WhatsApp order automation and the
admin/vendor/driver apps described in the full platform blueprint come in
later phases — see Roadmap below.

## 1. Install dependencies

```bash
npm install
```

## 2. Firebase project setup

You've already created the `prime-bookin` Firebase project and enabled
Google sign-in. Two more things to turn on:

1. **Firestore Database** — in the Firebase console, go to
   **Build → Firestore Database → Create database**, start in production
   mode, pick a region close to India (e.g. `asia-south1`).
2. **Security rules** — this repo ships [firestore.rules](firestore.rules):
   customers can create an order for themselves and read only their own
   orders. Paste its contents into **Firestore Database → Rules** in the
   console and publish (or deploy via the Firebase CLI once you have it
   installed: `firebase deploy --only firestore:rules`). Without this,
   checkout will fail with a permissions error, since new Firestore
   databases deny all reads/writes by default.
3. **Authorized domains** — in **Authentication → Settings → Authorized
   domains**, add `primebookin.in` and `www.primebookin.in` once you deploy.

## 3. Configure environment variables

`.env.local` already has your real Firebase config and is git-ignored, so
it won't be committed. If you ever need to recreate it, copy the example:

```bash
cp .env.local.example .env.local
```

## 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Click **Continue with Google** to sign in.
- Browse a category (e.g. Medical Store), add a couple of items, then check
  the cart icon in the navbar.
- Go to `/cart` → items are grouped by store with subtotal, delivery, GST
  and grand total.
- `/checkout` → fill in the delivery address (or use "Use my current
  location" for a map preview), pick **Cash on Delivery** (the only payment
  method wired up so far), and place the order.
- You'll land on `/order/[id]` — the order is saved in Firestore under the
  `orders` collection, scoped to your account.

## 5. Test on your mobile

### Quick look over Wi-Fi (same network as your PC)

```bash
npm run dev:mobile
```

Find your PC's local IP (`ipconfig` on Windows, `ifconfig` on macOS/Linux),
e.g. `192.168.1.5`, and open `http://192.168.1.5:3000` on your phone. Allow
Node through the Windows firewall if prompted. `next.config.ts` already
allows `192.168.x.x`, `10.x.x.x`, `172.x.x.x` and `100.x.x.x` origins; add yours to
`allowedDevOrigins` if your network uses a different range.

Limitations: Google sign-in will likely fail (Firebase only authorizes
`localhost` and domains you add), and "Use my current location" needs HTTPS.

### Full test with sign-in and location (HTTPS)

- **Vercel (recommended):** import the repo at vercel.com, add the
  `NEXT_PUBLIC_FIREBASE_*` values from `.env.local` as environment
  variables, deploy, then add the `*.vercel.app` domain under Firebase
  **Authentication → Settings → Authorized domains**.
- **Tunnel:** run `npm run dev` and `npx ngrok http 3000`, open the
  `https://…ngrok-free.app` URL on your phone, and add that domain to
  Firebase Authorized domains (it changes on each restart of the free tier).

Tip: use **Add to Home Screen** in Chrome/Safari — the app ships a web
manifest and icons, so it opens full-screen like an installed app.

## Project structure

```
src/
  app/
    page.tsx                  Landing page
    services/[category]/      Category listing (cabs, hotels, food, medical, grocery, other)
    cart/                     Cart page
    checkout/                 Checkout: address, location, payment method
    order/[orderId]/          Order confirmation (reads from Firestore)
  components/                 Navbar, Hero, ServiceCategories, OfferingCard, etc.
  context/                    AuthContext, ThemeContext, CartContext (localStorage-persisted)
  data/catalog.ts             Mock stores + offerings per category (swap for real data later)
  lib/firebase.ts             Firebase app + auth + Firestore initialization
firestore.rules               Security rules for the `orders` collection
```

## Roadmap (next phases)

- Replace `src/data/catalog.ts` mock data with real store/product data in
  Firestore, plus a vendor portal to manage it
- Razorpay integration for UPI/Card/Wallet (currently disabled — COD only)
- Google Maps Distance Matrix for real distance-based delivery pricing
  (currently a flat ₹40/store fee) and drag-to-pin address selection
  (currently browser geolocation + a read-only map preview)
- WhatsApp order notifications to store owners and admin
- Admin dashboard (orders, stores, users, analytics, commissions)
- Vendor/partner portal, delivery-partner app, cab-driver app — these are
  best built as separate Flutter/React Native apps sharing this same
  Firebase backend, once the web app's data model has stabilized
- Deployment to Firebase Hosting under `www.primebookin.in`
