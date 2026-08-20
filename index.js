// Root entry point for Render deployment
const app = require('./server/index.js');
const db = require('./server/models/database');
const { startScheduler } = require('./server/utils/scheduler');
const PORT = process.env.PORT || 5000;

db.ready.then(() => {
  app.listen(PORT, () => {
    console.log(`Bodija Health Hub server running on port ${PORT}`);
    startScheduler();
  });
}).catch((err) => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});
