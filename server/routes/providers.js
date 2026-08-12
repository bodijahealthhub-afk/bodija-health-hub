const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

const toClient = (p) => ({
  ...p,
  providerType: p.provider_type,
  bookingMethod: p.booking_method,
  bookingUrl: p.booking_url,
  externalBookingUrl: p.external_booking_url,
  contactEmail: p.contact_email,
  contactPhone: p.contact_phone,
  servicesOffered: p.services_offered ? p.services_offered.split(',').map((s) => s.trim()).filter(Boolean) : [],
  featured: Boolean(p.featured),
  displayOrder: p.display_order,
  status: p.is_active ? 'active' : 'inactive',
});

// Unique slug for a provider.
const makeUniqueSlug = async (name, excludeId) => {
  let base = db.slugify(name);
  if (!base) base = `provider-${Date.now()}`;
  const existing = await db.prepare('SELECT id FROM providers WHERE slug = ?').get(base);
  if (!existing || (excludeId && existing.id === excludeId)) return base;
  let n = 2;
  while (await db.prepare('SELECT id FROM providers WHERE slug = ?').get(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
};

// GET /api/providers (public — active only) or /api/admin/providers (admin — all)
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.baseUrl.includes('/admin');
    const { provider_type, booking_method, featured } = req.query;
    let query = 'SELECT * FROM providers WHERE 1=1';
    const params = [];

    if (!isAdmin) {
      query += ' AND is_active = 1';
    }
    if (provider_type) {
      query += ' AND provider_type = ?';
      params.push(provider_type);
    }
    if (booking_method) {
      query += ' AND booking_method = ?';
      params.push(booking_method);
    }
    if (featured) {
      query += ' AND featured = 1';
    }

    query += ' ORDER BY display_order ASC, name ASC';
    const providers = await db.prepare(query).all(...params);
    res.json(isAdmin ? { providers: providers.map(toClient) } : providers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// GET /api/providers/:idOrSlug (public) — includes the provider's related services
router.get('/:idOrSlug', async (req, res) => {
  try {
    const param = req.params.idOrSlug;
    const isId = /^\d+$/.test(param);
    let provider;
    if (isId) {
      provider = await db.prepare('SELECT * FROM providers WHERE id = ?').get(param);
    } else {
      provider = await db.prepare('SELECT * FROM providers WHERE slug = ?').get(param);
    }
    if (!provider || (!req.baseUrl.includes('/admin') && !provider.is_active)) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    const services = await db.prepare(
      'SELECT id, name, slug, short_description, category, price FROM services WHERE provider_id = ? AND is_active = 1 ORDER BY display_order ASC, name ASC'
    ).all(provider.id);
    res.json({ ...toClient(provider), services });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

// POST /api/providers (admin)
router.post('/', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const {
      name, provider_type, description, logo, location, contact_email, contact_phone, website,
      services_offered, booking_method, booking_url, external_booking_url, featured, display_order, config,
    } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Provider name is required' });
    }

    const slug = await makeUniqueSlug(
      req.body.slug && db.slugify(req.body.slug) ? db.slugify(req.body.slug) : name,
      null
    );

    const result = await db.prepare(
      `INSERT INTO providers
        (name, slug, provider_type, description, logo, location, contact_email, contact_phone, website,
         services_offered, booking_method, booking_url, external_booking_url, featured, display_order, config, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
    ).run(
      name,
      slug,
      provider_type || 'PARTNER',
      description || null,
      logo || null,
      location || null,
      contact_email || null,
      contact_phone || null,
      website || null,
      Array.isArray(services_offered) ? services_offered.join(',') : (services_offered || null),
      booking_method || 'PARTNER_REQUEST',
      booking_url || null,
      external_booking_url || null,
      featured ? 1 : 0,
      display_order || 0,
      config || null
    );

    const provider = await db.prepare('SELECT * FROM providers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(toClient(provider));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create provider' });
  }
});

// PATCH /api/providers/:id/status (admin)
router.patch('/:id/status', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const provider = await db.prepare('SELECT * FROM providers WHERE id = ?').get(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    const status = req.body.status;
    const isActive = status === 'active' ? 1 : 0;
    await db.prepare('UPDATE providers SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(isActive, req.params.id);
    const updated = await db.prepare('SELECT * FROM providers WHERE id = ?').get(req.params.id);
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update provider status' });
  }
});

// PUT /api/providers/:id (admin)
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const provider = await db.prepare('SELECT * FROM providers WHERE id = ?').get(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const {
      name, provider_type, description, logo, location, contact_email, contact_phone, website,
      services_offered, booking_method, booking_url, external_booking_url, config, is_active, status,
      featured, display_order,
    } = req.body;

    let slug = provider.slug;
    if (req.body.slug !== undefined) {
      const cleaned = db.slugify(req.body.slug);
      slug = cleaned || await makeUniqueSlug(req.body.name || provider.name, provider.id);
    } else if (req.body.name && req.body.name !== provider.name && !provider.slug) {
      slug = await makeUniqueSlug(req.body.name, provider.id);
    }
    if (slug !== provider.slug) {
      slug = await makeUniqueSlug(slug, provider.id);
    }

    await db.prepare(
      `UPDATE providers SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        provider_type = COALESCE(?, provider_type),
        description = COALESCE(?, description),
        logo = COALESCE(?, logo),
        location = COALESCE(?, location),
        contact_email = COALESCE(?, contact_email),
        contact_phone = COALESCE(?, contact_phone),
        website = COALESCE(?, website),
        services_offered = COALESCE(?, services_offered),
        booking_method = COALESCE(?, booking_method),
        booking_url = COALESCE(?, booking_url),
        external_booking_url = COALESCE(?, external_booking_url),
        featured = COALESCE(?, featured),
        display_order = COALESCE(?, display_order),
        config = COALESCE(?, config),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(
      name || null,
      slug || null,
      provider_type || null,
      description || null,
      logo || null,
      location || null,
      contact_email || null,
      contact_phone || null,
      website || null,
      Array.isArray(services_offered) ? services_offered.join(',') : (services_offered ?? null),
      booking_method || null,
      booking_url || null,
      external_booking_url || null,
      featured !== undefined ? (featured ? 1 : 0) : null,
      display_order ?? null,
      config || null,
      (is_active !== undefined ? is_active : (status !== undefined ? (status === 'active' ? 1 : 0) : null)),
      req.params.id
    );

    const updated = await db.prepare('SELECT * FROM providers WHERE id = ?').get(req.params.id);
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update provider' });
  }
});

// DELETE /api/providers/:id (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const provider = await db.prepare('SELECT * FROM providers WHERE id = ?').get(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    await db.prepare('DELETE FROM providers WHERE id = ?').run(req.params.id);
    res.json({ message: 'Provider deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete provider' });
  }
});

module.exports = router;
