const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();

app.use(helmet());
// In development any localhost port is allowed, since the dev server may not get 3000.
const localhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
app.use(cors({ origin: config.isProd ? config.corsOrigin : [...config.corsOrigin, localhost] }));
// Photos and documents are sent as data URLs for now, hence the higher limit.
app.use(express.json({ limit: '14mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Static app configuration the client needs on startup.
app.get('/api/meta', (_req, res) => {
  res.json({
    services: [
      { key: 'stay', label: 'Stays', partnerType: 'hotel' },
      { key: 'food', label: 'Food', partnerType: 'restaurant' },
      { key: 'medicine', label: 'Medicines', partnerType: 'pharmacy' },
      { key: 'cab', label: 'Cabs', partnerType: 'cab' },
    ],
    partnerTypes: [
      { key: 'hotel', label: 'Hotel / Resort Owner' },
      { key: 'restaurant', label: 'Restaurant Owner' },
      { key: 'pharmacy', label: 'Medical Store / Pharmacy' },
      { key: 'cab', label: 'Cab / Taxi Driver' },
      { key: 'delivery', label: 'Delivery Partner' },
    ],
    supportWhatsapp: config.supportWhatsapp,
    currency: 'INR',
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/maps', require('./routes/maps'));
app.use('/api/panel', require('./routes/panel'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
