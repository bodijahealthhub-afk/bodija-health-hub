const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getFlag } = require('../utils/features');

const router = express.Router();

// GET /api/admin/system-health — operational health checks for the admin console.
router.get('/', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const driver = process.env.DATABASE_URL ? 'postgres'
      : process.env.DB_BACKEND === 'pglite' ? 'pglite' : 'sqlite';

    let database = { status: 'error', driver, error: 'Could not reach database' };
    try {
      await db.prepare('SELECT 1').get();
      database = { status: 'ok', driver };
    } catch (err) {
      database = { status: 'error', driver, error: err.message };
    }

    const tables = ['users', 'services', 'providers', 'partners', 'events', 'programmes',
      'appointments', 'patients', 'blog_posts', 'feature_flags', 'messages', 'payments', 'backups'];
    const tableCounts = {};
    for (const table of tables) {
      try {
        const row = await db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get();
        tableCounts[table] = Number(row ? row.count : 0);
      } catch {
        tableCounts[table] = null;
      }
    }

    const uploadsDir = path.resolve(process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads'));
    let storage = { uploadsDir, exists: false, writable: false };
    try {
      if (fs.existsSync(uploadsDir)) {
        storage.exists = true;
        fs.accessSync(uploadsDir, fs.constants.W_OK);
        storage.writable = true;
        const stat = fs.statfsSync(uploadsDir);
        storage.freeBytes = stat.bavail * stat.bsize;
        storage.freeGb = Number((storage.freeBytes / 1073741824).toFixed(2));
      }
    } catch {
      storage.writable = false;
    }

    let backups = { count: 0, latest: null };
    try {
      const rows = await db.prepare('SELECT COUNT(*) AS count FROM backups').get();
      backups.count = Number(rows ? rows.count : 0);
      const latest = await db.prepare('SELECT created_at FROM backups ORDER BY created_at DESC LIMIT 1').get();
      backups.latest = latest ? latest.created_at : null;
    } catch {
      // backups table unavailable — report as empty
    }

    let payments = { mock: true, gatewayConfigured: false, flagEnabled: false };
    try {
      const flag = await getFlag('payment_system');
      payments.flagEnabled = Boolean(flag && flag.enabled);
    } catch {
      // feature table unavailable
    }
    payments.gatewayConfigured = Boolean(process.env.PAYSTACK_SECRET_KEY);
    payments.mock = process.env.PAYSTACK_MOCK === 'true' || !payments.gatewayConfigured;

    const mem = process.memoryUsage();

    res.json({
      server: {
        status: 'ok',
        uptime: process.uptime(),
        node: process.version,
        platform: process.platform,
        hostname: os.hostname(),
        memory: { rssMb: Math.round(mem.rss / 1048576), heapMb: Math.round(mem.heapUsed / 1048576) },
      },
      database,
      tableCounts,
      storage,
      backups,
      email: { configured: Boolean(process.env.SMTP_HOST), host: process.env.SMTP_HOST || null, from: process.env.SMTP_FROM || null },
      payments,
      env: {
        DB_PATH: Boolean(process.env.DB_PATH),
        DATABASE_URL: Boolean(process.env.DATABASE_URL),
        DB_BACKEND: process.env.DB_BACKEND || null,
        SMTP_HOST: Boolean(process.env.SMTP_HOST),
        PAYSTACK_SECRET_KEY: Boolean(process.env.PAYSTACK_SECRET_KEY),
        PAYSTACK_MOCK: process.env.PAYSTACK_MOCK || null,
        SENTRY_DSN: Boolean(process.env.SENTRY_DSN),
        UPLOADS_DIR: process.env.UPLOADS_DIR || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to run health checks' });
  }
});

module.exports = router;
