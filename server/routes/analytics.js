const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');

const router = express.Router();

// GET /api/admin/analytics — real analytics from DB
router.get('/', authenticateToken, requirePermission('analytics.view'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const now = new Date();
    let sinceDate;
    switch (period) {
      case '7d': sinceDate = new Date(now - 7 * 86400000); break;
      case '30d': sinceDate = new Date(now - 30 * 86400000); break;
      case '90d': sinceDate = new Date(now - 90 * 86400000); break;
      case '12m': sinceDate = new Date(now - 365 * 86400000); break;
      default: sinceDate = new Date(now - 30 * 86400000);
    }
    const since = sinceDate.toISOString();

    // Service requests
    const totalBookings = await db.prepare('SELECT COUNT(*) as count FROM appointments').get();
    const periodBookings = await db.prepare('SELECT COUNT(*) as count FROM appointments WHERE created_at >= ?').get(since);
    const bookingsByStatus = await db.prepare(
      'SELECT status, COUNT(*) as count FROM appointments GROUP BY status'
    ).all();
    const bookingsByType = await db.prepare(
      'SELECT booking_type, COUNT(*) as count FROM appointments GROUP BY booking_type'
    ).all();

    // Messages
    const totalMessages = await db.prepare('SELECT COUNT(*) as count FROM messages').get();
    const periodMessages = await db.prepare('SELECT COUNT(*) as count FROM messages WHERE created_at >= ?').get(since);
    const unreadMessages = await db.prepare('SELECT COUNT(*) as count FROM messages WHERE is_read = 0').get();

    // Blog
    const totalPosts = await db.prepare('SELECT COUNT(*) as count FROM blog_posts').get();
    const publishedPosts = await db.prepare("SELECT COUNT(*) as count FROM blog_posts WHERE status = 'published'").get();
    const periodPosts = await db.prepare('SELECT COUNT(*) as count FROM blog_posts WHERE created_at >= ?').get(since);
    const totalViews = await db.prepare('SELECT COALESCE(SUM(views), 0) as total FROM blog_posts').get();

    // Content
    const totalServices = await db.prepare('SELECT COUNT(*) as count FROM services').get();
    const activeServices = await db.prepare("SELECT COUNT(*) as count FROM services WHERE is_active = 1 AND (status IS NULL OR status = 'active')").get();
    const totalPartners = await db.prepare('SELECT COUNT(*) as count FROM partners').get();
    const activePartners = await db.prepare("SELECT COUNT(*) as count FROM partners WHERE is_active = 1 AND (status IS NULL OR status = 'active')").get();
    const totalProgrammes = await db.prepare('SELECT COUNT(*) as count FROM programmes').get();
    const totalEvents = await db.prepare('SELECT COUNT(*) as count FROM events').get();

    // Contacts (CRM)
    const totalContacts = await db.prepare('SELECT COUNT(*) as count FROM contacts').get();
    const newContacts = await db.prepare("SELECT COUNT(*) as count FROM contacts WHERE status = 'new'").get();

    // Newsletter
    const totalSubscribers = await db.prepare('SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = 1').get();

    // Trend: bookings per day for last 14 days
    const trendData = [];
    for (let i = 13; i >= 0; i--) {
      const day = new Date(now - i * 86400000);
      const dayStr = day.toISOString().split('T')[0];
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      const count = await db.prepare(
        'SELECT COUNT(*) as count FROM appointments WHERE created_at >= ? AND created_at < ?'
      ).get(dayStr, nextDayStr);
      trendData.push({ date: dayStr, count: count.count });
    }

    res.json({
      overview: {
        totalBookings: totalBookings.count,
        periodBookings: periodBookings.count,
        totalMessages: totalMessages.count,
        periodMessages: periodMessages.count,
        unreadMessages: unreadMessages.count,
        totalPosts: totalPosts.count,
        publishedPosts: publishedPosts.count,
        periodPosts: periodPosts.count,
        totalViews: totalViews.total,
        totalServices: totalServices.count,
        activeServices: activeServices.count,
        totalPartners: totalPartners.count,
        activePartners: activePartners.count,
        totalProgrammes: totalProgrammes.count,
        totalEvents: totalEvents.count,
        totalContacts: totalContacts.count,
        newContacts: newContacts.count,
        totalSubscribers: totalSubscribers.count,
      },
      bookingsByStatus,
      bookingsByType,
      trend: trendData,
      period,
    });
  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
