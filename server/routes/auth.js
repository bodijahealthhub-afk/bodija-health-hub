const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const { logAudit } = require('../utils/audit');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const VALID_ROLES = ['admin', 'receptionist', 'content_manager', 'accountant'];
const ALL_ROLES = ['admin', 'super_admin', 'receptionist', 'content_manager', 'accountant', 'doctor'];

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      await logAudit({ action: 'LOGIN_FAILURE', entityType: 'auth', actor: email, ip: req.ip });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status === 'disabled') {
      await logAudit({ action: 'LOGIN_FAILURE', entityType: 'auth', entityId: String(user.id), actor: user.email, after_state: 'Account disabled', ip: req.ip });
      return res.status(403).json({ error: 'Account is disabled' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      await logAudit({ action: 'LOGIN_FAILURE', entityType: 'auth', entityId: String(user.id), actor: user.email, ip: req.ip });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    await logAudit({ action: 'LOGIN_SUCCESS', entityType: 'auth', entityId: String(user.id), actor: user.email, ip: req.ip });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone, status: user.status || 'active' }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    return res.status(403).json({ error: 'Public registration is disabled. Contact an administrator to create an account.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET /api/auth/me — includes permissions
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.prepare('SELECT id, name, email, role, avatar, phone, status, last_login, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.status === 'disabled') {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    const { getPermissionsForRole } = require('../middleware/authorize');
    const permissions = await getPermissionsForRole(user.role);

    res.json({ ...user, permissions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, avatar, current_password, new_password } = req.body;
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (new_password) {
      if (!current_password || !(await bcrypt.compare(current_password, user.password_hash))) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      const hash = await bcrypt.hash(new_password, 10);
      await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
      await logAudit({ action: 'PASSWORD_RESET', entityType: 'user', entityId: String(req.user.id), actor: user.email, ip: req.ip });
    }

    await db.prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar) WHERE id = ?').run(
      name || null, phone || null, avatar || null, req.user.id
    );

    const updated = await db.prepare('SELECT id, name, email, role, avatar, phone, status, last_login, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// GET /api/auth/users — list all users (requires users.view)
router.get('/users', authenticateToken, requirePermission('users.view'), async (req, res) => {
  try {
    const users = await db.prepare('SELECT id, name, email, role, phone, status, last_login, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/auth/users/:id — get single user
router.get('/users/:id', authenticateToken, requirePermission('users.view'), async (req, res) => {
  try {
    const user = await db.prepare('SELECT id, name, email, role, phone, status, last_login, created_at FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/auth/create-admin — create a new admin user (requires users.create)
router.post('/create-admin', authenticateToken, requirePermission('users.create'), async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const finalRole = role || 'admin';
    if (!VALID_ROLES.includes(finalRole)) {
      return res.status(400).json({ error: `Invalid role. Allowed: ${VALID_ROLES.join(', ')}` });
    }

    const caller = await db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
    if (finalRole === 'super_admin' && (!caller || caller.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Only super admins can create super admin accounts' });
    }

    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await db.prepare('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)').run(
      name, email, hash, finalRole, phone || null
    );
    const user = await db.prepare('SELECT id, name, email, role, phone, status, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    await logAudit({ action: 'USER_CREATED', entityType: 'user', entityId: String(user.id), actor: req.user.email, after_state: { name: user.name, email: user.email, role: user.role }, ip: req.ip });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/auth/reset-password — reset a user's password (requires users.update)
router.put('/reset-password', authenticateToken, requirePermission('users.update'), async (req, res) => {
  try {
    const { user_id, new_password } = req.body;
    if (!user_id || !new_password) {
      return res.status(400).json({ error: 'User ID and new password are required' });
    }
    const hash = await bcrypt.hash(new_password, 10);
    await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user_id);
    await logAudit({ action: 'PASSWORD_RESET', entityType: 'user', entityId: String(user_id), actor: req.user.email, ip: req.ip });
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// PUT /api/auth/users/:id/role — change user role (requires users.manage_roles)
router.put('/users/:id/role', authenticateToken, requirePermission('users.manage_roles'), async (req, res) => {
  try {
    const { role } = req.body;
    const targetId = parseInt(req.params.id);

    if (!role || !ALL_ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Allowed: ${ALL_ROLES.join(', ')}` });
    }

    if (targetId === req.user.id) {
      return res.status(403).json({ error: 'Cannot change your own role' });
    }

    const target = await db.prepare('SELECT id, role, email FROM users WHERE id = ?').get(targetId);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (target.role === 'super_admin' && role !== 'super_admin') {
      const caller = await db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
      if (!caller || caller.role !== 'super_admin') {
        return res.status(403).json({ error: 'Only super admins can modify super admin roles' });
      }
      const superAdminCount = await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'super_admin' AND status = 'active'").get();
      if (superAdminCount.count <= 1) {
        return res.status(403).json({ error: 'Cannot remove the last super admin privileges' });
      }
    }

    if (role === 'super_admin') {
      const caller = await db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
      if (!caller || caller.role !== 'super_admin') {
        return res.status(403).json({ error: 'Only super admins can assign super admin role' });
      }
    }

    const before = { role: target.role };
    await db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, targetId);
    await logAudit({ action: 'ROLE_CHANGED', entityType: 'user', entityId: String(targetId), actor: req.user.email, before_state: before, after_state: { role }, ip: req.ip });

    const updated = await db.prepare('SELECT id, name, email, role, phone, status, last_login, created_at FROM users WHERE id = ?').get(targetId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to change role' });
  }
});

// PUT /api/auth/users/:id/status — enable/disable user (requires users.disable)
router.put('/users/:id/status', authenticateToken, requirePermission('users.disable'), async (req, res) => {
  try {
    const { status } = req.body;
    const targetId = parseInt(req.params.id);

    if (!status || !['active', 'disabled'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "active" or "disabled"' });
    }

    if (targetId === req.user.id) {
      return res.status(403).json({ error: 'Cannot change your own account status' });
    }

    const target = await db.prepare('SELECT id, role, status, email FROM users WHERE id = ?').get(targetId);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (target.role === 'super_admin' && status === 'disabled') {
      const superAdminCount = await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'super_admin' AND status = 'active'").get();
      if (superAdminCount.count <= 1) {
        return res.status(403).json({ error: 'Cannot disable the last active super admin' });
      }
    }

    const before = { status: target.status };
    await db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, targetId);
    const auditAction = status === 'disabled' ? 'USER_DISABLED' : 'USER_ENABLED';
    await logAudit({ action: auditAction, entityType: 'user', entityId: String(targetId), actor: req.user.email, before_state: before, after_state: { status }, ip: req.ip });

    const updated = await db.prepare('SELECT id, name, email, role, phone, status, last_login, created_at FROM users WHERE id = ?').get(targetId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to change status' });
  }
});

// DELETE /api/auth/users/:id — delete a user (requires users.disable)
router.delete('/users/:id', authenticateToken, requirePermission('users.disable'), async (req, res) => {
  try {
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot delete super admin' });
    }
    await db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    await logAudit({ action: 'USER_DELETED', entityType: 'user', entityId: String(req.params.id), actor: req.user.email, before_state: { name: user.name, email: user.email, role: user.role }, ip: req.ip });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
