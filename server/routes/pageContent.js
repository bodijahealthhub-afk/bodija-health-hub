const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/page-content/:pageId — public: returns page title, meta, and sections
router.get('/:pageId', async (req, res) => {
  try {
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const { pageId } = req.params;

    // Get page meta from site_content
    const titleRow = await db.prepare('SELECT value FROM site_content WHERE key = ?').get(`page_${pageId}_title`);
    const metaTitleRow = await db.prepare('SELECT value FROM site_content WHERE key = ?').get(`page_${pageId}_meta_title`);
    const metaDescRow = await db.prepare('SELECT value FROM site_content WHERE key = ?').get(`page_${pageId}_meta_description`);

    const sections = await db.prepare(
      'SELECT * FROM page_sections WHERE page_id = ? ORDER BY sort_order ASC'
    ).all(pageId);

    // Parse JSON fields in sections
    const parsedSections = sections.map(s => ({
      ...s,
      content: s.content || '',
      image: s.image || '',
      buttonText: s.button_text || '',
      buttonLink: s.button_link || '',
    }));

    res.json({
      title: titleRow?.value || '',
      metaTitle: metaTitleRow?.value || '',
      metaDescription: metaDescRow?.value || '',
      sections: parsedSections,
    });
  } catch (err) {
    console.error('Failed to fetch page content:', err);
    res.status(500).json({ error: 'Failed to fetch page content' });
  }
});

// PUT /api/page-content/:pageId — admin: update page meta and sections
router.put('/:pageId', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { pageId } = req.params;
    const { title, metaTitle, metaDescription, sections } = req.body;

    const upsert = db.prepare(
      'INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP'
    );

    await db.transaction(async () => {
      // Save page meta
      await upsert.run(`page_${pageId}_title`, title || '');
      await upsert.run(`page_${pageId}_meta_title`, metaTitle || '');
      await upsert.run(`page_${pageId}_meta_description`, metaDescription || '');

      // Replace sections
      const deleteSections = db.prepare('DELETE FROM page_sections WHERE page_id = ?');
      const insertSection = db.prepare(
        'INSERT INTO page_sections (page_id, sort_order, title, content, image, button_text, button_link) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );

      await deleteSections.run(pageId);
      if (sections && Array.isArray(sections)) {
        for (let i = 0; i < sections.length; i++) {
          const s = sections[i];
          await insertSection.run(
            pageId,
            s.sort_order ?? i,
            s.title || '',
            s.content || '',
            s.image || '',
            s.buttonText || s.button_text || '',
            s.buttonLink || s.button_link || ''
          );
        }
      }
    });

    // Return updated data
    const updatedSections = await db.prepare(
      'SELECT * FROM page_sections WHERE page_id = ? ORDER BY sort_order ASC'
    ).all(pageId);

    const parsedSections = updatedSections.map(s => ({
      ...s,
      buttonText: s.button_text || '',
      buttonLink: s.button_link || '',
    }));

    res.json({
      title: title || '',
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      sections: parsedSections,
    });
  } catch (err) {
    console.error('Failed to update page content:', err);
    res.status(500).json({ error: 'Failed to update page content' });
  }
});

module.exports = router;
