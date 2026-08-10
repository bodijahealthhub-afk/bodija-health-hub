const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getFlag } = require('../utils/features');

const router = express.Router();

const toClient = (s) => ({
  ...s,
  status: s.is_active ? 'active' : 'inactive',
});

// Returns true for public (non-admin) requests whose feature is disabled.
const featureDisabled = async (req, key) => {
  if (req.baseUrl.includes('/admin')) return false;
  const flag = await getFlag(key);
  return !flag || !flag.enabled;
};

// GET /api/services (public — active only) or /api/admin/services (admin — all)
router.get('/', async (req, res) => {
  try {
    if (await featureDisabled(req, 'services')) {
      return res.status(404).json({ error: 'Not Found' });
    }
    const isAdmin = req.baseUrl.includes('/admin');
    const { category } = req.query;
    let query = 'SELECT * FROM services';
    const params = [];

    if (!isAdmin) {
      query += ' WHERE is_active = 1';
    }
    if (category) {
      query += isAdmin ? ' WHERE' : ' AND';
      query += ' category LIKE ?';
      params.push(`%${category}%`);
    }

    query += ' ORDER BY category, name';
    const services = await db.prepare(query).all(...params);
    res.json(isAdmin ? { services: services.map(toClient) } : services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET /api/services/:id
router.get('/:id', async (req, res) => {
  try {
    if (await featureDisabled(req, 'services')) {
      return res.status(404).json({ error: 'Not Found' });
    }
    const service = await db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(toClient(service));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// POST /api/services (admin)
router.post('/', authenticateToken, requireRole('admin', 'super_admin', 'content_manager'), async (req, res) => {
  try {
    const { name, description, category, price, image, icon, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Service name is required' });
    }

    const result = await db.prepare(
      'INSERT INTO services (name, description, category, price, image, icon, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      name,
      description || null,
      category || null,
      price || 0,
      image || null,
      icon || null,
      status === undefined ? 1 : (status === 'active' ? 1 : 0)
    );

    const service = await db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(toClient(service));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// PUT /api/services/:id (admin)
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin', 'content_manager'), async (req, res) => {
  try {
    const service = await db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const { name, description, category, price, image, icon, is_active, status } = req.body;

    await db.prepare(
      `UPDATE services SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        price = COALESCE(?, price),
        image = COALESCE(?, image),
        icon = COALESCE(?, icon),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`
    ).run(
      name || null,
      description || null,
      category || null,
      price ?? null,
      image || null,
      icon || null,
      (is_active !== undefined ? is_active : (status !== undefined ? (status === 'active' ? 1 : 0) : null)),
      req.params.id
    );

    const updated = await db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// DELETE /api/services/:id (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const service = await db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    await db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

module.exports = router;
