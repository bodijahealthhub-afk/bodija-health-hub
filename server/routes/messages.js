const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const { requireFeature } = require('../middleware/features');
const { sendMail } = require('../utils/email');
const { createNotification } = require('./adminNotifications');
const { upsertContact } = require('./contacts');

const router = express.Router();

// POST /api/messages (public contact form) — gated behind the contact_form feature
router.post('/', requireFeature('contact_form'), async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const result = await db.prepare(
      'INSERT INTO messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, phone || null, subject || null, message);

    const msg = await db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      sendMail({
        to: adminEmail,
        subject: `New contact form message from ${name}`,
        text: `You received a new message via the Bodija Health Hub contact form.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}`,
      });
    }

    // Create admin notification
    await createNotification({
      type: 'message_received',
      title: 'New message received',
      message: `${name} sent a message: "${(subject || message || '').slice(0, 80)}"`,
      link: '/admin/messages',
      entityType: 'message',
      entityId: result.lastInsertRowid,
    });

    // Auto-create CRM contact
    await upsertContact({
      name,
      email,
      phone,
      source: 'contact_form',
    });

    res.status(201).json({ success: true, id: msg.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/messages (admin)
router.get('/', authenticateToken, requirePermission('messages.view'), async (req, res) => {
  try {
    const { is_read, search } = req.query;
    let query = 'SELECT * FROM messages WHERE 1=1';
    const params = [];

    if (is_read !== undefined) {
      query += ' AND is_read = ?';
      params.push(parseInt(is_read));
    }
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR subject LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const messages = await db.prepare(query).all(...params);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET /api/messages/:id
router.get('/:id', authenticateToken, requirePermission('messages.view'), async (req, res) => {
  try {
    const message = await db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

// PUT /api/messages/:id/read
router.put('/:id/read', authenticateToken, requirePermission('messages.update'), async (req, res) => {
  try {
    const message = await db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// DELETE /api/messages/:id (admin)
router.delete('/:id', authenticateToken, requirePermission('messages.delete'), async (req, res) => {
  try {
    const message = await db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
