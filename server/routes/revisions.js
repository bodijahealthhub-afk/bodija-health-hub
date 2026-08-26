const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');

const router = express.Router();

// GET /api/admin/revisions — list revisions (entity_type, entity_id, limit)
router.get('/', authenticateToken, requirePermission('content.revisions.view'), async (req, res) => {
  try {
    const { entity_type, entity_id, limit = 50 } = req.query;
    let query = 'SELECT r.*, u.name as author_name FROM content_revisions r LEFT JOIN users u ON r.changed_by = u.id WHERE 1=1';
    const params = [];
    if (entity_type) {
      query += ' AND r.entity_type = ?';
      params.push(entity_type);
    }
    if (entity_id) {
      query += ' AND r.entity_id = ?';
      params.push(Number(entity_id));
    }
    query += ' ORDER BY r.version DESC LIMIT ?';
    params.push(Math.min(Number(limit), 200));

    const revisions = await db.prepare(query).all(...params);
    res.json({ revisions });
  } catch (err) {
    console.error('Failed to fetch revisions:', err.message);
    res.status(500).json({ error: 'Failed to fetch revisions' });
  }
});

// GET /api/admin/revisions/:id — get a single revision with full snapshot
router.get('/:id', authenticateToken, requirePermission('content.revisions.view'), async (req, res) => {
  try {
    const revision = await db.prepare(
      'SELECT r.*, u.name as author_name FROM content_revisions r LEFT JOIN users u ON r.changed_by = u.id WHERE r.id = ?'
    ).get(req.params.id);
    if (!revision) {
      return res.status(404).json({ error: 'Revision not found' });
    }
    res.json(revision);
  } catch (err) {
    console.error('Failed to fetch revision:', err.message);
    res.status(500).json({ error: 'Failed to fetch revision' });
  }
});

// POST /api/admin/revisions/:id/restore — restore content to a revision
router.post('/:id/restore', authenticateToken, requirePermission('content.revisions.restore'), async (req, res) => {
  try {
    const revision = await db.prepare(
      'SELECT r.*, u.name as author_name FROM content_revisions r LEFT JOIN users u ON r.changed_by = u.id WHERE r.id = ?'
    ).get(req.params.id);
    if (!revision) {
      return res.status(404).json({ error: 'Revision not found' });
    }

    const snapshot = JSON.parse(revision.snapshot);
    const entityMap = {
      blog_posts: 'blog_posts',
      services: 'services',
      partners: 'partners',
      programmes: 'programmes',
      events: 'events',
      page_sections: 'page_sections',
    };
    const table = entityMap[revision.entity_type];
    if (!table) {
      return res.status(400).json({ error: 'Cannot restore this entity type' });
    }

    // Build update statement from snapshot keys (exclude id, created_at)
    const excludeKeys = ['id', 'created_at'];
    const keys = Object.keys(snapshot).filter((k) => !excludeKeys.includes(k) && snapshot[k] !== undefined);
    if (keys.length === 0) {
      return res.status(400).json({ error: 'No fields to restore' });
    }

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => snapshot[k]);
    values.push(revision.entity_id);

    await db.prepare(`UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);

    // Create a revision entry for the restore itself
    const maxVersion = await db.prepare(
      'SELECT MAX(version) as mv FROM content_revisions WHERE entity_type = ? AND entity_id = ?'
    ).get(revision.entity_type, revision.entity_id);
    const nextVersion = (maxVersion?.mv || 0) + 1;

    await db.prepare(
      `INSERT INTO content_revisions (entity_type, entity_id, version, snapshot, changed_by, change_summary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    ).run(revision.entity_type, revision.entity_id, nextVersion, revision.snapshot, req.user.id, `Restored to version ${revision.version}`);

    res.json({ success: true, restored_version: revision.version });
  } catch (err) {
    console.error('Failed to restore revision:', err.message);
    res.status(500).json({ error: 'Failed to restore revision' });
  }
});

// Helper: create a revision snapshot before an update. Used by other route files.
async function createRevision(entityType, entityId, userId, summary) {
  const tableMap = {
    blog_posts: 'blog_posts',
    services: 'services',
    partners: 'partners',
    programmes: 'programmes',
    events: 'events',
    page_sections: 'page_sections',
  };
  const table = tableMap[entityType];
  if (!table) return;

  const entity = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(entityId);
  if (!entity) return;

  const maxVersion = await db.prepare(
    'SELECT MAX(version) as mv FROM content_revisions WHERE entity_type = ? AND entity_id = ?'
  ).get(entityType, entityId);
  const nextVersion = (maxVersion?.mv || 0) + 1;

  await db.prepare(
    `INSERT INTO content_revisions (entity_type, entity_id, version, snapshot, changed_by, change_summary, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  ).run(entityType, entityId, nextVersion, JSON.stringify(entity), userId || null, summary || null);
}

module.exports = router;
module.exports.createRevision = createRevision;
