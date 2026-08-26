const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const { getFlag } = require('../utils/features');

const router = express.Router();

// GET /api/search?q=term — public search, respects feature flags
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 2) {
      return res.json({ services: [], providers: [], partners: [], blog: [], events: [], programmes: [] });
    }
    const like = `%${q}%`;

    const featureIsOn = async (key) => {
      const flag = await getFlag(key);
      return Boolean(flag && flag.enabled);
    };

    const results = { services: [], providers: [], partners: [], blog: [], events: [], programmes: [] };

    if (await featureIsOn('services')) {
      results.services = await db.prepare(
        "SELECT id, name, description, category, icon FROM services WHERE is_active = 1 AND (status IS NULL OR status = 'active') AND (name LIKE ? OR description LIKE ? OR category LIKE ?) LIMIT 5"
      ).all(like, like, like);
    }

    if (await featureIsOn('partners_section')) {
      results.providers = await db.prepare(
        "SELECT id, name, description, provider_type, location FROM providers WHERE is_active = 1 AND (name LIKE ? OR description LIKE ? OR location LIKE ?) LIMIT 5"
      ).all(like, like, like);
      results.partners = await db.prepare(
        "SELECT id, name, description, partner_type, location FROM partners WHERE is_active = 1 AND (status IS NULL OR status = 'active') AND (name LIKE ? OR description LIKE ? OR location LIKE ?) LIMIT 5"
      ).all(like, like, like);
    }

    if (await featureIsOn('blog')) {
      results.blog = await db.prepare(
        "SELECT id, title, slug, excerpt, category FROM blog_posts WHERE status = 'published' AND (title LIKE ? OR excerpt LIKE ? OR category LIKE ?) LIMIT 5"
      ).all(like, like, like);
    }

    if (await featureIsOn('events')) {
      results.events = await db.prepare(
        "SELECT id, title, date, location FROM events WHERE is_active = 1 AND (status IS NULL OR status = 'active') AND (title LIKE ? OR location LIKE ? OR description LIKE ?) LIMIT 5"
      ).all(like, like, like);
    }

    if (await featureIsOn('programme_registration')) {
      results.programmes = await db.prepare(
        "SELECT id, title, category, schedule, location FROM programmes WHERE is_active = 1 AND (status IS NULL OR status = 'active') AND (title LIKE ? OR description LIKE ? OR category LIKE ?) LIMIT 5"
      ).all(like, like, like);
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/admin/search?q=term — admin search across all data
router.get('/admin', authenticateToken, requirePermission('dashboard.view'), async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 2) {
      return res.json({ services: [], partners: [], blog: [], events: [], programmes: [], appointments: [], contacts: [] });
    }
    const like = `%${q}%`;
    const limit = 5;

    const results = {
      services: await db.prepare(
        'SELECT id, name, slug, category, status FROM services WHERE name LIKE ? OR description LIKE ? LIMIT ?'
      ).all(like, like, limit),
      partners: await db.prepare(
        'SELECT id, name, slug, partner_type, status FROM partners WHERE name LIKE ? OR description LIKE ? LIMIT ?'
      ).all(like, like, limit),
      blog: await db.prepare(
        "SELECT id, title, slug, status FROM blog_posts WHERE title LIKE ? OR content LIKE ? LIMIT ?"
      ).all(like, like, limit),
      events: await db.prepare(
        'SELECT id, title, date, status FROM events WHERE title LIKE ? OR description LIKE ? LIMIT ?'
      ).all(like, like, limit),
      programmes: await db.prepare(
        'SELECT id, title, category, status FROM programmes WHERE title LIKE ? OR description LIKE ? LIMIT ?'
      ).all(like, like, limit),
      appointments: await db.prepare(
        "SELECT id, booking_reference, patient_name, status FROM appointments WHERE patient_name LIKE ? OR booking_reference LIKE ? OR patient_email LIKE ? LIMIT ?"
      ).all(like, like, like, limit),
      contacts: await db.prepare(
        'SELECT id, name, email, status FROM contacts WHERE name LIKE ? OR email LIKE ? LIMIT ?'
      ).all(like, like, limit),
    };

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Admin search failed' });
  }
});

module.exports = router;
