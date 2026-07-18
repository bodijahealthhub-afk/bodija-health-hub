const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/testimonials (public — active only)
router.get('/', (req, res) => {
  try {
    const testimonials = db.prepare('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY created_at DESC').all();
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// GET /api/testimonials/all (admin — all)
router.get('/all', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY created_at DESC').all();
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// GET /api/testimonials/:id
router.get('/:id', (req, res) => {
  try {
    const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    res.json(testimonial);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonial' });
  }
});

// POST /api/testimonials (admin)
router.post('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { patient_name, content, rating, photo } = req.body;
    if (!patient_name || !content) {
      return res.status(400).json({ error: 'Patient name and content are required' });
    }

    const result = db.prepare(
      'INSERT INTO testimonials (patient_name, content, rating, photo) VALUES (?, ?, ?, ?)'
    ).run(patient_name, content, rating || 5, photo || null);

    const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

// PUT /api/testimonials/:id (admin)
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    const { patient_name, content, rating, photo, is_active } = req.body;

    db.prepare(
      `UPDATE testimonials SET
        patient_name = COALESCE(?, patient_name),
        content = COALESCE(?, content),
        rating = COALESCE(?, rating),
        photo = COALESCE(?, photo),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`
    ).run(patient_name || null, content || null, rating ?? null, photo || null, is_active ?? null, req.params.id);

    const updated = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// DELETE /api/testimonials/:id (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

module.exports = router;
