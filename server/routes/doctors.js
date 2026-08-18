const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getFlag } = require('../utils/features');

const router = express.Router();

const toClient = (d) => ({
  ...d,
  experience: d.experience_years,
  consultationFee: d.consultation_fee,
  availableDays: d.available_days ? d.available_days.split(',').map((x) => x.trim()) : [],
  status: d.is_active ? 'active' : 'inactive',
});

// Public requests are blocked unless the "doctors" feature is enabled.
// The doctors directory is a future module (currently archived), so the public
// endpoint returns 404 while admin management keeps working.
const doctorsPubliclyDisabled = async (req) => {
  if (req.baseUrl.includes('/admin')) return false;
  const flag = await getFlag('doctors');
  return !flag || !flag.enabled;
};

// GET /api/doctors (public — active only) or /api/admin/doctors (admin — all)
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.baseUrl.includes('/admin');
    if (!isAdmin && (await doctorsPubliclyDisabled(req))) {
      return res.status(404).json({ error: 'Not Found' });
    }
    if (isAdmin && req.user && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const { specialization, department, available_day } = req.query;
    let query = `SELECT d.*, u.email, u.avatar
                 FROM doctors d
                 LEFT JOIN users u ON d.user_id = u.id
                 WHERE 1=1`;
    const params = [];

    if (!isAdmin) {
      query += ' AND d.is_active = 1';
    }
    if (specialization) {
      query += ' AND d.specialization LIKE ?';
      params.push(`%${specialization}%`);
    }
    if (department) {
      query += ' AND d.department LIKE ?';
      params.push(`%${department}%`);
    }
    if (available_day) {
      query += ' AND d.available_days LIKE ?';
      params.push(`%${available_day}%`);
    }

    query += ' ORDER BY d.name ASC';
    const doctors = await db.prepare(query).all(...params);
    res.json(isAdmin ? { doctors: doctors.map(toClient) } : doctors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// GET /api/doctors/:id (public)
router.get('/:id', async (req, res) => {
  try {
    if (await doctorsPubliclyDisabled(req)) {
      return res.status(404).json({ error: 'Not Found' });
    }
    const isAdmin = req.baseUrl.includes('/admin');
    if (isAdmin && req.user && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const doctor = await db.prepare(
      `SELECT d.*, u.email, u.avatar
       FROM doctors d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`
    ).get(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(toClient(doctor));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// POST /api/doctors (admin)
router.post('/', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { name, email, password, specialization, bio, experience, experience_years, photo, department, availableDays, available_days, consultationFee, consultation_fee } = req.body;
    if (!name || !specialization) {
      return res.status(400).json({ error: 'Name and specialization are required' });
    }

    let userId = req.body.user_id || null;
    if (email && password) {
      const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) {
        userId = existing.id;
      } else {
        const hash = bcrypt.hashSync(password, 10);
        const userResult = await db.prepare('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)').run(
          name, email, hash, 'doctor', req.body.phone || null
        );
        userId = userResult.lastInsertRowid;
      }
    }

    const days = Array.isArray(availableDays) ? availableDays.join(',') : (available_days || 'Mon,Tue,Wed,Thu,Fri');
    const result = await db.prepare(
      `INSERT INTO doctors (user_id, name, specialization, bio, experience_years, photo, department, available_days, consultation_fee)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      userId, name, specialization, bio || null, experience ?? experience_years ?? 0,
      photo || null, department || null, days, consultationFee ?? consultation_fee ?? 0
    );

    const doctor = await db.prepare(
      `SELECT d.*, u.email FROM doctors d LEFT JOIN users u ON d.user_id = u.id WHERE d.id = ?`
    ).get(result.lastInsertRowid);
    res.status(201).json(toClient(doctor));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

// PATCH /api/doctors/:id/status (admin)
router.patch('/:id/status', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const doctor = await db.prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    const status = req.body.status;
    const isActive = status === 'active' ? 1 : 0;
    await db.prepare('UPDATE doctors SET is_active = ? WHERE id = ?').run(isActive, req.params.id);
    const updated = await db.prepare(
      `SELECT d.*, u.email FROM doctors d LEFT JOIN users u ON d.user_id = u.id WHERE d.id = ?`
    ).get(req.params.id);
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update doctor status' });
  }
});

// PUT /api/doctors/:id (admin)
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const doctor = await db.prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const { name, specialization, bio, experience, experience_years, photo, department, availableDays, available_days, consultationFee, consultation_fee, is_active, status } = req.body;

    const days = Array.isArray(availableDays) ? availableDays.join(',') : (available_days || null);

    await db.prepare(
      `UPDATE doctors SET
        name = COALESCE(?, name),
        specialization = COALESCE(?, specialization),
        bio = COALESCE(?, bio),
        experience_years = COALESCE(?, experience_years),
        photo = COALESCE(?, photo),
        department = COALESCE(?, department),
        available_days = COALESCE(?, available_days),
        consultation_fee = COALESCE(?, consultation_fee),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`
    ).run(
      name || null, specialization || null, bio || null,
      experience ?? experience_years ?? null,
      photo || null, department || null, days,
      consultationFee ?? consultation_fee ?? null,
      (is_active !== undefined ? is_active : (status !== undefined ? (status === 'active' ? 1 : 0) : null)),
      req.params.id
    );

    const updated = await db.prepare(
      `SELECT d.*, u.email FROM doctors d LEFT JOIN users u ON d.user_id = u.id WHERE d.id = ?`
    ).get(req.params.id);
    res.json(toClient(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

// DELETE /api/doctors/:id (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const doctor = await db.prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    await db.prepare('DELETE FROM doctors WHERE id = ?').run(req.params.id);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

module.exports = router;
