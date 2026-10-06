const { HttpError } = require('./middleware/errors');

// Place search (Nominatim) and road distance (OSRM), both on free OpenStreetMap
// services. Fine for development and low traffic; for production volumes point
// NOMINATIM_URL / OSRM_URL at a paid or self-hosted provider.

const NOMINATIM_URL = process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org';
const OSRM_URL = process.env.OSRM_URL || 'https://router.project-osrm.org';
const USER_AGENT = `Primebookin/0.1 (${process.env.MAPS_CONTACT || 'primebookin app'})`;

const cache = new Map();
const CACHE_MAX = 1000;
const remember = (key, value) => {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(key, value);
  return value;
};

// Nominatim allows one request per second, so requests queue up.
let nominatimChain = Promise.resolve();
const nominatim = (path) => {
  const run = nominatimChain.then(async () => {
    let res;
    try {
      res = await fetch(`${NOMINATIM_URL}${path}`, {
        headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en' },
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      res = null; // offline, DNS failure or timeout
    }
    if (!res?.ok) throw new HttpError(502, 'Location search is unavailable right now. Tap the map to set the point instead.');
    return res.json();
  });
  nominatimChain = run.catch(() => {}).then(() => new Promise((r) => setTimeout(r, 1100)));
  return run;
};

const shortLabel = (place) => {
  const a = place.address || {};
  const first = place.name || a.road || a.neighbourhood || a.suburb;
  const area = a.city || a.town || a.village || a.county || a.state_district;
  return [first, area !== first ? area : null].filter(Boolean).join(', ') || place.display_name;
};

const toPlace = (p) => ({
  label: shortLabel(p),
  address: p.display_name,
  lat: Number(Number(p.lat).toFixed(6)),
  lng: Number(Number(p.lon).toFixed(6)),
});

async function searchPlaces(q) {
  const key = `s:${q.toLowerCase()}`;
  if (cache.has(key)) return cache.get(key);
  const rows = await nominatim(
    `/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=in&q=${encodeURIComponent(q)}`,
  );
  return remember(key, rows.map(toPlace));
}

async function reverse(lat, lng) {
  const key = `r:${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (cache.has(key)) return cache.get(key);
  const row = await nominatim(`/reverse?format=jsonv2&addressdetails=1&zoom=17&lat=${lat}&lon=${lng}`);
  const place = row && !row.error ? toPlace(row) : { label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, address: '', lat, lng };
  return remember(key, { ...place, lat, lng });
}

const haversineKm = (a, b) => {
  const rad = (d) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
};

// Road route between two points. Falls back to straight-line distance x 1.3
// (marked approximate) if the routing service is down.
async function route(from, to) {
  const key = `d:${from.lat.toFixed(5)},${from.lng.toFixed(5)};${to.lat.toFixed(5)},${to.lng.toFixed(5)}`;
  if (cache.has(key)) return cache.get(key);
  try {
    const res = await fetch(
      `${OSRM_URL}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=simplified&geometries=geojson`,
      { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(15000) },
    );
    const body = await res.json();
    if (body.code !== 'Ok' || !body.routes?.length) throw new Error(body.code || 'No route');
    const r = body.routes[0];
    return remember(key, {
      distanceKm: Math.round(r.distance / 100) / 10,
      durationMin: Math.round(r.duration / 60),
      // [lat, lng] pairs for drawing the route on the map
      path: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      approximate: false,
    });
  } catch {
    const km = Math.round(haversineKm(from, to) * 1.3 * 10) / 10;
    return { distanceKm: km, durationMin: Math.round((km / 40) * 60), path: [[from.lat, from.lng], [to.lat, to.lng]], approximate: true };
  }
}

const fareFor = (vehicle, km) => Math.max(vehicle.minFare, Math.round((vehicle.perKm * km) / 10) * 10);

// vehicles come from Settings.cab.vehicles
const fares = (km, vehicles) => vehicles.map((v) => ({ ...v, fare: fareFor(v, km) }));

function vehicleOrThrow(key, vehicles) {
  const v = vehicles.find((x) => x.key === key);
  if (!v) throw new HttpError(400, 'Choose a vehicle');
  return v;
}

module.exports = { searchPlaces, reverse, route, fares, fareFor, vehicleOrThrow, haversineKm };
