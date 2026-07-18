const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings (public — returns all settings)
router.get('/', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM contact_info').all();
    const settingsObj = {};
    for (const s of settings) {
      settingsObj[s.key] = s.value;
    }
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings (admin)
router.put('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const updates = req.body;
    const upsert = db.prepare(
      'INSERT INTO contact_info (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    );

    const updateMany = db.transaction((items) => {
      for (const [key, value] of Object.entries(items)) {
        upsert.run(key, value);
      }
    });

    updateMany(updates);

    // Return updated settings
    const settings = db.prepare('SELECT * FROM contact_info').all();
    const settingsObj = {};
    for (const s of settings) {
      settingsObj[s.key] = s.value;
    }
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
