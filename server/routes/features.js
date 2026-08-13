const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getAllFlags, getFlag } = require('../utils/features');
const { logAudit } = require('../utils/audit');

const publicRouter = express.Router();
const router = express.Router();
const auditRouter = express.Router();

const getActor = (req) => (req.user && (req.user.username || req.user.email)) || 'unknown';
const getIp = (req) => req.ip || req.connection.remoteAddress || null;

const publicFlag = (flag) => {
  if (!flag) return null;
  const { key, name, description, status, enabled, public_visible, navigation_visible, admin_visible, config } = flag;
  return {
    key, name, description, status, enabled,
    public_visible: Boolean(public_visible),
    navigation_visible: Boolean(navigation_visible),
    admin_visible: Boolean(admin_visible),
    config,
  };
};

const adminOnly = [authenticateToken, requireRole('admin', 'super_admin')];

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

// GET /api/features — all flags for client-side gating (nav, popups, section toggles).
// Returns every flag (not just visible ones) so isEnabled() can gate any feature.
publicRouter.get('/', async (req, res) => {
  try {
    const flags = await getAllFlags();
    res.json(flags.map(publicFlag));
  } catch (err) {
    console.error('Failed to fetch features:', err);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

// GET /api/features/:key — a single public feature
publicRouter.get('/:key', async (req, res) => {
  try {
    const flag = await getFlag(req.params.key);
    if (!flag) {
      return res.status(404).json({ error: 'Feature not found' });
    }
    res.json(publicFlag(flag));
  } catch (err) {
    console.error('Failed to fetch feature:', err);
    res.status(500).json({ error: 'Failed to fetch feature' });
  }
});

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

// GET /api/admin/features — all features with full admin fields
router.get('/', ...adminOnly, async (req, res) => {
  try {
    const flags = await getAllFlags();
    res.json(flags);
  } catch (err) {
    console.error('Failed to fetch features:', err);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

// POST /api/admin/features — create a new feature flag
router.post('/', ...adminOnly, async (req, res) => {
  try {
    const { key, name, description, status, enabled, public_visible, navigation_visible, admin_visible, requires_admin_confirmation, config } = req.body;
    if (!key || !name) {
      return res.status(400).json({ error: 'key and name are required' });
    }
    const existing = await db.prepare('SELECT key FROM feature_flags WHERE key = ?').get(key);
    if (existing) {
      return res.status(409).json({ error: `Feature key "${key}" already exists` });
    }
    await db.prepare(
      'INSERT INTO feature_flags (key, name, description, status, enabled, public_visible, navigation_visible, admin_visible, requires_admin_confirmation, config, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      key,
      name,
      description || '',
      status || 'draft',
      enabled ? 1 : 0,
      public_visible !== undefined ? (public_visible ? 1 : 0) : 1,
      navigation_visible !== undefined ? (navigation_visible ? 1 : 0) : 1,
      admin_visible !== undefined ? (admin_visible ? 1 : 0) : 1,
      requires_admin_confirmation ? 1 : 0,
      config ? (typeof config === 'string' ? config : JSON.stringify(config)) : null,
      getActor(req)
    );
    await logAudit({
      action: 'FEATURE_FLAG_CREATED',
      entityType: 'feature_flag',
      entityId: key,
      actor: getActor(req),
      after: { key, name, status, enabled: !!enabled },
      ip: getIp(req),
    });
    res.status(201).json(await getFlag(key));
  } catch (err) {
    console.error('Failed to create feature:', err);
    res.status(500).json({ error: 'Failed to create feature' });
  }
});

// PUT /api/admin/features/:key — update a feature flag
router.put('/:key', ...adminOnly, async (req, res) => {
  try {
    const { key } = req.params;
    const before = await getFlag(key);
    if (!before) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    const {
      name, description, status, enabled, public_visible, navigation_visible, admin_visible, requires_admin_confirmation, config,
    } = req.body;

    await db.prepare(
      `UPDATE feature_flags SET
         name = ?, description = ?, status = ?, enabled = ?,
         public_visible = ?, navigation_visible = ?, admin_visible = ?,
         requires_admin_confirmation = ?, config = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
       WHERE key = ?`
    ).run(
      name !== undefined ? name : before.name,
      description !== undefined ? description : before.description,
      status !== undefined ? status : before.status,
      enabled !== undefined ? (enabled ? 1 : 0) : (before.enabled ? 1 : 0),
      public_visible !== undefined ? (public_visible ? 1 : 0) : (before.public_visible ? 1 : 0),
      navigation_visible !== undefined ? (navigation_visible ? 1 : 0) : (before.navigation_visible ? 1 : 0),
      admin_visible !== undefined ? (admin_visible ? 1 : 0) : (before.admin_visible ? 1 : 0),
      requires_admin_confirmation !== undefined ? (requires_admin_confirmation ? 1 : 0) : (before.requires_admin_confirmation ? 1 : 0),
      config !== undefined ? (config == null ? null : (typeof config === 'string' ? config : JSON.stringify(config))) : (before.config ? JSON.stringify(before.config) : null),
      getActor(req),
      key
    );

    const after = await getFlag(key);
    await logAudit({
      action: 'FEATURE_FLAG_UPDATED',
      entityType: 'feature_flag',
      entityId: key,
      actor: getActor(req),
      before,
      after,
      ip: getIp(req),
    });
    res.json(after);
  } catch (err) {
    console.error('Failed to update feature:', err);
    res.status(500).json({ error: 'Failed to update feature' });
  }
});

// POST /api/admin/features/:key/toggle — flip the enabled bit
router.post('/:key/toggle', ...adminOnly, async (req, res) => {
  try {
    const { key } = req.params;
    const before = await getFlag(key);
    if (!before) {
      return res.status(404).json({ error: 'Feature not found' });
    }
    const next = before.enabled ? 0 : 1;
    await db.prepare('UPDATE feature_flags SET enabled = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE key = ?')
      .run(next, getActor(req), key);
    const after = await getFlag(key);
    await logAudit({
      action: 'FEATURE_FLAG_TOGGLED',
      entityType: 'feature_flag',
      entityId: key,
      actor: getActor(req),
      before,
      after,
      ip: getIp(req),
    });
    res.json(after);
  } catch (err) {
    console.error('Failed to toggle feature:', err);
    res.status(500).json({ error: 'Failed to toggle feature' });
  }
});

// POST /api/admin/features/:key/archive — archive or unarchive a feature
router.post('/:key/archive', ...adminOnly, async (req, res) => {
  try {
    const { key } = req.params;
    const before = await getFlag(key);
    if (!before) {
      return res.status(404).json({ error: 'Feature not found' });
    }
    const nextStatus = before.status === 'archived' ? 'draft' : 'archived';
    await db.prepare('UPDATE feature_flags SET status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE key = ?')
      .run(nextStatus, getActor(req), key);
    const after = await getFlag(key);
    await logAudit({
      action: 'FEATURE_FLAG_ARCHIVED',
      entityType: 'feature_flag',
      entityId: key,
      actor: getActor(req),
      before,
      after,
      ip: getIp(req),
    });
    res.json(after);
  } catch (err) {
    console.error('Failed to archive feature:', err);
    res.status(500).json({ error: 'Failed to archive feature' });
  }
});

// GET /api/admin/features/audit-logs — recent audit log entries
router.get('/audit-logs', ...adminOnly, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const rows = await db.prepare(
      'SELECT * FROM audit_logs ORDER BY created_at DESC, id DESC LIMIT ?'
    ).all(limit);
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// GET /api/admin/audit-logs — recent audit log entries (dedicated mount)
auditRouter.get('/', ...adminOnly, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const rows = await db.prepare(
      'SELECT * FROM audit_logs ORDER BY created_at DESC, id DESC LIMIT ?'
    ).all(limit);
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = publicRouter;
module.exports.router = router;
module.exports.auditRouter = auditRouter;
