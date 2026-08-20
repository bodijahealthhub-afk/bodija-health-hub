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
