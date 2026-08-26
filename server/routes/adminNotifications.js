const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');

const router = express.Router();

// Helper: create a notification and insert it
async function createNotification({ recipientUserId, type, title, message, link, entityType, entityId }) {
  try {
    await db.prepare(
      `INSERT INTO notifications (recipient_user_id, type, title, message, link, entity_type, entity_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).run(
      recipientUserId || null,
      type,
      title,
      message || null,
      link || null,
      entityType || null,
      entityId == null ? null : String(entityId)
    );
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
}

// GET /api/admin/notifications — list notifications for the current user
router.get('/', authenticateToken, requirePermission('notifications.view'), async (req, res) => {
  try {
    const { unread_only } = req.query;
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];

    // Super admins see all; others see only their own
    if (req.user.role !== 'super_admin') {
      query += ' AND (recipient_user_id = ? OR recipient_user_id IS NULL)';
      params.push(req.user.id);
    }

    if (unread_only === '1' || unread_only === 'true') {
      query += ' AND read_at IS NULL';
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const notifications = await db.prepare(query).all(...params);
    const unreadCount = await db.prepare(
      `SELECT COUNT(*) as count FROM notifications
       WHERE read_at IS NULL
       AND (recipient_user_id = ? OR recipient_user_id IS NULL)`
    ).get(req.user.id);

    res.json({ notifications, unreadCount: unreadCount.count });
  } catch (err) {
    console.error('Failed to fetch notifications:', err.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /api/admin/notifications — create a notification
router.post('/', authenticateToken, requirePermission('notifications.manage'), async (req, res) => {
  try {
    const { recipient_user_id, type, title, message, link, entity_type, entity_id } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const result = await db.prepare(
      `INSERT INTO notifications (recipient_user_id, type, title, message, link, entity_type, entity_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).run(recipient_user_id || null, type || 'info', title, message || null, link || null, entity_type || null, entity_id == null ? null : String(entity_id));
    const notif = await db.prepare('SELECT * FROM notifications WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(notif);
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// PATCH /api/admin/notifications/:id/read — mark a single notification as read
router.patch('/:id/read', authenticateToken, requirePermission('notifications.view'), async (req, res) => {
  try {
    const notif = await db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);
    if (!notif) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    await db.prepare('UPDATE notifications SET read_at = datetime(\'now\') WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PATCH /api/admin/notifications/read-all — mark all notifications as read
router.patch('/read-all', authenticateToken, requirePermission('notifications.view'), async (req, res) => {
  try {
    await db.prepare(
      `UPDATE notifications SET read_at = datetime('now')
       WHERE read_at IS NULL AND (recipient_user_id = ? OR recipient_user_id IS NULL)`
    ).run(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// DELETE /api/admin/notifications/:id — delete a notification
router.delete('/:id', authenticateToken, requirePermission('notifications.manage'), async (req, res) => {
  try {
    await db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;
module.exports.createNotification = createNotification;
