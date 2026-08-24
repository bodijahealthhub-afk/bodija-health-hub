const db = require('../models/database');

function parseWildcards(permissions) {
  const result = new Set();
  for (const p of permissions) {
    result.add(p);
    if (p === '*') return new Set(['*']);
    const parts = p.split('.');
    if (parts[1] === '*') result.add(parts[0] + '.*');
  }
  return result;
}

async function resolvePermissions(role) {
  if (role === 'super_admin') return new Set(['*']);

  const rows = await db.prepare(
    `SELECT p.key FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.id
     WHERE rp.role = ?`
  ).all(role);

  const raw = rows.map(r => r.key);
  return parseWildcards(raw);
}

async function getPermissionsForRole(role) {
  if (role === 'super_admin') return ['*'];

  const rows = await db.prepare(
    `SELECT p.key FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.id
     WHERE rp.role = ?`
  ).all(role);

  return rows.map(r => r.key);
}

async function checkUserStatus(userId) {
  try {
    const user = await db.prepare('SELECT status FROM users WHERE id = ?').get(userId);
    return user && user.status === 'disabled';
  } catch {
    return false;
  }
}

async function resolveUserAndPermissions(userId) {
  const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(userId);
  if (!user) return { error: 'User not found', status: 401 };

  const disabled = await checkUserStatus(userId);
  if (disabled) return { error: 'Account is disabled', status: 403 };

  return { user };
}

function requirePermission(permissionKey) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = await resolveUserAndPermissions(req.user.id);
      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }

      if (!req._permissions) {
        req._permissions = await resolvePermissions(result.user.role);
      }

      if (req._permissions.has('*')) return next();
      if (req._permissions.has(permissionKey)) return next();

      const module = permissionKey.split('.')[0];
      if (req._permissions.has(module + '.*')) return next();

      return res.status(403).json({ error: 'Insufficient permissions' });
    } catch (err) {
      console.error('Authorization error:', err);
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

function requireAnyPermission(...permissionKeys) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = await resolveUserAndPermissions(req.user.id);
      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }

      if (!req._permissions) {
        req._permissions = await resolvePermissions(result.user.role);
      }

      if (req._permissions.has('*')) return next();

      for (const pk of permissionKeys) {
        if (req._permissions.has(pk)) return next();
        const module = pk.split('.')[0];
        if (req._permissions.has(module + '.*')) return next();
      }

      return res.status(403).json({ error: 'Insufficient permissions' });
    } catch (err) {
      console.error('Authorization error:', err);
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

module.exports = { requirePermission, requireAnyPermission, resolvePermissions, getPermissionsForRole };
