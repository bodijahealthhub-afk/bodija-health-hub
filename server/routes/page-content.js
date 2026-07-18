const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/page-content/:pageId (public)
router.get('/:pageId', (req, res) => {
  try {
    const sections = db.prepare('SELECT * FROM page_sections WHERE page_id = ? ORDER BY sort_order').all(req.params.pageId);
    res.json(sections);
  } catch (err) {
    console.error('Error fetching page content:', err);
    res.status(500).json({ error: 'Failed to fetch page content' });
  }
});

// POST /api/page-content (admin)
router.post('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { page_id, title, content, image, button_text, button_link, sort_order } = req.body;
    const result = db.prepare('INSERT INTO page_sections (page_id, title, content, image, button_text, button_link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)').run(page_id, title, content, image, button_text, button_link, sort_order || 0);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error('Error creating page section:', err);
    res.status(500).json({ error: 'Failed to create page section' });
  }
});

// PUT /api/page-content/:id (admin)
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { title, content, image, button_text, button_link, sort_order } = req.body;
    db.prepare('UPDATE page_sections SET title = ?, content = ?, image = ?, button_text = ?, button_link = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title, content, image, button_text, button_link, sort_order, req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating page section:', err);
    res.status(500).json({ error: 'Failed to update page section' });
  }
});

// DELETE /api/page-content/:id (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    db.prepare('DELETE FROM page_sections WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting page section:', err);
    res.status(500).json({ error: 'Failed to delete page section' });
  }
});

module.exports = router;
