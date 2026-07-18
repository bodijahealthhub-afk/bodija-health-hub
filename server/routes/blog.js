const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/blog (public — published only)
router.get('/', (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let countQuery = "SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published'";
    let query = `SELECT bp.*, u.name as author_name
                 FROM blog_posts bp
                 LEFT JOIN users u ON bp.author_id = u.id
                 WHERE bp.status = 'published'`;
    const params = [];

    if (category) {
      query += ' AND bp.category LIKE ?';
      countQuery += ' AND category LIKE ?';
      params.push(`%${category}%`);
    }

    const total = db.prepare(countQuery).get(...params).total;
    query += ' ORDER BY bp.created_at DESC LIMIT ? OFFSET ?';
    const posts = db.prepare(query).all(...params, parseInt(limit), offset);

    res.json({ posts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Blog fetch error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch blog posts', details: err.message });
  }
});

// GET /api/blog/admin (admin — all posts)
router.get('/admin', authenticateToken, requireRole('admin', 'super_admin', 'content_manager'), (req, res) => {
  try {
    const { status, category } = req.query;
    let query = `SELECT bp.*, u.name as author_name
                 FROM blog_posts bp
                 LEFT JOIN users u ON bp.author_id = u.id
                 WHERE 1=1`;
    const params = [];

    if (status) {
      query += ' AND bp.status = ?';
      params.push(status);
    }
    if (category) {
      query += ' AND bp.category LIKE ?';
      params.push(`%${category}%`);
    }

    query += ' ORDER BY bp.created_at DESC';
    const posts = db.prepare(query).all(...params);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// GET /api/blog/:slug (public)
router.get('/:slug', (req, res) => {
  try {
    const post = db.prepare(
      `SELECT bp.*, u.name as author_name
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.slug = ?`
    ).get(req.params.slug);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment views
    db.prepare('UPDATE blog_posts SET views = views + 1 WHERE id = ?').run(post.id);
    post.views += 1;

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// POST /api/blog (admin)
router.post('/', authenticateToken, requireRole('admin', 'super_admin', 'content_manager'), (req, res) => {
  try {
    const { title, content, excerpt, category, featured_image, status } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Ensure unique slug
    let finalSlug = slug;
    let counter = 1;
    while (db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const result = db.prepare(
      `INSERT INTO blog_posts (title, slug, content, excerpt, category, featured_image, author_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(title, finalSlug, content, excerpt || null, category || null, featured_image || null,
      req.user.id, status || 'draft');

    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// PUT /api/blog/:id (admin)
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin', 'content_manager'), (req, res) => {
  try {
    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const { title, content, excerpt, category, featured_image, status } = req.body;

    let slug = post.slug;
    if (title && title !== post.title) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let counter = 1;
      while (db.prepare('SELECT id FROM blog_posts WHERE slug = ? AND id != ?').get(slug, req.params.id)) {
        slug = `${slug}-${counter}`;
        counter++;
      }
    }

    db.prepare(
      `UPDATE blog_posts SET
        title = COALESCE(?, title),
        slug = ?,
        content = COALESCE(?, content),
        excerpt = COALESCE(?, excerpt),
        category = COALESCE(?, category),
        featured_image = COALESCE(?, featured_image),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(title || null, slug, content || null, excerpt || null, category || null,
      featured_image || null, status || null, req.params.id);

    const updated = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// DELETE /api/blog/:id (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
    res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

module.exports = router;
