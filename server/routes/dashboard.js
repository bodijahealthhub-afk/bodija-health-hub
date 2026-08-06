const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

const formatNaira = (n) => `₦${Number(n || 0).toLocaleString('en-US')}`;

const buildStats = () => {
  const today = new Date().toISOString().split('T')[0];

  const todayAppointments = db.prepare(
    'SELECT COUNT(*) as count FROM appointments WHERE date = ?'
  ).get(today).count;

  const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;
  const totalDoctors = db.prepare('SELECT COUNT(*) as count FROM doctors WHERE is_active = 1').get().count;
  const totalAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments').get().count;

  const pendingAppointments = db.prepare(
    "SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'"
  ).get().count;

  const completedAppointments = db.prepare(
    "SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'"
  ).get().count;

  const revenue = db.prepare(
    "SELECT COALESCE(SUM(consultation_fee), 0) as total FROM appointments a JOIN doctors d ON a.doctor_id = d.id WHERE a.payment_status = 'paid'"
  ).get().total;

  const monthlyRevenueRaw = db.prepare(
    `SELECT COALESCE(SUM(consultation_fee), 0) as total FROM appointments a
     JOIN doctors d ON a.doctor_id = d.id
     WHERE a.payment_status = 'paid'
     AND a.date >= date('now', 'start of month')`
  ).get().total;

  const unreadMessages = db.prepare(
    'SELECT COUNT(*) as count FROM messages WHERE is_read = 0'
  ).get().count;

  const appointmentsByStatus = db.prepare(
    'SELECT status, COUNT(*) as count FROM appointments GROUP BY status'
  ).all();

  const recentRows = db.prepare(
    `SELECT a.*, d.name as doctor_name, s.name as service_name
     FROM appointments a
     LEFT JOIN doctors d ON a.doctor_id = d.id
     LEFT JOIN services s ON a.service_id = s.id
     ORDER BY a.created_at DESC LIMIT 5`
  ).all();

  const recentAppointments = recentRows.map((a) => ({
    id: a.id,
    patient: a.patient_name,
    doctor: a.doctor_name || '',
    service: a.service_name || '',
    date: a.date,
    time: a.time,
    status: a.status,
  }));

  const stats = {
    todayAppointments,
    totalPatients,
    totalDoctors,
    totalAppointments,
    pendingAppointments,
    completedAppointments,
    revenue,
    monthlyRevenue: formatNaira(monthlyRevenueRaw),
    unreadMessages,
    appointmentsByStatus,
  };

  return { stats, recentAppointments };
};

// GET /api/dashboard (admin — wrapped for admin panel)
router.get('/', authenticateToken, requireRole('admin', 'super_admin', 'accountant'), (req, res) => {
  try {
    res.json(buildStats());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/dashboard/stats (admin — flat stats, backward compatible)
router.get('/stats', authenticateToken, requireRole('admin', 'super_admin', 'accountant'), (req, res) => {
  try {
    const { stats, recentAppointments } = buildStats();
    res.json({ ...stats, recentAppointments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
