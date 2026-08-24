const db = require('../models/database');

const VALID_ACTIONS = [
  'LOGIN_SUCCESS', 'LOGIN_FAILURE',
  'USER_CREATED', 'USER_DELETED', 'USER_DISABLED', 'USER_ENABLED',
  'ROLE_CHANGED', 'PASSWORD_RESET',
  'CONTENT_CREATED', 'CONTENT_UPDATED', 'CONTENT_DELETED', 'CONTENT_PUBLISHED', 'CONTENT_ARCHIVED',
  'BOOKING_CREATED', 'BOOKING_UPDATED', 'BOOKING_CANCELLED',
  'SETTINGS_CHANGED', 'FEATURE_TOGGLED',
  'BACKUP_CREATED', 'BACKUP_RESTORED',
  'MEDIA_UPLOADED', 'MEDIA_DELETED',
];

async function logAudit({ action, entityType, entityId, actor, before_state, after_state, ip }) {
  try {
    await db.prepare(
      'INSERT INTO audit_logs (action, entity_type, entity_id, actor, before_state, after_state, ip) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      action,
      entityType,
      entityId == null ? null : String(entityId),
      actor || 'unknown',
      before_state == null ? null : JSON.stringify(before_state),
      after_state == null ? null : JSON.stringify(after_state),
      ip || null
    );
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

module.exports = { logAudit, VALID_ACTIONS };
