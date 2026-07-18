const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/site-content (public)
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM site_content').all();
    const content = {};
    rows.forEach(row => { content[row.key] = row.value; });
    res.json(content);
  } catch (err) {
    console.error('Error fetching site content:', err);
    res.status(500).json({ error: 'Failed to fetch site content' });
  }
});

// PUT /api/site-content (admin)
router.put('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const updates = req.body;
    const upsert = db.prepare('INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP');
    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(updates)) {
        upsert.run(key, value);
      }
    });
    transaction();
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating site content:', err);
    res.status(500).json({ error: 'Failed to update site content' });
  }
});

module.exports = router;
