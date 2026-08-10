const express = require('express');
const crypto = require('crypto');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireFeature } = require('../middleware/features');

const router = express.Router();

const PAYSTACK_BASE = 'https://api.paystack.co';
const secretKey = () => process.env.PAYSTACK_SECRET_KEY || '';

const isMock = () => process.env.PAYSTACK_MOCK === 'true' || !secretKey();

function makeReference() {
  return `BHH-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

// POST /api/payments/initialize — create a payment intent for an appointment and
// return the Paystack checkout URL. Gated behind the payment_system feature flag.
router.post('/initialize', requireFeature('payment_system'), async (req, res) => {
  try {
    const { appointment_id } = req.body;
    if (!appointment_id) {
      return res.status(400).json({ error: 'appointment_id is required' });
    }

    const appointment = await db.prepare(
      `SELECT a.*, d.consultation_fee, s.price as service_price
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`
    ).get(appointment_id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot pay for a cancelled appointment' });
    }
    if (appointment.payment_status === 'paid') {
      return res.status(409).json({ error: 'Appointment already paid' });
    }
    if (!appointment.patient_email) {
      return res.status(400).json({ error: 'A patient email is required to pay online' });
    }

    const amount = Number(appointment.consultation_fee || appointment.service_price || 0);
    if (!(amount > 0)) {
      return res.status(400).json({ error: 'This appointment does not require payment' });
    }

    const reference = makeReference();
    const result = await db.prepare(
      'INSERT INTO payments (reference, appointment_id, email, amount, currency, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(reference, appointment_id, appointment.patient_email, amount, 'NGN', 'pending');

    if (isMock()) {
      await db.prepare(
        'UPDATE payments SET status = ? WHERE id = ?'
      ).run('paid', result.lastInsertRowid);
      await db.prepare('UPDATE appointments SET payment_status = ? WHERE id = ?').run('paid', appointment_id);
      return res.status(201).json({
        reference,
        amount,
        status: 'paid',
        authorization_url: null,
        mock: true,
        message: 'Payment gateway not configured — payment recorded as paid (mock mode)',
      });
    }

    const payload = {
      email: appointment.patient_email,
      amount: Math.round(amount * 100),
      reference,
      currency: 'NGN',
      metadata: { appointment_id },
    };
    const callbackUrl = process.env.PAYSTACK_CALLBACK_URL;
    if (callbackUrl) payload.callback_url = callbackUrl;

    const paystackRes = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const paystack = await paystackRes.json();

    if (!paystack.status || !paystack.data) {
      return res.status(502).json({ error: paystack.message || 'Failed to initialize payment' });
    }

    await db.prepare('UPDATE payments SET paystack_reference = ? WHERE id = ?').run(
      paystack.data.reference || null, result.lastInsertRowid
    );

    res.status(201).json({
      reference,
      amount,
      status: 'pending',
      authorization_url: paystack.data.authorization_url,
    });
  } catch (err) {
    console.error('Error initializing payment:', err);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

async function verifyWithPaystack(reference) {
  if (isMock()) return null;
  const paystackRes = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
  });
  const paystack = await paystackRes.json();
  return paystack.data || null;
}

// Mark a payment (and its appointment) as paid.
async function markPaid(paymentId, appointmentId, paystackRef) {
  const now = new Date().toISOString();
  if (paystackRef) {
    await db.prepare('UPDATE payments SET paystack_reference = COALESCE(?, paystack_reference) WHERE id = ?').run(paystackRef, paymentId);
  }
  await db.prepare('UPDATE payments SET status = ?, paid_at = ? WHERE id = ?').run('paid', now, paymentId);
  if (appointmentId) {
    await db.prepare('UPDATE appointments SET payment_status = ? WHERE id = ?').run('paid', appointmentId);
  }
}

// GET /api/payments/:reference — verify a payment against Paystack (or the DB in mock mode).
router.get('/:reference', requireFeature('payment_system'), async (req, res) => {
  try {
    const payment = await db.prepare('SELECT * FROM payments WHERE reference = ?').get(req.params.reference);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const verified = await verifyWithPaystack(payment.reference || payment.paystack_reference);

    if (verified && verified.status === 'success') {
      await markPaid(payment.id, payment.appointment_id, payment.paystack_reference);
    } else if (verified && verified.status === 'abandoned') {
      await db.prepare("UPDATE payments SET status = 'cancelled' WHERE id = ?").run(payment.id);
    }

    const current = await db.prepare(
      `SELECT p.*, a.patient_name, a.date, a.time
       FROM payments p
       LEFT JOIN appointments a ON p.appointment_id = a.id
       WHERE p.id = ?`
    ).get(payment.id);

    res.json(current);
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// POST /api/payments/webhook — Paystack event webhook.
router.post('/webhook', (req, res) => {
  try {
    if (!secretKey() || isMock()) {
      return res.status(200).json({ success: true });
    }
    const signature = req.headers['x-paystack-signature'];
    const hash = crypto.createHmac('sha512', secretKey()).update(req.rawBody || '').digest('hex');
    if (!signature || hash !== signature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const data = event.data;
      const ref = data.reference;
      if (ref) {
        db.prepare('SELECT * FROM payments WHERE reference = ? OR paystack_reference = ?').get(ref, ref).then((payment) => {
          if (payment) {
            return markPaid(payment.id, payment.appointment_id, data.reference);
          }
          return null;
        }).catch((err) => console.error('Webhook processing error:', err));
      }
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// GET /api/payments (admin)
router.get('/', authenticateToken, requireRole('admin', 'super_admin', 'accountant'), async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `SELECT p.*, a.patient_name, a.date as appointment_date
                 FROM payments p
                 LEFT JOIN appointments a ON p.appointment_id = a.id
                 WHERE 1=1`;
    const params = [];
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (p.reference LIKE ? OR p.email LIKE ? OR a.patient_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY p.created_at DESC';
    const payments = await db.prepare(query).all(...params);
    res.json({ payments });
  } catch (err) {
    console.error('Error listing payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

module.exports = router;
