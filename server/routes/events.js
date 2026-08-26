const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const { getFlag } = require('../utils/features');
const { createRevision } = require('./revisions');

const router = express.Router();

const toClient = (e) => ({
  ...e,
  lifecycleStatus: e.status || (e.is_active ? 'active' : 'archived'),
  status: e.is_active ? 'active' : 'inactive',
});

// Returns true for public (non-admin) requests whose feature is disabled.
const featureDisabled = async (req, key) => {
  if (req.baseUrl.includes('/admin')) return false;
  const flag = await getFlag(key);
  return !flag || !flag.enabled;
};

// GET /api/events (public — active only) or /api/admin/events (admin — all)
router.get('/', async (req, res) => {
  try {
    if (await featureDisabled(req, 'events')) {
      return res.status(404).json({ error: 'Not Found' });
    }
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin', 'content_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const { type, status } = req.query;
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (!isAdmin) {
      query += " AND is_active = 1 AND (status IS NULL OR status = 'active')";
    }
    if (isAdmin && status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY date DESC';
    const events = await db.prepare(query).all(...params);
    res.json(isAdmin ? { events: events.map(toClient) } : events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/admin (admin — all events)
router.get('/admin', authenticateToken, requirePermission('events.view'), async (req, res) => {
  try {
    const events = await db.prepare('SELECT * FROM events ORDER BY date DESC').all();
    res.json({ events: events.map(toClient) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    if (await featureDisabled(req, 'events')) {
      return res.status(404).json({ error: 'Not Found' });
    }
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin', 'content_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const event = await db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(toClient(event));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST /api/events (admin)
router.post('/', authenticateToken, requirePermission('events.create'), async (req, res) => {
  try {
    const { title, description, date, location, image, type } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Event title is required' });
    }
    if (date && isNaN(Date.parse(date))) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const result = await db.prepare(
      'INSERT INTO events (title, description, date, location, image, type) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, description || null, date || null, location || null, image || null, type || 'event');

    const event = await db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(toClient(event));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id (admin)
router.put('/:id', authenticateToken, requirePermission('events.update'), async (req, res) => {
  try {
    const event = await db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Create revision before update
    await createRevision('events', event.id, req.user?.id, 'Updated event');

    const { title, description, date, location, image, type, is_active, status } = req.body;
    if (date && isNaN(Date.parse(date))) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    await db.prepare(
      `UPDATE events SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        date = COALESCE(?, date),
        location = COALESCE(?, location),
        image = COALESCE(?, image),
        type = COALESCE(?, type),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`
    ).run(title || null, description || null, date || null, location || null,
      image || null, type || null,
      (is_active !== undefined ? is_active : (status !== undefined ? (status === 'active' ? 1 : 0) : null)),
      req.params.id);

    const updated = await db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id (admin)
router.delete('/:id', authenticateToken, requirePermission('events.delete'), async (req, res) => {
  try {
    const event = await db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
