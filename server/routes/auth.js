const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bhh_secret_key_2026';

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)').run(
      name, email, hash, 'receptionist', phone || null
    );

    const user = db.prepare('SELECT id, name, email, role, avatar, phone, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, avatar, phone, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, phone, avatar, current_password, new_password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (new_password) {
      if (!current_password || !bcrypt.compareSync(current_password, user.password_hash)) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      const hash = bcrypt.hashSync(new_password, 10);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
    }

    db.prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar) WHERE id = ?').run(
      name || null, phone || null, avatar || null, req.user.id
    );

    const updated = db.prepare('SELECT id, name, email, role, avatar, phone, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// GET /api/auth/users — list all users (admin only)
router.get('/users', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/auth/create-admin — create a new admin user
router.post('/create-admin', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)').run(
      name, email, hash, role || 'admin', phone || null
    );
    const user = db.prepare('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/auth/reset-password — reset a user's password (admin only)
router.put('/reset-password', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { user_id, new_password } = req.body;
    if (!user_id || !new_password) {
      return res.status(400).json({ error: 'User ID and new password are required' });
    }
    const hash = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user_id);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// DELETE /api/auth/users/:id — delete a user (admin only)
router.delete('/users/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot delete super admin' });
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
