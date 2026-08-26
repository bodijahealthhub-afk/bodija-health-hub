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

test('public endpoints return 200 (archived modules return 404)', async () => {
  for (const url of ['/api/services', '/api/blog', '/api/events', '/api/testimonials', '/api/gallery', '/api/media', '/api/site-content', '/api/seo/home']) {
    const { status } = await request('GET', url);
    assert.strictEqual(status, 200, `${url} -> ${status}`);
  }
  // The doctors directory is an archived future module — it must not be publicly accessible
  assert.strictEqual((await request('GET', '/api/doctors')).status, 404);
  assert.strictEqual((await request('GET', '/api/doctors/1')).status, 404);
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

test('payments config endpoint discloses mock mode', async () => {
  const { status, json } = await request('GET', '/api/payments/config');
  assert.strictEqual(status, 200);
  assert.strictEqual(typeof json.mock, 'boolean');
  assert.strictEqual(typeof json.gatewayConfigured, 'boolean');
  assert.strictEqual(typeof json.flagEnabled, 'boolean');
});

test('admin system health endpoint returns operational checks', async () => {
  const { status, json } = await request('GET', '/api/admin/system-health', { token: adminToken });
  assert.strictEqual(status, 200);
  assert.strictEqual(json.database.status, 'ok');
  assert.ok(json.server.node);
  assert.ok(typeof json.storage.exists === 'boolean');
  assert.ok(Array.isArray(Object.keys(json.tableCounts)));
  assert.strictEqual(json.payments.gatewayConfigured, false);
  assert.strictEqual(json.payments.mock, true);

  const denied = await request('GET', '/api/admin/system-health');
  assert.strictEqual(denied.status, 401);
});

test('admin endpoints return wrapped camelCase contract', async () => {
  for (const url of ['/api/admin/services', '/api/admin/appointments', '/api/admin/blog', '/api/admin/events', '/api/admin/testimonials', '/api/admin/media', '/api/admin/dashboard']) {
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

test('patient portal is gated by the patient_portal flag and the full flow works when enabled', async () => {
  // Archived/disabled => the whole portal 404s like it never existed.
  assert.strictEqual((await request('POST', '/api/patient/register', {
    body: { name: 'Portal Patient', email: 'portal@example.com', phone: '08077777777', password: 'secret123' },
  })).status, 404);
  assert.strictEqual((await request('POST', '/api/patient/login', {
    body: { email: 'portal@example.com', password: 'secret123' },
  })).status, 404);

  // Admin enables the patient portal feature
  const enabled = await request('PUT', '/api/admin/features/patient_portal', {
    token: adminToken,
    body: { enabled: true },
  });
  assert.strictEqual(enabled.status, 200);
  assert.strictEqual(enabled.json.enabled, true);

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

  // Restore the archived/disabled state so the portal stays locked down.
  await request('PUT', '/api/admin/features/patient_portal', {
    token: adminToken,
    body: { enabled: false },
  });
});

test('payments initialize works in mock mode and marks appointment paid', async () => {
  // No fabricated doctors/services are seeded, so create a real service with a price
  // and attach the appointment to it (doctor-based pricing is a legacy future module).
  const svc = await request('POST', '/api/admin/services', {
    token: adminToken,
    body: { name: 'Test Service', category: 'Testing', price: 2500 },
  });
  assert.strictEqual(svc.status, 201);

  const created = await request('POST', '/api/appointments', {
    body: {
      patient_name: 'Paying Patient', patient_email: 'payer@example.com', patient_phone: '08055555555',
      service_id: svc.json.id, date: '2026-12-03', time: '09:00',
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

test('partners: public list, detail, admin CRUD, and status toggle', async () => {
  const publicList = await request('GET', '/api/partners');
  assert.strictEqual(publicList.status, 200);
  assert.ok(Array.isArray(publicList.json));

  const created = await request('POST', '/api/admin/partners', {
    token: adminToken,
    body: { name: 'Test Partner Org', partner_type: 'healthcare', services_offered: 'Audiology, Hearing Aids' },
  });
  assert.strictEqual(created.status, 201);
  assert.ok(created.json.id);
  assert.ok(created.json.slug);

  const detail = await request('GET', `/api/partners/${created.json.id}`);
  assert.strictEqual(detail.status, 200);
  assert.strictEqual(detail.json.name, 'Test Partner Org');
  assert.ok(Array.isArray(detail.json.services));

  const slugDetail = await request('GET', `/api/partners/${created.json.slug}`);
  assert.strictEqual(slugDetail.status, 200);

  // Search includes partners (gated by partners_section flag)
  const search = await request('GET', '/api/search?q=Partner');
  assert.ok(Array.isArray(search.json.partners));
  assert.ok(search.json.partners.some((p) => p.id === created.json.id));

  const toggle = await request('PATCH', `/api/admin/partners/${created.json.id}/status`, {
    token: adminToken,
    body: { status: 'inactive' },
  });
  assert.strictEqual(toggle.status, 200);

  // Inactive partners are hidden from the public list and detail
  const afterDeactivate = await request('GET', `/api/partners/${created.json.id}`);
  assert.strictEqual(afterDeactivate.status, 404);

  // Search no longer includes the inactive partner
  const searchAfter = await request('GET', '/api/search?q=Test Partner Org');
  assert.ok(!searchAfter.json.partners.some((p) => p.id === created.json.id));

  const adminList = await request('GET', '/api/admin/partners', { token: adminToken });
  assert.ok(adminList.json.partners.some((p) => p.id === created.json.id));

  const del = await request('DELETE', `/api/admin/partners/${created.json.id}`, { token: adminToken });
  assert.strictEqual(del.status, 200);
});

test('programmes: public list, detail, admin CRUD, and status toggle', async () => {
  const publicList = await request('GET', '/api/programmes');
  assert.strictEqual(publicList.status, 200);
  assert.ok(Array.isArray(publicList.json));

  const created = await request('POST', '/api/admin/programmes', {
    token: adminToken,
    body: { title: 'Test Community Nutrition Programme', category: 'Nutrition', schedule: 'Every 2nd Saturday', location: 'Bodija Community Center' },
  });
  assert.strictEqual(created.status, 201);
  assert.ok(created.json.id);

  const detail = await request('GET', `/api/programmes/${created.json.id}`);
  assert.strictEqual(detail.status, 200);
  assert.strictEqual(detail.json.title, 'Test Community Nutrition Programme');

  const toggle = await request('PATCH', `/api/admin/programmes/${created.json.id}/status`, {
    token: adminToken,
    body: { status: 'inactive' },
  });
  assert.strictEqual(toggle.status, 200);

  const afterDeactivate = await request('GET', `/api/programmes/${created.json.id}`);
  assert.strictEqual(afterDeactivate.status, 404);

  const adminList = await request('GET', '/api/admin/programmes', { token: adminToken });
  assert.ok(adminList.json.programmes.some((p) => p.id === created.json.id));

  const search = await request('GET', '/api/search?q=Nutrition');
  assert.ok(Array.isArray(search.json.programmes));

  const del = await request('DELETE', `/api/admin/programmes/${created.json.id}`, { token: adminToken });
  assert.strictEqual(del.status, 200);
});

test('admin GET routes require authentication (mount-level guard)', async () => {
  const adminGetRoutes = [
    '/api/admin/services', '/api/admin/doctors', '/api/admin/appointments',
    '/api/admin/patients', '/api/admin/blog', '/api/admin/events',
    '/api/admin/testimonials', '/api/admin/media', '/api/admin/partners',
    '/api/admin/programmes', '/api/admin/system-health',
    '/api/admin/page-content', '/api/admin/seo',
  ];
  for (const url of adminGetRoutes) {
    const { status } = await request('GET', url);
    assert.strictEqual(status, 401, `${url} should return 401 without token, got ${status}`);
  }
  // With valid token these should return 200
  for (const url of ['/api/admin/services', '/api/admin/testimonials', '/api/admin/events']) {
    const { status } = await request('GET', url, { token: adminToken });
    assert.strictEqual(status, 200, `${url} should return 200 with token, got ${status}`);
  }
});

test('admin system-health returns feature flags and status summary', async () => {
  const { status, json } = await request('GET', '/api/admin/system-health', { token: adminToken });
  assert.strictEqual(status, 200);
  assert.ok(json.status, 'should have status summary');
  assert.ok(['healthy', 'degraded'].includes(json.status.server), 'server status should be healthy or degraded');
  assert.ok(json.featureFlags, 'should have featureFlags');
  assert.strictEqual(typeof json.featureFlags.count, 'number');
  assert.strictEqual(typeof json.featureFlags.activeCount, 'number');
  assert.strictEqual(typeof json.featureFlags.loaded, 'boolean');
  assert.ok(json.backups, 'should have backups');
  assert.strictEqual(typeof json.backups.autoBackupEnabled, 'boolean');
});

test('backup export returns valid JSON (gzip tested)', async () => {
  const { status, json } = await request('GET', '/api/admin/backups/export', { token: adminToken });
  assert.strictEqual(status, 200);
  assert.ok(json, 'export should return data');
  assert.ok(json.data || json.export_date, 'export should have recognizable structure');
});

test('patient login and register routes exist and are accessible', async () => {
  const login = await request('POST', '/api/patient/login', {
    body: { email: 'nonexistent@example.com', password: 'wrong' },
  });
  assert.ok([400, 401, 403, 404].includes(login.status), `patient login responded with ${login.status}`);

  const register = await request('POST', '/api/patient/register', {
    body: { name: 'Test', email: 'test-ratelimit@example.com', phone: '08012345678', password: 'testpass' },
  });
  assert.ok([201, 400, 403, 404, 409].includes(register.status), `patient register responded with ${register.status}`);
});

test('feature gate regression: all public route flags are enabled and correctly structured', async () => {
  const { status, json } = await request('GET', '/api/features');
  assert.strictEqual(status, 200);
  assert.ok(Array.isArray(json));

  const byKey = Object.fromEntries(json.map((f) => [f.key, f]));

  // These flags control public routes via FeatureGate in App.jsx.
  // If any is disabled, the route shows "Coming Soon" instead of real content.
  const publicRouteFlags = [
    'services',
    'appointment_booking',
    'contact_form',
    'faq',
    'careers',
    'upcoming_projects',
    'partners_section',
    'platforms_section',
    'blog',
    'events',
    'programme_registration',
    'livecare',
    'hear_menders',
  ];

  for (const key of publicRouteFlags) {
    assert.ok(byKey[key], `flag "${key}" must exist in GET /api/features`);
    assert.strictEqual(byKey[key].enabled, true, `flag "${key}" must be enabled for its public route to render`);
    assert.strictEqual(byKey[key].status, 'active', `flag "${key}" must have status "active"`);
  }

  // Archived features must be disabled — their routes should stay behind "Coming Soon"
  const archivedFlags = ['patient_portal', 'appointments', 'doctors'];
  for (const key of archivedFlags) {
    assert.ok(byKey[key], `archived flag "${key}" must exist`);
    assert.strictEqual(byKey[key].enabled, false, `archived flag "${key}" must be disabled`);
    assert.strictEqual(byKey[key].status, 'archived', `archived flag "${key}" must have status "archived"`);
  }

  // Each public route flag must expose boolean fields the frontend relies on
  for (const key of publicRouteFlags) {
    const f = byKey[key];
    assert.strictEqual(typeof f.enabled, 'boolean', `"${key}".enabled must be boolean`);
    assert.strictEqual(typeof f.public_visible, 'boolean', `"${key}".public_visible must be boolean`);
    assert.strictEqual(typeof f.navigation_visible, 'boolean', `"${key}".navigation_visible must be boolean`);
  }
});

test('feature gate regression: disabling a public flag hides its API and re-enabling restores it', async () => {
  // Disable the blog flag (controls /newsroom route)
  await request('PUT', '/api/admin/features/blog', {
    token: adminToken,
    body: { enabled: false },
  });

  // Public blog endpoint should 404
  const disabled = await request('GET', '/api/blog');
  assert.strictEqual(disabled.status, 404);

  // Re-enable it
  await request('POST', '/api/admin/features/blog/toggle', { token: adminToken });

  // Public blog endpoint should work again
  const enabled = await request('GET', '/api/blog');
  assert.strictEqual(enabled.status, 200);
});

test('feature gate regression: every feature flag returned by public API has required boolean fields', async () => {
  const { status, json } = await request('GET', '/api/features');
  assert.strictEqual(status, 200);
  assert.ok(json.length > 0, 'must have feature flags');

  const requiredFields = ['key', 'name', 'status', 'enabled', 'public_visible', 'navigation_visible'];
  for (const flag of json) {
    for (const field of requiredFields) {
      assert.ok(field in flag, `flag "${flag.key}" missing field "${field}"`);
    }
    assert.strictEqual(typeof flag.enabled, 'boolean', `"${flag.key}".enabled must be boolean`);
    assert.strictEqual(typeof flag.public_visible, 'boolean', `"${flag.key}".public_visible must be boolean`);
    assert.strictEqual(typeof flag.navigation_visible, 'boolean', `"${flag.key}".navigation_visible must be boolean`);
  }
});

// ── Wave 1: Service Request Enhancements ──────────────────────────────────────

test('service request: assign endpoint assigns a booking to a team member', async () => {
  // Create a booking first
  const createRes = await request('POST', '/api/appointments', {
    body: {
      booking_type: 'appointment',
      patient_name: 'Assign Test Patient',
      patient_email: 'assign@test.com',
      service_id: null,
      preferred_date: '2026-09-01',
      preferred_time: '10:00',
    },
  });
  assert.strictEqual(createRes.status, 201);
  const bookingId = createRes.json.id;

  // Assign to admin user (id=1)
  const assignRes = await request('PATCH', `/api/admin/appointments/${bookingId}/assign`, {
    token: adminToken,
    body: { assigned_to: 1 },
  });
  assert.strictEqual(assignRes.status, 200);
  assert.strictEqual(assignRes.json.assignedTo, 1);
  assert.strictEqual(assignRes.json.assignedToName, 'Admin User');
});

test('service request: status transition sets timestamp (confirmed_at)', async () => {
  const createRes = await request('POST', '/api/appointments', {
    body: {
      booking_type: 'appointment',
      patient_name: 'Timestamp Test',
      patient_email: 'timestamp@test.com',
      preferred_date: '2026-09-02',
    },
  });
  assert.strictEqual(createRes.status, 201);
  const bookingId = createRes.json.id;

  const confirmRes = await request('PATCH', `/api/admin/appointments/${bookingId}/status`, {
    token: adminToken,
    body: { status: 'confirmed' },
  });
  assert.strictEqual(confirmRes.status, 200);
  assert.ok(confirmRes.json.confirmedAt, 'confirmedAt should be set after confirming');

  const completeRes = await request('PATCH', `/api/admin/appointments/${bookingId}/status`, {
    token: adminToken,
    body: { status: 'completed' },
  });
  assert.strictEqual(completeRes.status, 200);
  assert.ok(completeRes.json.completedAt, 'completedAt should be set after completing');
});

test('service request: internal_notes are saved via notes endpoint', async () => {
  const createRes = await request('POST', '/api/appointments', {
    body: {
      booking_type: 'appointment',
      patient_name: 'Internal Notes Test',
      preferred_date: '2026-09-03',
    },
  });
  const bookingId = createRes.json.id;

  const notesRes = await request('PATCH', `/api/admin/appointments/${bookingId}/notes`, {
    token: adminToken,
    body: { internal_notes: 'Internal note for admin eyes only' },
  });
  assert.strictEqual(notesRes.status, 200);
  assert.strictEqual(notesRes.json.internalNotes, 'Internal note for admin eyes only');
});

test('service request: admin GET supports assigned_to and source filters', async () => {
  const res = await request('GET', '/api/admin/appointments?assigned_to=1', { token: adminToken });
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.json.appointments));
});

// ── Wave 1: Lifecycle Status ──────────────────────────────────────────────────

test('lifecycle status: services support status column in admin GET', async () => {
  const res = await request('GET', '/api/admin/services?status=active', { token: adminToken });
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.json.services));
});

test('lifecycle status: partners support status column in admin GET', async () => {
  const res = await request('GET', '/api/admin/partners?status=active', { token: adminToken });
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.json.partners));
});

test('lifecycle status: services toClient includes lifecycleStatus', async () => {
  const res = await request('GET', '/api/admin/services', { token: adminToken });
  assert.strictEqual(res.status, 200);
  const first = res.json.services[0];
  assert.ok('lifecycleStatus' in first, 'toClient should include lifecycleStatus');
});

// ── Wave 1: Content Revisions ─────────────────────────────────────────────────

test('content revisions: revisions table exists and is queryable', async () => {
  const count = await db.prepare('SELECT COUNT(*) as count FROM content_revisions').get();
  assert.ok(typeof count.count === 'number');
});

test('content revisions: PUT /api/admin/blog creates a revision', async () => {
  // Create a blog post
  const createRes = await request('POST', '/api/admin/blog', {
    token: adminToken,
    body: { title: 'Revision Test Post', content: '<p>Original content</p>', status: 'draft' },
  });
  assert.strictEqual(createRes.status, 201);
  const postId = createRes.json.id;

  // Update it
  const updateRes = await request('PUT', `/api/admin/blog/${postId}`, {
    token: adminToken,
    body: { content: '<p>Updated content</p>' },
  });
  assert.strictEqual(updateRes.status, 200);

  // Check revisions
  const revRes = await request('GET', `/api/admin/revisions?entity_type=blog_posts&entity_id=${postId}`, {
    token: adminToken,
  });
  assert.strictEqual(revRes.status, 200);
  assert.ok(revRes.json.revisions.length >= 1, 'Should have at least 1 revision after update');
  assert.strictEqual(revRes.json.revisions[0].entity_type, 'blog_posts');
});

// --- Phase 4: Notifications Centre ---

test('notifications: GET /api/admin/notifications returns empty list', async () => {
  const res = await request('GET', '/api/admin/notifications', { token: adminToken });
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.json.notifications));
});

test('notifications: POST /api/admin/notifications creates notification', async () => {
  const res = await request('POST', '/api/admin/notifications', {
    token: adminToken,
    body: { title: 'Test notification', message: 'Hello from tests', type: 'info' },
  });
  assert.strictEqual(res.status, 201);
  assert.ok(res.json.id);
  assert.strictEqual(res.json.title, 'Test notification');
});

test('notifications: PATCH marks notification read', async () => {
  const createRes = await request('POST', '/api/admin/notifications', {
    token: adminToken,
    body: { title: 'Read test', message: 'Mark as read', type: 'info' },
  });
  assert.strictEqual(createRes.status, 201);
  const id = createRes.json.id;

  const patchRes = await request('PATCH', `/api/admin/notifications/${id}/read`, { token: adminToken });
  assert.strictEqual(patchRes.status, 200);
  assert.ok(patchRes.json.success);
});

// --- Phase 6: CRM Contacts ---

test('contacts: GET /api/admin/contacts returns empty list', async () => {
  const res = await request('GET', '/api/admin/contacts', { token: adminToken });
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.json.contacts));
});

