const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');

const router = express.Router();

const toClient = (t) => ({
  ...t,
  name: t.patient_name,
  active: !!t.is_active,
  createdAt: t.created_at,
});

// GET /api/testimonials (public — active only) or admin (with valid token — all, wrapped)
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    if (isAdmin) {
      const testimonials = await db.prepare('SELECT * FROM testimonials ORDER BY created_at DESC').all();
      return res.json({ testimonials: testimonials.map(toClient) });
    }

    const testimonials = await db.prepare('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY created_at DESC').all();
    res.json(testimonials.map(toClient));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// GET /api/testimonials/all (admin — all)
router.get('/all', authenticateToken, requirePermission('testimonials.view'), async (req, res) => {
  try {
    const testimonials = await db.prepare('SELECT * FROM testimonials ORDER BY created_at DESC').all();
    res.json({ testimonials: testimonials.map(toClient) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// GET /api/testimonials/:id
router.get('/:id', async (req, res) => {
  try {
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const testimonial = await db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    res.json(toClient(testimonial));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonial' });
  }
});

// POST /api/testimonials (admin)
router.post('/', authenticateToken, requirePermission('testimonials.create'), async (req, res) => {
  try {
    const { name, patient_name, content, rating, photo, active, is_active } = req.body;
    if ((!name && !patient_name) || !content) {
      return res.status(400).json({ error: 'Patient name and content are required' });
    }
    const safeRating = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));

    const result = await db.prepare(
      'INSERT INTO testimonials (patient_name, content, rating, photo, is_active) VALUES (?, ?, ?, ?, ?)'
    ).run(
      name || patient_name,
      content,
      safeRating,
      photo || null,
      active !== undefined ? (active ? 1 : 0) : (is_active !== undefined ? is_active : 1)
    );

    const testimonial = await db.prepare('SELECT * FROM testimonials WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(toClient(testimonial));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

// PUT /api/testimonials/:id (admin)
router.put('/:id', authenticateToken, requirePermission('testimonials.update'), async (req, res) => {
  try {
    const testimonial = await db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    const { name, patient_name, content, rating, photo, active, is_active } = req.body;
    const safeRating = rating !== undefined && rating !== null ? Math.min(5, Math.max(1, Math.round(Number(rating)))) : null;

    await db.prepare(
      `UPDATE testimonials SET
        patient_name = COALESCE(?, patient_name),
        content = COALESCE(?, content),
        rating = COALESCE(?, rating),
        photo = COALESCE(?, photo),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`
    ).run(
      name || patient_name || null,
      content || null,
      safeRating,
      photo || null,
      (active !== undefined ? (active ? 1 : 0) : (is_active ?? null)),
      req.params.id
    );

    const updated = await db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// DELETE /api/testimonials/:id (admin)
router.delete('/:id', authenticateToken, requirePermission('testimonials.delete'), async (req, res) => {
  try {
    const testimonial = await db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    await db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

module.exports = router;
