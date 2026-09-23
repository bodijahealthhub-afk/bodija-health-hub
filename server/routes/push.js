const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const { isPushConfigured, getVapidConfig, sendPushForNotification } = require('../utils/push');

const router = express.Router();

// All routes require a valid admin JWT (mount-level) + messages.view (1A audience).

router.get('/public-key', authenticateToken, requirePermission('messages.view'), (req, res) => {
  const cfg = getVapidConfig();
  if (!cfg) {
    return res.status(503).json({ error: 'Push notifications are not configured' });
  }
  res.json({ publicKey: cfg.publicKey, configured: true });
});

router.get('/status', authenticateToken, requirePermission('messages.view'), async (req, res) => {
  try {
    const count = await db
      .prepare('SELECT COUNT(*) as count FROM push_subscriptions WHERE user_id = ?')
      .get(req.user.id);
    res.json({
      configured: isPushConfigured(),
      subscribed: count.count > 0,
    });
  } catch (err) {
    console.error('[push] status failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch push status' });
  }
});

router.post('/subscribe', authenticateToken, requirePermission('messages.view'), async (req, res) => {
  try {
    if (!isPushConfigured()) {
      return res.status(503).json({ error: 'Push notifications are not configured' });
    }
    const { endpoint, keys, userAgent } = req.body || {};
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ error: 'endpoint and keys (p256dh, auth) are required' });
    }

    await db
      .prepare(
        `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent, created_at, last_used_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
         ON CONFLICT(endpoint) DO UPDATE SET
           user_id = excluded.user_id,
           p256dh = excluded.p256dh,
           auth = excluded.auth,
           user_agent = excluded.user_agent`
      )
      .run(req.user.id, endpoint, keys.p256dh, keys.auth, userAgent || req.get('user-agent') || null);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('[push] subscribe failed:', err.message);
    res.status(500).json({ error: 'Failed to save push subscription' });
  }
});

router.post('/unsubscribe', authenticateToken, requirePermission('messages.view'), async (req, res) => {
  try {
    const { endpoint } = req.body || {};
    if (!endpoint) {
      return res.status(400).json({ error: 'endpoint is required' });
    }
    await db
      .prepare('DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?')
      .run(endpoint, req.user.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[push] unsubscribe failed:', err.message);
    res.status(500).json({ error: 'Failed to remove push subscription' });
  }
});

router.post('/test', authenticateToken, requirePermission('messages.view'), async (req, res) => {
  try {
    const result = await sendPushForNotification({
      recipientUserId: req.user.id,
      title: 'Test notification',
      message: 'Push notifications are working for Bodija Health Hub.',
      link: '/admin/messages',
    });
    if (result.skipped) {
      return res.status(503).json({ error: 'Push notifications are not configured' });
    }
    if (!result.sent) {
      return res.status(404).json({ error: 'No active subscription for this user' });
    }
    res.json({ success: true, sent: result.sent });
  } catch (err) {
    console.error('[push] test failed:', err.message);
    res.status(500).json({ error: 'Failed to send test push' });
  }
});

module.exports = router;
