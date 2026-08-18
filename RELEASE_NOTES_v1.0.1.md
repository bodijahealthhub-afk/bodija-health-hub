# Bodija Health Hub — v1.0.1 Release Notes

**Tag:** `v1.0.1`  
**Commit:** `5a13d3f`  
**Date:** 2026-08-18  
**Message:** Production stabilization release

---

## Executive Summary

v1.0.1 is a security hardening and production stabilization release following the v1.0 full production deployment. It closes all 10 identified maintenance items across admin authentication, backup optimization, system health observability, and security configuration. All changes are backend-only — no frontend logic was modified.

---

## Fixed Issues

### Admin Endpoint Authentication (Issue 1)

Every `/api/admin/*` GET handler now requires a valid JWT from a recognized admin role. Prior to this fix, several admin list/detail endpoints (services, partners, programmes, events, testimonials, gallery, doctors, providers) were accessible without authentication when queried directly.

**What changed:**
- Mount-level `adminAuth` middleware applied to all 25 admin route groups in `server/index.js`
- Per-handler `requireRole()` checks added to 14 shared route files that serve both public and admin paths
- Unauthenticated requests to any `/api/admin/*` endpoint now return `401 Access token required`

### CORS Configuration (Issue 6)

Localhost development origins (`http://localhost:5173`, `http://localhost:3000`) were present in the production CORS fallback string, broadening the attack surface unnecessarily.

**What changed:**
- Removed localhost origins from the CORS fallback in `server/index.js`
- Production CORS now only allows `https://client-six-eta-66.vercel.app` and `https://client-nt8gk3ac6-team-bhh.vercel.app`
- Set `CORS_ORIGINS` env var on Railway to override if needed

### Patient Portal Rate Limiting (Issue 6)

The `/api/patient/login` and `/api/patient/register` endpoints had no rate limiting, allowing brute-force attacks against patient credentials.

**What changed:**
- Added `authLimiter` (10 requests/15 min) to both patient login and register routes in `server/index.js`

### Debug Logging Cleanup (Issue 6)

Two `console.log` statements in `siteContent.js` were dumping admin-submitted content payloads to stdout on every PUT request.

**What changed:**
- Removed `console.log('PUT received updates:...')` and `console.log('hero_headline in updates:...')` from `server/routes/siteContent.js`

---

## Security Improvements

| Area | Before | After |
|---|---|---|
| Admin GET endpoints | Some accessible without auth | All require JWT + role |
| CORS fallback | Included localhost dev origins | Production origins only |
| Patient portal auth | No rate limiting | 10 req/15 min per IP |
| Debug logging | Content payloads logged to stdout | Removed |
| Health endpoint | No sensitive data exposed | Env flags shown as booleans |

---

## Feature Flag Improvements

The system health endpoint (`/api/admin/system-health`) now reports feature flag status:

- `featureFlags.count` — total flags in database
- `featureFlags.activeCount` — currently enabled flags
- `featureFlags.loaded` — whether the feature_flags table is accessible

---

## Backup Improvements

The backup export endpoint (`GET /api/admin/backups/export`) now streams gzipped JSON when the client sends `Accept-Encoding: gzip`.

- **Before:** Full JSON payload held in memory (~97 MB for production), often timing out on large databases
- **After:** Response compressed with zlib level 6, typically reducing payload to ~15-20 MB
- Clients that don't send gzip still receive uncompressed JSON

---

## Test Results

```
tests  26
pass   26
fail   0
duration_ms  ~2900
```

### New Regression Tests (v1.0.1)

| Test | What It Verifies |
|---|---|
| `admin GET routes require authentication` | 13 admin endpoints return 401 without token; 3 return 200 with valid token |
| `admin system-health returns feature flags and status summary` | New `featureFlags`, `status`, and `backups.autoBackupEnabled` fields present |
| `backup export returns valid JSON` | Export endpoint returns `200` with `data` and `export_date` structure |
| `patient login and register routes exist` | Patient portal endpoints respond (404 when feature flag disabled) |

---

## Deployment Information

| Component | URL | Status |
|---|---|---|
| Backend (Railway) | `https://backend-production-f347f.up.railway.app` | Deployed, all admin endpoints return 401 |
| Frontend (Vercel) | `https://client-six-eta-66.vercel.app` | Deployed, all 11 pages return 200 |
| Git Tag | `v1.0.1` on `origin/master` | Pushed |
| Volume | `/data` on Railway (500 MB) | 193 MB used |

### Verification

- 6 public API endpoints: all 200
- 15 admin endpoints without auth: all 401
- 11 frontend pages: all 200
- CORS: localhost origins removed
- Rate limiting: patient auth routes now throttled

---

## Known Low-Priority Issues

These items are documented but do not require immediate action:

| Issue | Severity | Notes |
|---|---|---|
| Weak JWT secret in local `.env` files | Medium | Production Railway uses its own secret; local `.env` should be regenerated before any local dev work with real data |
| Email address logging in `email.js` | Low | Operational logs include recipient addresses (PII); acceptable for current scale but should be reviewed before GDPR audit |
| No CSP header customization | Low | `helmet` is configured with `contentSecurityPolicy: false`; consider enabling with a strict policy for v1.1 |
| `patient_portal` flag drift risk | Low | Seed defaults to archived/disabled; any admin UI toggle will be overridden on server restart via upsert |

---

## Upgrade Path to v1.1

Planned for v1.1:

1. **Content Security Policy** — Enable helmet CSP with nonce-based script loading
2. **Email PII logging** — Replace recipient addresses with hashed identifiers in operational logs
3. **JWT secret rotation** — Add secret rotation mechanism and validate production secret strength on boot
4. **Frontend hardening** — Subresource integrity (SRI) for external assets, stricter cache headers
5. **Monitoring** — Sentry DSN integration verification, structured logging with correlation IDs
6. **Database migrations** — Schema versioning system for safe multi-environment deploys
