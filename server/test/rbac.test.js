'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bhh-rbac-test-'));

process.env.DB_PATH = path.join(tmpDir, 'database.sqlite');
process.env.UPLOADS_DIR = path.join(tmpDir, 'uploads');
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.ADMIN_EMAIL = 'admin@bodijahealthhub.com';
process.env.ADMIN_PASSWORD = 'test-admin-password';
process.env.NODE_ENV = 'test';

const db = require('../models/database');

let server;
let base;
let adminToken;
let contentManagerToken;
let receptionistToken;
let accountantToken;

async function loginAs(email, password) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

async function authHeader(token) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

before(async () => {
  await db.ready;

  const app = require('../index');
  server = app.listen(0);
  await new Promise(resolve => server.on('listening', resolve));
  base = `http://localhost:${server.address().port}`;

  const adminResult = await loginAs('admin@bodijahealthhub.com', 'test-admin-password');
  adminToken = adminResult.token;

  await fetch(`${base}/api/auth/create-admin`, {
    method: 'POST',
    headers: await authHeader(adminToken),
    body: JSON.stringify({ name: 'Content Manager', email: 'cm@test.com', password: 'test123', role: 'content_manager' }),
  });
  const cmResult = await loginAs('cm@test.com', 'test123');
  contentManagerToken = cmResult.token;

  await fetch(`${base}/api/auth/create-admin`, {
    method: 'POST',
    headers: await authHeader(adminToken),
    body: JSON.stringify({ name: 'Ops Manager', email: 'ops@test.com', password: 'test123', role: 'receptionist' }),
  });
  const opsResult = await loginAs('ops@test.com', 'test123');
  receptionistToken = opsResult.token;

  await fetch(`${base}/api/auth/create-admin`, {
    method: 'POST',
    headers: await authHeader(adminToken),
    body: JSON.stringify({ name: 'Finance Manager', email: 'fin@test.com', password: 'test123', role: 'accountant' }),
  });
  const finResult = await loginAs('fin@test.com', 'test123');
  accountantToken = finResult.token;
});

after(() => {
  if (server) server.close();
  try { fs.rmSync(tmpDir, { recursive: true }); } catch {}
});

test('RBAC: permissions table is seeded', async () => {
  const count = await db.prepare('SELECT COUNT(*) as count FROM permissions').get();
  assert.ok(count.count >= 50, `Expected >= 50 permissions, got ${count.count}`);
});

test('RBAC: role_permissions table is seeded', async () => {
  const count = await db.prepare('SELECT COUNT(*) as count FROM role_permissions').get();
  assert.ok(count.count >= 20, `Expected >= 20 role_permissions, got ${count.count}`);
});

test('RBAC: super_admin has all permissions via wildcard', async () => {
  const { requirePermission } = require('../middleware/authorize');
  const mockReq = { user: { id: 1 }, _permissions: null };
  let nextCalled = false;
  const mockRes = { status: () => mockRes, json: () => mockRes };
  const middleware = requirePermission('dashboard.view');
  await middleware(mockReq, mockRes, () => { nextCalled = true; });
  assert.ok(nextCalled, 'super_admin should pass all permission checks');
});

test('RBAC: content_manager can view blog but not payments', async () => {
  const cmUser = await db.prepare("SELECT id FROM users WHERE email = 'cm@test.com'").get();
  const { resolvePermissions } = require('../middleware/authorize');
  const perms = await resolvePermissions('content_manager');
  assert.ok(perms.has('blog.view') || perms.has('blog.*'), 'content_manager should have blog permissions');
  assert.ok(!perms.has('payments.view') && !perms.has('payments.*'), 'content_manager should not have payments permissions');
});

test('RBAC: receptionist can view bookings but not blog', async () => {
  const { resolvePermissions } = require('../middleware/authorize');
  const perms = await resolvePermissions('receptionist');
  assert.ok(perms.has('bookings.view') || perms.has('bookings.*'), 'receptionist should have bookings permissions');
  assert.ok(!perms.has('blog.view') && !perms.has('blog.*'), 'receptionist should not have blog permissions');
});

test('RBAC: accountant can view payments but not services', async () => {
  const { resolvePermissions } = require('../middleware/authorize');
  const perms = await resolvePermissions('accountant');
  assert.ok(perms.has('payments.view') || perms.has('payments.*'), 'accountant should have payments permissions');
  assert.ok(!perms.has('services.create') && !perms.has('services.*'), 'accountant should not have services create permissions');
});

test('RBAC: /api/auth/me returns permissions for admin', async () => {
  const res = await fetch(`${base}/api/auth/me`, {
    headers: await authHeader(adminToken),
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.permissions), 'Should return permissions array');
  assert.ok(data.permissions.length > 0, 'Admin should have permissions');
  assert.ok(data.permissions.includes('dashboard.view') || data.permissions.includes('*'), 'Admin should have dashboard.view');
});

