const express = require('express');
const { z } = require('zod');
const maps = require('../maps');
const { getSettings } = require('../models/Settings');
const { validate } = require('../middleware/errors');

const router = express.Router();

const lat = z.coerce.number().min(-90).max(90);
const lng = z.coerce.number().min(-180).max(180);
const point = z
  .string()
  .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, 'Use lat,lng')
  .transform((s) => {
    const [a, b] = s.split(',').map(Number);
    return { lat: a, lng: b };
  });

router.get('/search', validate(z.object({ q: z.string().trim().min(3, 'Type at least 3 letters').max(120) }), 'query'), async (req, res) => {
  res.json({ places: await maps.searchPlaces(req.validQuery.q) });
});

router.get('/reverse', validate(z.object({ lat, lng }), 'query'), async (req, res) => {
  res.json({ place: await maps.reverse(req.validQuery.lat, req.validQuery.lng) });
});

// Distance, travel time, route line and fare per vehicle.
router.get('/route', validate(z.object({ from: point, to: point }), 'query'), async (req, res) => {
  const [r, settings] = await Promise.all([maps.route(req.validQuery.from, req.validQuery.to), getSettings()]);
  res.json({ ...r, fares: maps.fares(r.distanceKm, settings.cab.vehicles) });
});

module.exports = router;
