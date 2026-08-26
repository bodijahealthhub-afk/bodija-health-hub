const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const { requireFeature } = require('../middleware/features');
const { sendMail } = require('../utils/email');

const router = express.Router();

// POST /api/newsletter/subscribe — gated behind the newsletter feature
router.post('/subscribe', requireFeature('newsletter'), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existing = await db.prepare('SELECT * FROM newsletter_subscribers WHERE email = ?').get(email);
    if (existing) {
      if (!existing.is_active) {
        await db.prepare('UPDATE newsletter_subscribers SET is_active = 1 WHERE email = ?').run(email);
        return res.json({ success: true, message: 'Subscription reactivated' });
      }
      return res.json({ success: true, message: 'Already subscribed' });
    }

    await db.prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)').run(email);
    sendMail({
      to: email,
      subject: 'Welcome to Bodija Health Hub',
      text: `Welcome to the Bodija Health Hub community!\n\nYou have been subscribed to our newsletter. You'll receive health tips, service updates, and news from our ecosystem in Ibadan.\n\nIf you did not request this subscription, you can unsubscribe at any time.\n\nWarm regards,\nBodija Health Hub`,
    });
    res.status(201).json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// POST /api/newsletter/unsubscribe
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await db.prepare('UPDATE newsletter_subscribers SET is_active = 0 WHERE email = ?').run(email);
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// GET /api/newsletter/subscribers (admin)
router.get('/subscribers', authenticateToken, requirePermission('newsletter.view'), async (req, res) => {
  try {
    const subscribers = await db.prepare('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC').all();
    res.json({
      subscribers: subscribers.map((s) => ({
        id: s.id,
        email: s.email,
        name: '',
        subscribedAt: s.created_at,
        status: s.is_active ? 'active' : 'unsubscribed',
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

module.exports = router;
