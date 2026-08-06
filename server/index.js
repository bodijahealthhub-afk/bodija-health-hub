require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

require('./models/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(process.env.UPLOADS_DIR || path.join(__dirname, 'uploads')));

// Public routes
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
app.use('/api/site-content', require('./routes/siteContent'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/page-content', require('./routes/pageContent'));
app.use('/api/careers', require('./routes/careers'));
app.use('/api/upcoming-registrations', require('./routes/upcoming'));
app.use('/api/search', require('./routes/search'));

// Admin routes
app.use('/api/admin/site-content', require('./routes/siteContent'));
app.use('/api/admin/page-content', require('./routes/pageContent'));
app.use('/api/admin/media', require('./routes/media'));
app.use('/api/admin/seo', require('./routes/seo'));
app.use('/api/admin/backups', require('./routes/backup'));
app.use('/api/admin/site-settings', require('./routes/siteSettings'));
app.use('/api/admin/services', require('./routes/services'));
app.use('/api/admin/blog', require('./routes/blog'));
app.use('/api/admin/testimonials', require('./routes/testimonials'));
app.use('/api/admin/messages', require('./routes/messages'));
app.use('/api/admin/events', require('./routes/events'));
app.use('/api/admin/gallery', require('./routes/gallery'));
app.use('/api/admin/doctors', require('./routes/doctors'));
app.use('/api/admin/appointments', require('./routes/appointments'));
app.use('/api/admin/patients', require('./routes/patients'));
app.use('/api/admin/notifications', require('./routes/notifications'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Bodija Health Hub server running on port ${PORT}`);
});

module.exports = app;
