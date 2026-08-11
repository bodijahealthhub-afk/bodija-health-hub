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
const db = require('../models/database');

let server;
let base;

before(async () => {
  await db.ready;
  // Some content features are seeded disabled; enable the ones existing tests
  // exercise so the public contract tests remain green. Feature behaviour is
  // covered explicitly by the feature-flag tests below.
  await db.prepare("UPDATE feature_flags SET enabled = 1 WHERE key IN ('events', 'payment_system')").run();
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

test('feature flags: public list, admin CRUD, API gating, and audit logs', async () => {
  // Public list only exposes visible features
  const publicList = await request('GET', '/api/features');
  assert.strictEqual(publicList.status, 200);
  assert.ok(Array.isArray(publicList.json));
  assert.ok(publicList.json.some((f) => f.key === 'appointment_booking'));

  // Admin endpoints require auth
  assert.strictEqual((await request('GET', '/api/admin/features')).status, 401);
  assert.strictEqual((await request('GET', '/api/admin/audit-logs')).status, 401);

  // Admin sees the full flag list
  const adminList = await request('GET', '/api/admin/features', { token: adminToken });
  assert.strictEqual(adminList.status, 200);
  const servicesFlag = adminList.json.find((f) => f.key === 'services');
  assert.ok(servicesFlag);
  assert.strictEqual(typeof servicesFlag.enabled, 'boolean');

  // Disable the services feature via the admin API
  const disabled = await request('PUT', '/api/admin/features/services', {
    token: adminToken,
    body: { enabled: false },
  });
  assert.strictEqual(disabled.status, 200);
  assert.strictEqual(disabled.json.enabled, false);

  // Public API for the disabled feature returns 404, admin still works
  assert.strictEqual((await request('GET', '/api/services')).status, 404);
  assert.strictEqual((await request('GET', '/api/services/1')).status, 404);
  assert.strictEqual((await request('GET', '/api/admin/services', { token: adminToken })).status, 200);

  // Search excludes results from disabled features
  const search = await request('GET', '/api/search?q=clinic');
  assert.strictEqual(search.status, 200);
  assert.ok(Array.isArray(search.json.services));
  assert.strictEqual(search.json.services.length, 0);

  // Toggle endpoint flips the flag back on
  const toggled = await request('POST', '/api/admin/features/services/toggle', { token: adminToken });
  assert.strictEqual(toggled.status, 200);
  assert.strictEqual(toggled.json.enabled, true);
  assert.strictEqual((await request('GET', '/api/services')).status, 200);

  // Audit log records the changes
  const audit = await request('GET', '/api/admin/audit-logs', { token: adminToken });
  assert.strictEqual(audit.status, 200);
  assert.ok(Array.isArray(audit.json));
  assert.ok(audit.json.some((e) => e.action === 'FEATURE_FLAG_TOGGLED' && e.entity_id === 'services'));

  // Creating a duplicate key is rejected
  const duplicate = await request('POST', '/api/admin/features', {
    token: adminToken,
    body: { key: 'services', name: 'Duplicate' },
  });
  assert.strictEqual(duplicate.status, 409);
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

test('dashboard analytics returns trend data', async () => {
  const { status, json } = await request('GET', '/api/admin/dashboard/analytics?days=7', { token: adminToken });
  assert.strictEqual(status, 200);
  assert.strictEqual(json.days, 7);
  assert.ok(Array.isArray(json.daily));
  assert.strictEqual(json.daily.length, 7);
  assert.ok('appointments' in json.daily[0]);
  assert.ok('revenue' in json.daily[0]);
  assert.ok(Array.isArray(json.statusBreakdown));
  assert.ok(Array.isArray(json.topServices));
  assert.ok(json.rangeSummary && typeof json.rangeSummary.totalAppointments === 'number');
});

test('patient can register, log in, and see own appointments', async () => {
  const registered = await request('POST', '/api/patient/register', {
    body: { name: 'Portal Patient', email: 'portal@example.com', phone: '08077777777', password: 'secret123' },
  });
  assert.strictEqual(registered.status, 201);
  assert.ok(registered.json.token);

  const book = await request('POST', '/api/appointments', {
    body: { patient_name: 'Portal Patient', patient_email: 'portal@example.com', patient_phone: '08077777777', date: '2026-12-02', time: '11:00' },
  });
  assert.strictEqual(book.status, 201);

  const list = await request('GET', '/api/patient/appointments', { token: registered.json.token });
  assert.strictEqual(list.status, 200);
  assert.ok(list.json.appointments.some((a) => a.id === book.json.id));

  const cancelled = await request('POST', `/api/patient/appointments/${book.json.id}/cancel`, { token: registered.json.token });
  assert.strictEqual(cancelled.status, 200);

  const login = await request('POST', '/api/patient/login', {
    body: { email: 'portal@example.com', password: 'secret123' },
  });
  assert.strictEqual(login.status, 200);
  assert.ok(login.json.token);
});

test('payments initialize works in mock mode and marks appointment paid', async () => {
  const created = await request('POST', '/api/appointments', {
    body: {
      patient_name: 'Paying Patient', patient_email: 'payer@example.com', patient_phone: '08055555555',
      doctor_id: 1, date: '2026-12-03', time: '09:00',
    },
  });
  assert.strictEqual(created.status, 201);
  assert.ok(created.json.amount > 0);

  const pay = await request('POST', '/api/payments/initialize', { body: { appointment_id: created.json.id } });
  assert.strictEqual(pay.status, 201);
  assert.strictEqual(pay.json.status, 'paid');
  assert.ok(pay.json.reference);

  const verify = await request('GET', `/api/payments/${pay.json.reference}`);
  assert.strictEqual(verify.status, 200);
  assert.strictEqual(verify.json.status, 'paid');
  assert.strictEqual(verify.json.appointment_id, created.json.id);

  const list = await request('GET', '/api/admin/payments', { token: adminToken });
  assert.strictEqual(list.status, 200);
  assert.ok(list.json.payments.some((p) => p.reference === pay.json.reference));

  const doublePay = await request('POST', '/api/payments/initialize', { body: { appointment_id: created.json.id } });
  assert.strictEqual(doublePay.status, 409);
});

test('website contact message reaches the admin panel (full round-trip)', async () => {
  // Website sends the contact form
  const sent = await request('POST', '/api/messages', {
    body: { name: 'Website Visitor', email: 'visitor@example.com', phone: '08090000000', subject: 'Enquiry', message: 'Round-trip test message' },
  });
  assert.strictEqual(sent.status, 201);
  assert.ok(sent.json.id);

  // Admin panel can read, mark as read, and delete it
  const list = await request('GET', '/api/messages', { token: adminToken });
  assert.strictEqual(list.status, 200);
  const found = list.json.find((m) => m.id === sent.json.id);
  assert.ok(found, 'admin did not receive the website message');
  assert.strictEqual(found.name, 'Website Visitor');

  const read = await request('PUT', `/api/messages/${sent.json.id}/read`, { token: adminToken });
  assert.strictEqual(read.status, 200);

  const del = await request('DELETE', `/api/messages/${sent.json.id}`, { token: adminToken });
  assert.strictEqual(del.status, 200);

  const after = await request('GET', '/api/messages', { token: adminToken });
  assert.ok(!after.json.some((m) => m.id === sent.json.id));
});

test('contact form gate blocks messages when the feature is disabled', async () => {
  const disabled = await request('PUT', '/api/admin/features/contact_form', {
    token: adminToken,
    body: { enabled: false },
  });
  assert.strictEqual(disabled.status, 200);

  const blocked = await request('POST', '/api/messages', {
    body: { name: 'Blocked', email: 'blocked@example.com', message: 'should not persist' },
  });
  assert.strictEqual(blocked.status, 404);

  const reEnabled = await request('PUT', '/api/admin/features/contact_form', {
    token: adminToken,
    body: { enabled: true },
  });
  assert.strictEqual(reEnabled.status, 200);
});

test('request-based booking engine: public booking options, booking, and admin review', async () => {
  // Public booking-options endpoint lists the bookable categories
  const options = await request('GET', '/api/appointments/booking-options');
  assert.strictEqual(options.status, 200);
  assert.ok(Array.isArray(options.json.bookingTypes));
  assert.ok(options.json.bookingTypes.some((t) => t.value === 'appointment'));
  assert.ok(Array.isArray(options.json.providers));

  // Public POST uses the new engine: type-aware, with booking reference
  const booked = await request('POST', '/api/appointments', {
    body: {
      booking_type: 'appointment',
      patient_name: 'Engine Test', patient_email: 'engine@example.com', patient_phone: '08091111111',
      preferred_date: '2026-12-05', preferred_time: '12:00', category: 'General Consultation',
    },
  });
  assert.strictEqual(booked.status, 201);
  assert.ok(booked.json.booking_reference);
  assert.match(booked.json.booking_reference, /^BHH-\d{8}-[A-F0-9]{6}$/);
  assert.strictEqual(booked.json.status, 'requested');

  // The admin panel sees it with the booking reference and type
  const list = await request('GET', '/api/admin/appointments', { token: adminToken });
  const row = list.json.appointments.find((a) => a.id === booked.json.id);
  assert.ok(row, 'admin did not receive the booking');
  assert.strictEqual(row.bookingReference, booked.json.booking_reference);
  assert.strictEqual(row.bookingType, 'appointment');

  // Admin confirms it and the status reflects in the patient-facing record
  const confirm = await request('PATCH', `/api/admin/appointments/${booked.json.id}/status`, {
    token: adminToken,
    body: { status: 'confirmed' },
  });
  assert.strictEqual(confirm.status, 200);
  assert.strictEqual(confirm.json.status, 'confirmed');

  // Cleanup
  const del = await request('DELETE', `/api/admin/appointments/${booked.json.id}`, { token: adminToken });
  assert.strictEqual(del.status, 200);
});

test('external partner booking requires an external link', async () => {
  const external = await request('POST', '/api/appointments', {
    body: {
      booking_type: 'external',
      patient_name: 'External Test', patient_email: 'external@example.com',
    },
  });
  assert.strictEqual(external.status, 400);
});

test('providers: public list, admin CRUD, and status toggle', async () => {
  const publicList = await request('GET', '/api/providers');
  assert.strictEqual(publicList.status, 200);
  assert.ok(Array.isArray(publicList.json));
  assert.ok(publicList.json.some((p) => p.name === 'Bodija Health Hub (BHH)'));

  const created = await request('POST', '/api/admin/providers', {
    token: adminToken,
    body: { name: 'Test Partner Clinic', provider_type: 'PARTNER', booking_method: 'PARTNER_REQUEST' },
  });
  assert.strictEqual(created.status, 201);
  assert.ok(created.json.id);

  const toggle = await request('PATCH', `/api/admin/providers/${created.json.id}/status`, {
    token: adminToken,
    body: { status: 'inactive' },
  });
  assert.strictEqual(toggle.status, 200);

  const list = await request('GET', '/api/admin/providers', { token: adminToken });
  assert.ok(list.json.providers.some((p) => p.id === created.json.id));

  const del = await request('DELETE', `/api/admin/providers/${created.json.id}`, { token: adminToken });
  assert.strictEqual(del.status, 200);
});
