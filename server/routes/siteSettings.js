const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/site-settings — get all site settings
router.get('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM site_settings').all();
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
router.put('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const updates = req.body;
    const upsert = db.prepare(
      'INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP'
    );

    const updateMany = db.transaction((items) => {
      for (const [key, value] of Object.entries(items)) {
        if (typeof value === 'object' && value !== null) {
          upsert.run(key, JSON.stringify(value));
        } else {
          upsert.run(key, String(value ?? ''));
        }
      }
    });

    updateMany(updates);

    const rows = db.prepare('SELECT key, value FROM site_settings').all();
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
