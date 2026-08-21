// Root entry point for Render deployment
const app = require('./server/index.js');
const db = require('./server/models/database');
const { startScheduler } = require('./server/utils/scheduler');
const PORT = process.env.PORT || 5000;

// --- Startup validation (production) ---
if (process.env.NODE_ENV === 'production') {
  const missing = [];
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.ADMIN_EMAIL) missing.push('ADMIN_EMAIL');
  if (!process.env.ADMIN_PASSWORD) missing.push('ADMIN_PASSWORD');
  if (missing.length) {
    console.error(`[startup] FATAL: Missing required env vars: ${missing.join(', ')}`);
    console.error('[startup] Set these in your hosting dashboard (Render -> Environment tab).');
    process.exit(1);
  }
}

// --- Graceful shutdown ---
let server;
function shutdown(signal) {
  console.log(`[shutdown] Received ${signal}, shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('[shutdown] HTTP server closed.');
      try { db.close(); } catch (_) {}
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[shutdown] Forced exit after timeout.');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

db.ready.then(() => {
  server = app.listen(PORT, () => {
    console.log(`Bodija Health Hub server running on port ${PORT}`);
    startScheduler();
  });
}).catch((err) => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});
