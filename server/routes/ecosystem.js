const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');

const router = express.Router();

// GET /api/ecosystem/categories (public — active only)
// GET /api/admin/ecosystem/categories (admin — all including inactive)
router.get('/categories', async (req, res) => {
  try {
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin) {
      const categories = await db.prepare(
        'SELECT * FROM ecosystem_categories ORDER BY display_order ASC, name ASC'
      ).all();
      res.json({ categories });
    } else {
      const categories = await db.prepare(
        'SELECT * FROM ecosystem_categories WHERE is_active = 1 ORDER BY display_order ASC, name ASC'
      ).all();
      res.json(categories);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ecosystem categories' });
  }
});

// POST /api/admin/ecosystem/categories (admin)
router.post('/categories', authenticateToken, requirePermission('partners.create'), async (req, res) => {
  try {
    const { name, description, icon, display_order } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const slug = (name || '').toLowerCase().trim().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const result = await db.prepare(
      'INSERT INTO ecosystem_categories (name, slug, description, icon, display_order) VALUES (?, ?, ?, ?, ?)'
    ).run(name, slug, description || null, icon || null, display_order || 0);
    const category = await db.prepare('SELECT * FROM ecosystem_categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create ecosystem category' });
  }
});

// PUT /api/admin/ecosystem/categories/:id (admin)
router.put('/categories/:id', authenticateToken, requirePermission('partners.update'), async (req, res) => {
  try {
    const category = await db.prepare('SELECT * FROM ecosystem_categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const { name, description, icon, display_order, is_active } = req.body;
    await db.prepare(
      `UPDATE ecosystem_categories SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        display_order = COALESCE(?, display_order),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`
    ).run(name || null, name ? (name || '').toLowerCase().trim().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : null, description || null, icon || null, display_order ?? null, is_active ?? null, req.params.id);
    const updated = await db.prepare('SELECT * FROM ecosystem_categories WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ecosystem category' });
  }
});

// DELETE /api/admin/ecosystem/categories/:id (admin)
router.delete('/categories/:id', authenticateToken, requirePermission('partners.delete'), async (req, res) => {
  try {
    await db.prepare('DELETE FROM ecosystem_categories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete ecosystem category' });
  }
});

module.exports = router;
