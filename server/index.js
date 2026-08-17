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

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = (process.env.CORS_ORIGINS ||
  'https://client-six-eta-66.vercel.app,https://client-nt8gk3ac6-team-bhh.vercel.app,http://localhost:5173,http://localhost:3000'
).split(',').map((s) => s.trim()).filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
}));

app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  },
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
app.use('/api/messages', publicWriteLimiter);
app.use('/api/newsletter', publicWriteLimiter);
app.use('/api/appointments', publicWriteLimiter);
app.use('/api/careers', publicWriteLimiter);
app.use('/api/upcoming-registrations', publicWriteLimiter);

app.use('/uploads', express.static(process.env.UPLOADS_DIR || path.join(__dirname, 'uploads')));

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
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/services', require('./routes/services'));
app.use('/api/providers', require('./routes/providers'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/patients', require('./routes/patients'));
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
app.use('/api/admin/payments', paymentsRouter);
app.use('/api/patient', require('./routes/patient'));

// Admin routes
app.use('/api/admin/site-content', require('./routes/siteContent'));
app.use('/api/admin/page-content', require('./routes/pageContent'));
app.use('/api/admin/media', require('./routes/media'));
app.use('/api/admin/seo', require('./routes/seo'));
app.use('/api/admin/backups', require('./routes/backup'));
app.use('/api/admin/system-health', require('./routes/systemHealth'));
app.use('/api/admin/site-settings', require('./routes/siteSettings'));
app.use('/api/admin/services', require('./routes/services'));
app.use('/api/admin/blog', require('./routes/blog'));
app.use('/api/admin/testimonials', require('./routes/testimonials'));
app.use('/api/admin/messages', require('./routes/messages'));
app.use('/api/admin/events', require('./routes/events'));
app.use('/api/admin/programmes', require('./routes/programmes'));
app.use('/api/admin/gallery', require('./routes/gallery'));
app.use('/api/admin/doctors', require('./routes/doctors'));
app.use('/api/admin/providers', require('./routes/providers'));
app.use('/api/admin/partners', require('./routes/partners'));
app.use('/api/admin/service-categories', require('./routes/serviceCategories').router);
app.use('/api/admin/appointments', require('./routes/appointments'));
app.use('/api/admin/patients', require('./routes/patients'));
app.use('/api/admin/notifications', require('./routes/notifications'));
app.use('/api/admin/dashboard', require('./routes/dashboard'));
app.use('/api/admin/features', require('./routes/features').router);
app.use('/api/admin/audit-logs', require('./routes/features').auditRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (Sentry) Sentry.captureException(err);
  console.error(err.stack);
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
