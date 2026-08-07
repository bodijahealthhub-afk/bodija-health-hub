const express = require('express');
const db = require('../models/database');

const router = express.Router();

// GET /api/search?q=term
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 2) {
      return res.json({ services: [], doctors: [], blog: [], events: [] });
    }
    const like = `%${q}%`;

    const services = await db.prepare(
      "SELECT id, name, description, category, icon FROM services WHERE is_active = 1 AND (name LIKE ? OR description LIKE ? OR category LIKE ?) LIMIT 5"
    ).all(like, like, like);

    const doctors = await db.prepare(
      "SELECT id, name, specialization, department, photo FROM doctors WHERE is_active = 1 AND (name LIKE ? OR specialization LIKE ? OR department LIKE ?) LIMIT 5"
    ).all(like, like, like);

    const blog = await db.prepare(
      "SELECT id, title, slug, excerpt, category FROM blog_posts WHERE status = 'published' AND (title LIKE ? OR excerpt LIKE ? OR category LIKE ?) LIMIT 5"
    ).all(like, like, like);

    const events = await db.prepare(
      "SELECT id, title, date, location FROM events WHERE is_active = 1 AND (title LIKE ? OR location LIKE ? OR description LIKE ?) LIMIT 5"
    ).all(like, like, like);

    res.json({ services, doctors, blog, events });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
