const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');

const router = express.Router();

// GET /api/admin/contacts (admin)
router.get('/', authenticateToken, requirePermission('contacts.view'), async (req, res) => {
  try {
    const { status, search, source } = req.query;
    let query = 'SELECT * FROM contacts WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (source) {
      query += ' AND source = ?';
      params.push(source);
    }
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR organisation LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    query += ' ORDER BY created_at DESC';
    const contacts = await db.prepare(query).all(...params);
    res.json({ contacts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// GET /api/admin/contacts/:id (admin)
router.get('/:id', authenticateToken, requirePermission('contacts.view'), async (req, res) => {
  try {
    const contact = await db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Get related notes
    const notes = await db.prepare(
      'SELECT cn.*, u.name as author_name FROM contact_notes cn LEFT JOIN users u ON cn.author_id = u.id WHERE cn.contact_id = ? ORDER BY cn.created_at DESC'
    ).all(req.params.id);

    // Get related bookings
    const bookings = await db.prepare(
      'SELECT * FROM appointments WHERE patient_email = ? ORDER BY created_at DESC'
    ).all(contact.email);

    // Get related messages
    const messages = await db.prepare(
      'SELECT * FROM messages WHERE email = ? ORDER BY created_at DESC'
    ).all(contact.email);

    res.json({ ...contact, notes, bookings, messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// POST /api/admin/contacts (admin)
router.post('/', authenticateToken, requirePermission('contacts.create'), async (req, res) => {
  try {
    const { name, email, phone, organisation, interests, source, notes } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Contact name is required' });
    }
    const result = await db.prepare(
      'INSERT INTO contacts (name, email, phone, organisation, interests, source, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(name, email || null, phone || null, organisation || null, interests || null, source || 'admin', notes || null);
    const contact = await db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// PUT /api/admin/contacts/:id (admin)
router.put('/:id', authenticateToken, requirePermission('contacts.update'), async (req, res) => {
  try {
    const contact = await db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    const { name, email, phone, organisation, interests, source, status, notes } = req.body;
    await db.prepare(
      `UPDATE contacts SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        organisation = COALESCE(?, organisation),
        interests = COALESCE(?, interests),
        source = COALESCE(?, source),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(name || null, email || null, phone || null, organisation || null, interests || null, source || null, status || null, notes || null, req.params.id);
    const updated = await db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// POST /api/admin/contacts/:id/notes (admin)
router.post('/:id/notes', authenticateToken, requirePermission('contacts.update'), async (req, res) => {
  try {
    const contact = await db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    const { note } = req.body;
    if (!note) {
      return res.status(400).json({ error: 'Note text is required' });
    }
    const result = await db.prepare(
      'INSERT INTO contact_notes (contact_id, author_id, note) VALUES (?, ?, ?)'
    ).run(req.params.id, req.user.id, note);
    const created = await db.prepare(
      'SELECT cn.*, u.name as author_name FROM contact_notes cn LEFT JOIN users u ON cn.author_id = u.id WHERE cn.id = ?'
    ).get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// DELETE /api/admin/contacts/:id (admin)
router.delete('/:id', authenticateToken, requirePermission('contacts.update'), async (req, res) => {
  try {
    await db.prepare('DELETE FROM contact_notes WHERE contact_id = ?').run(req.params.id);
    await db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Helper: auto-create or find contact from booking/message data
async function upsertContact({ name, email, phone, organisation, source }) {
  if (!email && !phone) return null;
  let contact = email
    ? await db.prepare('SELECT id FROM contacts WHERE email = ?').get(email)
    : null;
  if (!contact && phone) {
    contact = await db.prepare('SELECT id FROM contacts WHERE phone = ?').get(phone);
  }
  if (contact) return contact.id;
  const result = await db.prepare(
    'INSERT INTO contacts (name, email, phone, organisation, source) VALUES (?, ?, ?, ?, ?)'
  ).run(name, email || null, phone || null, organisation || null, source || 'website');
  return result.lastInsertRowid;
}

module.exports = router;
module.exports.upsertContact = upsertContact;
