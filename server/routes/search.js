const express = require('express');
const db = require('../models/database');
const { getFlag } = require('../utils/features');

const router = express.Router();

// GET /api/search?q=term — results respect disabled feature flags
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 2) {
      return res.json({ services: [], doctors: [], blog: [], events: [] });
    }
    const like = `%${q}%`;

    const featureIsOn = async (key) => {
      const flag = await getFlag(key);
      return Boolean(flag && flag.enabled);
    };

    const results = { services: [], doctors: [], blog: [], events: [] };

    if (await featureIsOn('services')) {
      results.services = await db.prepare(
        "SELECT id, name, description, category, icon FROM services WHERE is_active = 1 AND (name LIKE ? OR description LIKE ? OR category LIKE ?) LIMIT 5"
      ).all(like, like, like);
    }

    if (await featureIsOn('appointments')) {
      results.doctors = await db.prepare(
        "SELECT id, name, specialization, department, photo FROM doctors WHERE is_active = 1 AND (name LIKE ? OR specialization LIKE ? OR department LIKE ?) LIMIT 5"
      ).all(like, like, like);
    }

    if (await featureIsOn('blog')) {
      results.blog = await db.prepare(
        "SELECT id, title, slug, excerpt, category FROM blog_posts WHERE status = 'published' AND (title LIKE ? OR excerpt LIKE ? OR category LIKE ?) LIMIT 5"
      ).all(like, like, like);
    }

    if (await featureIsOn('events')) {
      results.events = await db.prepare(
        "SELECT id, title, date, location FROM events WHERE is_active = 1 AND (title LIKE ? OR location LIKE ? OR description LIKE ?) LIMIT 5"
      ).all(like, like, like);
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
