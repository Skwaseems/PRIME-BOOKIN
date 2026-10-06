require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me')) {
  throw new Error('JWT_SECRET must be set in production');
}

if (process.env.MONGO_URI && !/^mongodb(\+srv)?:\/\//.test(process.env.MONGO_URI)) {
  throw new Error(
    'MONGO_URI in server/.env is not a MongoDB connection string. ' +
      'Paste the one from Atlas (starts with mongodb+srv://), or leave it empty to use the embedded database.',
  );
}

module.exports = {
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map((s) => s.trim()),
  adminPhone: process.env.ADMIN_PHONE || '9999999999',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  supportWhatsapp: process.env.SUPPORT_WHATSAPP || '917768817510',

  // Delivery charges, cab fares, commissions and data retention are in the
  // Settings model, editable from the admin panel.
};
