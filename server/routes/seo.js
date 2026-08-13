const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Maps seo_settings page_id -> { path, featureKey }. When featureKey is set, the
// page is only emitted while that feature flag is enabled.
const SEARCH_PAGE_MAP = {
  home: { path: '/', featureKey: null },
  about: { path: '/about', featureKey: null },
  services: { path: '/services', featureKey: 'services' },
  partners: { path: '/partners', featureKey: 'partners_section' },
  platforms: { path: '/platforms', featureKey: 'platforms_section' },
  livecare: { path: '/livecare', featureKey: 'livecare' },
  hearmenders: { path: '/hear-menders', featureKey: 'hear_menders' },
  blog: { path: '/newsroom', featureKey: 'blog' },
  contact: { path: '/contact', featureKey: 'contact_form' },
  careers: { path: '/careers', featureKey: 'careers' },
  faq: { path: '/faq', featureKey: 'faq' },
  events: { path: '/events', featureKey: 'events' },
  programmes: { path: '/programmes', featureKey: 'programme_registration' },
};

const toClient = (row) => ({
  metaTitle: row.meta_title || '',
  metaDescription: row.meta_description || '',
  ogTitle: row.og_title || '',
  ogDescription: row.og_description || '',
  ogImage: row.og_image || '',
  twitterCard: row.twitter_card || 'summary_large_image',
  twitterTitle: row.twitter_title || '',
  twitterDescription: row.twitter_description || '',
  twitterImage: row.twitter_image || '',
  canonical: row.canonical || '',
  noindex: !!row.noindex,
  nofollow: !!row.nofollow,
});

const getSetting = async (key) => {
  const row = await db.prepare('SELECT value FROM site_settings WHERE key = ?').get(key);
  return row ? row.value : '';
};

const setSetting = async (key, value) => {
  await db.prepare(
    'INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP'
  ).run(key, value === null || value === undefined ? '' : String(value));
};

