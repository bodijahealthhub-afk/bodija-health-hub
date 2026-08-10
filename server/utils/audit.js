const db = require('../models/database');

// Append an entry to the audit log. Best-effort: never throws so callers
// don't need to wrap audit writes in their own error handling.
async function logAudit({ action, entityType, entityId, actor, before, after, ip }) {
  try {
    await db.prepare(
      'INSERT INTO audit_logs (action, entity_type, entity_id, actor, before_state, after_state, ip) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      action,
      entityType,
      entityId == null ? null : String(entityId),
      actor || 'unknown',
      before == null ? null : JSON.stringify(before),
      after == null ? null : JSON.stringify(after),
      ip || null
    );
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

module.exports = { logAudit };