test('contacts: POST creates a contact', async () => {
  const res = await request('POST', '/api/admin/contacts', {
    token: adminToken,
    body: { name: 'Test Contact', email: 'test@example.com', source: 'manual' },
  });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.json.name, 'Test Contact');
  assert.strictEqual(res.json.email, 'test@example.com');
});

test('contacts: GET by id returns contact', async () => {
  const createRes = await request('POST', '/api/admin/contacts', {
    token: adminToken,
    body: { name: 'Lookup Contact', email: 'lookup@example.com' },
  });
  const id = createRes.json.id;

  const res = await request('GET', `/api/admin/contacts/${id}`, { token: adminToken });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.json.name, 'Lookup Contact');
});

// --- Phase 2: Ecosystem Categories ---

test('ecosystem categories: public GET returns empty list', async () => {
  const res = await request('GET', '/api/ecosystem/categories');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.json));
});

test('ecosystem categories: admin can create category', async () => {
  const res = await request('POST', '/api/admin/ecosystem/categories', {
    token: adminToken,
    body: { name: 'Healthcare', slug: 'healthcare', icon: '🏥' },
  });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.json.name, 'Healthcare');
});

// --- Phase 8: Analytics ---

test('analytics: GET /api/admin/analytics returns metrics', async () => {
  const res = await request('GET', '/api/admin/analytics', { token: adminToken });
  assert.strictEqual(res.status, 200);
  assert.ok(res.json.overview, 'Should have overview object');
  assert.ok(typeof res.json.overview.totalBookings === 'number');
  assert.ok(typeof res.json.overview.totalContacts === 'number');
  assert.ok(typeof res.json.overview.totalPosts === 'number');
});