const generateSitemapXml = async () => {
  const baseUrl = (process.env.SITE_URL || 'https://bodijahealthhub.com').replace(/\/+$/, '');
  const urls = [];

  const flagEnabled = async (key) => {
    if (!key) return true;
    const row = await db.prepare('SELECT enabled FROM feature_flags WHERE key = ?').get(key);
    return Boolean(row && row.enabled);
  };

  const seoRows = await db.prepare('SELECT page_id, canonical FROM seo_settings').all();
  for (const row of seoRows) {
    const page = SEARCH_PAGE_MAP[row.page_id];
    if (!page || !(await flagEnabled(page.featureKey))) continue;
    const path = page.path;
    urls.push({ loc: `${baseUrl}${path}`, priority: row.page_id === 'home' ? 1.0 : 0.8 });
  }

  if (await flagEnabled('blog')) {
    const posts = await db.prepare("SELECT slug, updated_at FROM blog_posts WHERE status = 'published'").all();
    for (const post of posts) {
      urls.push({ loc: `${baseUrl}/newsroom/${post.slug}`, lastmod: post.updated_at, priority: 0.7 });
    }
  }

  if (await flagEnabled('events')) {
    const events = await db.prepare('SELECT id, date FROM events WHERE is_active = 1').all();
    for (const event of events) {
      urls.push({ loc: `${baseUrl}/events/${event.id}`, lastmod: event.date, priority: 0.6 });
    }
  }

  const urlTags = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}\n    <priority>${u.priority || 0.5}</priority>\n  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlTags}\n</urlset>`;
};

// GET /api/seo (admin — all pages + robots + sitemap)
router.get('/', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const rows = await db.prepare('SELECT * FROM seo_settings ORDER BY page_id').all();
    const pages = {};
    for (const row of rows) {
      pages[row.page_id] = toClient(row);
    }
    res.json({
      pages,
      robots: await getSetting('robots_txt'),
      sitemap: await getSetting('sitemap'),
    });
  } catch (err) {
    console.error('Error fetching SEO settings:', err);
    res.status(500).json({ error: 'Failed to fetch SEO settings' });
  }
});

// PUT /api/seo (admin — save all pages + robots + sitemap)
router.put('/', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { pages, robots, sitemap } = req.body || {};

    if (pages && typeof pages === 'object') {
      const upsert = db.prepare(
        `INSERT INTO seo_settings (page_id, meta_title, meta_description, og_title, og_description, og_image, twitter_card, twitter_title, twitter_description, twitter_image, canonical, noindex, nofollow, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(page_id) DO UPDATE SET
           meta_title = excluded.meta_title,
           meta_description = excluded.meta_description,
           og_title = excluded.og_title,
           og_description = excluded.og_description,
           og_image = excluded.og_image,
           twitter_card = excluded.twitter_card,
           twitter_title = excluded.twitter_title,
           twitter_description = excluded.twitter_description,
           twitter_image = excluded.twitter_image,
           canonical = excluded.canonical,
           noindex = excluded.noindex,
           nofollow = excluded.nofollow,
           updated_at = CURRENT_TIMESTAMP`
      );
      await db.transaction(async () => {
        for (const [pageId, p] of Object.entries(pages)) {
          const data = p || {};
          await upsert.run(
            pageId,
            data.metaTitle || '',
            data.metaDescription || '',
            data.ogTitle || '',
            data.ogDescription || '',
            data.ogImage || '',
            data.twitterCard || 'summary_large_image',
            data.twitterTitle || '',
            data.twitterDescription || '',
            data.twitterImage || '',
            data.canonical || '',
            data.noindex ? 1 : 0,
            data.nofollow ? 1 : 0
          );
        }
      });
    }

    if (robots !== undefined) await setSetting('robots_txt', robots);
    if (sitemap !== undefined) await setSetting('sitemap', sitemap);

    res.json({ success: true });
  } catch (err) {
    console.error('Error saving SEO settings:', err);
    res.status(500).json({ error: 'Failed to save SEO settings' });
  }
});

// PUT /api/seo/robots (admin — save robots.txt content)
router.put('/robots', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { content } = req.body || {};
    await setSetting('robots_txt', content || '');
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving robots.txt:', err);
    res.status(500).json({ error: 'Failed to save robots.txt' });
  }
});

// POST /api/seo/sitemap/generate (admin — generate sitemap)
router.post('/sitemap/generate', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const sitemap = await generateSitemapXml();
    await setSetting('sitemap', sitemap);
    res.json({ success: true, sitemap });
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

// GET /api/seo/:pageId (public)
router.get('/:pageId', async (req, res) => {
  try {
    const row = await db.prepare('SELECT * FROM seo_settings WHERE page_id = ?').get(req.params.pageId);
    res.json(row ? toClient(row) : {});
  } catch (err) {
    console.error('Error fetching SEO:', err);
    res.status(500).json({ error: 'Failed to fetch SEO' });
  }
});

// PUT /api/seo/:pageId (admin)
router.put('/:pageId', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { meta_title, meta_description, og_title, og_description, og_image, twitter_card, twitter_title, twitter_description, twitter_image, canonical, noindex, nofollow } = req.body;
    const existing = await db.prepare('SELECT id FROM seo_settings WHERE page_id = ?').get(req.params.pageId);
    if (existing) {
      await db.prepare('UPDATE seo_settings SET meta_title=?, meta_description=?, og_title=?, og_description=?, og_image=?, twitter_card=?, twitter_title=?, twitter_description=?, twitter_image=?, canonical=?, noindex=?, nofollow=?, updated_at=CURRENT_TIMESTAMP WHERE page_id=?').run(meta_title, meta_description, og_title, og_description, og_image, twitter_card, twitter_title, twitter_description, twitter_image, canonical, noindex ? 1 : 0, nofollow ? 1 : 0, req.params.pageId);
    } else {
      await db.prepare('INSERT INTO seo_settings (page_id, meta_title, meta_description, og_title, og_description, og_image, twitter_card, twitter_title, twitter_description, twitter_image, canonical, noindex, nofollow) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(req.params.pageId, meta_title, meta_description, og_title, og_description, og_image, twitter_card || 'summary_large_image', twitter_title, twitter_description, twitter_image, canonical, noindex ? 1 : 0, nofollow ? 1 : 0);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating SEO:', err);
    res.status(500).json({ error: 'Failed to update SEO' });
  }
});

module.exports = router;
module.exports.generateSitemapXml = generateSitemapXml;
