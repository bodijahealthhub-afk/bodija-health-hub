const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/services (public)
router.get('/', (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM services WHERE is_active = 1';
    const params = [];

    if (category) {
      query += ' AND category LIKE ?';
      params.push(`%${category}%`);
    }

    query += ' ORDER BY category, name';
    const services = db.prepare(query).all(...params);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET /api/services/:id
router.get('/:id', (req, res) => {
  try {
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// POST /api/services (admin)
router.post('/', authenticateToken, requireRole('admin', 'super_admin', 'content_manager'), (req, res) => {
  try {
    const { name, description, category, price, image, icon } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Service name is required' });
    }

    const result = db.prepare(
      'INSERT INTO services (name, description, category, price, image, icon) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, description || null, category || null, price || 0, image || null, icon || null);

    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// PUT /api/services/:id (admin)
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin', 'content_manager'), (req, res) => {
  try {
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const { name, description, category, price, image, icon, is_active } = req.body;

    db.prepare(
      `UPDATE services SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        price = COALESCE(?, price),
        image = COALESCE(?, image),
        icon = COALESCE(?, icon),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`
    ).run(name || null, description || null, category || null, price ?? null, image || null, icon || null, is_active ?? null, req.params.id);

    const updated = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// DELETE /api/services/:id (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

module.exports = router;