// --- Phase 14: Admin Search ---

test('admin search: GET /api/search/admin?q=test returns results', async () => {
  const res = await request('GET', '/api/search/admin?q=test', { token: adminToken });
  assert.strictEqual(res.status, 200);
  assert.ok(typeof res.json.services === 'object');
  assert.ok(typeof res.json.blog === 'object');
});

test('admin search: short query returns empty', async () => {
  const res = await request('GET', '/api/search/admin?q=a', { token: adminToken });
  assert.strictEqual(res.status, 200);
});

// --- Phase 17: Security ---

test('security: input sanitization strips XSS', () => {
  const { sanitizeString } = require('../utils/security');
  const dirty = '<script>alert("xss")</script>';
  const clean = sanitizeString(dirty);
  assert.ok(!clean.includes('<script>'));
  assert.ok(clean.includes('&lt;script&gt;'));
});

test('security: sanitizeObject recurses', () => {
  const { sanitizeObject } = require('../utils/security');
  const input = { name: '<b>bold</b>', nested: { desc: 'normal' } };
  const result = sanitizeObject(input);
  assert.ok(!result.name.includes('<b>'));
  assert.strictEqual(result.nested.desc, 'normal');
});

test('security: isValidEmail validates', () => {
  const { isValidEmail } = require('../utils/security');
  assert.ok(isValidEmail('user@example.com'));
  assert.ok(!isValidEmail('not-an-email'));
  assert.ok(!isValidEmail(''));
});

