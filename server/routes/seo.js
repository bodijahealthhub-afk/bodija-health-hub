const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/seo (admin - all pages)
router.get('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM seo_settings ORDER BY page_id').all();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching SEO settings:', err);
    res.status(500).json({ error: 'Failed to fetch SEO settings' });
  }
});

// GET /api/seo/:pageId (public)
router.get('/:pageId', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM seo_settings WHERE page_id = ?').get(req.params.pageId);
    res.json(row || {});
  } catch (err) {
    console.error('Error fetching SEO:', err);
    res.status(500).json({ error: 'Failed to fetch SEO' });
  }
});

// PUT /api/seo/:pageId (admin)
router.put('/:pageId', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { meta_title, meta_description, og_title, og_description, og_image, twitter_card, twitter_title, twitter_description, twitter_image, canonical, noindex, nofollow } = req.body;
    const existing = db.prepare('SELECT id FROM seo_settings WHERE page_id = ?').get(req.params.pageId);
    if (existing) {
      db.prepare('UPDATE seo_settings SET meta_title=?, meta_description=?, og_title=?, og_description=?, og_image=?, twitter_card=?, twitter_title=?, twitter_description=?, twitter_image=?, canonical=?, noindex=?, nofollow=?, updated_at=CURRENT_TIMESTAMP WHERE page_id=?').run(meta_title, meta_description, og_title, og_description, og_image, twitter_card, twitter_title, twitter_description, twitter_image, canonical, noindex ? 1 : 0, nofollow ? 1 : 0, req.params.pageId);
    } else {
      db.prepare('INSERT INTO seo_settings (page_id, meta_title, meta_description, og_title, og_description, og_image, twitter_card, twitter_title, twitter_description, twitter_image, canonical, noindex, nofollow) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(req.params.pageId, meta_title, meta_description, og_title, og_description, og_image, twitter_card || 'summary_large_image', twitter_title, twitter_description, twitter_image, canonical, noindex ? 1 : 0, nofollow ? 1 : 0);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating SEO:', err);
    res.status(500).json({ error: 'Failed to update SEO' });
  }
});

module.exports = router;
