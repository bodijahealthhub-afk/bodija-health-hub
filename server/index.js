require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

let Sentry = null;
if (process.env.SENTRY_DSN) {
  Sentry = require('@sentry/node');
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
}

const db = require('./models/database');
const { generateSitemapXml } = require('./routes/seo');
const { startScheduler } = require('./utils/scheduler');
const { authenticateToken, requireRole } = require('./middleware/auth');
const { requireFeature } = require('./middleware/features');

const app = express();
const PORT = process.env.PORT || 5000;
const crypto = require('crypto');

const { sanitizeBody, securityHeaders } = require('./utils/security');

app.set('trust proxy', 1);

// Request ID middleware
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["https://www.google.com"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Security headers
app.use(securityHeaders);

// Body sanitizer
app.use(sanitizeBody);

// Rate limiter for auth endpoints (using express-rate-limit above)

const allowedOrigins = (process.env.CORS_ORIGINS ||
  'https://client-six-eta-66.vercel.app'
).split(',').map((s) => s.trim()).filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
}));

app.use(express.json({
  limit: '1mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  },
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' },
});

const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.PUBLIC_WRITE_RATE_LIMIT_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== 'POST',
  message: { error: 'Too many requests, please try again later' },
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/patient/login', authLimiter);
app.use('/api/patient/register', authLimiter);
app.use('/api/messages', publicWriteLimiter);
app.use('/api/newsletter', publicWriteLimiter);
app.use('/api/appointments', publicWriteLimiter);
app.use('/api/careers', publicWriteLimiter);
app.use('/api/upcoming-registrations', publicWriteLimiter);

app.use('/uploads', express.static(process.env.UPLOADS_DIR || path.join(__dirname, 'uploads')));

// Cache headers for public read-only data (10 minutes)
app.use('/api/services', (req, res, next) => {
  if (req.method === 'GET' && !req.baseUrl.includes('/admin')) {
    res.setHeader('Cache-Control', 'public, max-age=600, stale-while-revalidate=300');
  }
  next();
});
app.use('/api/partners', (req, res, next) => {
  if (req.method === 'GET' && !req.baseUrl.includes('/admin')) {
    res.setHeader('Cache-Control', 'public, max-age=600, stale-while-revalidate=300');
  }
  next();
});
app.use('/api/programmes', (req, res, next) => {
  if (req.method === 'GET' && !req.baseUrl.includes('/admin')) {
    res.setHeader('Cache-Control', 'public, max-age=600, stale-while-revalidate=300');
  }
  next();
});
app.use('/api/events', (req, res, next) => {
  if (req.method === 'GET' && !req.baseUrl.includes('/admin')) {
    res.setHeader('Cache-Control', 'public, max-age=600, stale-while-revalidate=300');
  }
  next();
});
app.use('/api/blog', (req, res, next) => {
  if (req.method === 'GET' && !req.baseUrl.includes('/admin')) {
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=120');
  }
  next();
});

app.get('/robots.txt', async (req, res) => {
  const row = await db.prepare("SELECT value FROM site_settings WHERE key = 'robots_txt'").get();
  const content = (row && row.value) || 'User-agent: *\nAllow: /';
  res.type('text/plain').send(content);
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const host = req.get('host');
    const content = await generateSitemapXml(host);
    res.type('application/xml').send(content);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).type('application/xml').send('<?xml version="1.0"?><error>Sitemap generation failed</error>');
  }
});

// Public routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', requireFeature('doctors'), require('./routes/doctors'));
app.use('/api/services', require('./routes/services'));
app.use('/api/providers', require('./routes/providers'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/patients', requireFeature('patient_portal'), require('./routes/patients'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/events', require('./routes/events'));
app.use('/api/programmes', require('./routes/programmes'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/media', require('./routes/media'));
app.use('/api/seo', require('./routes/seo'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/site-content', require('./routes/siteContent'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/page-content', require('./routes/pageContent'));
app.use('/api/careers', require('./routes/careers'));
app.use('/api/upcoming-registrations', require('./routes/upcoming'));
app.use('/api/features', require('./routes/features'));
app.use('/api/search', require('./routes/search'));
app.use('/api/service-categories', require('./routes/serviceCategories'));
const paymentsRouter = require('./routes/payments');
app.use('/api/payments', paymentsRouter);
app.use('/api/ecosystem', require('./routes/ecosystem'));
app.use('/api/patient', require('./routes/patient'));

// Admin routes — mount-level authentication ensures all /api/admin/* routes require
// a valid JWT from a recognised admin-panel role.  Per-handler requireRole() calls
// inside individual route files further restrict access where needed.
const adminAuth = [authenticateToken, requireRole('admin', 'super_admin', 'content_manager', 'receptionist', 'accountant')];

app.use('/api/admin/site-content', ...adminAuth, require('./routes/siteContent'));
app.use('/api/admin/page-content', ...adminAuth, require('./routes/pageContent'));
app.use('/api/admin/media', ...adminAuth, require('./routes/media'));
app.use('/api/admin/seo', ...adminAuth, require('./routes/seo'));
app.use('/api/admin/backups', ...adminAuth, require('./routes/backup'));
app.use('/api/admin/system-health', ...adminAuth, require('./routes/systemHealth'));
app.use('/api/admin/site-settings', ...adminAuth, require('./routes/siteSettings'));
app.use('/api/admin/services', ...adminAuth, require('./routes/services'));
app.use('/api/admin/blog', ...adminAuth, require('./routes/blog'));
app.use('/api/admin/testimonials', ...adminAuth, require('./routes/testimonials'));
app.use('/api/admin/messages', ...adminAuth, require('./routes/messages'));
app.use('/api/admin/events', ...adminAuth, require('./routes/events'));
app.use('/api/admin/programmes', ...adminAuth, require('./routes/programmes'));
app.use('/api/admin/gallery', ...adminAuth, require('./routes/gallery'));
app.use('/api/admin/doctors', ...adminAuth, requireFeature('doctors'), require('./routes/doctors'));
app.use('/api/admin/providers', ...adminAuth, require('./routes/providers'));
app.use('/api/admin/partners', ...adminAuth, require('./routes/partners'));
app.use('/api/admin/service-categories', ...adminAuth, require('./routes/serviceCategories').router);
app.use('/api/admin/appointments', ...adminAuth, require('./routes/appointments'));
app.use('/api/admin/patients', ...adminAuth, requireFeature('patient_portal'), require('./routes/patients'));
app.use('/api/admin/notifications', ...adminAuth, require('./routes/adminNotifications'));
app.use('/api/admin/revisions', ...adminAuth, require('./routes/revisions'));
app.use('/api/admin/contacts', ...adminAuth, require('./routes/contacts'));
app.use('/api/admin/ecosystem', ...adminAuth, require('./routes/ecosystem'));
app.use('/api/admin/analytics', ...adminAuth, require('./routes/analytics'));
app.use('/api/admin/dashboard', ...adminAuth, require('./routes/dashboard'));
app.use('/api/admin/features', ...adminAuth, require('./routes/features').router);
app.use('/api/admin/audit-logs', ...adminAuth, require('./routes/features').auditRouter);
app.use('/api/admin/payments', ...adminAuth, paymentsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/blog', (req, res) => {
  res.redirect(301, '/newsroom');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (Sentry) Sentry.captureException(err);
  console.error(`[${req.id || 'no-id'}]`, err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  db.ready.then(() => {
    app.listen(PORT, () => {
      console.log(`Bodija Health Hub server running on port ${PORT}`);
      startScheduler();
    });
  }).catch((err) => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });
}

module.exports = app;
