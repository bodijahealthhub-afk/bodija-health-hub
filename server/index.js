require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize database (creates tables and seeds data on first run)
require('./models/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/services', require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/events', require('./routes/events'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/settings', require('./routes/settings'));

// Content management routes (public GET, admin PUT)
app.use('/api/site-content', require('./routes/siteContent'));

// Admin-only routes
app.use('/api/admin/site-content', require('./routes/siteContent'));
app.use('/api/admin/page-content', require('./routes/pageContent'));
app.use('/api/admin/media', require('./routes/media'));
app.use('/api/admin/seo', require('./routes/seo'));
app.use('/api/admin/backups', require('./routes/backup'));
app.use('/api/admin/site-settings', require('./routes/siteSettings'));

// Public content routes for frontend pages
app.use('/api/page-content', require('./routes/pageContent'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Bodija Health Hub server running on port ${PORT}`);
});

module.exports = app;

