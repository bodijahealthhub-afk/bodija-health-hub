const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const { getFlag } = require('../utils/features');
const { createRevision } = require('./revisions');

const router = express.Router();

const toClient = (s) => ({
  ...s,
  shortDescription: s.short_description,
  displayOrder: s.display_order,
  providerId: s.provider_id,
  bookingType: s.booking_type,
  bookingUrl: s.booking_url,
  featured: Boolean(s.featured),
  lifecycleStatus: s.status || (s.is_active ? 'active' : 'archived'),
  status: s.is_active ? 'active' : 'inactive',
});

// Returns true for public (non-admin) requests whose feature is disabled.
const featureDisabled = async (req, key) => {
  if (req.baseUrl.includes('/admin')) return false;
  const flag = await getFlag(key);
  return !flag || !flag.enabled;
};

// Make a unique slug for a service (used on create; edits keep theirs unless blank).
const makeUniqueSlug = async (name, excludeId) => {
  let base = db.slugify(name);
  if (!base) base = `service-${Date.now()}`;
  const existing = await db.prepare('SELECT id FROM services WHERE slug = ?').get(base);
  if (!existing || (excludeId && existing.id === excludeId)) return base;
  let n = 2;
  while (await db.prepare('SELECT id FROM services WHERE slug = ?').get(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
};

// GET /api/services (public — active only) or /api/admin/services (admin — all)
router.get('/', async (req, res) => {
  try {
    if (await featureDisabled(req, 'services')) {
      return res.status(404).json({ error: 'Not Found' });
    }
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin', 'content_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const { category, featured, q, status } = req.query;
    let query = 'SELECT * FROM services';
    const params = [];
    const where = [];

    if (!isAdmin) {
      where.push("(is_active = 1 AND (status IS NULL OR status = 'active'))");
    }
    if (isAdmin && status) {
      where.push('status = ?');
      params.push(status);
    }
    if (category) {
      where.push('(category = ? OR category LIKE ?)');
      params.push(category, `%${category}%`);
    }
    if (featured) {
      where.push('featured = 1');
    }
    if (q) {
      where.push('(name LIKE ? OR description LIKE ? OR short_description LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    if (where.length) query += ' WHERE ' + where.join(' AND ');

    query += ' ORDER BY display_order ASC, name ASC';
    const services = await db.prepare(query).all(...params);
    res.json(isAdmin ? { services: services.map(toClient) } : services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET /api/services/:idOrSlug (public)
router.get('/:idOrSlug', async (req, res) => {
  try {
    if (await featureDisabled(req, 'services')) {
      return res.status(404).json({ error: 'Not Found' });
    }
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin', 'content_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const param = req.params.idOrSlug;
    const isId = /^\d+$/.test(param);
    let service;
    if (isId) {
      service = await db.prepare('SELECT * FROM services WHERE id = ?').get(param);
      if (service && !req.baseUrl.includes('/admin') && !service.is_active) service = null;
    } else {
      service = await db.prepare('SELECT * FROM services WHERE slug = ?').get(param);
      if (service && !req.baseUrl.includes('/admin') && !service.is_active) service = null;
    }
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Fetch related services (same category, excluding self)
    let relatedServices = [];
    if (service.category) {
      relatedServices = await db.prepare(
        "SELECT id, name, slug, short_description, category, icon, price FROM services WHERE is_active = 1 AND category = ? AND id != ? ORDER BY display_order ASC LIMIT 4"
      ).all(service.category, service.id);
    }
    if (relatedServices.length < 4) {
      const more = await db.prepare(
        "SELECT id, name, slug, short_description, category, icon, price FROM services WHERE is_active = 1 AND id != ? ORDER BY display_order ASC LIMIT ?"
      ).all(service.id, 4 - relatedServices.length);
      const existingIds = new Set(relatedServices.map((s) => s.id));
      for (const s of more) {
        if (!existingIds.has(s.id)) relatedServices.push(s);
      }
    }

    res.json({ ...toClient(service), relatedServices });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// POST /api/services (admin)
router.post('/', authenticateToken, requirePermission('services.create'), async (req, res) => {
  try {
    const {
      name, description, short_description, category, price, image, icon, lifecycle_status, status,
      featured, display_order, booking_type, booking_url, provider_id, location,
    } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Service name is required' });
    }

    const lifecycleStatus = lifecycle_status || status || 'active';
    const isActive = lifecycleStatus === 'archived' || lifecycleStatus === 'draft' ? 0 : 1;
    if (price !== undefined && price !== null && price !== '' && (isNaN(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }
    if (booking_url && !/^https?:\/\/.+/.test(booking_url)) {
      return res.status(400).json({ error: 'Booking URL must be a valid URL' });
    }

    const slug = req.body.slug && db.slugify(req.body.slug) ? db.slugify(req.body.slug) : null;
    const finalSlug = await makeUniqueSlug(slug || name, null);

    const result = await db.prepare(
      `INSERT INTO services (name, slug, short_description, description, category, price, image, icon, featured, display_order, booking_type, booking_url, provider_id, location, is_active, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      name,
      finalSlug,
      short_description || null,
      description || null,
      category || null,
      price || 0,
      image || null,
      icon || null,
      featured ? 1 : 0,
      display_order || 0,
      booking_type || null,
      booking_url || null,
      provider_id || null,
      location || null,
      isActive,
      lifecycleStatus
    );

    const service = await db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(toClient(service));
  } catch (err) {
    console.error('Failed to create service:', err.message);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// PUT /api/services/:id (admin)
router.put('/:id', authenticateToken, requirePermission('services.update'), async (req, res) => {
  try {
    const service = await db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Create revision before update
    await createRevision('services', service.id, req.user?.id, 'Updated service');

    const {
      name, description, short_description, category, price, image, icon, is_active, status, lifecycle_status,
      featured, display_order, booking_type, booking_url, provider_id, location,
    } = req.body;

    // Derive lifecycle status: explicit lifecycle_status > status > existing > active
    const lifecycleStatus = lifecycle_status || status || service.status || 'active';
    const isActive = lifecycleStatus === 'archived' || lifecycleStatus === 'draft' ? 0 : (is_active !== undefined ? (is_active ? 1 : 0) : (service.is_active || 1));

    if (price !== undefined && price !== null && price !== '' && (isNaN(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }
    if (booking_url && !/^https?:\/\/.+/.test(booking_url)) {
      return res.status(400).json({ error: 'Booking URL must be a valid URL' });
    }

    let slug = service.slug;
    if (req.body.slug !== undefined) {
      const cleaned = db.slugify(req.body.slug);
      slug = cleaned || await makeUniqueSlug(req.body.name || service.name, service.id);
    } else if (req.body.name && req.body.name !== service.name && !service.slug) {
      slug = await makeUniqueSlug(req.body.name, service.id);
    }
    if (slug !== service.slug) {
      slug = await makeUniqueSlug(slug, service.id);
    }

    await db.prepare(
      `UPDATE services SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        short_description = COALESCE(?, short_description),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        price = COALESCE(?, price),
        image = COALESCE(?, image),
        icon = COALESCE(?, icon),
        featured = COALESCE(?, featured),
        display_order = COALESCE(?, display_order),
        booking_type = COALESCE(?, booking_type),
        booking_url = COALESCE(?, booking_url),
        provider_id = COALESCE(?, provider_id),
        location = COALESCE(?, location),
        is_active = COALESCE(?, is_active),
        status = COALESCE(?, status)
       WHERE id = ?`
    ).run(
      name || null,
      slug || null,
      short_description || null,
      description || null,
      category || null,
      price ?? null,
      image || null,
      icon || null,
      featured !== undefined ? (featured ? 1 : 0) : null,
      display_order ?? null,
      booking_type || null,
      booking_url || null,
      provider_id ?? null,
      location || null,
      isActive,
      lifecycleStatus,
      req.params.id
    );

    const updated = await db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    res.json(toClient(updated));
  } catch (err) {
    console.error('Failed to update service:', err.message);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// DELETE /api/services/:id (admin)
router.delete('/:id', authenticateToken, requirePermission('services.delete'), async (req, res) => {
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
