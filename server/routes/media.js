const express = require('express');
const multer = require('multer');
const fs = require('fs');
const db = require('../models/database');
const { uploadsDir } = require('../utils/uploads');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const { uploadFile, configured: storageConfigured } = require('../utils/objectStorage');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const toClient = (m) => ({
  id: m.id,
  name: m.name,
  url: m.url,
  thumbnail: m.thumbnail,
  category: m.category || 'general',
  size: m.size || 0,
  mime_type: m.mime_type,
  createdAt: m.created_at,
  created_at: m.created_at,
});

// GET /api/media (public) or /api/admin/media (admin — wrapped with stats)
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const { category } = req.query;
    let query = 'SELECT * FROM media';
    const params = [];
    if (category) { query += ' WHERE category = ?'; params.push(category); }
    query += ' ORDER BY created_at DESC';
    const media = await db.prepare(query).all(...params);

    if (isAdmin) {
      const total = (await db.prepare('SELECT COUNT(*) as count FROM media').get()).count;
      const images = (await db.prepare("SELECT COUNT(*) as count FROM media WHERE mime_type LIKE 'image/%' OR thumbnail IS NOT NULL").get()).count;
      const usedIn = await db.prepare('SELECT category, COUNT(*) as count FROM media GROUP BY category').all();
      const usedInObj = {};
      for (const row of usedIn) {
        usedInObj[row.category] = row.count;
      }
      return res.json({ media: media.map(toClient), stats: { total, images, usedIn: usedInObj } });
    }

    res.json(media.map(toClient));
  } catch (err) {
    console.error('Error fetching media:', err);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// POST /api/admin/media/upload (admin — multipart, field "images")
router.post('/upload', authenticateToken, requirePermission('media.upload'), upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const insert = db.prepare(
      'INSERT INTO media (name, url, thumbnail, category, size, mime_type) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const created = [];
    for (const file of req.files) {
      let url;
      if (storageConfigured()) {
        const key = `media/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
        url = await uploadFile({ key, filePath: file.path, contentType: file.mimetype });
        try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
      } else {
        url = `/uploads/${file.filename}`;
      }
      const result = await insert.run(file.originalname, url, url, req.body.category || 'general', file.size, file.mimetype);
      created.push(toClient(await db.prepare('SELECT * FROM media WHERE id = ?').get(result.lastInsertRowid)));
    }

    res.status(201).json({ media: created });
  } catch (err) {
    console.error('Error uploading media:', err);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// POST /api/media (admin)
router.post('/', authenticateToken, requirePermission('media.upload'), async (req, res) => {
  try {
    const { name, url, thumbnail, category, size, mime_type } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }
    const result = await db.prepare('INSERT INTO media (name, url, thumbnail, category, size, mime_type) VALUES (?, ?, ?, ?, ?, ?)').run(name, url, thumbnail || null, category || 'general', size || 0, mime_type || 'image/jpeg');
    res.status(201).json(toClient(await db.prepare('SELECT * FROM media WHERE id = ?').get(result.lastInsertRowid)));
  } catch (err) {
    console.error('Error creating media:', err);
    res.status(500).json({ error: 'Failed to create media' });
  }
});

// DELETE /api/media/:id (admin)
router.delete('/:id', authenticateToken, requirePermission('media.delete'), async (req, res) => {
  try {
    await db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting media:', err);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

module.exports = router;
