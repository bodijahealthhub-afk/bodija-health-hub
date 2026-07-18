const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/site-content — public: returns all site content as key-value object
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM site_content').all();
    const content = {};
    for (const row of rows) {
      content[row.key] = row.value;
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch site content' });
  }
});

// PUT /api/site-content — admin: update multiple key-value pairs
router.put('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const updates = req.body;
    console.log('PUT received updates:', Object.keys(updates).length, 'keys');
    console.log('hero_headline in updates:', updates.hero_headline);
    const upsert = db.prepare(
      'INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP'
    );

    const updateMany = db.transaction((items) => {
      for (const [key, value] of Object.entries(items)) {
        upsert.run(key, typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''));
      }
    });

    updateMany(updates);

    const rows = db.prepare('SELECT key, value FROM site_content').all();
    const content = {};
    for (const row of rows) {
      content[row.key] = row.value;
    }
    res.json(content);
  } catch (err) {
    console.error('Failed to update site content:', err);
    res.status(500).json({ error: 'Failed to update site content' });
  }
});

// GET /api/site-content/:section — public: returns content for a specific section
router.get('/:section', (req, res) => {
  try {
    const { section } = req.params;
    const prefixes = {
      hero: 'hero_',
      about: 'about_',
      ecosystem: 'ecosystem_',
      partners: 'partners_',
      platforms: 'platforms_',
      contact: 'contact_',
      footer: 'footer_',
      seo: 'seo_',
      nav: 'nav_',
    };
    const prefix = prefixes[section];
    if (!prefix) return res.status(404).json({ error: 'Unknown section' });

    const rows = db.prepare('SELECT key, value FROM site_content WHERE key LIKE ?').all(prefix + '%');
    const content = {};
    for (const row of rows) {
      content[row.key] = row.value;
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch section content' });
  }
});

// PUT /api/site-content/:section — admin: update a specific section
router.put('/:section', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { section } = req.params;
    const updates = req.body;
    const upsert = db.prepare(
      'INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP'
    );

    // Flatten nested objects (e.g., hero.cta1 -> hero_cta1)
    const flattenObj = (obj, prefix) => {
      const flat = {};
      for (const [k, v] of Object.entries(obj)) {
        if (k === 'cta1' || k === 'cta2' || k === 'ctaButton') {
          // Handle nested CTA objects
          if (typeof v === 'object' && v !== null) {
            for (const [sk, sv] of Object.entries(v)) {
              flat[`${prefix}_${k}_${sk}`] = sv;
            }
          }
        } else if (k === 'quickLinks' || k === 'platformLinks' || k === 'socialLinks') {
          flat[`${prefix}_${k}`] = JSON.stringify(v);
        } else if (k === 'links') {
          flat[`${prefix}_links`] = JSON.stringify(v);
        } else {
          flat[`${prefix}_${k}`] = v;
        }
      }
      return flat;
    };

    const prefixMap = {
      hero: 'hero',
      about: 'about',
      ecosystem: 'ecosystem',
      partners: 'partners',
      platforms: 'platforms',
      contact: 'contact',
      footer: 'footer',
      navigation: 'nav',
    };
    const prefix = prefixMap[section] || section;

    const flatUpdates = flattenObj(updates, prefix);

    const updateMany = db.transaction((items) => {
      for (const [key, value] of Object.entries(items)) {
        upsert.run(key, typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''));
      }
    });

    updateMany(flatUpdates);

    // Return updated section
    const rows = db.prepare('SELECT key, value FROM site_content WHERE key LIKE ?').all(prefix + '%');
    const content = {};
    for (const row of rows) {
      content[row.key] = row.value;
    }
    res.json(content);
  } catch (err) {
    console.error('Failed to update section content:', err);
    res.status(500).json({ error: 'Failed to update section content' });
  }
});

module.exports = router;
