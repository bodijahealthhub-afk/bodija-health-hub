const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const notifications = [];
    const unreadMessages = db.prepare('SELECT COUNT(*) as count FROM messages WHERE is_read = 0').get();
    if (unreadMessages.count > 0) {
      notifications.push({ id: 1, text: `You have ${unreadMessages.count} unread message${unreadMessages.count > 1 ? 's' : ''}`, time: 'New', read: false, type: 'message', link: '/admin/messages' });
    }
    const pendingAppts = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'").get();
    if (pendingAppts.count > 0) {
      notifications.push({ id: 2, text: `${pendingAppts.count} pending appointment${pendingAppts.count > 1 ? 's' : ''} need review`, time: 'Action needed', read: false, type: 'appointment', link: '/admin/appointments' });
    }
    const newSubscribers = db.prepare("SELECT COUNT(*) as count FROM newsletter_subscribers WHERE created_at > datetime('now', '-7 days')").get();
    if (newSubscribers.count > 0) {
      notifications.push({ id: 3, text: `${newSubscribers.count} new subscriber${newSubscribers.count > 1 ? 's' : ''} this week`, time: 'This week', read: true, type: 'newsletter', link: '/admin/newsletter' });
    }
    const recentMsg = db.prepare("SELECT name, created_at FROM messages ORDER BY created_at DESC LIMIT 1").get();
    if (recentMsg) {
      notifications.push({ id: 4, text: `Latest message from ${recentMsg.name}`, time: new Date(recentMsg.created_at).toLocaleDateString(), read: true, type: 'message', link: '/admin/messages' });
    }
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.get('/count', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const unreadMessages = db.prepare('SELECT COUNT(*) as count FROM messages WHERE is_read = 0').get();
    const pendingAppts = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'").get();
    res.json({ unread: unreadMessages.count + pendingAppts.count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch count' });
  }
});

module.exports = router;
