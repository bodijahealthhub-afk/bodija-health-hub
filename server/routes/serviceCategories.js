const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

const publicRouter = express.Router();
const router = express.Router();

const getActor = (req) => (req.user && (req.user.username || req.user.email)) || 'unknown';
const getIp = (req) => req.ip || req.connection.remoteAddress || null;

const toClient = (c) => ({
  ...c,
  displayOrder: c.display_order,
  status: c.is_active ? 'active' : 'inactive',
});

const makeUniqueSlug = async (name, excludeId) => {
  let base = db.slugify(name);
  if (!base) base = `category-${Date.now()}`;
  const existing = await db.prepare('SELECT id FROM service_categories WHERE slug = ?').get(base);
  if (!existing || (excludeId && existing.id === excludeId)) return base;
  let n = 2;
  while (await db.prepare('SELECT id FROM service_categories WHERE slug = ?').get(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
};

// GET /api/service-categories (public — active only)
publicRouter.get('/', async (req, res) => {
  try {
    const rows = await db.prepare(
      'SELECT * FROM service_categories WHERE is_active = 1 ORDER BY display_order ASC, name ASC'
    ).all();
    res.json(rows.map(toClient));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch service categories' });
  }
});

// GET /api/admin/service-categories — all categories
router.get('/', authenticateToken, requireRole('admin', 'super_admin', 'content_manager'), async (req, res) => {
  try {
    const rows = await db.prepare(
      'SELECT * FROM service_categories ORDER BY display_order ASC, name ASC'
    ).all();
    res.json({ categories: rows.map(toClient) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch service categories' });
  }
});

// POST /api/admin/service-categories
router.post('/', authenticateToken, requireRole('admin', 'super_admin', 'content_manager'), async (req, res) => {
  try {
    const { name, description, icon, display_order, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const slug = await makeUniqueSlug(
      req.body.slug && db.slugify(req.body.slug) ? db.slugify(req.body.slug) : name,
      null
    );
    const result = await db.prepare(
      'INSERT INTO service_categories (name, slug, description, icon, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      name,
      slug,
      description || null,
      icon || null,
      display_order || 0,
      status === undefined ? 1 : (status === 'active' ? 1 : 0)
    );
    const category = await db.prepare('SELECT * FROM service_categories WHERE id = ?').get(result.lastInsertRowid);
    await logAudit({
      action: 'SERVICE_CATEGORY_CREATED',
      entityType: 'service_category',
      entityId: String(category.id),
      actor: getActor(req),
      after: { name, slug },
      ip: getIp(req),
    });
    res.status(201).json(toClient(category));
  } catch (err) {
    console.error('Failed to create service category:', err.message);
    res.status(500).json({ error: 'Failed to create service category' });
  }
});

// PUT /api/admin/service-categories/:id
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin', 'content_manager'), async (req, res) => {
  try {
    const category = await db.prepare('SELECT * FROM service_categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const { name, description, icon, display_order, is_active, status } = req.body;

    let slug = category.slug;
    if (req.body.slug !== undefined) {
      const cleaned = db.slugify(req.body.slug);
      slug = cleaned || await makeUniqueSlug(req.body.name || category.name, category.id);
    } else if (req.body.name && req.body.name !== category.name && !category.slug) {
      slug = await makeUniqueSlug(req.body.name, category.id);
    }
    if (slug !== category.slug) {
      slug = await makeUniqueSlug(slug, category.id);
    }

    await db.prepare(
      `UPDATE service_categories SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        display_order = COALESCE(?, display_order),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`
    ).run(
      name || null,
      slug || null,
      description || null,
      icon || null,
      display_order ?? null,
      (is_active !== undefined ? is_active : (status !== undefined ? (status === 'active' ? 1 : 0) : null)),
      req.params.id
    );

    const updated = await db.prepare('SELECT * FROM service_categories WHERE id = ?').get(req.params.id);
    await logAudit({
      action: 'SERVICE_CATEGORY_UPDATED',
      entityType: 'service_category',
      entityId: String(updated.id),
      actor: getActor(req),
      before: category,
      after: updated,
      ip: getIp(req),
    });
    res.json(toClient(updated));
  } catch (err) {
    console.error('Failed to update service category:', err.message);
    res.status(500).json({ error: 'Failed to update service category' });
  }
});

// PATCH /api/admin/service-categories/:id/status
router.patch('/:id/status', authenticateToken, requireRole('admin', 'super_admin', 'content_manager'), async (req, res) => {
  try {
    const category = await db.prepare('SELECT * FROM service_categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const status = req.body.status;
    const isActive = status === 'active' ? 1 : 0;
    await db.prepare('UPDATE service_categories SET is_active = ? WHERE id = ?').run(isActive, req.params.id);
    const updated = await db.prepare('SELECT * FROM service_categories WHERE id = ?').get(req.params.id);
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category status' });
  }
});

// DELETE /api/admin/service-categories/:id — archive instead of hard delete
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const category = await db.prepare('SELECT * FROM service_categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    await db.prepare('UPDATE service_categories SET is_active = 0 WHERE id = ?').run(req.params.id);
    await logAudit({
      action: 'SERVICE_CATEGORY_ARCHIVED',
      entityType: 'service_category',
      entityId: String(category.id),
      actor: getActor(req),
      before: category,
      ip: getIp(req),
    });
    res.json({ success: true, message: 'Category archived' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to archive category' });
  }
});

module.exports = publicRouter;
module.exports.router = router;
