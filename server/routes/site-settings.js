const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/site-settings (public)
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM site_settings').all();
    const settings = {};
    rows.forEach(row => { settings[row.key] = row.value; });
    res.json(settings);
  } catch (err) {
    console.error('Error fetching site settings:', err);
    res.status(500).json({ error: 'Failed to fetch site settings' });
  }
});

// PUT /api/site-settings (admin)
router.put('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const updates = req.body;
    const upsert = db.prepare('INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP');
    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(updates)) {
        upsert.run(key, value);
      }
    });
    transaction();
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating site settings:', err);
    res.status(500).json({ error: 'Failed to update site settings' });
  }
});

module.exports = router;
