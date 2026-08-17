const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
// Load .env from project root (works for both local and Render)
const rootDir = path.resolve(__dirname, '../..');
require('dotenv').config({ path: path.join(rootDir, '.env') });

const backend = process.env.DATABASE_URL
  ? 'postgres'
  : process.env.DB_BACKEND === 'pglite'
    ? 'pglite'
    : 'sqlite';

const impl = backend === 'postgres'
  ? require('./pgDb')
  : backend === 'pglite'
    ? require('./pgliteDb')
    : require('./sqliteDb');

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'receptionist' CHECK(role IN ('admin','receptionist','doctor','content_manager','accountant','super_admin')),
    avatar TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    bio TEXT,
    experience_years INTEGER DEFAULT 0,
    photo TEXT,
    department TEXT,
    available_days TEXT DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    consultation_fee REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    short_description TEXT,
    description TEXT,
    category TEXT,
    price REAL DEFAULT 0,
    image TEXT,
    icon TEXT,
    featured INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    booking_type TEXT,
    booking_url TEXT,
    provider_id INTEGER REFERENCES providers(id),
    location TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS service_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    provider_type TEXT DEFAULT 'BHH' CHECK(provider_type IN ('BHH','PARTNER','INDEPENDENT','EXTERNAL')),
    description TEXT,
    logo TEXT,
    location TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    services_offered TEXT,
    booking_method TEXT DEFAULT 'BHH_MANAGED' CHECK(booking_method IN ('BHH_MANAGED','PARTNER_REQUEST','EXTERNAL')),
    booking_url TEXT,
    external_booking_url TEXT,
    featured INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    partner_id INTEGER REFERENCES partners(id),
    config TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    partner_type TEXT DEFAULT 'healthcare',
    description TEXT,
    logo TEXT,
    location TEXT,
    website TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    services_offered TEXT,
    featured INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    config TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_reference TEXT UNIQUE,
    booking_type TEXT DEFAULT 'appointment' CHECK(booking_type IN ('appointment','partner_appointment','programme','event','training','external')),
    category TEXT,
    patient_name TEXT NOT NULL,
    patient_email TEXT,
    patient_phone TEXT,
    patient_age INTEGER,
    doctor_id INTEGER REFERENCES doctors(id),
    service_id INTEGER REFERENCES services(id),
    provider_id INTEGER REFERENCES providers(id),
    provider_type TEXT DEFAULT 'BHH',
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    preferred_date TEXT,
    preferred_time TEXT,
    booking_method TEXT DEFAULT 'BHH_MANAGED' CHECK(booking_method IN ('BHH_MANAGED','PARTNER_REQUEST','EXTERNAL')),
    external_booking_url TEXT,
    contact_method TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','requested','confirmed','completed','cancelled','declined','expired','archived')),
    payment_status TEXT DEFAULT 'not_required' CHECK(payment_status IN ('not_required','unpaid','pending','paid','failed','refunded')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    age INTEGER,
    gender TEXT,
    address TEXT,
    blood_group TEXT,
    medical_history TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    category TEXT,
    featured_image TEXT,
    author_id INTEGER REFERENCES users(id),
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft','published')),
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    location TEXT,
    image TEXT,
    type TEXT DEFAULT 'event' CHECK(type IN ('outreach','screening','event')),
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS programmes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    schedule TEXT,
    frequency TEXT,
    location TEXT,
    image TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    image_url TEXT NOT NULL,
    category TEXT,
    album TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK(rating BETWEEN 1 AND 5),
    photo TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contact_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS page_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    title TEXT,
    content TEXT,
    image TEXT,
    button_text TEXT,
    button_link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    category TEXT DEFAULT 'general',
    size INTEGER DEFAULT 0,
    mime_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS seo_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id TEXT UNIQUE NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    twitter_card TEXT DEFAULT 'summary_large_image',
    twitter_title TEXT,
    twitter_description TEXT,
    twitter_image TEXT,
    canonical TEXT,
    noindex INTEGER DEFAULT 0,
    nofollow INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    size INTEGER DEFAULT 0,
    created_by TEXT,
    data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS career_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    position TEXT NOT NULL,
    cover_letter TEXT,
    status TEXT DEFAULT 'new' CHECK(status IN ('new','reviewing','shortlisted','rejected','hired')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS upcoming_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    area_of_interest TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT UNIQUE NOT NULL,
    appointment_id INTEGER REFERENCES appointments(id),
    email TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'NGN',
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','paid','failed','cancelled')),
    paystack_reference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS patient_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    patient_id INTEGER REFERENCES patients(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS feature_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'disabled' CHECK(status IN ('active','draft','coming_soon','disabled','archived')),
    enabled INTEGER NOT NULL DEFAULT 0,
    public_visible INTEGER NOT NULL DEFAULT 1,
    navigation_visible INTEGER NOT NULL DEFAULT 1,
    admin_visible INTEGER NOT NULL DEFAULT 1,
    requires_admin_confirmation INTEGER NOT NULL DEFAULT 0,
    config TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    actor TEXT,
    before_state TEXT,
    after_state TEXT,
    ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

async function insertUsers() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const isHosted = process.env.NODE_ENV === 'production' || Boolean(process.env.DATABASE_URL);
  if (!adminEmail || !adminPassword) {
    if (isHosted) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required in production');
    }
    console.warn('[seed] ADMIN_EMAIL/ADMIN_PASSWORD not set — using default dev credentials (production will fail fast).');
  }
  const seededAdminEmail = adminEmail || 'admin@bodijahealthhub.com';
  const seededAdminPassword = adminPassword || 'admin123';
  const adminHash = bcrypt.hashSync(seededAdminPassword, 10);

  await db.prepare('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)').run(
    'Admin User', seededAdminEmail, adminHash, 'admin', '+234 801 234 5678'
  );
}

async function insertContentDefaults() {
  // NOTE: No fake services, blog posts, or testimonials are seeded.
  // The spec requires real, admin-created content only — fresh installs start with
  // empty content (empty states) rather than fabricated entries.

  const insertContact = db.prepare('INSERT INTO contact_info (key, value) VALUES (?, ?)');
  await insertContact.run('phone', '+234 801 234 5678');
  await insertContact.run('email', 'info@bodijahealthhub.com');
  await insertContact.run('address', '12 Bodija Road, Ibadan, Oyo State, Nigeria');
  await insertContact.run('facebook', 'https://facebook.com/bodijahealthhub');
  await insertContact.run('twitter', 'https://twitter.com/bodijahealthhub');
  await insertContact.run('instagram', 'https://instagram.com/bodijahealthhub');
  await insertContact.run('whatsapp', '+234 801 234 5678');
  await insertContact.run('opening_hours', 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM');

  const insertSiteContent = db.prepare('INSERT OR IGNORE INTO site_content (key, value) VALUES (?, ?)');
  const siteContentDefaults = [
    ['hero_headline', 'Quality Healthcare for Every Family'],
    ['hero_subtext', 'Bodija Health Hub provides comprehensive, compassionate healthcare services in the heart of Ibadan. Your well-being is our priority.'],
    ['hero_cta1_text', 'Book Appointment'],
    ['hero_cta1_link', '/appointments'],
    ['hero_cta2_text', 'Our Services'],
    ['hero_cta2_link', '/services'],
    ['hero_image', ''],
    ['about_headline', 'A Healthcare Ecosystem, Not Just a Clinic'],
    ['about_description', 'Bodija Health Hub is an integrated healthcare network designed to ensure that patients receive coordinated, comprehensive care at every stage of their health journey.\n\nBy connecting primary care, specialist consultations, diagnostics, therapy, and digital health solutions under one umbrella, we eliminate the gaps that often leave families navigating the healthcare system alone.\n\nOur model is built on the belief that when healthcare providers, specialists, and digital platforms work in harmony, patients don\'t just get treated — they get cared for, consistently and completely.'],
    ['about_mission', 'To build and sustain an integrated healthcare network that brings together clinics, specialists, diagnostics, therapy, and digital health solutions — making quality, coordinated care accessible to every individual and family in our community.'],
    ['about_vision', 'To be the most trusted integrated healthcare ecosystem in Ibadan and beyond — where every family has access to connected, continuous, and compassionate care.'],
    ['ecosystem_headline', 'One Hub. Many Hands. Whole-Person Care.'],
    ['ecosystem_description', 'Care doesn\'t exist in isolation — and neither should the systems that support it. At Bodija Health Hub, we\'ve built an ecosystem where every service connects, every specialist coordinates, and every patient benefits from truly integrated healthcare.'],
    ['partners_headline', 'Our Partner Network'],
    ['partners_description', 'The Bodija Health Hub ecosystem is powered by a network of specialized healthcare organizations — each bringing expertise, trust, and commitment to community wellness.'],
    ['platforms_headline', 'Our Platforms'],
    ['platforms_description', 'BHH is building and supporting digital solutions that extend the reach of quality care beyond clinic walls — connecting patients to providers, families to peace of mind, and communities to wellness.'],
    ['contact_headline', 'Ready to Be Part of Something Bigger?'],
    ['contact_description', 'Whether you\'re a patient, a family member, a healthcare provider, or a caregiver — we\'re here to connect you with the care, the partners, and the community you need.'],
    ['contact_phone', '+234 801 234 5678'],
    ['contact_email', 'info@bodijahealthhub.com'],
    ['contact_address', '12 Bodija Road, Ibadan, Oyo State, Nigeria'],
    ['contact_whatsapp', '+234 801 234 5678'],
    ['contact_hours', 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM'],
    ['footer_tagline', 'Your Trusted Healthcare Partner in Ibadan. Providing compassionate, comprehensive medical services for individuals and families.'],
    ['footer_copyright', '© 2025 Bodija Health Hub. All rights reserved.'],
    ['welcome_modal_title', 'Welcome to Bodija Health Hub'],
    ['welcome_modal_subtitle', 'Discover quality, coordinated healthcare for your whole family — right here in the heart of Ibadan.'],
    ['welcome_modal_cta_text', 'Explore Our Services'],
    ['welcome_modal_cta_link', '/services'],
    ['footer_quick_links', JSON.stringify([
      { label: 'Home', url: '/' },
      { label: 'About Us', url: '/about' },
      { label: 'Services', url: '/services' },
      { label: 'Blog', url: '/blog' },
      { label: 'Contact', url: '/contact' },
    ])],
    ['footer_platform_links', JSON.stringify([
      { label: 'LiveCare', url: '/platforms/livecare' },
      { label: 'hEar Menders', url: '/platforms/hear-menders' },
    ])],
    ['footer_social_links', JSON.stringify({
      facebook: 'https://facebook.com/bodijahealthhub',
      instagram: 'https://instagram.com/bodijahealthhub',
      twitter: 'https://twitter.com/bodijahealthhub',
      linkedin: 'https://linkedin.com/company/bodijahealthhub',
      youtube: '',
    })],
    ['seo_title', 'Bodija Health Hub - Quality Healthcare in Ibadan'],
    ['seo_description', 'Bodija Health Hub provides comprehensive healthcare services including general consultation, audiology, laboratory services, and more in Ibadan, Nigeria.'],
    ['seo_keywords', 'healthcare, hospital, Ibadan, Nigeria, doctor, consultation, audiology, laboratory'],
    ['nav_logo', ''],
    ['nav_logo_text', 'Bodija Health Hub'],
    ['nav_links', JSON.stringify([
      { label: 'Home', url: '/' },
      { label: 'About Us', url: '/about' },
      { label: 'The Ecosystem', url: '/ecosystem' },
      { label: 'Our Partners', url: '/partners' },
      { label: 'Our Platforms', url: '/platforms' },
      { label: 'Events', url: '/events' },
      { label: 'Programmes', url: '/programmes' },
      { label: 'Upcoming Projects', url: '/upcoming' },
      { label: 'Contact Us', url: '/contact' },
    ])],
    ['nav_cta_text', 'Get Started'],
    ['nav_cta_url', '/contact'],
    ['nav_phone', '+234 801 234 5678'],
  ];
  for (const [key, value] of siteContentDefaults) {
    await insertSiteContent.run(key, value);
  }

  const insertSeo = db.prepare('INSERT OR IGNORE INTO seo_settings (page_id, meta_title, meta_description, canonical) VALUES (?, ?, ?, ?)');
  const seoPages = [
    ['home', 'Bodija Health Hub - Quality Healthcare in Ibadan', 'Bodija Health Hub provides comprehensive healthcare services in Ibadan, Nigeria.', 'https://bodijahealthhub.com/'],
    ['about', 'About Us - Bodija Health Hub', 'Learn about Bodija Health Hub, an integrated healthcare network in Ibadan.', 'https://bodijahealthhub.com/about'],
    ['services', 'Our Services - Bodija Health Hub', 'Explore our comprehensive healthcare services.', 'https://bodijahealthhub.com/services'],
    ['events', 'Events - Bodija Health Hub', 'Health talks, screenings and events at Bodija Health Hub.', 'https://bodijahealthhub.com/events'],
    ['programmes', 'Programmes - Bodija Health Hub', 'Community programmes and initiatives at Bodija Health Hub.', 'https://bodijahealthhub.com/programmes'],
    ['platforms', 'Our Platforms - Bodija Health Hub', 'Discover our digital health platforms.', 'https://bodijahealthhub.com/platforms'],
    ['blog', 'Blog - Bodija Health Hub', 'Health tips and news from our experts.', 'https://bodijahealthhub.com/blog'],
    ['contact', 'Contact Us - Bodija Health Hub', 'Get in touch with Bodija Health Hub.', 'https://bodijahealthhub.com/contact'],
    ['ecosystem', 'The Ecosystem - Bodija Health Hub', 'Our connected healthcare ecosystem.', 'https://bodijahealthhub.com/ecosystem'],
    ['partners', 'Our Partners - Bodija Health Hub', 'Meet our healthcare partner network.', 'https://bodijahealthhub.com/partners'],
    ['careers', 'Careers - Bodija Health Hub', 'Join our team at Bodija Health Hub.', 'https://bodijahealthhub.com/careers'],
    ['faq', 'FAQ - Bodija Health Hub', 'Frequently asked questions.', 'https://bodijahealthhub.com/faq'],
  ];
  for (const [pageId, title, desc, canonical] of seoPages) {
    await insertSeo.run(pageId, title, desc, canonical);
  }

  const insertSiteSetting = db.prepare('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)');
  const siteSettingsDefaults = [
    ['site_name', 'Bodija Health Hub'],
    ['site_tagline', 'Your Trusted Healthcare Partner'],
    ['site_logo', ''],
    ['site_favicon', ''],
    ['primary_color', '#0D9488'],
    ['secondary_color', '#0F766E'],
    ['accent_color', '#14B8A6'],
    ['background_color', '#FFFFFF'],
    ['text_color', '#1F2937'],
    ['seo_meta_title', 'Bodija Health Hub - Quality Healthcare in Ibadan'],
    ['seo_meta_description', 'Bodija Health Hub provides comprehensive healthcare services including general consultation, audiology, laboratory services, and more in Ibadan, Nigeria.'],
    ['seo_keywords', 'healthcare, hospital, Ibadan, Nigeria, doctor, consultation, audiology, laboratory'],
    ['social_image', ''],
    ['analytics_id', ''],
    ['maintenance_mode', 'false'],
  ];
  for (const [key, value] of siteSettingsDefaults) {
    await insertSiteSetting.run(key, value);
  }
}

async function insertProviderSeeds() {
  const count = await db.prepare('SELECT COUNT(*) as count FROM providers').get();
  if (count.count > 0) return;

  const insert = db.prepare(`INSERT INTO providers
    (name, slug, provider_type, description, location, booking_method, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  await insert.run(
    'Bodija Health Hub (BHH)',
    'bodija-health-hub',
    'BHH',
    'Bodija Health Hub is a health and wellness ecosystem hub in Ibadan connecting the community with quality healthcare services, programmes, training, and partner providers.',
    'Ibadan, Oyo State',
    'BHH_MANAGED',
    1
  );
}

const APPOINTMENT_NEW_SCHEMA = `
  CREATE TABLE appointments_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_reference TEXT UNIQUE,
    booking_type TEXT DEFAULT 'appointment' CHECK(booking_type IN ('appointment','partner_appointment','programme','event','training','external')),
    category TEXT,
    patient_name TEXT NOT NULL,
    patient_email TEXT,
    patient_phone TEXT,
    patient_age INTEGER,
    doctor_id INTEGER REFERENCES doctors(id),
    service_id INTEGER REFERENCES services(id),
    provider_id INTEGER REFERENCES providers(id),
    provider_type TEXT DEFAULT 'BHH',
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    preferred_date TEXT,
    preferred_time TEXT,
    booking_method TEXT DEFAULT 'BHH_MANAGED' CHECK(booking_method IN ('BHH_MANAGED','PARTNER_REQUEST','EXTERNAL')),
    external_booking_url TEXT,
    contact_method TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','requested','confirmed','completed','cancelled','declined','expired','archived')),
    payment_status TEXT DEFAULT 'not_required' CHECK(payment_status IN ('not_required','unpaid','pending','paid','failed','refunded')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

async function migrateBookings() {
  if (db.backend === 'sqlite') {
    const cols = await db.prepare('PRAGMA table_info(appointments)').all();
    if (cols.some((c) => c.name === 'booking_type')) return;

    db.pragma('foreign_keys = OFF');
    try {
      await db.transaction(async () => {
        await db.prepare(APPOINTMENT_NEW_SCHEMA).run();
        await db.prepare(`
          INSERT INTO appointments_new (
            id, patient_name, patient_email, patient_phone, patient_age,
            doctor_id, service_id, date, time, status, notes, payment_status, created_at
          )
          SELECT id, patient_name, patient_email, patient_phone, patient_age,
            doctor_id, service_id, date, time, status, notes, payment_status, created_at
          FROM appointments
        `).run();
        await db.prepare('DROP TABLE appointments').run();
        await db.prepare('ALTER TABLE appointments_new RENAME TO appointments').run();
      });
    } finally {
      db.pragma('foreign_keys = ON');
    }
    return;
  }

  const col = await db.prepare(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'booking_type'"
  ).get();
  if (col) return;

  await db.transaction(async () => {
    const adds = [
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS booking_reference TEXT',
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'appointment'",
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS category TEXT',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS provider_id INTEGER REFERENCES providers(id)',
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS provider_type TEXT DEFAULT 'BHH'",
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS preferred_date TEXT',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS preferred_time TEXT',
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS booking_method TEXT DEFAULT 'BHH_MANAGED'",
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS external_booking_url TEXT',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS contact_method TEXT',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    ];
    for (const stmt of adds) await db.prepare(stmt).run();
    await db.prepare('ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check').run();
    await db.prepare('ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_payment_status_check').run();
    await db.prepare("ALTER TABLE appointments ALTER COLUMN payment_status SET DEFAULT 'not_required'").run();
  });
}

// Phase 3 migration: adds CMS fields (slug, featured, display order, booking links,
// location, partner association) to services and providers, plus the
// service_categories table. Runs on every init and is idempotent.
const PHASE3_COLUMNS = {
  services: [
    { name: 'slug', ddl: 'TEXT' },
    { name: 'short_description', ddl: 'TEXT' },
    { name: 'featured', ddl: 'INTEGER DEFAULT 0' },
    { name: 'display_order', ddl: 'INTEGER DEFAULT 0' },
    { name: 'booking_type', ddl: 'TEXT' },
    { name: 'booking_url', ddl: 'TEXT' },
    { name: 'provider_id', ddl: 'INTEGER REFERENCES providers(id)' },
    { name: 'location', ddl: 'TEXT' },
  ],
  providers: [
    { name: 'slug', ddl: 'TEXT' },
    { name: 'services_offered', ddl: 'TEXT' },
    { name: 'featured', ddl: 'INTEGER DEFAULT 0' },
    { name: 'display_order', ddl: 'INTEGER DEFAULT 0' },
  ],
};

async function migratePhase3() {
  if (db.backend === 'sqlite') {
    for (const [table, cols] of Object.entries(PHASE3_COLUMNS)) {
      const existing = new Set((await db.prepare(`PRAGMA table_info(${table})`).all()).map((c) => c.name));
      for (const col of cols) {
        if (!existing.has(col.name)) {
          await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${col.name} ${col.ddl}`).run();
        }
      }
    }
    return;
  }

  // Postgres / PGlite
  for (const [table, cols] of Object.entries(PHASE3_COLUMNS)) {
    for (const col of cols) {
      const type = col.ddl.includes('INTEGER') ? 'INTEGER DEFAULT 0'
        : col.ddl.includes('REFERENCES') ? 'INTEGER'
          : 'TEXT';
      await db.prepare(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col.name} ${type}`).run();
    }
  }
}

// Ensures SEO entries exist for pages added after the original seed (events, programmes)
// so the sitemap and SEO admin can manage them. Idempotent — runs on every init.
async function migrateSeoSettings() {
  const insertSeo = db.prepare('INSERT OR IGNORE INTO seo_settings (page_id, meta_title, meta_description, canonical) VALUES (?, ?, ?, ?)');
  const seoPages = [
    ['events', 'Events - Bodija Health Hub', 'Health talks, screenings and events at Bodija Health Hub.', 'https://bodijahealthhub.com/events'],
    ['programmes', 'Programmes - Bodija Health Hub', 'Community programmes and initiatives at Bodija Health Hub.', 'https://bodijahealthhub.com/programmes'],
  ];
  for (const [pageId, title, desc, canonical] of seoPages) {
    await insertSeo.run(pageId, title, desc, canonical);
  }
}

// Adds the partner_id FK to providers on databases created before the Partners module.
async function migratePartnersLink() {
  if (db.backend === 'sqlite') {
    const cols = await db.prepare('PRAGMA table_info(providers)').all();
    if (!cols.some((c) => c.name === 'partner_id')) {
      await db.prepare('ALTER TABLE providers ADD COLUMN partner_id INTEGER REFERENCES partners(id)').run();
    }
    return;
  }
  await db.prepare('ALTER TABLE providers ADD COLUMN IF NOT EXISTS partner_id INTEGER').run();
}

async function seedIfEmpty() {
  const userCount = await db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    await insertUsers();
    await insertContentDefaults();
  }
  await insertProviderSeeds();
  await insertFeatureFlags();
  await insertAuditSeeds();
}

const featureFlagSeeds = [
  { key: 'appointments', name: 'Appointments & Scheduling (Legacy)', description: 'Legacy doctor-based booking form — superseded by appointment_booking.', status: 'archived', enabled: 0, public_visible: 0, navigation_visible: 0 },
  { key: 'doctors', name: 'Doctors Directory (Future)', description: 'Doctor directory and profiles — future module, not presented publicly.', status: 'archived', enabled: 0, public_visible: 0, navigation_visible: 0 },
  { key: 'appointment_booking', name: 'Book a Service / Appointment', description: 'Request-based booking for BHH services, partner providers, programmes, events, and training.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 1, requires_admin_confirmation: 1, config: '{"mode":"request_based"}' },
  { key: 'programme_registration', name: 'Programme Registration', description: 'Registration for BHH community programmes and initiatives.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 1 },
  { key: 'event_registration', name: 'Event Registration', description: 'Registration for BHH events and health talks.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 0 },
  { key: 'training_registration', name: 'Training Registration', description: 'Registration for BHH trainings and capacity-building programmes.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 0 },
  { key: 'external_partner_booking', name: 'External Partner Booking', description: 'Route bookings to partner external booking portals when enabled.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 0 },
  { key: 'contact_form', name: 'Contact & Inquiry Form', description: 'Contact page form for patient inquiries.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 0 },
  { key: 'welcome_modal', name: 'Welcome Popup', description: 'Show a welcome popup on the homepage for first-time visitors.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 0 },
  { key: 'home_hero', name: 'Homepage Hero Section', description: 'Show the hero banner on the homepage.', status: 'active', enabled: 1, public_visible: 0, navigation_visible: 0 },
  { key: 'services', name: 'Services Section', description: 'Show the services section and services page.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 1 },
  { key: 'cta_section', name: 'Call-to-Action Sections', description: 'Show call-to-action banners across the site.', status: 'active', enabled: 1, public_visible: 0, navigation_visible: 0 },
  { key: 'ecosystem_section', name: 'Ecosystem Section', description: 'Show the about-ecosystem and core values sections on the homepage.', status: 'active', enabled: 1, public_visible: 0, navigation_visible: 0 },
  { key: 'partners_section', name: 'Partner Network Section', description: 'Show the partner network section on the homepage.', status: 'active', enabled: 1, public_visible: 0, navigation_visible: 0 },
  { key: 'platforms_section', name: 'Platforms Section', description: 'Show the platforms section on the homepage.', status: 'active', enabled: 1, public_visible: 0, navigation_visible: 0 },
  { key: 'upcoming_projects', name: 'Upcoming Projects', description: 'Upcoming projects page and section.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 1 },
  { key: 'blog', name: 'Blog & News', description: 'Blog and news section.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 1 },
  { key: 'events', name: 'Events', description: 'Events and health talk schedules.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 1 },
  { key: 'testimonials', name: 'Testimonials', description: 'Patient testimonials section.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 0 },
  { key: 'gallery', name: 'Gallery', description: 'Facility photo gallery.', status: 'draft', enabled: 0, public_visible: 0, navigation_visible: 0 },
  { key: 'careers', name: 'Careers', description: 'Careers page and job listings.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 1 },
  { key: 'faq', name: 'FAQ', description: 'Frequently asked questions section.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 1 },
  { key: 'newsletter', name: 'Newsletter Signup', description: 'Email newsletter signup form in the footer.', status: 'active', enabled: 1, public_visible: 0, navigation_visible: 0 },
  { key: 'payment_system', name: 'Payment System', description: 'Online payment processing for bookings and services.', status: 'disabled', enabled: 0, public_visible: 0, navigation_visible: 0, requires_admin_confirmation: 1 },
  { key: 'patient_portal', name: 'Patient Portal', description: 'Patient portal for bookings, records, and messaging.', status: 'archived', enabled: 0, public_visible: 0, navigation_visible: 0 },
  { key: 'audio_consultation', name: 'Audio Consultation', description: 'Audio consultation service.', status: 'coming_soon', enabled: 0, public_visible: 1, navigation_visible: 0 },
  { key: 'video_consultation', name: 'Video Consultation', description: 'Video consultation service.', status: 'coming_soon', enabled: 0, public_visible: 1, navigation_visible: 0 },
  { key: 'chatbot', name: 'Chatbot Support', description: 'AI-powered chatbot for visitor support.', status: 'draft', enabled: 0, public_visible: 0, navigation_visible: 0 },
  { key: 'livecare', name: 'LiveCare Platform', description: 'LiveCare telemedicine platform.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 1, config: '{"launchDate":""}' },
  { key: 'hear_menders', name: 'hEar Menders Platform', description: 'hEar Menders hearing care platform.', status: 'active', enabled: 1, public_visible: 1, navigation_visible: 1 },
];
async function insertFeatureFlags() {
  // Upsert (not INSERT OR IGNORE) so the seed remains the authoritative baseline and
  // existing databases self-heal drift (e.g. a flag toggled off that should be on).
  const insert = db.prepare(
    `INSERT INTO feature_flags (key, name, description, status, enabled, public_visible, navigation_visible, admin_visible, requires_admin_confirmation, config) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       name = excluded.name,
       description = excluded.description,
       status = excluded.status,
       enabled = excluded.enabled,
       public_visible = excluded.public_visible,
       navigation_visible = excluded.navigation_visible,
       admin_visible = excluded.admin_visible,
       requires_admin_confirmation = excluded.requires_admin_confirmation,
       config = excluded.config`
  );
  for (const f of featureFlagSeeds) {
    await insert.run(f.key, f.name, f.description, f.status, f.enabled, f.public_visible, f.navigation_visible, f.admin_visible !== undefined ? f.admin_visible : 1, f.requires_admin_confirmation || 0, f.config || null);
  }
}

async function insertAuditSeeds() {
  const auditCount = await db.prepare('SELECT COUNT(*) as count FROM audit_logs').get();
  if (auditCount.count === 0) {
    await db.prepare("INSERT INTO audit_logs (action, entity_type, entity_id, actor, after_state, ip, created_at) VALUES ('FEATURE_FLAG_INITIALIZED', 'feature_flag', 'system', 'system', 'Feature flags initialized with defaults.', 'system', '2025-01-01 00:00:00')").run();
  }
}

// ARCHIVE (not delete) any content that was created by earlier seed versions with
// fabricated data — fake doctors and fake testimonials. This is idempotent and runs on
// every init so existing databases (including production) are cleaned up safely while
// real admin-created content is left untouched.
const FAKE_DOCTOR_NAMES = [
  'Dr. Adaeze Okafor', 'Dr. Emeka Adeyemi', 'Dr. Fatima Bello',
  'Dr. Olumide Olatunji', 'Dr. Ngozi Eze', 'Dr. Tunde Bakare',
];

const FAKE_TESTIMONIALS = [
  'The audiology team at Bodija Health Hub changed my life. After years of struggling with hearing loss, I can finally enjoy conversations with my family again. The hearing aid fitting was professional and the follow-up care has been excellent.',
  'Dr. Bello is an amazing pediatrician. She is patient, thorough, and genuinely cares about her young patients. My children actually look forward to their check-ups! The facility is clean and welcoming.',
  'I have been managing my hypertension at Bodija Health Hub for two years now. The doctors are knowledgeable and the staff are always friendly. The hypertension clinic has helped me understand and control my blood pressure properly.',
  'The home care service has been a blessing for my elderly mother. The nurses are professional, compassionate, and highly skilled. It gives our family peace of mind knowing she receives quality care at home.',
  'I visited for a wellness screening and was impressed by the thoroughness of the check-up. The staff took time to explain every result and provided practical health advice. Highly recommend their preventive health services!',
];

// Baseline editorial content that an earlier seed cleanup drafted. Restored (republished)
// on every init so the newsroom is never left empty — idempotent, admin edits preserved.
const BLOG_CATALOG_SLUGS = [
  'understanding-hearing-loss', 'managing-hypertension',
  'child-health-vaccinations', 'diabetes-management',
];

async function archiveFakeSeedData() {
  const placeholders = (n) => new Array(n).fill('?').join(',');
  const doctorPh = placeholders(FAKE_DOCTOR_NAMES.length);
  await db.prepare(`UPDATE doctors SET is_active = 0 WHERE is_active = 1 AND name IN (${doctorPh})`).run(...FAKE_DOCTOR_NAMES);

  const testPh = placeholders(FAKE_TESTIMONIALS.length);
  await db.prepare(`UPDATE testimonials SET is_active = 0 WHERE is_active = 1 AND content IN (${testPh})`).run(...FAKE_TESTIMONIALS);

  const archivedCount = await db.prepare(
    "SELECT (SELECT COUNT(*) FROM doctors WHERE is_active = 0 AND name IN (" + doctorPh + ")) AS total"
  ).get(...FAKE_DOCTOR_NAMES);
  console.log(`[migrate] Archived fabricated seed content (doctors = ${archivedCount.total} affected rows).`);
}

// Restores the baseline newsroom posts that earlier seed cleanup drafted. Idempotent —
// runs on every init so production gets the posts back on next deploy.
async function republishBlogPosts() {
  const placeholders = (n) => new Array(n).fill('?').join(',');
  const ph = placeholders(BLOG_CATALOG_SLUGS.length);
  await db.prepare(`UPDATE blog_posts SET status = 'published' WHERE slug IN (${ph})`).run(...BLOG_CATALOG_SLUGS);
}

// Restores the baseline service catalog that earlier seed cleanup archived. Idempotent —
// runs on every init so existing databases (including production) get the catalog back
// on next deploy without overwriting admin edits to real services.
const SERVICE_CATALOG = [
  'General Consultation', 'Audiology', 'Hearing Tests', 'Hearing Aids',
  'Speech Therapy', 'Laboratory Services', 'Hypertension Clinic', 'Diabetes Care',
  'Kidney Care', 'Elderly Care', 'Child Health', 'Wellness Screening',
  'Home Care LiveCare', 'Preventive Health', 'Vaccination', 'Health Outreach Programs',
];

async function reactivateServiceCatalog() {
  const placeholders = (n) => new Array(n).fill('?').join(',');
  const ph = placeholders(SERVICE_CATALOG.length);
  await db.prepare(
    `UPDATE services SET is_active = 1, slug = COALESCE(slug, LOWER(REPLACE(name, ' ', '-'))) WHERE name IN (${ph})`
  ).run(...SERVICE_CATALOG);
}

async function init() {
  await impl.ready;
  if (impl.backend === 'sqlite') {
    impl.pragma('journal_mode = WAL');
    impl.pragma('foreign_keys = ON');
  }
  await impl.exec(SCHEMA);
  await migrateBookings();
  await migratePhase3();
  await migratePartnersLink();
  await migrateSeoSettings();
  await seedIfEmpty();
  await archiveFakeSeedData();
  await reactivateServiceCatalog();
  await republishBlogPosts();
}

// Reset all content to the original defaults (used by the admin backup/reset endpoint).
// Users, doctors, appointments, patients, messages, and uploads are preserved.
async function resetContentToDefaults() {
  const contentTables = [
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

  if (impl.backend === 'sqlite') db.pragma('foreign_keys = OFF');
  try {
    await db.transaction(async () => {
      for (const table of contentTables) {
        await db.prepare(`DELETE FROM ${table}`).run();
      }
    });
    await insertContentDefaults();
  } finally {
    if (impl.backend === 'sqlite') db.pragma('foreign_keys = ON');
  }
}

// Generate a URL-safe slug from a name/title (used by services, providers, and categories).
function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const db = {
  backend: impl.backend,
  prepare(sql) {
    return {
      get: (...params) => impl.get(sql, params),
      all: (...params) => impl.all(sql, params),
      run: (...params) => impl.run(sql, params),
    };
  },
  transaction: (fn) => impl.transaction(fn),
  pragma: (p) => impl.pragma(p),
  slugify,
  resetContentToDefaults,
};

db.ready = init();

module.exports = db;
