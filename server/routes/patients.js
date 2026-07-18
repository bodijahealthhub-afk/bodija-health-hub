const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/patients
router.get('/', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), (req, res) => {
  try {
    const { search, gender, blood_group } = req.query;
    let query = 'SELECT * FROM patients WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (gender) {
      query += ' AND gender = ?';
      params.push(gender);
    }
    if (blood_group) {
      query += ' AND blood_group = ?';
      params.push(blood_group);
    }

    query += ' ORDER BY created_at DESC';
    const patients = db.prepare(query).all(...params);
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET /api/patients/:id
router.get('/:id', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), (req, res) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// POST /api/patients
router.post('/', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), (req, res) => {
  try {
    const { name, email, phone, age, gender, address, blood_group, medical_history } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Patient name is required' });
    }

    const result = db.prepare(
      `INSERT INTO patients (name, email, phone, age, gender, address, blood_group, medical_history)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(name, email || null, phone || null, age || null, gender || null, address || null, blood_group || null, medical_history || null);

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// PUT /api/patients/:id
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), (req, res) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const { name, email, phone, age, gender, address, blood_group, medical_history } = req.body;

    db.prepare(
      `UPDATE patients SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        age = COALESCE(?, age),
        gender = COALESCE(?, gender),
        address = COALESCE(?, address),
        blood_group = COALESCE(?, blood_group),
        medical_history = COALESCE(?, medical_history)
       WHERE id = ?`
    ).run(name || null, email || null, phone || null, age ?? null, gender || null,
      address || null, blood_group || null, medical_history || null, req.params.id);

    const updated = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// DELETE /api/patients/:id
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id);
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

module.exports = router;
