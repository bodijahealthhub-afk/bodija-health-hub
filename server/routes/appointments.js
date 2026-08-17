const express = require('express');
const crypto = require('crypto');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireFeature } = require('../middleware/features');
const { sendMail } = require('../utils/email');

const router = express.Router();

const BOOKING_TYPES = {
  appointment: { label: 'Appointment', feature: 'appointment_booking', defaultMethod: 'BHH_MANAGED', requiresProvider: false },
  partner_appointment: { label: 'Partner Appointment', feature: 'appointment_booking', defaultMethod: 'PARTNER_REQUEST', requiresProvider: true },
  programme: { label: 'Programme', feature: 'programme_registration', defaultMethod: 'BHH_MANAGED', requiresProvider: false },
  event: { label: 'Event', feature: 'event_registration', defaultMethod: 'BHH_MANAGED', requiresProvider: false },
  training: { label: 'Training', feature: 'training_registration', defaultMethod: 'BHH_MANAGED', requiresProvider: false },
  external: { label: 'External Booking', feature: 'external_partner_booking', defaultMethod: 'EXTERNAL', requiresProvider: true },
};

const generateBookingReference = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `BHH-${y}${m}${day}-${rand}`;
};

const toClient = (a) => ({
  ...a,
  bookingReference: a.booking_reference,
  bookingType: a.booking_type,
  category: a.category,
  patientName: a.patient_name,
  email: a.patient_email,
  phone: a.patient_phone,
  patientEmail: a.patient_email,
  patientPhone: a.patient_phone,
  patientAge: a.patient_age,
  doctor: a.doctor_name || '',
  service: a.service_name || '',
  provider: a.provider_name || '',
  providerName: a.provider_name || '',
  providerType: a.provider_type,
  bookingMethod: a.booking_method,
  externalBookingUrl: a.external_booking_url,
  preferredDate: a.preferred_date,
  preferredTime: a.preferred_time,
  paymentStatus: a.payment_status,
  amount: a.consultation_fee || a.service_price || null,
});

const bookingSelect = `
  SELECT a.*, d.name as doctor_name, d.consultation_fee, s.name as service_name, s.price as service_price, p.name as provider_name
  FROM appointments a
  LEFT JOIN doctors d ON a.doctor_id = d.id
  LEFT JOIN services s ON a.service_id = s.id
  LEFT JOIN providers p ON a.provider_id = p.id
`;

