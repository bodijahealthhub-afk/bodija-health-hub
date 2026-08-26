const express = require('express');
const crypto = require('crypto');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const { requireFeature } = require('../middleware/features');
const { sendMail } = require('../utils/email');
const { createNotification } = require('./adminNotifications');
const { upsertContact } = require('./contacts');
const { logAudit } = require('../utils/audit');

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
  partnerId: a.partner_id,
  programmeId: a.programme_id,
  eventId: a.event_id,
  assignedTo: a.assigned_to,
  assignedToName: a.assigned_to_name || '',
  alternativeDate: a.alternative_date,
  alternativeTime: a.alternative_time,
  locationPreference: a.location_preference,
  internalNotes: a.internal_notes,
  source: a.source || 'website',
  reviewedAt: a.reviewed_at,
  confirmedAt: a.confirmed_at,
  cancelledAt: a.cancelled_at,
  completedAt: a.completed_at,
});

const bookingSelect = `
  SELECT a.*, d.name as doctor_name, d.consultation_fee, s.name as service_name, s.price as service_price, p.name as provider_name,
    u.name as assigned_to_name
  FROM appointments a
  LEFT JOIN doctors d ON a.doctor_id = d.id
  LEFT JOIN services s ON a.service_id = s.id
  LEFT JOIN providers p ON a.provider_id = p.id
  LEFT JOIN users u ON a.assigned_to = u.id
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
      partner_id,
      programme_id,
      event_id,
      date,
      time,
      preferred_date,
      preferred_time,
      booking_method,
      external_booking_url,
      contact_method,
      notes,
      location_preference,
      source,
    } = req.body;

    const type = BOOKING_TYPES[booking_type] || BOOKING_TYPES.appointment;

    if (!patient_name) {
      return res.status(400).json({ error: 'Your name is required' });
    }

    if (patient_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient_email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (patient_phone && !/^(\+234|0)[789][01]\d{8}$/.test(patient_phone.replace(/[\s-]/g, ''))) {
      return res.status(400).json({ error: 'Invalid Nigerian phone number' });
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
        booking_method, external_booking_url, contact_method, notes, status, payment_status,
        partner_id, programme_id, event_id, location_preference, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested', 'not_required', ?, ?, ?, ?, ?)`
    ).run(
      bookingReference, booking_type, category || null, patient_name, patient_email || null, patient_phone || null, patient_age || null,
      doctor_id || null, service_id || null, resolvedProviderId, resolvedProviderType || 'BHH', finalDate, finalTime,
      preferred_date || null, preferred_time || null, finalMethod, resolvedExternalUrl || null, contact_method || null, notes || null,
      partner_id || null, programme_id || null, event_id || null, location_preference || null, source || 'website'
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

    // Create admin notification
    await createNotification({
      type: 'booking_created',
      title: `New ${type.label} booking`,
      message: `${patient_name} submitted a ${type.label.toLowerCase()} request (${bookingReference})`,
      link: '/admin/appointments',
      entityType: 'appointment',
      entityId: result.lastInsertRowid,
    });

    // Auto-create CRM contact
    await upsertContact({
      name: patient_name,
      email: patient_email,
      phone: patient_phone,
      source: 'booking',
    });

    // Audit log
    await logAudit({
      action: 'BOOKING_CREATED',
      entityType: 'appointment',
      entityId: result.lastInsertRowid,
      actor: req.user ? req.user.email : 'public',
      after_state: { bookingReference, bookingType: booking_type, status: 'requested', patientName: patient_name },
      ip: req.ip,
    });

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
router.get('/available-slots', authenticateToken, requirePermission('bookings.view'), async (req, res) => {
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
router.get('/', authenticateToken, requirePermission('bookings.view'), async (req, res) => {
  try {
    const { status, booking_type, date, doctor_id, provider_id, search, assigned_to, source } = req.query;
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
    if (assigned_to) {
      query += ' AND a.assigned_to = ?';
      params.push(assigned_to);
    }
    if (source) {
      query += ' AND a.source = ?';
      params.push(source);
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
router.patch('/:id/status', authenticateToken, requirePermission('bookings.update'), async (req, res) => {
  try {
    const appointment = await db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const { status, alternative_date, alternative_time } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Set lifecycle timestamps based on status transitions
    const timestampColumns = [];
    const timestampValues = [];
    if (status === 'under_review' || status === 'reviewed') {
      timestampColumns.push('reviewed_at');
      timestampValues.push(new Date().toISOString());
    } else if (status === 'confirmed') {
      timestampColumns.push('confirmed_at');
      timestampValues.push(new Date().toISOString());
    } else if (status === 'cancelled' || status === 'declined') {
      timestampColumns.push('cancelled_at');
      timestampValues.push(new Date().toISOString());
    } else if (status === 'completed') {
      timestampColumns.push('completed_at');
      timestampValues.push(new Date().toISOString());
    }

    const setClauses = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const params = [status];
    for (let i = 0; i < timestampColumns.length; i++) {
      setClauses.push(`${timestampColumns[i]} = ?`);
      params.push(timestampValues[i]);
    }
    if (alternative_date !== undefined) {
      setClauses.push('alternative_date = ?');
      params.push(alternative_date || null);
    }
    if (alternative_time !== undefined) {
      setClauses.push('alternative_time = ?');
      params.push(alternative_time || null);
    }
    params.push(req.params.id);

    await db.prepare(`UPDATE appointments SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);

    const updated = await db.prepare(`${bookingSelect} WHERE a.id = ?`).get(req.params.id);

    // Audit log for status change
    await logAudit({
      action: 'BOOKING_STATUS_CHANGED',
      entityType: 'appointment',
      entityId: parseInt(req.params.id),
      actor: req.user ? req.user.email : 'unknown',
      before_state: { status: appointment.status },
      after_state: { status, previousStatus: appointment.status },
      ip: req.ip,
    });

    if (updated.patient_email) {
      const statusText = {
        requested: 'Your booking has been received and is awaiting confirmation.',
        under_review: 'Your booking is being reviewed by our team.',
        reviewed: 'Your booking has been reviewed and is being processed.',
        confirmed: 'Your booking has been confirmed.',
        rescheduled: 'Your booking has been rescheduled. Please check the updated date/time.',
        completed: 'Your booking has been marked as completed. Thank you for using Bodija Health Hub.',
        cancelled: 'Your booking has been cancelled. Please contact us if you would like to reschedule.',
        declined: 'Unfortunately, we are unable to fulfil this booking request. Please contact us for alternatives.',
        expired: 'This booking request has expired because we could not confirm it in time.',
        no_show: 'This booking has been marked as a no-show.',
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
router.patch('/:id/notes', authenticateToken, requirePermission('bookings.update'), async (req, res) => {
  try {
    const appointment = await db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const { notes, internal_notes } = req.body;
    await db.prepare(
      'UPDATE appointments SET notes = COALESCE(?, notes), internal_notes = COALESCE(?, internal_notes), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(notes ?? null, internal_notes ?? null, req.params.id);

    const updated = await db.prepare(`${bookingSelect} WHERE a.id = ?`).get(req.params.id);

    // Audit log for notes update
    await logAudit({
      action: 'BOOKING_UPDATED',
      entityType: 'appointment',
      entityId: parseInt(req.params.id),
      actor: req.user ? req.user.email : 'unknown',
      after_state: { field: 'notes', hasNotes: !!(notes || internal_notes) },
      ip: req.ip,
    });

    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking notes' });
  }
});

// PATCH /api/appointments/:id/assign (admin) — assign a booking to a team member
router.patch('/:id/assign', authenticateToken, requirePermission('bookings.assign'), async (req, res) => {
  try {
    const appointment = await db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const { assigned_to } = req.body;
    if (assigned_to !== undefined && assigned_to !== null) {
      const assignee = await db.prepare('SELECT id FROM users WHERE id = ?').get(assigned_to);
      if (!assignee) {
        return res.status(400).json({ error: 'Invalid assignee user ID' });
      }
    }

    await db.prepare(
      'UPDATE appointments SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(assigned_to || null, req.params.id);

    const updated = await db.prepare(`${bookingSelect} WHERE a.id = ?`).get(req.params.id);

    // Audit log for assignment
    await logAudit({
      action: 'BOOKING_ASSIGNED',
      entityType: 'appointment',
      entityId: parseInt(req.params.id),
      actor: req.user ? req.user.email : 'unknown',
      before_state: { assignedTo: appointment.assigned_to },
      after_state: { assignedTo: assigned_to || null, previousAssignee: appointment.assigned_to },
      ip: req.ip,
    });

    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign booking' });
  }
});

// GET /api/appointments/:id
router.get('/:id', authenticateToken, requirePermission('bookings.view'), async (req, res) => {
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
router.put('/:id', authenticateToken, requirePermission('bookings.update'), async (req, res) => {
  try {
    const appointment = await db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const { status, notes, payment_status, doctor_id, service_id, date, time, preferred_date, preferred_time, booking_method, category,
      partner_id, programme_id, event_id, assigned_to, alternative_date, alternative_time, location_preference, internal_notes, source } = req.body;

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
        partner_id = COALESCE(?, partner_id),
        programme_id = COALESCE(?, programme_id),
        event_id = COALESCE(?, event_id),
        assigned_to = COALESCE(?, assigned_to),
        alternative_date = COALESCE(?, alternative_date),
        alternative_time = COALESCE(?, alternative_time),
        location_preference = COALESCE(?, location_preference),
        internal_notes = COALESCE(?, internal_notes),
        source = COALESCE(?, source),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(status || null, notes || null, payment_status || null,
      doctor_id ?? null, service_id ?? null, date || null, time || null,
      preferred_date || null, preferred_time || null, booking_method || null, category || null,
      partner_id ?? null, programme_id ?? null, event_id ?? null, assigned_to ?? null,
      alternative_date || null, alternative_time || null, location_preference || null, internal_notes || null, source || null,
      req.params.id);

    const updated = await db.prepare(`${bookingSelect} WHERE a.id = ?`).get(req.params.id);

    // Audit log for full update
    await logAudit({
      action: 'BOOKING_UPDATED',
      entityType: 'appointment',
      entityId: parseInt(req.params.id),
      actor: req.user ? req.user.email : 'unknown',
      before_state: { status: appointment.status, assignedTo: appointment.assigned_to },
      after_state: { status: updated.status, assignedTo: updated.assigned_to },
      ip: req.ip,
    });

    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// DELETE /api/appointments/:id (admin)
router.delete('/:id', authenticateToken, requirePermission('bookings.cancel'), async (req, res) => {
  try {
    const appointment = await db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Audit log for deletion
    await logAudit({
      action: 'BOOKING_CANCELLED',
      entityType: 'appointment',
      entityId: parseInt(req.params.id),
      actor: req.user ? req.user.email : 'unknown',
      before_state: { status: appointment.status, bookingReference: appointment.booking_reference },
      ip: req.ip,
    });

    await db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

module.exports = router;
