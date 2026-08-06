const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/careers (public job application form)
router.post('/', (req, res) => {
  try {
    const { name, email, phone, position, coverLetter } = req.body;
    if (!name || !email || !position) {
      return res.status(400).json({ error: 'Name, email, and position are required' });
    }

    const result = db.prepare(
      'INSERT INTO career_applications (name, email, phone, position, cover_letter, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, email, phone || null, position, coverLetter || null, 'new');

    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// GET /api/careers (admin)
router.get('/', authenticateToken, requireRole('admin', 'super_admin', 'receptionist'), (req, res) => {
  try {
    const applications = db.prepare('SELECT * FROM career_applications ORDER BY created_at DESC').all();
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// PUT /api/careers/:id/status (admin)
router.put('/:id/status', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const result = db.prepare('UPDATE career_applications SET status = ? WHERE id = ?').run(status, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// DELETE /api/careers/:id (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM career_applications WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;