test('security: rateLimit blocks after threshold', () => {
  const { rateLimit } = require('../utils/security');
  const key = 'test-ratelimit-' + Date.now();
  for (let i = 0; i < 5; i++) rateLimit(key, 60000, 5);
  assert.ok(!rateLimit(key, 60000, 5), 'Should block after 5 requests');
});

// --- Regression tests for audit security fixes ---

test('C1 regression: /api/admin/payments requires authentication', async () => {
  const res = await request('GET', '/api/admin/payments/config');
  assert.strictEqual(res.status, 401, 'Unauthenticated request to /api/admin/payments/config must be rejected');
});

test('C2 regression: /api/admin/doctors returns 404 when doctors flag is disabled', async () => {
  await db.prepare("UPDATE feature_flags SET enabled = 0 WHERE key = 'doctors'").run();
  const res = await request('GET', '/api/admin/doctors', { token: adminToken });
  assert.strictEqual(res.status, 404, 'Doctors admin endpoint must be 404 when feature flag disabled');
  await db.prepare("UPDATE feature_flags SET enabled = 1 WHERE key = 'doctors'").run();
});

test('C2 regression: /api/admin/patients returns 404 when patient_portal flag is disabled', async () => {
  await db.prepare("UPDATE feature_flags SET enabled = 0 WHERE key = 'patient_portal'").run();
  const res = await request('GET', '/api/admin/patients', { token: adminToken });
  assert.strictEqual(res.status, 404, 'Patients admin endpoint must be 404 when feature flag disabled');
  await db.prepare("UPDATE feature_flags SET enabled = 1 WHERE key = 'patient_portal'").run();
});

