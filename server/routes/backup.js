const express = require('express');
const zlib = require('zlib');
const db = require('../models/database');
const { exportAll, importData } = require('../utils/backupData');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

const toClient = (b) => ({
  id: b.id,
  filename: b.filename,
  size: b.size || 0,
  createdBy: b.created_by || 'System',
  createdAt: b.created_at,
});

// GET /api/admin/backups — list stored server backups
router.get('/', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const backups = await db.prepare('SELECT * FROM backups ORDER BY created_at DESC').all();
    res.json({ backups: backups.map(toClient) });
  } catch (err) {
    console.error('Error listing backups:', err);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// GET /api/admin/backups/export?format=json — export all data (gzip when accepted)
router.get('/export', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const snapshot = await exportAll();
    const json = JSON.stringify(snapshot);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="bhh-export.json"');

    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (acceptEncoding.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip');
      const gzipped = await new Promise((resolve, reject) => {
        zlib.gzip(Buffer.from(json), { level: 6 }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      res.setHeader('Content-Length', gzipped.length);
      res.end(gzipped);
    } else {
      res.setHeader('Content-Length', Buffer.byteLength(json));
      res.end(json);
    }
  } catch (err) {
    console.error('Error exporting data:', err);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// POST /api/admin/backups/import — import data (also aliased at POST /)
router.post('/import', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const body = req.body || {};
    const data = body.data || body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'No data provided' });
    }
    await importData(data);
    res.json({ success: true, message: 'Data imported successfully' });
  } catch (err) {
    console.error('Error importing data:', err);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// POST /api/admin/backups/reset — reset content to defaults
router.post('/reset', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    await db.resetContentToDefaults();
    res.json({ success: true, message: 'All content reset to defaults' });
  } catch (err) {
    console.error('Error resetting content:', err);
    res.status(500).json({ error: 'Failed to reset content' });
  }
});

// POST /api/admin/backups/create — create a stored server backup
router.post('/create', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const snapshot = await exportAll();
    const json = JSON.stringify(snapshot);
    const filename = `backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
    const result = await db.prepare(
      'INSERT INTO backups (filename, size, created_by, data) VALUES (?, ?, ?, ?)'
    ).run(filename, Buffer.byteLength(json), req.user.name || req.user.email, json);

    const backup = await db.prepare('SELECT * FROM backups WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ backup: toClient(backup) });
  } catch (err) {
    console.error('Error creating backup:', err);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// POST /api/admin/backups/:id/restore — restore from a stored backup
router.post('/:id/restore', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const backup = await db.prepare('SELECT * FROM backups WHERE id = ?').get(req.params.id);
    if (!backup || !backup.data) {
      return res.status(404).json({ error: 'Backup not found' });
    }
    let snapshot;
    try {
      snapshot = JSON.parse(backup.data);
    } catch (e) {
      return res.status(400).json({ error: 'Backup data is corrupted' });
    }
    await importData(snapshot.data || snapshot);
    res.json({ success: true, message: 'Backup restored successfully' });
  } catch (err) {
    console.error('Error restoring backup:', err);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// POST /api/admin/backups — alias for import (kept for backward compatibility)
router.post('/', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const body = req.body || {};
    const data = body.data || body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'No data provided' });
    }
    await importData(data);
    res.json({ success: true, message: 'Data imported successfully' });
  } catch (err) {
    console.error('Error importing data:', err);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// DELETE /api/admin/backups/:id
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const backup = await db.prepare('SELECT * FROM backups WHERE id = ?').get(req.params.id);
    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }
    await db.prepare('DELETE FROM backups WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Backup deleted' });
  } catch (err) {
    console.error('Error deleting backup:', err);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

module.exports = router;
