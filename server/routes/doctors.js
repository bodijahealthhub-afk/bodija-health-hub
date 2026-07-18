const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/doctors (public)
router.get('/', (req, res) => {
  try {
    const { specialization, department, available_day } = req.query;
    let query = 'SELECT * FROM doctors WHERE is_active = 1';
    const params = [];

    if (specialization) {
      query += ' AND specialization LIKE ?';
      params.push(`%${specialization}%`);
    }
    if (department) {
      query += ' AND department LIKE ?';
      params.push(`%${department}%`);
    }
    if (available_day) {
      query += ' AND available_days LIKE ?';
      params.push(`%${available_day}%`);
    }

    query += ' ORDER BY name ASC';
    const doctors = db.prepare(query).all(...params);
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// GET /api/doctors/:id (public)
router.get('/:id', (req, res) => {
  try {
    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// POST /api/doctors (admin)
router.post('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { name, specialization, bio, experience_years, photo, department, available_days, consultation_fee, user_id } = req.body;
    if (!name || !specialization) {
      return res.status(400).json({ error: 'Name and specialization are required' });
    }

    const result = db.prepare(
      `INSERT INTO doctors (user_id, name, specialization, bio, experience_years, photo, department, available_days, consultation_fee)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      user_id || null, name, specialization, bio || null, experience_years || 0,
      photo || null, department || null, available_days || 'Mon,Tue,Wed,Thu,Fri', consultation_fee || 0
    );

    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

// PUT /api/doctors/:id (admin)
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const { name, specialization, bio, experience_years, photo, department, available_days, consultation_fee, is_active } = req.body;

    db.prepare(
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
      name || null, specialization || null, bio || null, experience_years ?? null,
      photo || null, department || null, available_days || null, consultation_fee ?? null,
      is_active ?? null, req.params.id
    );

    const updated = db.prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

// DELETE /api/doctors/:id (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    db.prepare('DELETE FROM doctors WHERE id = ?').run(req.params.id);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

module.exports = router;