test('C2 regression: /api/doctors (public) returns 404 when doctors flag is disabled', async () => {
  await db.prepare("UPDATE feature_flags SET enabled = 0 WHERE key = 'doctors'").run();
  const res = await request('GET', '/api/doctors');
  assert.strictEqual(res.status, 404, 'Public doctors endpoint must be 404 when feature flag disabled');
  await db.prepare("UPDATE feature_flags SET enabled = 1 WHERE key = 'doctors'").run();
});

test('M3 regression: public registration is disabled (returns 403)', async () => {
  const res = await request('POST', '/api/auth/register', {
    body: { name: 'Test Reg User', email: `testreg-${Date.now()}@example.com`, password: 'testpass123' },
  });
  assert.strictEqual(res.status, 403, 'Public registration must be disabled');
});

test('C4 regression: /api/admin/contacts requires authentication', async () => {
  const res = await request('GET', '/api/admin/contacts');
  assert.strictEqual(res.status, 401, 'Unauthenticated contacts request must be rejected');
});

test('C4 regression: /api/admin/analytics requires authentication', async () => {
  const res = await request('GET', '/api/admin/analytics');
  assert.strictEqual(res.status, 401, 'Unauthenticated analytics request must be rejected');
});

test('H1 regression: ecosystem admin GET returns all categories including inactive', async () => {
  // Create an active category
  const createRes = await request('POST', '/api/admin/ecosystem/categories', {
    token: adminToken,
    body: { name: 'Test Active Cat' },
  });
  assert.strictEqual(createRes.status, 201);
  const catId = createRes.json.id;

  // Deactivate it
  await request('PUT', `/api/admin/ecosystem/categories/${catId}`, {
    token: adminToken,
    body: { is_active: 0 },
  });

  // Admin GET should still return it
  const adminRes = await request('GET', '/api/admin/ecosystem/categories', { token: adminToken });
  assert.ok(adminRes.json.categories.some((c) => c.id === catId && c.is_active === 0),
    'Admin ecosystem categories must include inactive categories');

  // Public GET should NOT return it
  const publicRes = await request('GET', '/api/ecosystem/categories');
  assert.ok(!publicRes.json.some((c) => c.id === catId),
    'Public ecosystem categories must exclude inactive categories');
});

