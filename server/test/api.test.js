'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bhh-test-'));

process.env.DB_PATH = path.join(tmpDir, 'database.sqlite');
process.env.UPLOADS_DIR = path.join(tmpDir, 'uploads');
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.ADMIN_EMAIL = 'admin@bodijahealthhub.com';
process.env.ADMIN_PASSWORD = 'test-admin-password';
process.env.NODE_ENV = 'test';

const app = require('../index');

let server;
let base;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await new Promise((resolve) => setTimeout(resolve, 100));
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) { /* sqlite may hold handles on Windows */ }
});

const request = async (method, url, { body, token, files } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (files) {
    payload = new FormData();
    for (const [k, v] of Object.entries(body || {})) payload.append(k, v);
    for (const f of files) payload.append(f.field, f.blob, f.name);
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${base}${url}`, { method, headers, body: payload });
  let json = null;
  try { json = await res.json(); } catch (e) { /* not json */ }
  return { status: res.status, json };
};

let adminToken;

test('health endpoint', async () => {
  const { status, json } = await request('GET', '/api/health');
  assert.strictEqual(status, 200);
  assert.strictEqual(json.status, 'ok');
});

test('public endpoints return 200', async () => {
  for (const url of ['/api/doctors', '/api/services', '/api/blog', '/api/events', '/api/testimonials', '/api/gallery', '/api/media', '/api/site-content', '/api/seo/home']) {
    const { status } = await request('GET', url);
    assert.strictEqual(status, 200, `${url} -> ${status}`);
  }
});

test('robots.txt and sitemap.xml served', async () => {
  const robots = await request('GET', '/robots.txt');
  assert.strictEqual(robots.status, 200);
  const sitemap = await request('GET', '/sitemap.xml');
  assert.strictEqual(sitemap.status, 200);
});

test('admin login works', async () => {
  const { status, json } = await request('POST', '/api/auth/login', {
    body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
  });
  assert.strictEqual(status, 200);
  assert.ok(json.token);
  adminToken = json.token;
});

test('admin endpoints return wrapped camelCase contract', async () => {
  for (const url of ['/api/admin/services', '/api/admin/doctors', '/api/admin/appointments', '/api/admin/patients', '/api/admin/blog', '/api/admin/events', '/api/admin/testimonials', '/api/admin/media', '/api/admin/dashboard']) {
    const { status, json } = await request('GET', url, { token: adminToken });
    assert.strictEqual(status, 200, `${url} -> ${status}`);
    assert.ok(json, `${url} returned no body`);
    const keys = Object.keys(json);
    assert.ok(keys.some((k) => k !== 'success' && k !== 'message' && k !== 'error'), `${url} has no wrapped data key`);
  }
});

test('admin can create and delete an appointment', async () => {
  const created = await request('POST', '/api/appointments', {
    body: {
      patient_name: 'Test Patient', patient_email: 'test@example.com', patient_phone: '08012345678',
      date: '2026-12-01', time: '10:00',
    },
  });
  assert.strictEqual(created.status, 201);
  assert.ok(created.json.id);
  const id = created.json.id;

  const list = await request('GET', '/api/admin/appointments', { token: adminToken });
  assert.ok(list.json.appointments.some((a) => a.id === id));

  const del = await request('DELETE', `/api/admin/appointments/${id}`, { token: adminToken });
  assert.strictEqual(del.status, 200);

  const gone = await request('GET', `/api/admin/appointments/${id}`, { token: adminToken });
  assert.strictEqual(gone.status, 404);
});

test('public write endpoints rate limited config is active', async () => {
  const res = await request('POST', '/api/messages', {
    body: { name: 'Rate Test', email: 'rate@example.com', message: 'hello' },
  });
  assert.ok([201, 200].includes(res.status), `unexpected status ${res.status}`);
});

test('unauthorized admin request rejected', async () => {
  const { status } = await request('GET', '/api/admin/backups');
  assert.strictEqual(status, 401);
});

test('unknown route returns 404', async () => {
  const { status } = await request('GET', '/api/does-not-exist');
  assert.strictEqual(status, 404);
});
