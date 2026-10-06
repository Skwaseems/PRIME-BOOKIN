const config = require('./config');
const db = require('./db');
const app = require('./app');
const { seed } = require('./seed');
const privacy = require('./privacy');

async function main() {
  await db.connect();
  await seed();
  privacy.schedule();
  const server = app.listen(config.port, () => {
    console.log(`Primebookin API running on http://localhost:${config.port}`);
  });

  const shutdown = async () => {
    server.close();
    await db.disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
