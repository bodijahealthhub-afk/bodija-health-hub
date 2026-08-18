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
      database = { status: 'error', driver, error: 'Database connection failed' };
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

    let backups = { count: 0, latest: null, autoBackupEnabled: true };
    try {
      const rows = await db.prepare('SELECT COUNT(*) AS count FROM backups').get();
      backups.count = Number(rows ? rows.count : 0);
      const latest = await db.prepare('SELECT created_at FROM backups ORDER BY created_at DESC LIMIT 1').get();
      backups.latest = latest ? latest.created_at : null;
    } catch {
      // backups table unavailable — report as empty
    }
    if (process.env.AUTO_BACKUP_ENABLED === 'false') {
      backups.autoBackupEnabled = false;
    }

    let featureFlags = { count: 0, activeCount: 0, loaded: false };
    try {
      const flagCount = await db.prepare('SELECT COUNT(*) AS count FROM feature_flags').get();
      featureFlags.count = Number(flagCount ? flagCount.count : 0);
      const activeCount = await db.prepare("SELECT COUNT(*) AS count FROM feature_flags WHERE enabled = 1").get();
      featureFlags.activeCount = Number(activeCount ? activeCount.count : 0);
      featureFlags.loaded = featureFlags.count > 0;
    } catch {
      // feature_flags table unavailable
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

    const email = { configured: Boolean(process.env.SMTP_HOST), host: process.env.SMTP_HOST || null, from: process.env.SMTP_FROM || null };

    const mem = process.memoryUsage();

    const statusSummary = {
      server: database.status === 'ok' ? 'healthy' : 'degraded',
      database: database.status,
      email: email.configured ? 'configured' : 'not_configured',
      payments: payments.mock ? 'test_mode' : 'live',
      backups: backups.autoBackupEnabled ? 'auto_enabled' : 'auto_disabled',
      features: featureFlags.loaded ? 'loaded' : 'error',
    };

    res.json({
      status: statusSummary,
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
      featureFlags,
      storage,
      backups,
      email,
      payments,
      env: {
        DB_PATH: Boolean(process.env.DB_PATH),
        DATABASE_URL: Boolean(process.env.DATABASE_URL),
        DB_BACKEND: process.env.DB_BACKEND || null,
        SMTP_HOST: Boolean(process.env.SMTP_HOST),
        SMTP_PORT: process.env.SMTP_PORT || null,
        PAYSTACK_SECRET_KEY: Boolean(process.env.PAYSTACK_SECRET_KEY),
        PAYSTACK_MOCK: process.env.PAYSTACK_MOCK || null,
        SENTRY_DSN: Boolean(process.env.SENTRY_DSN),
        UPLOADS_DIR: process.env.UPLOADS_DIR || null,
        CORS_ORIGINS: Boolean(process.env.CORS_ORIGINS),
        ADMIN_EMAIL: Boolean(process.env.ADMIN_EMAIL),
        AUTO_BACKUP_ENABLED: process.env.AUTO_BACKUP_ENABLED || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to run health checks' });
  }
});

module.exports = router;
