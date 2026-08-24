const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const { getFlag } = require('../utils/features');

const router = express.Router();

const toClient = (p) => ({ ...p, status: p.is_active ? 'active' : 'inactive' });

// Returns true for public (non-admin) requests whose feature is disabled.
const featureDisabled = async (req, key) => {
  if (req.baseUrl.includes('/admin')) return false;
  const flag = await getFlag(key);
  return !flag || !flag.enabled;
};

// GET /api/programmes (public — active only) or /api/admin/programmes (admin — all)
router.get('/', async (req, res) => {
  try {
    if (await featureDisabled(req, 'programme_registration')) {
      return res.status(404).json({ error: 'Not Found' });
    }
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin', 'content_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const { category, q } = req.query;
    let query = 'SELECT * FROM programmes WHERE 1=1';
    const params = [];

    if (!isAdmin) {
      query += ' AND is_active = 1';
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (q) {
      const like = `%${q}%`;
      query += ' AND (title LIKE ? OR description LIKE ? OR category LIKE ?)';
      params.push(like, like, like);
    }

    query += ' ORDER BY id ASC';
    const programmes = await db.prepare(query).all(...params);
    res.json(isAdmin ? { programmes: programmes.map(toClient) } : programmes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch programmes' });
  }
});

// GET /api/programmes/:id
router.get('/:id', async (req, res) => {
  try {
    if (await featureDisabled(req, 'programme_registration')) {
      return res.status(404).json({ error: 'Not Found' });
    }
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin', 'content_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const programme = await db.prepare('SELECT * FROM programmes WHERE id = ?').get(req.params.id);
    if (!programme || (!req.baseUrl.includes('/admin') && !programme.is_active)) {
      return res.status(404).json({ error: 'Programme not found' });
    }
    res.json(toClient(programme));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch programme' });
  }
});

// POST /api/programmes (admin)
router.post('/', authenticateToken, requirePermission('programmes.create'), async (req, res) => {
  try {
    const { title, description, category, schedule, frequency, location, image, status } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Programme title is required' });
    }

    const result = await db.prepare(
      `INSERT INTO programmes (title, description, category, schedule, frequency, location, image, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      title,
      description || null,
      category || null,
      schedule || null,
      frequency || null,
      location || null,
      image || null,
      status === undefined ? 1 : (status === 'active' ? 1 : 0)
    );

    const programme = await db.prepare('SELECT * FROM programmes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(toClient(programme));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create programme' });
  }
});

// PUT /api/programmes/:id (admin)
router.put('/:id', authenticateToken, requirePermission('programmes.update'), async (req, res) => {
  try {
    const programme = await db.prepare('SELECT * FROM programmes WHERE id = ?').get(req.params.id);
    if (!programme) {
      return res.status(404).json({ error: 'Programme not found' });
    }

    const { title, description, category, schedule, frequency, location, image, is_active, status } = req.body;

    await db.prepare(
      `UPDATE programmes SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        schedule = COALESCE(?, schedule),
        frequency = COALESCE(?, frequency),
        location = COALESCE(?, location),
        image = COALESCE(?, image),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(title || null, description || null, category || null, schedule || null,
      frequency || null, location || null, image || null,
      (is_active !== undefined ? is_active : (status !== undefined ? (status === 'active' ? 1 : 0) : null)),
      req.params.id);

    const updated = await db.prepare('SELECT * FROM programmes WHERE id = ?').get(req.params.id);
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update programme' });
  }
});

// PATCH /api/programmes/:id/status (admin)
router.patch('/:id/status', authenticateToken, requirePermission('programmes.update'), async (req, res) => {
  try {
    const programme = await db.prepare('SELECT * FROM programmes WHERE id = ?').get(req.params.id);
    if (!programme) {
      return res.status(404).json({ error: 'Programme not found' });
    }
    const status = req.body.status;
    const isActive = status === 'active' ? 1 : 0;
    await db.prepare('UPDATE programmes SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(isActive, req.params.id);
    const updated = await db.prepare('SELECT * FROM programmes WHERE id = ?').get(req.params.id);
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update programme status' });
  }
});

// DELETE /api/programmes/:id (admin)
router.delete('/:id', authenticateToken, requirePermission('programmes.delete'), async (req, res) => {
  try {
    const programme = await db.prepare('SELECT * FROM programmes WHERE id = ?').get(req.params.id);
    if (!programme) {
      return res.status(404).json({ error: 'Programme not found' });
    }

    await db.prepare('DELETE FROM programmes WHERE id = ?').run(req.params.id);
    res.json({ message: 'Programme deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete programme' });
  }
});

module.exports = router;
