const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');

const router = express.Router();

const formatNaira = (n) => `₦${Number(n || 0).toLocaleString('en-US')}`;

const buildStats = async () => {
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date().toISOString().slice(0, 8) + '01';

  const todayAppointments = (await db.prepare(
    'SELECT COUNT(*) as count FROM appointments WHERE date = ?'
  ).get(today)).count;

  const totalPatients = (await db.prepare('SELECT COUNT(*) as count FROM patients').get()).count;
  const totalAppointments = (await db.prepare('SELECT COUNT(*) as count FROM appointments').get()).count;

  const pendingAppointments = (await db.prepare(
    "SELECT COUNT(*) as count FROM appointments WHERE status IN ('pending','requested','new','under_review')"
  ).get()).count;

  const completedAppointments = (await db.prepare(
    "SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'"
  ).get()).count;

  const revenue = (await db.prepare(
    "SELECT COALESCE(SUM(consultation_fee), 0) as total FROM appointments a JOIN doctors d ON a.doctor_id = d.id WHERE a.payment_status = 'paid'"
  ).get()).total;

  const monthlyRevenueRaw = (await db.prepare(
    `SELECT COALESCE(SUM(consultation_fee), 0) as total FROM appointments a
     JOIN doctors d ON a.doctor_id = d.id
     WHERE a.payment_status = 'paid'
     AND a.date >= ?`
  ).get(firstOfMonth)).total;

  const unreadMessages = (await db.prepare(
    'SELECT COUNT(*) as count FROM messages WHERE is_read = 0'
  ).get()).count;

  const appointmentsByStatus = await db.prepare(
    'SELECT status, COUNT(*) as count FROM appointments GROUP BY status'
  ).all();

  // Wave 1-4 metrics
  const activeServices = (await db.prepare(
    "SELECT COUNT(*) as count FROM services WHERE is_active = 1 AND (status IS NULL OR status = 'active')"
  ).get()).count;
  const activePartners = (await db.prepare(
    "SELECT COUNT(*) as count FROM partners WHERE is_active = 1 AND (status IS NULL OR status = 'active')"
  ).get()).count;
  const activeProgrammes = (await db.prepare(
    "SELECT COUNT(*) as count FROM programmes WHERE is_active = 1 AND (status IS NULL OR status = 'active')"
  ).get()).count;
  const upcomingEvents = (await db.prepare(
    "SELECT COUNT(*) as count FROM events WHERE is_active = 1 AND date >= ?"
  ).get(today)).count;
  const newContacts = (await db.prepare(
    "SELECT COUNT(*) as count FROM contacts WHERE status = 'new'"
  ).get()).count;
  const unreadNotifications = (await db.prepare(
    'SELECT COUNT(*) as count FROM notifications WHERE read_at IS NULL'
  ).get()).count;

  const recentRows = await db.prepare(
    `SELECT a.*, s.name as service_name
     FROM appointments a
     LEFT JOIN services s ON a.service_id = s.id
     ORDER BY a.created_at DESC LIMIT 5`
  ).all();

  const recentAppointments = recentRows.map((a) => ({
    id: a.id,
    patient: a.patient_name,
    service: a.service_name || '',
    date: a.date,
    time: a.time,
    status: a.status,
  }));

  const stats = {
    todayAppointments,
    totalPatients,
    totalAppointments,
    pendingAppointments,
    completedAppointments,
    revenue,
    monthlyRevenue: formatNaira(monthlyRevenueRaw),
    unreadMessages,
    appointmentsByStatus,
    activeServices,
    activePartners,
    activeProgrammes,
    upcomingEvents,
    newContacts,
    unreadNotifications,
  };

  return { stats, recentAppointments };
};

// GET /api/dashboard (admin — wrapped for admin panel)
router.get('/', authenticateToken, requirePermission('dashboard.view'), async (req, res) => {
  try {
    res.json(await buildStats());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/dashboard/stats (admin — flat stats, backward compatible)
router.get('/stats', authenticateToken, requirePermission('dashboard.view'), async (req, res) => {
  try {
    const { stats, recentAppointments } = await buildStats();
    res.json({ ...stats, recentAppointments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Build a date-series (YYYY-MM-DD strings) covering the last `days` days.
function dateSeries(days) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    out.push(new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  }
  return out;
}

// GET /api/dashboard/analytics?days=30 (admin — trend data for the dashboard charts)
router.get('/analytics', authenticateToken, requirePermission('dashboard.view'), async (req, res) => {
  try {
    const days = Math.min(365, Math.max(1, parseInt(req.query.days, 10) || 30));
    const start = dateSeries(days)[0];

    // Daily aggregates (missing days are zero-filled in JS for cross-DB compatibility).
    const dailyRows = await db.prepare(
      `SELECT date,
              COUNT(*) AS count,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
              COALESCE(SUM(CASE WHEN a.payment_status = 'paid' THEN d.consultation_fee ELSE 0 END), 0) AS revenue
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.date >= ?
       GROUP BY a.date`
    ).all(start);

    const dailyMap = new Map(dailyRows.map((r) => [r.date, r]));
    const daily = dateSeries(days).map((date) => {
      const r = dailyMap.get(date) || {};
      return { date, appointments: Number(r.count || 0), completed: Number(r.completed || 0), revenue: Number(r.revenue || 0) };
    });

    const totalAppointments = daily.reduce((s, d) => s + d.appointments, 0);
    const totalCompleted = daily.reduce((s, d) => s + d.completed, 0);
    const totalRevenue = daily.reduce((s, d) => s + d.revenue, 0);

    const statusBreakdown = await db.prepare(
      `SELECT status, COUNT(*) AS count FROM appointments WHERE date >= ? GROUP BY status`
    ).all(start);

    const topServices = await db.prepare(
      `SELECT s.name, COUNT(*) AS count
       FROM appointments a
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.date >= ? AND s.name IS NOT NULL
       GROUP BY a.service_id
       ORDER BY count DESC
       LIMIT 5`
    ).all(start);

    const newPatients = await db.prepare(
      `SELECT COUNT(*) AS count FROM patients WHERE created_at >= ?`
    ).get(start);

    const rangeSummary = {
      totalAppointments,
      totalCompleted,
      totalRevenue,
      completionRate: totalAppointments ? Math.round((totalCompleted / totalAppointments) * 100) : 0,
      newPatients: Number(newPatients.count || 0),
    };

    res.json({ days, daily, statusBreakdown, topServices, rangeSummary });
  } catch (err) {
    console.error('Error building analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
