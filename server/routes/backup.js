const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/backup (admin - export all data)
router.get('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const tables = ['users', 'doctors', 'services', 'appointments', 'patients', 'blog_posts', 'events', 'gallery', 'testimonials', 'messages', 'newsletter_subscribers', 'contact_info', 'site_content', 'page_sections', 'media', 'seo_settings', 'site_settings'];
    const data = {};
    for (const table of tables) {
      data[table] = db.prepare(`SELECT * FROM ${table}`).all();
    }
    res.json({ export_date: new Date().toISOString(), data });
  } catch (err) {
    console.error('Error exporting data:', err);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// POST /api/backup (admin - import data)
router.post('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });
    
    const importable = ['services', 'blog_posts', 'events', 'gallery', 'testimonials', 'contact_info', 'site_content', 'page_sections', 'media', 'seo_settings', 'site_settings'];
    const transaction = db.transaction(() => {
      for (const table of importable) {
        if (data[table] && Array.isArray(data[table])) {
          for (const row of data[table]) {
            const columns = Object.keys(row).filter(c => c !== 'id');
            const placeholders = columns.map(() => '?').join(', ');
            const values = columns.map(c => row[c]);
            try {
              db.prepare(`INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`).run(...values);
            } catch (e) { /* skip errors */ }
          }
        }
      }
    });
    transaction();
    res.json({ success: true, message: 'Data imported successfully' });
  } catch (err) {
    console.error('Error importing data:', err);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

module.exports = router;
