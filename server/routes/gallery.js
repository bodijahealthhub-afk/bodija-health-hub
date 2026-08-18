const express = require('express');
const multer = require('multer');
const fs = require('fs');
const db = require('../models/database');
const { uploadsDir } = require('../utils/uploads');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { uploadFile, configured: storageConfigured } = require('../utils/objectStorage');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/gallery (public) or admin (with valid token — returns {images})
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin', 'content_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
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
    const items = await db.prepare(query).all(...params);

    const toClient = (item) => ({
      id: item.id,
      title: item.title,
      url: item.image_url,
      image_url: item.image_url,
      category: item.category,
      album: item.album,
      createdAt: item.created_at,
      created_at: item.created_at,
    });

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
        if (['admin', 'super_admin', 'content_manager'].includes(decoded.role)) {
          return res.json({ images: items.map(toClient) });
        }
      } catch (err) { /* fall through to public */ }
    }

    res.json(items.map(toClient));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// GET /api/gallery/:id
router.get('/:id', async (req, res) => {
  try {
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin', 'content_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const item = await db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery item' });
  }
});

// POST /api/gallery (admin)
router.post('/', authenticateToken, requireRole('admin', 'super_admin', 'content_manager'), upload.single('image'), async (req, res) => {
  try {
    const { title, category, album } = req.body;
    let image_url = req.body.image_url;
    if (req.file) {
      if (storageConfigured()) {
        const key = `gallery/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
        image_url = await uploadFile({ key, filePath: req.file.path, contentType: req.file.mimetype });
        try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
      } else {
        image_url = `/uploads/${req.file.filename}`;
      }
    }

    if (!image_url) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const result = await db.prepare(
      'INSERT INTO gallery (title, image_url, category, album) VALUES (?, ?, ?, ?)'
    ).run(title || null, image_url, category || null, album || null);

    const item = await db.prepare('SELECT * FROM gallery WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add gallery item' });
  }
});

// PUT /api/gallery/:id (admin)
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin', 'content_manager'), upload.single('image'), async (req, res) => {
  try {
    const item = await db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    const { title, category, album } = req.body;
    let image_url = req.body.image_url || null;
    if (req.file) {
      if (storageConfigured()) {
        const key = `gallery/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
        image_url = await uploadFile({ key, filePath: req.file.path, contentType: req.file.mimetype });
        try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
      } else {
        image_url = `/uploads/${req.file.filename}`;
      }
    }

    await db.prepare(
      `UPDATE gallery SET
        title = COALESCE(?, title),
        image_url = COALESCE(?, image_url),
        category = COALESCE(?, category),
        album = COALESCE(?, album)
       WHERE id = ?`
    ).run(title || null, image_url, category || null, album || null, req.params.id);

    const updated = await db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update gallery item' });
  }
});

// DELETE /api/gallery/:id (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const item = await db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    await db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

module.exports = router;
