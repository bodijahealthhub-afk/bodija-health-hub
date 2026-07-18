const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/gallery (public)
router.get('/', (req, res) => {
  try {
    const { category, album } = req.query;
    let query = 'SELECT * FROM gallery WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category LIKE ?';
      params.push(`%${category}%`);
    }
    if (album) {
      query += ' AND album LIKE ?';
      params.push(`%${album}%`);
    }

    query += ' ORDER BY created_at DESC';
    const items = db.prepare(query).all(...params);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// GET /api/gallery/:id
router.get('/:id', (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery item' });
  }
});

// POST /api/gallery (admin)
router.post('/', authenticateToken, requireRole('admin', 'super_admin', 'content_manager'), upload.single('image'), (req, res) => {
  try {
    const { title, category, album } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

    if (!image_url) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const result = db.prepare(
      'INSERT INTO gallery (title, image_url, category, album) VALUES (?, ?, ?, ?)'
    ).run(title || null, image_url, category || null, album || null);

    const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add gallery item' });
  }
});

// PUT /api/gallery/:id (admin)
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin', 'content_manager'), upload.single('image'), (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    const { title, category, album } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;

    db.prepare(
      `UPDATE gallery SET
        title = COALESCE(?, title),
        image_url = COALESCE(?, image_url),
        category = COALESCE(?, category),
        album = COALESCE(?, album)
       WHERE id = ?`
    ).run(title || null, image_url, category || null, album || null, req.params.id);

    const updated = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update gallery item' });
  }
});

// DELETE /api/gallery/:id (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

module.exports = router;
