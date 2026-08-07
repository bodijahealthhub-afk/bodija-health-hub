const db = require('../models/database');

const IMPORTABLE_TABLES = [
  'services',
  'blog_posts',
  'events',
  'gallery',
  'testimonials',
  'contact_info',
  'site_content',
  'page_sections',
  'media',
  'seo_settings',
  'site_settings',
];

const ALL_TABLES = [
  'users',
  'doctors',
  'services',
  'appointments',
  'patients',
  'blog_posts',
  'events',
  'gallery',
  'testimonials',
  'messages',
  'newsletter_subscribers',
  'contact_info',
  'site_content',
  'page_sections',
  'media',
  'seo_settings',
  'site_settings',
  'backups',
  'career_applications',
  'upcoming_registrations',
];

const exportAll = async () => {
  const data = {};
  for (const table of ALL_TABLES) {
    data[table] = await db.prepare(`SELECT * FROM ${table}`).all();
  }
  return { export_date: new Date().toISOString(), data };
};

const importData = async (data) => {
  if (!data || typeof data !== 'object') return;
  if (db.backend === 'sqlite') db.pragma('foreign_keys = OFF');
  try {
    await db.transaction(async () => {
      for (const table of IMPORTABLE_TABLES) {
        if (data[table] && Array.isArray(data[table])) {
          for (const row of data[table]) {
            const columns = Object.keys(row).filter((c) => c !== 'id');
            if (columns.length === 0) continue;
            const placeholders = columns.map(() => '?').join(', ');
            const values = columns.map((c) => row[c]);
            try {
              await db.prepare(`INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`).run(...values);
            } catch (e) { /* skip errors */ }
          }
        }
      }
    });
  } finally {
    if (db.backend === 'sqlite') db.pragma('foreign_keys = ON');
  }
};

module.exports = { exportAll, importData };