test('RBAC: /api/auth/me returns permissions for content_manager', async () => {
  const res = await fetch(`${base}/api/auth/me`, {
    headers: await authHeader(contentManagerToken),
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.permissions), 'Should return permissions array');
  assert.ok(data.permissions.includes('blog.view') || data.permissions.includes('blog.*'), 'CM should have blog.view');
});

test('RBAC: login returns 403 for disabled user', async () => {
  const createRes = await fetch(`${base}/api/auth/create-admin`, {
    method: 'POST',
    headers: await authHeader(adminToken),
    body: JSON.stringify({ name: 'Disabled User', email: 'disabled@test.com', password: 'test123', role: 'admin' }),
  });
  const created = await createRes.json();

  const disableRes = await fetch(`${base}/api/auth/users/${created.id}/status`, {
    method: 'PUT',
    headers: await authHeader(adminToken),
    body: JSON.stringify({ status: 'disabled' }),
  });
  assert.ok(disableRes.ok, `Disable request should succeed, got ${disableRes.status}`);

  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'disabled@test.com', password: 'test123' }),
  });
  assert.ok(loginRes.status === 403 || loginRes.status === 401, `Disabled user login should be rejected, got ${loginRes.status}`);
});

test('RBAC: content_manager cannot access /api/auth/users', async () => {
  const res = await fetch(`${base}/api/auth/users`, {
    headers: await authHeader(contentManagerToken),
  });
  assert.strictEqual(res.status, 403);
});

test('RBAC: admin can access /api/auth/users', async () => {
  const res = await fetch(`${base}/api/auth/users`, {
    headers: await authHeader(adminToken),
  });
  assert.strictEqual(res.status, 200);
});

test('RBAC: accountant cannot create services', async () => {
  const res = await fetch(`${base}/api/services`, {
    method: 'POST',
    headers: await authHeader(accountantToken),
    body: JSON.stringify({ name: 'Test Service', description: 'test', category: 'general' }),
  });
  assert.strictEqual(res.status, 403);
});

test('RBAC: admin can create services', async () => {
  const res = await fetch(`${base}/api/services`, {
    method: 'POST',
    headers: await authHeader(adminToken),
    body: JSON.stringify({ name: 'Test Service RBAC', description: 'test service', category: 'general' }),
  });
  assert.ok(res.status === 200 || res.status === 201, `Admin should create service, got ${res.status}`);
});

test('RBAC: role change is audited', async () => {
  const createRes = await fetch(`${base}/api/auth/create-admin`, {
    method: 'POST',
    headers: await authHeader(adminToken),
    body: JSON.stringify({ name: 'Audit Test', email: 'audit@test.com', password: 'test123', role: 'admin' }),
  });
  const user = await createRes.json();

  await fetch(`${base}/api/auth/users/${user.id}/role`, {
    method: 'PUT',
    headers: await authHeader(adminToken),
    body: JSON.stringify({ role: 'receptionist' }),
  });

  const audit = await db.prepare("SELECT * FROM audit_logs WHERE entity_id = ? AND action = 'ROLE_CHANGED'").get(String(user.id));
  assert.ok(audit, 'Role change should be audited');
});

test('RBAC: cannot change own role', async () => {
  const res = await fetch(`${base}/api/auth/users/1/role`, {
    method: 'PUT',
    headers: await authHeader(adminToken),
    body: JSON.stringify({ role: 'receptionist' }),
  });
  assert.strictEqual(res.status, 403);
});

test('RBAC: cannot disable self', async () => {
  const res = await fetch(`${base}/api/auth/users/1/status`, {
    method: 'PUT',
    headers: await authHeader(adminToken),
    body: JSON.stringify({ status: 'disabled' }),
  });
  assert.strictEqual(res.status, 403);
});

test('RBAC: receptionist cannot access backup endpoint', async () => {
  const res = await fetch(`${base}/api/admin/backups`, {
    headers: await authHeader(receptionistToken),
  });
  assert.ok(res.status === 403, `Receptionist should not access backups, got ${res.status}`);
});

test('RBAC: accountant cannot access system health', async () => {
  const res = await fetch(`${base}/api/admin/system-health`, {
    headers: await authHeader(accountantToken),
  });
  assert.strictEqual(res.status, 403);
});

test('RBAC: wildcard permission matching works', async () => {
  const { resolvePermissions } = require('../middleware/authorize');
  const perms = await resolvePermissions('super_admin');
  assert.ok(perms.has('*'), 'super_admin should have wildcard');
});

test('RBAC: permission key format is valid', async () => {
  const perms = await db.prepare('SELECT key, module, action FROM permissions').all();
  for (const p of perms) {
    assert.ok(p.key.includes('.'), `Permission key ${p.key} should contain a dot`);
    assert.ok(p.module, `Permission ${p.key} should have a module`);
    assert.ok(p.action, `Permission ${p.key} should have an action`);
  }
});
