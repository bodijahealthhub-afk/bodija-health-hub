const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats (admin)
router.get('/stats', authenticateToken, requireRole('admin', 'super_admin', 'accountant'), (req, res) => {
  try {
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

    const monthlyRevenue = db.prepare(
      `SELECT COALESCE(SUM(consultation_fee), 0) as total FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.payment_status = 'paid'
       AND a.date >= date('now', 'start of month')`
    ).get().total;

    const recentAppointments = db.prepare(
      `SELECT a.*, d.name as doctor_name, d.specialization, s.name as service_name
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN services s ON a.service_id = s.id
       ORDER BY a.created_at DESC LIMIT 5`
    ).all();

    const unreadMessages = db.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE is_read = 0'
    ).get().count;

    const appointmentsByStatus = db.prepare(
      'SELECT status, COUNT(*) as count FROM appointments GROUP BY status'
    ).all();

    res.json({
      todayAppointments,
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      revenue,
      monthlyRevenue,
      unreadMessages,
      appointmentsByStatus,
      recentAppointments,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