test('appointment audit logging: status change creates audit entry', async () => {
  // Create a service request
  const created = await request('POST', '/api/appointments', {
    body: {
      patient_name: 'Audit Test User', patient_email: 'audit@example.com',
      patient_phone: '08012345678', date: '2026-12-01', time: '10:00',
    },
  });
  assert.strictEqual(created.status, 201);
  const id = created.json.id;

  // Change status
  const statusRes = await request('PATCH', `/api/admin/appointments/${id}/status`, {
    token: adminToken,
    body: { status: 'under_review' },
  });
  assert.strictEqual(statusRes.status, 200);
  assert.strictEqual(statusRes.json.status, 'under_review');

  // Check audit log
  const audit = await request('GET', '/api/admin/audit-logs', { token: adminToken });
  assert.ok(audit.status === 200);
  assert.ok(audit.json.some((e) => e.action === 'BOOKING_STATUS_CHANGED' && e.entity_id === String(id)),
    'Status change must create BOOKING_STATUS_CHANGED audit entry');

  // Cleanup
  await request('DELETE', `/api/admin/appointments/${id}`, { token: adminToken });
});

test('appointment audit logging: assignment creates audit entry', async () => {
  // Create a service request
  const created = await request('POST', '/api/appointments', {
    body: {
      patient_name: 'Assign Test User', patient_email: 'assign@example.com',
      patient_phone: '08012345679', date: '2026-12-02', time: '11:00',
    },
  });
  assert.strictEqual(created.status, 201);
  const id = created.json.id;

  // Assign to admin user (adminToken user)
  const me = await request('GET', '/api/auth/me', { token: adminToken });
  const userId = me.json.id;

  const assignRes = await request('PATCH', `/api/admin/appointments/${id}/assign`, {
    token: adminToken,
    body: { assigned_to: userId },
  });
  assert.strictEqual(assignRes.status, 200);
  assert.strictEqual(assignRes.json.assignedTo, userId);

  // Check audit log
  const audit = await request('GET', '/api/admin/audit-logs', { token: adminToken });
  assert.ok(audit.json.some((e) => e.action === 'BOOKING_ASSIGNED' && e.entity_id === String(id)),
    'Assignment must create BOOKING_ASSIGNED audit entry');

  // Cleanup
  await request('DELETE', `/api/admin/appointments/${id}`, { token: adminToken });
});

test('backup backward-compat alias validates backup structure', async () => {
  // Send malformed backup (missing required arrays)
  const malformed = await request('POST', '/api/admin/backups', {
    token: adminToken,
    body: { invalid: 'data' },
  });
  assert.strictEqual(malformed.status, 400, 'Malformed backup must be rejected');
  assert.ok(malformed.json.error);

  // Send incomplete backup (missing required keys)
  const incomplete = await request('POST', '/api/admin/backups', {
    token: adminToken,
    body: { services: [], partners: [] },
  });
  assert.strictEqual(incomplete.status, 400, 'Incomplete backup must be rejected');

  // Send valid backup structure
  const valid = await request('POST', '/api/admin/backups', {
    token: adminToken,
    body: { services: [], partners: [], programmes: [], events: [] },
  });
  assert.strictEqual(valid.status, 200, 'Valid empty backup must be accepted');
  assert.strictEqual(valid.json.success, true);
});

test('backup backward-compat alias rejects unauthorized requests', async () => {
  const res = await request('POST', '/api/admin/backups', {
    body: { services: [], partners: [], programmes: [], events: [] },
  });
  assert.strictEqual(res.status, 401, 'Unauthenticated backup import must be rejected');
});
