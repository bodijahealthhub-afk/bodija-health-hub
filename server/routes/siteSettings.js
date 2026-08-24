const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');

const router = express.Router();

// GET /api/admin/site-settings — get all site settings
router.get('/', authenticateToken, requirePermission('site_settings.view'), async (req, res) => {
  try {
    const rows = await db.prepare('SELECT key, value FROM site_settings').all();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    res.json(settings);
  } catch (err) {
    console.error('Failed to fetch site settings:', err);
    res.status(500).json({ error: 'Failed to fetch site settings' });
  }
});

// PUT /api/admin/site-settings — update site settings
router.put('/', authenticateToken, requirePermission('site_settings.manage'), async (req, res) => {
  try {
    const updates = req.body;
    const upsert = db.prepare(
      'INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP'
    );

    await db.transaction(async () => {
      for (const [key, value] of Object.entries(updates)) {
        if (typeof value === 'object' && value !== null) {
          await upsert.run(key, JSON.stringify(value));
        } else {
          await upsert.run(key, String(value ?? ''));
        }
      }
    });

    const rows = await db.prepare('SELECT key, value FROM site_settings').all();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    res.json(settings);
  } catch (err) {
    console.error('Failed to update site settings:', err);
    res.status(500).json({ error: 'Failed to update site settings' });
  }
});

module.exports = router;
