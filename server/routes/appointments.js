const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/appointments (public booking)
router.post('/', (req, res) => {
  try {
    const { patient_name, patient_email, patient_phone, patient_age, doctor_id, service_id, date, time, notes } = req.body;

    if (!patient_name || !date || !time) {
      return res.status(400).json({ error: 'Patient name, date, and time are required' });
    }

    // Check slot availability
    if (doctor_id) {
      const existing = db.prepare(
        `SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND time = ? AND status != 'cancelled'`
      ).get(doctor_id, date, time);

      if (existing) {
        return res.status(409).json({ error: 'This time slot is already booked' });
      }
    }

    const result = db.prepare(
      `INSERT INTO appointments (patient_name, patient_email, patient_phone, patient_age, doctor_id, service_id, date, time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(patient_name, patient_email || null, patient_phone || null, patient_age || null,
      doctor_id || null, service_id || null, date, time, notes || null);

    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// GET /api/appointments/available-slots (admin)
router.get('/available-slots', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), (req, res) => {
  try {
    const { doctor_id, date } = req.query;
    if (!doctor_id || !date) {
      return res.status(400).json({ error: 'doctor_id and date are required' });
    }

    const booked = db.prepare(
      `SELECT time FROM appointments WHERE doctor_id = ? AND date = ? AND status != 'cancelled'`
    ).all(doctor_id, date);

    const allSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

    const bookedTimes = booked.map(b => b.time);
    const available = allSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({ date, doctor_id: parseInt(doctor_id), available });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

// GET /api/appointments (admin)
router.get('/', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), (req, res) => {
  try {
    const { status, date, doctor_id, search } = req.query;
    let query = `SELECT a.*, d.name as doctor_name, d.specialization, s.name as service_name
                 FROM appointments a
                 LEFT JOIN doctors d ON a.doctor_id = d.id
                 LEFT JOIN services s ON a.service_id = s.id
                 WHERE 1=1`;
    const params = [];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }
    if (doctor_id) {
      query += ' AND a.doctor_id = ?';
      params.push(doctor_id);
    }
    if (search) {
      query += ' AND (a.patient_name LIKE ? OR a.patient_email LIKE ? OR a.patient_phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY a.date DESC, a.time DESC';
    const appointments = db.prepare(query).all(...params);
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// GET /api/appointments/:id
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const appointment = db.prepare(
      `SELECT a.*, d.name as doctor_name, d.specialization, s.name as service_name
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`
    ).get(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// PUT /api/appointments/:id (admin)
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), (req, res) => {
  try {
    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const { status, notes, payment_status, doctor_id, service_id, date, time } = req.body;

    db.prepare(
      `UPDATE appointments SET
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        payment_status = COALESCE(?, payment_status),
        doctor_id = COALESCE(?, doctor_id),
        service_id = COALESCE(?, service_id),
        date = COALESCE(?, date),
        time = COALESCE(?, time)
       WHERE id = ?`
    ).run(status || null, notes || null, payment_status || null,
      doctor_id ?? null, service_id ?? null, date || null, time || null, req.params.id);

    const updated = db.prepare(
      `SELECT a.*, d.name as doctor_name, s.name as service_name
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`
    ).get(req.params.id);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

module.exports = router;
