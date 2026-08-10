const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireFeature } = require('../middleware/features');
const { sendMail } = require('../utils/email');

const router = express.Router();

const toClient = (a) => ({
  ...a,
  patientName: a.patient_name,
  email: a.patient_email,
  phone: a.patient_phone,
  patientEmail: a.patient_email,
  patientPhone: a.patient_phone,
  patientAge: a.patient_age,
  doctor: a.doctor_name || '',
  service: a.service_name || '',
  paymentStatus: a.payment_status,
  amount: a.consultation_fee || null,
});

// POST /api/appointments (public booking) — gated behind the appointments feature
router.post('/', requireFeature('appointments'), async (req, res) => {
  try {
    const { patient_name, patient_email, patient_phone, patient_age, doctor_id, service_id, date, time, notes } = req.body;

    if (!patient_name || !date || !time) {
      return res.status(400).json({ error: 'Patient name, date, and time are required' });
    }

    // Check slot availability
    if (doctor_id) {
      const existing = await db.prepare(
        `SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND time = ? AND status != 'cancelled'`
      ).get(doctor_id, date, time);

      if (existing) {
        return res.status(409).json({ error: 'This time slot is already booked' });
      }
    }

    const result = await db.prepare(
      `INSERT INTO appointments (patient_name, patient_email, patient_phone, patient_age, doctor_id, service_id, date, time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(patient_name, patient_email || null, patient_phone || null, patient_age || null,
      doctor_id || null, service_id || null, date, time, notes || null);

    const appointment = await db.prepare(
      `SELECT a.*, d.name as doctor_name, d.consultation_fee, s.name as service_name, s.price as service_price
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`
    ).get(result.lastInsertRowid);

    if (patient_email) {
      sendMail({
        to: patient_email,
        subject: 'Appointment Booking Confirmation - Bodija Health Hub',
        text: `Dear ${patient_name},\n\nYour appointment has been booked successfully.\n\nDate: ${date}\nTime: ${time}\nDoctor: ${appointment.doctor_name || 'To be assigned'}\nService: ${appointment.service_name || ''}\n\nThank you for choosing Bodija Health Hub.\n\nWarm regards,\nBodija Health Hub`,
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      sendMail({
        to: adminEmail,
        subject: `New appointment booking from ${patient_name}`,
        text: `A new appointment has been booked on the website.\n\nPatient: ${patient_name}\nEmail: ${patient_email || 'N/A'}\nPhone: ${patient_phone || 'N/A'}\nDoctor: ${appointment.doctor_name || 'To be assigned'}\nService: ${appointment.service_name || ''}\nDate: ${date}\nTime: ${time}\n\nReview it in the admin panel.`,
      });
    }

    res.status(201).json(toClient(appointment));
  } catch (err) {
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// GET /api/appointments/available-slots (admin)
router.get('/available-slots', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), async (req, res) => {
  try {
    const { doctor_id, date } = req.query;
    if (!doctor_id || !date) {
      return res.status(400).json({ error: 'doctor_id and date are required' });
    }

    const booked = await db.prepare(
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
router.get('/', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), async (req, res) => {
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
    const appointments = await db.prepare(query).all(...params);
    res.json({ appointments: appointments.map(toClient) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// PATCH /api/appointments/:id/status (admin)
router.patch('/:id/status', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), async (req, res) => {
  try {
    const appointment = await db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    await db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);

    const updated = await db.prepare(
      `SELECT a.*, d.name as doctor_name, s.name as service_name
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`
    ).get(req.params.id);

    if (updated.patient_email) {
      const statusText = {
        confirmed: 'Your appointment has been confirmed.',
        completed: 'Your appointment has been marked as completed. Thank you for visiting Bodija Health Hub.',
        cancelled: 'Your appointment has been cancelled. Please contact us if you would like to reschedule.',
      }[status];
      if (statusText) {
        sendMail({
          to: updated.patient_email,
          subject: `Appointment Update - Bodija Health Hub (${status})`,
          text: `Dear ${updated.patient_name},\n\n${statusText}\n\nDate: ${updated.date}\nTime: ${updated.time}\nDoctor: ${updated.doctor_name || 'To be assigned'}\n\nWarm regards,\nBodija Health Hub`,
        });
      }
    }

    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

// PATCH /api/appointments/:id/notes (admin)
router.patch('/:id/notes', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), async (req, res) => {
  try {
    const appointment = await db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const { notes } = req.body;
    await db.prepare('UPDATE appointments SET notes = COALESCE(?, notes) WHERE id = ?').run(notes ?? null, req.params.id);

    const updated = await db.prepare(
      `SELECT a.*, d.name as doctor_name, s.name as service_name
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`
    ).get(req.params.id);
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment notes' });
  }
});

// GET /api/appointments/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await db.prepare(
      `SELECT a.*, d.name as doctor_name, d.specialization, s.name as service_name
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`
    ).get(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(toClient(appointment));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// PUT /api/appointments/:id (admin)
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), async (req, res) => {
  try {
    const appointment = await db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const { status, notes, payment_status, doctor_id, service_id, date, time } = req.body;

    await db.prepare(
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

    const updated = await db.prepare(
      `SELECT a.*, d.name as doctor_name, s.name as service_name
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`
    ).get(req.params.id);

    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// DELETE /api/appointments/:id (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), async (req, res) => {
  try {
    const appointment = await db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    await db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

module.exports = router;
