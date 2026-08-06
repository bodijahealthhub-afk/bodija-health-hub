const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/upcoming-registrations (public registration form)
router.post('/', (req, res) => {
  try {
    const { fullName, email, phone, areaOfInterest } = req.body;
    if (!fullName || !email || !areaOfInterest) {
      return res.status(400).json({ error: 'Full name, email, and area of interest are required' });
    }

    const result = db.prepare(
      'INSERT INTO upcoming_registrations (full_name, email, phone, area_of_interest, status) VALUES (?, ?, ?, ?, ?)'
    ).run(fullName, email, phone || null, areaOfInterest, 'new');

    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit registration' });
  }
});

// GET /api/upcoming-registrations (admin)
router.get('/', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), (req, res) => {
  try {
    const registrations = db.prepare('SELECT * FROM upcoming_registrations ORDER BY created_at DESC').all();
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// DELETE /api/upcoming-registrations/:id (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM upcoming_registrations WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    res.json({ message: 'Registration deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete registration' });
  }
});

module.exports = router;
