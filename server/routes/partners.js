const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');

const router = express.Router();

const toClient = (p) => ({
  ...p,
  partnerType: p.partner_type,
  contactEmail: p.contact_email,
  contactPhone: p.contact_phone,
  servicesOffered: p.services_offered ? p.services_offered.split(',').map((s) => s.trim()).filter(Boolean) : [],
  featured: Boolean(p.featured),
  displayOrder: p.display_order,
  lifecycleStatus: p.status || (p.is_active ? 'active' : 'archived'),
  status: p.is_active ? 'active' : 'inactive',
});

// Unique slug for a partner.
const makeUniqueSlug = async (name, excludeId) => {
  let base = db.slugify(name);
  if (!base) base = `partner-${Date.now()}`;
  const existing = await db.prepare('SELECT id FROM partners WHERE slug = ?').get(base);
  if (!existing || (excludeId && existing.id === excludeId)) return base;
  let n = 2;
  while (await db.prepare('SELECT id FROM partners WHERE slug = ?').get(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
};

// GET /api/partners (public — active only) or /api/admin/partners (admin — all)
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const { partner_type, featured, status } = req.query;
    let query = 'SELECT * FROM partners WHERE 1=1';
    const params = [];

    if (!isAdmin) {
      query += " AND is_active = 1 AND (status IS NULL OR status = 'active')";
    }
    if (isAdmin && status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (partner_type) {
      query += ' AND partner_type = ?';
      params.push(partner_type);
    }
    if (featured) {
      query += ' AND featured = 1';
    }

    query += ' ORDER BY display_order ASC, name ASC';
    const partners = await db.prepare(query).all(...params);
    res.json(isAdmin ? { partners: partners.map(toClient) } : partners.map(toClient));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
});

// GET /api/partners/:idOrSlug (public) — includes the partner's related services
router.get('/:idOrSlug', async (req, res) => {
  try {
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const param = req.params.idOrSlug;
    const isId = /^\d+$/.test(param);
    let partner;
    if (isId) {
      partner = await db.prepare('SELECT * FROM partners WHERE id = ?').get(param);
    } else {
      partner = await db.prepare('SELECT * FROM partners WHERE slug = ?').get(param);
    }
    if (!partner || (!req.baseUrl.includes('/admin') && !partner.is_active)) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    const services = await db.prepare(
      'SELECT id, name, slug, short_description, category, price FROM services WHERE is_active = 1 ORDER BY display_order ASC, name ASC'
    ).all();
    const offered = new Set((partner.services_offered || '').split(',').map((s) => s.trim()).filter(Boolean));
    const filtered = offered.size
      ? services.filter((s) => offered.has(s.name) || offered.has(String(s.id)) || offered.has(s.category))
      : services.slice(0, 6);
    res.json({ ...toClient(partner), services: filtered });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch partner' });
  }
});

// POST /api/partners (admin)
router.post('/', authenticateToken, requirePermission('partners.create'), async (req, res) => {
  try {
    const {
      name, partner_type, description, logo, location, website, contact_email, contact_phone,
      services_offered, featured, display_order, config,
    } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Partner name is required' });
    }

    const slug = await makeUniqueSlug(
      req.body.slug && db.slugify(req.body.slug) ? db.slugify(req.body.slug) : name,
      null
    );

    const result = await db.prepare(
      `INSERT INTO partners
        (name, slug, partner_type, description, logo, location, website, contact_email, contact_phone,
         services_offered, featured, display_order, config, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
    ).run(
      name,
      slug,
      partner_type || 'healthcare',
      description || null,
      logo || null,
      location || null,
      website || null,
      contact_email || null,
      contact_phone || null,
      Array.isArray(services_offered) ? services_offered.join(',') : (services_offered || null),
      featured ? 1 : 0,
      display_order || 0,
      config || null
    );

    const partner = await db.prepare('SELECT * FROM partners WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(toClient(partner));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create partner' });
  }
});

// PATCH /api/partners/:id/status (admin)
router.patch('/:id/status', authenticateToken, requirePermission('partners.update'), async (req, res) => {
  try {
    const partner = await db.prepare('SELECT * FROM partners WHERE id = ?').get(req.params.id);
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    const status = req.body.status;
    const isActive = status === 'active' ? 1 : 0;
    await db.prepare('UPDATE partners SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(isActive, req.params.id);
    const updated = await db.prepare('SELECT * FROM partners WHERE id = ?').get(req.params.id);
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update partner status' });
  }
});

// PUT /api/partners/:id (admin)
router.put('/:id', authenticateToken, requirePermission('partners.update'), async (req, res) => {
  try {
    const partner = await db.prepare('SELECT * FROM partners WHERE id = ?').get(req.params.id);
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    const {
      name, partner_type, description, logo, location, website, contact_email, contact_phone,
      services_offered, config, is_active, status, featured, display_order,
    } = req.body;

    let slug = partner.slug;
    if (req.body.slug !== undefined) {
      const cleaned = db.slugify(req.body.slug);
      slug = cleaned || await makeUniqueSlug(req.body.name || partner.name, partner.id);
    } else if (req.body.name && req.body.name !== partner.name && !partner.slug) {
      slug = await makeUniqueSlug(req.body.name, partner.id);
    }
    if (slug !== partner.slug) {
      slug = await makeUniqueSlug(slug, partner.id);
    }

    await db.prepare(
      `UPDATE partners SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        partner_type = COALESCE(?, partner_type),
        description = COALESCE(?, description),
        logo = COALESCE(?, logo),
        location = COALESCE(?, location),
        website = COALESCE(?, website),
        contact_email = COALESCE(?, contact_email),
        contact_phone = COALESCE(?, contact_phone),
        services_offered = COALESCE(?, services_offered),
        featured = COALESCE(?, featured),
        display_order = COALESCE(?, display_order),
        config = COALESCE(?, config),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(
      name || null,
      slug || null,
      partner_type || null,
      description || null,
      logo || null,
      location || null,
      website || null,
      contact_email || null,
      contact_phone || null,
      Array.isArray(services_offered) ? services_offered.join(',') : (services_offered ?? null),
      featured !== undefined ? (featured ? 1 : 0) : null,
      display_order ?? null,
      config || null,
      (is_active !== undefined ? is_active : (status !== undefined ? (status === 'active' ? 1 : 0) : null)),
      req.params.id
    );

    const updated = await db.prepare('SELECT * FROM partners WHERE id = ?').get(req.params.id);
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update partner' });
  }
});

// DELETE /api/partners/:id (admin)
router.delete('/:id', authenticateToken, requirePermission('partners.delete'), async (req, res) => {
  try {
    const partner = await db.prepare('SELECT * FROM partners WHERE id = ?').get(req.params.id);
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    await db.prepare('UPDATE providers SET partner_id = NULL WHERE partner_id = ?').run(req.params.id);
    await db.prepare('DELETE FROM partners WHERE id = ?').run(req.params.id);
    res.json({ message: 'Partner deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete partner' });
  }
});

module.exports = router;
