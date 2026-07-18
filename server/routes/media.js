const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/media (public)
router.get('/', (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM media';
    const params = [];
    if (category) { query += ' WHERE category = ?'; params.push(category); }
    query += ' ORDER BY created_at DESC';
    const media = db.prepare(query).all(...params);
    res.json(media);
  } catch (err) {
    console.error('Error fetching media:', err);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// POST /api/media (admin)
router.post('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { name, url, thumbnail, category, size, mime_type } = req.body;
    const result = db.prepare('INSERT INTO media (name, url, thumbnail, category, size, mime_type) VALUES (?, ?, ?, ?, ?, ?)').run(name, url, thumbnail, category || 'general', size || 0, mime_type);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error('Error creating media:', err);
    res.status(500).json({ error: 'Failed to create media' });
  }
});

// DELETE /api/media/:id (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting media:', err);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

module.exports = router;
