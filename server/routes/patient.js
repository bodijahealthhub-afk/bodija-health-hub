const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/database');
const { authenticatePatient } = require('../middleware/auth');
const { sendMail } = require('../utils/email');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

function signPatientToken(account) {
  return jwt.sign(
    { id: account.id, email: account.email, name: account.name, scope: 'patient' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

const publicAccount = (a) => ({
  id: a.id,
  name: a.name,
  email: a.email,
  phone: a.phone,
  patient_id: a.patient_id,
  created_at: a.created_at,
});

// POST /api/patient/register — create a patient account.
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await db.prepare('SELECT id FROM patient_accounts WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Link to an existing patient record when possible.
    const patient = await db.prepare(
      'SELECT id FROM patients WHERE email = ? OR phone = ? ORDER BY id ASC LIMIT 1'
    ).get(email, phone || null);

    const hash = bcrypt.hashSync(password, 10);
    const result = await db.prepare(
      'INSERT INTO patient_accounts (name, email, phone, password_hash, patient_id) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, phone || null, hash, patient ? patient.id : null);

    const account = await db.prepare('SELECT * FROM patient_accounts WHERE id = ?').get(result.lastInsertRowid);
    const token = signPatientToken(account);

    res.status(201).json({ token, patient: publicAccount(account) });
  } catch (err) {
    console.error('Patient registration failed:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/patient/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const account = await db.prepare('SELECT * FROM patient_accounts WHERE email = ?').get(email);
    if (!account || !bcrypt.compareSync(password, account.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signPatientToken(account);
    res.json({ token, patient: publicAccount(account) });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/patient/me
router.get('/me', authenticatePatient, async (req, res) => {
  try {
    const account = await db.prepare('SELECT * FROM patient_accounts WHERE id = ?').get(req.patient.id);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(publicAccount(account));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

const toPortalAppointment = (a) => ({
  id: a.id,
  patientName: a.patient_name,
  date: a.date,
  time: a.time,
  status: a.status,
  notes: a.notes,
  paymentStatus: a.payment_status,
  doctor: a.doctor_name || '',
  doctorSpecialization: a.specialization || '',
  service: a.service_name || '',
  amount: a.consultation_fee || null,
});

// GET /api/patient/appointments — the patient's own appointments.
router.get('/appointments', authenticatePatient, async (req, res) => {
  try {
    const account = await db.prepare('SELECT * FROM patient_accounts WHERE id = ?').get(req.patient.id);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const rows = await db.prepare(
      `SELECT a.*, d.name as doctor_name, d.specialization, d.consultation_fee, s.name as service_name
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.patient_email = ? OR a.patient_phone = ?
       ORDER BY a.date DESC, a.time DESC`
    ).all(account.email, account.phone || '');

    res.json({ appointments: rows.map(toPortalAppointment) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// POST /api/patient/appointments/:id/cancel — cancel a pending/confirmed appointment.
router.post('/appointments/:id/cancel', authenticatePatient, async (req, res) => {
  try {
    const account = await db.prepare('SELECT * FROM patient_accounts WHERE id = ?').get(req.patient.id);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const appointment = await db.prepare(
      `SELECT a.*, d.name as doctor_name FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id WHERE a.id = ?`
    ).get(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    const ownsAppointment = appointment.patient_email === account.email ||
      (appointment.patient_phone && account.phone && appointment.patient_phone === account.phone);
    if (!ownsAppointment) {
      return res.status(403).json({ error: 'Not your appointment' });
    }
    if (!['pending', 'requested', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({ error: 'This appointment can no longer be cancelled' });
    }

    await db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?").run(appointment.id);

    if (appointment.patient_email) {
      sendMail({
        to: appointment.patient_email,
        subject: 'Appointment Cancelled - Bodija Health Hub',
        text: `Dear ${appointment.patient_name},\n\nYour appointment scheduled for ${appointment.date} at ${appointment.time} has been cancelled.\n\nIf you would like to reschedule, please book a new appointment on our website or call us.\n\nWarm regards,\nBodija Health Hub`,
      });
    }

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// GET /api/patient/payments — the patient's payment history (receipts).
router.get('/payments', authenticatePatient, async (req, res) => {
  try {
    const account = await db.prepare('SELECT * FROM patient_accounts WHERE id = ?').get(req.patient.id);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const rows = await db.prepare(
      `SELECT p.*, a.patient_name, a.date as appointment_date, a.time as appointment_time
       FROM payments p
       LEFT JOIN appointments a ON p.appointment_id = a.id
       WHERE p.email = ?
       ORDER BY p.created_at DESC`
    ).all(account.email);

    res.json({ payments: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

module.exports = router;
