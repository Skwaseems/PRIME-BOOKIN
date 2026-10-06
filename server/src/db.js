const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const config = require('./config');

let memoryServer = null;

// Connects to MONGO_URI (e.g. MongoDB Atlas). Without it, in development, starts an
// embedded MongoDB whose data persists in server/.data. `dbName` overrides the
// database name, which the tests use to stay away from real data.
async function connect({ dbName } = {}) {
  let uri = config.mongoUri;

  if (!uri) {
    if (config.isProd) throw new Error('MONGO_URI must be set in production');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const instance = {};
    if (process.env.NODE_ENV !== 'test') {
      const dbPath = path.join(__dirname, '..', '.data');
      fs.mkdirSync(dbPath, { recursive: true });
      Object.assign(instance, { dbPath, storageEngine: 'wiredTiger', port: 27018 });
    }
    memoryServer = await MongoMemoryServer.create({ instance });
    uri = memoryServer.getUri();
    if (process.env.NODE_ENV !== 'test') console.log(`Embedded MongoDB running at ${uri}`);
  }

  // Atlas connection strings usually have no database name, which would mean "test".
  const uriHasDb = new URL(uri).pathname.length > 1;
  await mongoose.connect(uri, { dbName: dbName || (uriHasDb ? undefined : 'primebookin') });
  if (process.env.NODE_ENV !== 'test') console.log(`Connected to database "${mongoose.connection.name}"`);
}

async function disconnect() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
  memoryServer = null;
}

module.exports = { connect, disconnect };
