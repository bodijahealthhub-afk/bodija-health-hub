const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

const IMPORTABLE_TABLES = [
  'services',
  'blog_posts',
  'events',
  'gallery',
  'testimonials',
  'contact_info',
  'site_content',
  'page_sections',
  'media',
  'seo_settings',
  'site_settings',
];

const ALL_TABLES = [
  'users',
  'doctors',
  'services',
  'appointments',
  'patients',
  'blog_posts',
  'events',
  'gallery',
  'testimonials',
  'messages',
  'newsletter_subscribers',
  'contact_info',
  'site_content',
  'page_sections',
  'media',
  'seo_settings',
  'site_settings',
  'backups',
  'career_applications',
  'upcoming_registrations',
];

const toClient = (b) => ({
  id: b.id,
  filename: b.filename,
  size: b.size || 0,
  createdBy: b.created_by || 'System',
  createdAt: b.created_at,
});

const exportAll = () => {
  const data = {};
  for (const table of ALL_TABLES) {
    data[table] = db.prepare(`SELECT * FROM ${table}`).all();
  }
  return { export_date: new Date().toISOString(), data };
};

const importData = (data) => {
  if (!data || typeof data !== 'object') return;
  const transaction = db.transaction(() => {
    db.pragma('foreign_keys = OFF');
    for (const table of IMPORTABLE_TABLES) {
      if (data[table] && Array.isArray(data[table])) {
        for (const row of data[table]) {
          const columns = Object.keys(row).filter((c) => c !== 'id');
          if (columns.length === 0) continue;
          const placeholders = columns.map(() => '?').join(', ');
          const values = columns.map((c) => row[c]);
          try {
            db.prepare(`INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`).run(...values);
          } catch (e) { /* skip errors */ }
        }
      }
    }
    db.pragma('foreign_keys = ON');
  });
  transaction();
};

// GET /api/admin/backups — list stored server backups
router.get('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const backups = db.prepare('SELECT * FROM backups ORDER BY created_at DESC').all();
    res.json({ backups: backups.map(toClient) });
  } catch (err) {
    console.error('Error listing backups:', err);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// GET /api/admin/backups/export?format=json — export all data
router.get('/export', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    res.json(exportAll());
  } catch (err) {
    console.error('Error exporting data:', err);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// POST /api/admin/backups/import — import data (also aliased at POST /)
router.post('/import', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const body = req.body || {};
    const data = body.data || body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'No data provided' });
    }
    importData(data);
    res.json({ success: true, message: 'Data imported successfully' });
  } catch (err) {
    console.error('Error importing data:', err);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// POST /api/admin/backups/reset — reset content to defaults
router.post('/reset', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    db.resetContentToDefaults();
    res.json({ success: true, message: 'All content reset to defaults' });
  } catch (err) {
    console.error('Error resetting content:', err);
    res.status(500).json({ error: 'Failed to reset content' });
  }
});

// POST /api/admin/backups/create — create a stored server backup
router.post('/create', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const snapshot = exportAll();
    const json = JSON.stringify(snapshot);
    const filename = `backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
    const result = db.prepare(
      'INSERT INTO backups (filename, size, created_by, data) VALUES (?, ?, ?, ?)'
    ).run(filename, Buffer.byteLength(json), req.user.name || req.user.email, json);

    const backup = db.prepare('SELECT * FROM backups WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ backup: toClient(backup) });
  } catch (err) {
    console.error('Error creating backup:', err);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// POST /api/admin/backups/:id/restore — restore from a stored backup
router.post('/:id/restore', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const backup = db.prepare('SELECT * FROM backups WHERE id = ?').get(req.params.id);
    if (!backup || !backup.data) {
      return res.status(404).json({ error: 'Backup not found' });
    }
    let snapshot;
    try {
      snapshot = JSON.parse(backup.data);
    } catch (e) {
      return res.status(400).json({ error: 'Backup data is corrupted' });
    }
    importData(snapshot.data || snapshot);
    res.json({ success: true, message: 'Backup restored successfully' });
  } catch (err) {
    console.error('Error restoring backup:', err);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// POST /api/admin/backups — alias for import (kept for backward compatibility)
router.post('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const body = req.body || {};
    const data = body.data || body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'No data provided' });
    }
    importData(data);
    res.json({ success: true, message: 'Data imported successfully' });
  } catch (err) {
    console.error('Error importing data:', err);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// DELETE /api/admin/backups/:id
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const backup = db.prepare('SELECT * FROM backups WHERE id = ?').get(req.params.id);
    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }
    db.prepare('DELETE FROM backups WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Backup deleted' });
  } catch (err) {
    console.error('Error deleting backup:', err);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

module.exports = router;
