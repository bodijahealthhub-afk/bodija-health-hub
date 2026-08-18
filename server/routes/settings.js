const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings (public — returns all settings)
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const settings = await db.prepare('SELECT * FROM contact_info').all();
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
router.put('/', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const updates = req.body;
    const upsert = db.prepare(
      'INSERT INTO contact_info (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    );

    await db.transaction(async () => {
      for (const [key, value] of Object.entries(updates)) {
        await upsert.run(key, value);
      }
    });

    // Return updated settings
    const settings = await db.prepare('SELECT * FROM contact_info').all();
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