// POST /api/appointments (public booking) — request-based, type aware
router.post('/', requireFeature('appointment_booking'), async (req, res) => {
  try {
    const {
      booking_type = 'appointment',
      category,
      patient_name,
      patient_email,
      patient_phone,
      patient_age,
      doctor_id,
      service_id,
      provider_id,
      provider_name,
      date,
      time,
      preferred_date,
      preferred_time,
      booking_method,
      external_booking_url,
      contact_method,
      notes,
    } = req.body;

    const type = BOOKING_TYPES[booking_type] || BOOKING_TYPES.appointment;

    if (!patient_name) {
      return res.status(400).json({ error: 'Your name is required' });
    }

    let resolvedProviderId = provider_id || null;
    let providerRow = null;
    if (!resolvedProviderId && provider_name) {
      const p = await db.prepare(
        'SELECT * FROM providers WHERE LOWER(name) = LOWER(?) OR LOWER(name) LIKE LOWER(?)'
      ).get(provider_name, `%${provider_name}%`);
      if (p) {
        resolvedProviderId = p.id;
        providerRow = p;
      }
    }
    if (resolvedProviderId && !providerRow) {
      providerRow = await db.prepare('SELECT * FROM providers WHERE id = ?').get(resolvedProviderId);
    }
    const resolvedProviderType = providerRow ? providerRow.provider_type : null;

    if (type.requiresProvider && !resolvedProviderId) {
      return res.status(400).json({ error: 'A provider is required for this booking type' });
    }

    const resolvedExternalUrl = external_booking_url || (providerRow ? providerRow.external_booking_url : null);
    if (booking_type === 'external' && !resolvedExternalUrl) {
      return res.status(400).json({ error: 'No external booking link is available for this provider' });
    }

    if (doctor_id && date && time && booking_type === 'appointment') {
      const existing = await db.prepare(
        `SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND time = ? AND status IN ('pending','confirmed','requested')`
      ).get(doctor_id, date, time);
      if (existing) {
        return res.status(409).json({ error: 'This time slot is already booked' });
      }
    }

    const bookingReference = generateBookingReference();
    const finalMethod = booking_method || (providerRow && providerRow.booking_method) || type.defaultMethod;
    const finalDate = date || preferred_date || 'TBD';
    const finalTime = time || preferred_time || 'TBD';

    const result = await db.prepare(
      `INSERT INTO appointments (
        booking_reference, booking_type, category, patient_name, patient_email, patient_phone, patient_age,
        doctor_id, service_id, provider_id, provider_type, date, time, preferred_date, preferred_time,
        booking_method, external_booking_url, contact_method, notes, status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested', 'not_required')`
    ).run(
      bookingReference, booking_type, category || null, patient_name, patient_email || null, patient_phone || null, patient_age || null,
      doctor_id || null, service_id || null, resolvedProviderId, resolvedProviderType || 'BHH', finalDate, finalTime,
      preferred_date || null, preferred_time || null, finalMethod, resolvedExternalUrl || null, contact_method || null, notes || null
    );

    const booking = await db.prepare(`${bookingSelect} WHERE a.id = ?`).get(result.lastInsertRowid);

    if (patient_email) {
      sendMail({
        to: patient_email,
        subject: `Your ${type.label} Booking Received (${bookingReference}) - Bodija Health Hub`,
        text: `Dear ${patient_name},\n\nThank you for your ${type.label.toLowerCase()} request.\n\nReference: ${bookingReference}\nType: ${type.label}\nDate: ${finalDate}${finalTime !== 'TBD' ? `\nTime: ${finalTime}` : ''}\nProvider: ${booking.provider_name || 'Bodija Health Hub'}\nService: ${booking.service_name || ''}\n\nOur team will confirm your booking shortly.\n\nWarm regards,\nBodija Health Hub`,
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      sendMail({
        to: adminEmail,
        subject: `New ${type.label} booking from ${patient_name} (${bookingReference})`,
        text: `A new booking was submitted on the website.\n\nReference: ${bookingReference}\nType: ${type.label}\nName: ${patient_name}\nEmail: ${patient_email || 'N/A'}\nPhone: ${patient_phone || 'N/A'}\nProvider: ${booking.provider_name || 'Bodija Health Hub'}\nService: ${booking.service_name || ''}\nPreferred date: ${preferred_date || finalDate}\nPreferred time: ${preferred_time || finalTime}\nBooking method: ${finalMethod}\nNotes: ${notes || 'N/A'}\n\nReview it in the admin panel.`,
      });
    }

    res.status(201).json(toClient(booking));
  } catch (err) {
    console.error('Booking error:', err.message);
    res.status(500).json({ error: 'Failed to submit booking' });
  }
});

// GET /api/appointments/booking-options (public) — form options for the booking flow
router.get('/booking-options', requireFeature('appointment_booking'), async (req, res) => {
  try {
    const services = await db.prepare('SELECT id, name, description, category, price FROM services WHERE is_active = 1 ORDER BY name').all();
    const providers = await db.prepare(
      'SELECT id, name, provider_type, description, location, contact_email, contact_phone, website, booking_method, booking_url, external_booking_url FROM providers WHERE is_active = 1 ORDER BY name'
    ).all();
    const bookingTypes = Object.keys(BOOKING_TYPES).map((k) => ({
      value: k,
      label: BOOKING_TYPES[k].label,
      bookingMethod: BOOKING_TYPES[k].defaultMethod,
    }));
    res.json({ bookingTypes, services, providers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch booking options' });
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
      `SELECT time FROM appointments WHERE doctor_id = ? AND date = ? AND status NOT IN ('cancelled','declined')`
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
    const { status, booking_type, date, doctor_id, provider_id, search } = req.query;
    let query = `${bookingSelect} WHERE 1=1`;
    const params = [];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (booking_type) {
      query += ' AND a.booking_type = ?';
      params.push(booking_type);
    }
    if (date) {
      query += ' AND (a.date = ? OR a.preferred_date = ?)';
      params.push(date, date);
    }
    if (doctor_id) {
      query += ' AND a.doctor_id = ?';
      params.push(doctor_id);
    }
    if (provider_id) {
      query += ' AND a.provider_id = ?';
      params.push(provider_id);
    }
    if (search) {
      query += ' AND (a.patient_name LIKE ? OR a.patient_email LIKE ? OR a.patient_phone LIKE ? OR a.booking_reference LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY a.created_at DESC';
    const appointments = await db.prepare(query).all(...params);
    res.json({ appointments: appointments.map(toClient) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// PATCH /api/appointments/:id/status (admin)
router.patch('/:id/status', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), async (req, res) => {
  try {
    const appointment = await db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    await db.prepare('UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);

    const updated = await db.prepare(`${bookingSelect} WHERE a.id = ?`).get(req.params.id);

    if (updated.patient_email) {
      const statusText = {
        requested: 'Your booking has been received and is awaiting confirmation.',
        confirmed: 'Your booking has been confirmed.',
        completed: 'Your booking has been marked as completed. Thank you for using Bodija Health Hub.',
        cancelled: 'Your booking has been cancelled. Please contact us if you would like to reschedule.',
        declined: 'Unfortunately, we are unable to fulfil this booking request. Please contact us for alternatives.',
        expired: 'This booking request has expired because we could not confirm it in time.',
      }[status];
      if (statusText) {
        sendMail({
          to: updated.patient_email,
          subject: `Booking Update - Bodija Health Hub (${status})`,
          text: `Dear ${updated.patient_name},\n\n${statusText}\n\nReference: ${updated.booking_reference || ''}\nType: ${updated.booking_type || 'Appointment'}\nDate: ${updated.preferred_date || updated.date || 'TBD'}\nTime: ${updated.preferred_time || updated.time || 'TBD'}\nProvider: ${updated.provider_name || 'Bodija Health Hub'}\n\nWarm regards,\nBodija Health Hub`,
        });
      }
    }

    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// PATCH /api/appointments/:id/notes (admin)
router.patch('/:id/notes', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), async (req, res) => {
  try {
    const appointment = await db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const { notes } = req.body;
    await db.prepare('UPDATE appointments SET notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(notes ?? null, req.params.id);

    const updated = await db.prepare(`${bookingSelect} WHERE a.id = ?`).get(req.params.id);
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking notes' });
  }
});

// GET /api/appointments/:id
router.get('/:id', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), async (req, res) => {
  try {
    const appointment = await db.prepare(`${bookingSelect} WHERE a.id = ?`).get(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(toClient(appointment));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// PUT /api/appointments/:id (admin)
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), async (req, res) => {
  try {
    const appointment = await db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const { status, notes, payment_status, doctor_id, service_id, date, time, preferred_date, preferred_time, booking_method, category } = req.body;

    await db.prepare(
      `UPDATE appointments SET
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        payment_status = COALESCE(?, payment_status),
        doctor_id = COALESCE(?, doctor_id),
        service_id = COALESCE(?, service_id),
        date = COALESCE(?, date),
        time = COALESCE(?, time),
        preferred_date = COALESCE(?, preferred_date),
        preferred_time = COALESCE(?, preferred_time),
        booking_method = COALESCE(?, booking_method),
        category = COALESCE(?, category),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(status || null, notes || null, payment_status || null,
      doctor_id ?? null, service_id ?? null, date || null, time || null,
      preferred_date || null, preferred_time || null, booking_method || null, category || null, req.params.id);

    const updated = await db.prepare(`${bookingSelect} WHERE a.id = ?`).get(req.params.id);

    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// DELETE /api/appointments/:id (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const appointment = await db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    await db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

module.exports = router;
