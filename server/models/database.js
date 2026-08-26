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

  CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    permission_id INTEGER NOT NULL REFERENCES permissions(id),
    UNIQUE(role, permission_id)
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
  const adminHash = await bcrypt.hash(seededAdminPassword, 10);

  await db.prepare('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)').run(
    'Admin User', seededAdminEmail, adminHash, 'admin', '+234 801 234 5678'
  );
}

// Syncs the admin password ONLY when both ADMIN_EMAIL and ADMIN_PASSWORD env vars
// are explicitly configured (e.g. in Render dashboard or .env). This avoids overwriting
// passwords on deployments where env vars are not set.
async function syncAdminPassword() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return;

  const admin = await db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(adminEmail);
  const newHash = await bcrypt.hash(adminPassword, 10);

  if (!admin) {
    await db.prepare('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)').run(
      'Admin User', adminEmail, newHash, 'admin', '+234 801 234 5678'
    );
    console.log(`[seed] Created admin user ${adminEmail}`);
    return;
  }

  const valid = await bcrypt.compare(adminPassword, admin.password_hash);
  if (valid) return;

  await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, admin.id);
  console.log(`[seed] Synced password hash for admin user ${adminEmail}`);
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
      { label: 'Newsroom', url: '/newsroom' },
      { label: 'Contact', url: '/contact' },
    ])],
    ['footer_platform_links', JSON.stringify([
      { label: 'LiveCare', url: '/livecare' },
      { label: 'hEar Menders', url: '/hear-menders' },
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
    ['blog', 'Newsroom - Bodija Health Hub', 'Health tips and news from our experts.', 'https://bodijahealthhub.com/newsroom'],
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

// Ensures a default admin account always exists with admin role.
// On persistent databases the original seed may have been skipped, or the email may
// have been registered via the public form with receptionist role.
// Creates the user if missing; promotes the role if non-admin. Does NOT reset the
// password — syncAdminPassword() handles that when env vars are available.
async function ensureDefaultAdmin() {
  const email = 'admin@bodijahealthhub.com';
  const existing = await db.prepare('SELECT id, role FROM users WHERE email = ?').get(email);

  if (!existing) {
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const hash = await bcrypt.hash(password, 10);
    await db.prepare('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)').run(
      'Admin User', email, hash, 'admin', '+234 801 234 5678'
    );
    console.log(`[seed] Created default admin user ${email}`);
    return;
  }

  if (existing.role !== 'admin' && existing.role !== 'super_admin') {
    await db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', existing.id);
    console.log(`[seed] Promoted ${email} to admin role`);
  }
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

// Baseline editorial content that ensures the newsroom is never empty on fresh DBs.
// INSERT OR IGNORE adds missing posts; UPDATE republishes any that were drafted.
const BLOG_CATALOG = [
  {
    title: 'Understanding Hearing Loss: Causes, Signs, and Solutions',
    slug: 'understanding-hearing-loss',
    category: 'Audiology',
    excerpt: 'Hearing loss affects millions of people worldwide, yet many suffer in silence. Learn about the causes, early warning signs, and modern treatment options available at Bodija Health Hub.',
    content: `<h2>What is Hearing Loss?</h2>
<p>Hearing loss is a partial or total inability to hear. It can affect one or both ears and may come on gradually or suddenly. At Bodija Health Hub, we see patients across all age groups — from children with congenital hearing issues to elderly patients experiencing age-related decline.</p>

<h2>Common Causes</h2>
<ul>
<li><strong>Age-related:</strong> Presbycusis affects most people over 60 to some degree</li>
<li><strong>Noise exposure:</strong> Prolonged exposure to loud sounds damages hair cells in the inner ear</li>
<li><strong>Infections:</strong> Ear infections, if untreated, can lead to permanent damage</li>
<li><strong>Genetics:</strong> Some forms of hearing loss run in families</li>
<li><strong>Medications:</strong> Certain drugs are ototoxic and can damage hearing</li>
</ul>

<h2>Warning Signs to Watch For</h2>
<p>Difficulty following conversations in groups, asking people to repeat themselves, turning up the TV volume, and avoiding social situations are all common signs. If you notice these, schedule a hearing test at our Audiology department.</p>

<h2>Treatment Options</h2>
<p>Modern hearing aids are smaller, smarter, and more effective than ever. Our audiologists at BHH provide comprehensive assessments and personalized fitting services. For severe cases, we coordinate with specialist partners for cochlear implant evaluations.</p>

<p><strong>Take the first step:</strong> Book a hearing assessment at Bodija Health Hub today. Early detection makes all the difference.</p>`,
  },
  {
    title: 'Managing Hypertension: Your Guide to Healthy Blood Pressure',
    slug: 'managing-hypertension',
    category: 'Chronic Care',
    excerpt: 'High blood pressure is a silent killer that affects millions of Nigerians. Discover practical strategies for monitoring and managing your blood pressure effectively.',
    content: `<h2>Why Hypertension Matters</h2>
<p>Hypertension — or high blood pressure — is one of the leading causes of heart disease, stroke, and kidney failure worldwide. In Nigeria, an estimated 30-40% of adults live with hypertension, and many don't even know it because the condition rarely shows symptoms until serious damage has occurred.</p>

<h2>What Numbers Should You Know?</h2>
<p>A normal blood pressure reading is below 120/80 mmHg. Elevated blood pressure is 120-129/less than 80. Stage 1 hypertension is 130-139/80-89, and Stage 2 is 140+/90+. A hypertensive crisis (above 180/120) requires immediate medical attention.</p>

<h2>Practical Management Strategies</h2>
<ul>
<li><strong>Monitor regularly:</strong> Check your blood pressure at home and keep a log</li>
<li><strong>Reduce salt intake:</strong> Aim for less than 5g per day — be mindful of processed foods</li>
<li><strong>Stay active:</strong> At least 30 minutes of moderate exercise most days of the week</li>
<li><strong>Manage stress:</strong> Practice relaxation techniques and ensure adequate sleep</li>
<li><strong>Take medication consistently:</strong> Never skip doses or stop without consulting your doctor</li>
</ul>

<h2>Our Hypertension Clinic</h2>
<p>Bodija Health Hub's dedicated Hypertension Clinic provides regular monitoring, medication management, lifestyle counselling, and follow-up care. Our goal is to help you achieve and maintain healthy blood pressure for life.</p>`,
  },
  {
    title: 'Child Health: Essential Vaccinations Every Parent Should Know',
    slug: 'child-health-vaccinations',
    category: 'Child Health',
    excerpt: 'Vaccinations protect your child from serious diseases. Learn about the recommended immunization schedule and why each vaccine matters.',
    content: `<h2>Why Vaccinate?</h2>
<p>Vaccines are one of the most important tools we have to protect children from serious, potentially life-threatening diseases. They work by training the immune system to recognise and fight specific pathogens without causing the actual disease.</p>

<h2>The Nigerian Childhood Immunization Schedule</h2>
<p>The National Primary Health Care Development Agency recommends vaccinations starting from birth:</p>
<ul>
<li><strong>Birth:</strong> BCG (tuberculosis), OPV-0 (polio), Hepatitis B-0</li>
<li><strong>6 weeks:</strong> OPV-1, Penta-1, PCV-1, Rotavirus-1</li>
<li><strong>10 weeks:</strong> OPV-2, Penta-2, PCV-2, Rotavirus-2</li>
<li><strong>14 weeks:</strong> OPV-3, Penta-3, PCV-3, Rotavirus-3, IPV</li>
<li><strong>9 months:</strong> Measles-Rubella-1, Yellow Fever</li>
<li><strong>15-18 months:</strong> Measles-Rubella-2, DPT booster-1</li>
</ul>

<h2>Common Concerns</h2>
<p>Many parents worry about side effects. Most reactions are mild — slight fever, redness at the injection site, or fussiness — and resolve within a day or two. Serious reactions are extremely rare. The diseases vaccines prevent are far more dangerous than any vaccine side effect.</p>

<h2>Vaccination at BHH</h2>
<p>Our Child Health clinic provides all recommended vaccinations in a safe, child-friendly environment. We maintain proper cold-chain storage and our nurses are trained in gentle, reassuring techniques for little ones.</p>`,
  },
  {
    title: 'Living Well with Diabetes: Practical Tips for Daily Management',
    slug: 'diabetes-management',
    category: 'Chronic Care',
    excerpt: 'Diabetes doesn\'t have to control your life. With the right knowledge and support, you can manage your condition and live fully.',
    content: `<h2>Understanding Diabetes</h2>
<p>Diabetes is a chronic condition where the body cannot properly process blood sugar (glucose). In Type 1 diabetes, the pancreas produces little or no insulin. In Type 2 diabetes — which accounts for about 90% of cases — the body becomes resistant to insulin or doesn't produce enough.</p>

<h2>Key Management Strategies</h2>
<h3>Monitor Your Blood Sugar</h3>
<p>Regular monitoring helps you understand how food, activity, stress, and medication affect your blood sugar levels. Check at the times your doctor recommends and keep a log to share at appointments.</p>

<h3>Eat Balanced Meals</h3>
<p>Focus on whole grains, lean proteins, vegetables, and healthy fats. Limit refined carbohydrates and sugary drinks. The "plate method" is simple: fill half your plate with vegetables, a quarter with protein, and a quarter with whole grains or starchy foods.</p>

<h3>Stay Physically Active</h3>
<p>Regular exercise helps your body use insulin more effectively. Aim for at least 150 minutes of moderate activity per week. Walking, swimming, and cycling are excellent choices.</p>

<h3>Take Medication as Prescribed</h3>
<p>Whether you take oral medications or insulin, consistency is key. Set reminders and never skip doses without consulting your doctor.</p>

<h2>Our Diabetes Care Programme</h2>
<p>Bodija Health Hub's Diabetes Care programme includes regular check-ups, blood sugar monitoring, nutritional counselling, foot care screening, and education workshops. Our multidisciplinary team works together to help you stay in control.</p>

<p><strong>Remember:</strong> Diabetes is manageable. With consistent care and the right support, you can live a full, healthy life.</p>`,
  },
];

async function republishBlogPosts() {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO blog_posts (title, slug, content, excerpt, category, status, views)
     VALUES (?, ?, ?, ?, ?, 'published', 0)`
  );
  const activate = db.prepare(
    `UPDATE blog_posts SET status = 'published' WHERE slug = ?`
  );
  for (const post of BLOG_CATALOG) {
    insert.run(post.title, post.slug, post.content, post.excerpt, post.category);
    activate.run(post.slug);
  }
  console.log(`[seed] Blog: ${BLOG_CATALOG.length} baseline newsroom posts ensured.`);
}

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

// Ensures the baseline service catalog exists and is active. On fresh databases
// the INSERT adds the rows; on existing databases the UPDATE reactivates any that
// were archived. Admin edits to name/description/price are preserved on re-deploys.
const SERVICE_CATALOG = [
  { name: 'General Consultation', category: 'Primary Care', short_description: 'Comprehensive health assessment and diagnosis by our experienced physicians.', icon: '🩺', price: 5000 },
  { name: 'Audiology', category: 'Specialist Care', short_description: 'Professional hearing assessment and treatment by certified audiologists.', icon: '👂', price: 10000 },
  { name: 'Hearing Tests', category: 'Diagnostics', short_description: 'Advanced audiometric testing to evaluate hearing sensitivity and identify hearing loss.', icon: '🔬', price: 7500 },
  { name: 'Hearing Aids', category: 'Specialist Care', short_description: 'Fitting and dispensing of modern hearing aids tailored to your needs.', icon: '🎧', price: 50000 },
  { name: 'Speech Therapy', category: 'Therapy', short_description: 'Speech and language therapy for children and adults with communication disorders.', icon: '🗣️', price: 8000 },
  { name: 'Laboratory Services', category: 'Diagnostics', short_description: 'Full range of clinical laboratory tests including blood work, urinalysis, and more.', icon: '🧪', price: 3000 },
  { name: 'Hypertension Clinic', category: 'Chronic Care', short_description: 'Specialized management and monitoring for patients with high blood pressure.', icon: '❤️', price: 5000 },
  { name: 'Diabetes Care', category: 'Chronic Care', short_description: 'Comprehensive diabetes management including monitoring, education, and lifestyle support.', icon: '💉', price: 5000 },
  { name: 'Kidney Care', category: 'Specialist Care', short_description: 'Expert nephrology services for kidney health assessment and management.', icon: '🫘', price: 15000 },
  { name: 'Elderly Care', category: 'Primary Care', short_description: 'Compassionate healthcare services designed for the unique needs of senior citizens.', icon: '🧓', price: 8000 },
  { name: 'Child Health', category: 'Primary Care', short_description: 'Pediatric care including immunizations, growth monitoring, and childhood illness treatment.', icon: '👶', price: 5000 },
  { name: 'Wellness Screening', category: 'Preventive', short_description: 'Comprehensive health check-ups and preventive screenings for early detection.', icon: '📋', price: 10000 },
  { name: 'Home Care LiveCare', category: 'Digital Health', short_description: 'Remote patient monitoring and virtual care through our LiveCare digital platform.', icon: '📱', price: 15000 },
  { name: 'Preventive Health', category: 'Preventive', short_description: 'Proactive health programmes focused on disease prevention and wellness promotion.', icon: '🛡️', price: 7000 },
  { name: 'Vaccination', category: 'Preventive', short_description: 'Full range of immunizations for children and adults following national guidelines.', icon: '💊', price: 3000 },
  { name: 'Health Outreach Programs', category: 'Community', short_description: 'Community health initiatives including free screenings, health talks, and wellness events.', icon: '🏥', price: 0 },
];

async function reactivateServiceCatalog() {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO services (name, slug, short_description, category, icon, price, is_active, display_order)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
  );
  const activate = db.prepare(
    `UPDATE services SET is_active = 1, slug = COALESCE(slug, LOWER(REPLACE(name, ' ', '-'))) WHERE name = ?`
  );
  SERVICE_CATALOG.forEach((svc, i) => {
    insert.run(svc.name, db.slugify(svc.name), svc.short_description, svc.category, svc.icon, svc.price, i);
    activate.run(svc.name);
  });
  console.log(`[seed] Service catalog: ${SERVICE_CATALOG.length} baseline services ensured.`);
}

// Baseline partners — only inserted when the partners table is empty so admin-created
// partners are never overwritten. Gives the Partners page real content on fresh DBs.
const PARTNER_CATALOG = [
  {
    name: 'Bodija Health Hub (BHH)',
    partner_type: 'healthcare',
    description: 'The central hub connecting patients with quality healthcare services, programmes, and partner providers across Ibadan.',
    location: 'Favos Junction, Bodija, Ibadan',
    services_offered: 'General Consultation,Wellness Screening,Health Outreach Programs',
    featured: 1,
  },
  {
    name: 'Ibadan Community Health Initiative',
    partner_type: 'community',
    description: 'A community-based organisation focused on preventive health education and outreach in underserved neighbourhoods across Ibadan.',
    location: 'Ibadan, Oyo State',
    services_offered: 'Health Outreach Programs,Preventive Health,Vaccination',
    featured: 1,
  },
  {
    name: 'Sunrise Hearing Centre',
    partner_type: 'specialist',
    description: 'Specialist audiology and hearing care provider offering advanced diagnostics, hearing aid fitting, and rehabilitation services.',
    location: 'Bodija, Ibadan',
    services_offered: 'Audiology,Hearing Tests,Hearing Aids',
    featured: 0,
  },
];

async function seedPartners() {
  const count = await db.prepare('SELECT COUNT(*) as count FROM partners').get();
  if (count.count > 0) return;

  const insert = db.prepare(
    `INSERT INTO partners (name, slug, partner_type, description, location, services_offered, featured, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
  );
  for (const p of PARTNER_CATALOG) {
    insert.run(p.name, db.slugify(p.name), p.partner_type, p.description, p.location, p.services_offered, p.featured);
  }
  console.log(`[seed] Partners: ${PARTNER_CATALOG.length} baseline partners seeded.`);
}

// Wave 1: Extend appointments table with service request fields.
// Idempotent — checks for each column before adding.
async function migrateServiceRequests() {
  const cols = [
    { name: 'partner_id', ddl: 'INTEGER REFERENCES partners(id)' },
    { name: 'programme_id', ddl: 'INTEGER REFERENCES programmes(id)' },
    { name: 'event_id', ddl: 'INTEGER REFERENCES events(id)' },
    { name: 'assigned_to', ddl: 'INTEGER REFERENCES users(id)' },
    { name: 'alternative_date', ddl: 'TEXT' },
    { name: 'alternative_time', ddl: 'TEXT' },
    { name: 'location_preference', ddl: 'TEXT' },
    { name: 'internal_notes', ddl: 'TEXT' },
    { name: 'source', ddl: "TEXT DEFAULT 'website'" },
    { name: 'reviewed_at', ddl: 'DATETIME' },
    { name: 'confirmed_at', ddl: 'DATETIME' },
    { name: 'cancelled_at', ddl: 'DATETIME' },
    { name: 'completed_at', ddl: 'DATETIME' },
  ];
  if (db.backend === 'sqlite') {
    const existing = new Set((await db.prepare('PRAGMA table_info(appointments)').all()).map((c) => c.name));
    for (const col of cols) {
      if (!existing.has(col.name)) {
        await db.prepare(`ALTER TABLE appointments ADD COLUMN ${col.name} ${col.ddl}`).run();
      }
    }
  } else {
    for (const col of cols) {
      const type = col.ddl.includes('INTEGER') ? 'INTEGER'
        : col.ddl.includes('DATETIME') ? 'DATETIME'
          : 'TEXT';
      await db.prepare(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS ${col.name} ${type}`).run();
    }
  }
}

// Extend appointments CHECK constraint to support full service-request lifecycle statuses.
// SQLite requires table recreation to modify CHECK constraints. Idempotent.
async function migrateAppointmentsStatusCheck() {
  if (impl.backend !== 'sqlite') return;
  const tableInfo = await impl.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='appointments'");
  if (!tableInfo) return;
  const currentSql = tableInfo.sql;
  const targetStatuses = "'pending','requested','new','under_review','reviewed','contacted','confirmed','rescheduled','in_progress','completed','cancelled','declined','expired','no_show','archived'";
  // If the CHECK already contains 'under_review', the constraint is up to date
  if (currentSql.includes('under_review')) return;
  console.log('[migrate] Extending appointments status CHECK constraint to support full lifecycle...');
  impl.pragma('foreign_keys = OFF');
  try {
    await impl.exec(`
      CREATE TABLE IF NOT EXISTS appointments_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_reference TEXT UNIQUE,
        booking_type TEXT DEFAULT 'appointment',
        category TEXT,
        patient_name TEXT NOT NULL,
        patient_email TEXT,
        patient_phone TEXT,
        patient_age INTEGER,
        doctor_id INTEGER REFERENCES doctors(id),
        service_id INTEGER REFERENCES services(id),
        provider_id INTEGER REFERENCES providers(id),
        provider_type TEXT DEFAULT 'BHH',
        date TEXT,
        time TEXT,
        preferred_date TEXT,
        preferred_time TEXT,
        booking_method TEXT DEFAULT 'BHH_MANAGED',
        external_booking_url TEXT,
        contact_method TEXT,
        notes TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN (${targetStatuses})),
        payment_status TEXT DEFAULT 'not_required' CHECK(payment_status IN ('not_required','unpaid','pending','paid','failed','refunded')),
        partner_id INTEGER REFERENCES partners(id),
        programme_id INTEGER REFERENCES programmes(id),
        event_id INTEGER REFERENCES events(id),
        assigned_to INTEGER REFERENCES users(id),
        alternative_date TEXT,
        alternative_time TEXT,
        location_preference TEXT,
        internal_notes TEXT,
        source TEXT DEFAULT 'website',
        reviewed_at DATETIME,
        confirmed_at DATETIME,
        cancelled_at DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Copy all existing data
    await impl.exec(`INSERT INTO appointments_new SELECT * FROM appointments`);
    // Drop old table and rename
    await impl.exec(`DROP TABLE appointments`);
    await impl.exec(`ALTER TABLE appointments_new RENAME TO appointments`);
    // Recreate indexes
    await impl.exec(`CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status)`);
    await impl.exec(`CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date)`);
    await impl.exec(`CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id)`);
    await impl.exec(`CREATE INDEX IF NOT EXISTS idx_appointments_reference ON appointments(booking_reference)`);
    console.log('[migrate] Appointments status CHECK constraint extended successfully.');
  } catch (err) {
    console.error('[migrate] Failed to extend appointments CHECK constraint:', err.message);
  } finally {
    impl.pragma('foreign_keys = ON');
  }
}

// Wave 1: Add lifecycle `status` TEXT column to services, partners, programmes, events.
// Keeps `is_active` in sync for backward compatibility. Idempotent.
const LIFECYCLE_TABLES = ['services', 'partners', 'programmes', 'events'];

async function migrateLifecycleStatus() {
  for (const table of LIFECYCLE_TABLES) {
    if (db.backend === 'sqlite') {
      const cols = await db.prepare(`PRAGMA table_info(${table})`).all();
      if (!cols.some((c) => c.name === 'status')) {
        await db.prepare(`ALTER TABLE ${table} ADD COLUMN status TEXT DEFAULT 'active'`).run();
      }
    } else {
      await db.prepare(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`).run();
    }
  }
}

// Wave 1: Content revision history table.
async function createRevisionsTable() {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS content_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      version INTEGER NOT NULL,
      snapshot TEXT NOT NULL,
      changed_by INTEGER,
      change_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  if (db.backend === 'sqlite') {
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_revisions_entity ON content_revisions(entity_type, entity_id)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_revisions_version ON content_revisions(entity_type, entity_id, version)').run();
  } else {
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_revisions_entity ON content_revisions(entity_type, entity_id)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_revisions_version ON content_revisions(entity_type, entity_id, version)').run();
  }
}

// Wave 2: Notifications table for admin notification centre.
async function createNotificationsTable() {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipient_user_id INTEGER REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      link TEXT,
      entity_type TEXT,
      entity_id TEXT,
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  if (db.backend === 'sqlite') {
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(recipient_user_id, read_at)').run();
  } else {
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(recipient_user_id, read_at)').run();
  }
}

// Wave 2: Content workflow + scheduled publishing columns on blog_posts, events, programmes.
async function migrateContentWorkflow() {
  const blogCols = [
    { name: 'reviewed_by', ddl: 'INTEGER REFERENCES users(id)' },
    { name: 'published_at', ddl: 'DATETIME' },
    { name: 'publish_at', ddl: 'DATETIME' },
    { name: 'unpublish_at', ddl: 'DATETIME' },
  ];
  const eventCols = [
    { name: 'publish_at', ddl: 'DATETIME' },
    { name: 'unpublish_at', ddl: 'DATETIME' },
  ];
  const programmeCols = [
    { name: 'publish_at', ddl: 'DATETIME' },
    { name: 'unpublish_at', ddl: 'DATETIME' },
  ];

  const addCols = async (table, cols) => {
    if (db.backend === 'sqlite') {
      const existing = new Set((await db.prepare(`PRAGMA table_info(${table})`).all()).map((c) => c.name));
      for (const col of cols) {
        if (!existing.has(col.name)) {
          await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${col.name} ${col.ddl}`).run();
        }
      }
    } else {
      for (const col of cols) {
        await db.prepare(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col.name} DATETIME`).run();
      }
    }
  };

  await addCols('blog_posts', blogCols);
  await addCols('events', eventCols);
  await addCols('programmes', programmeCols);
}

// Wave 3 Phase 2: Ecosystem categories table + partner extensions.
async function migrateEcosystemCategories() {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS ecosystem_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Add category_id, social_links, gallery to partners
  const partnerCols = [
    { name: 'category_id', ddl: 'INTEGER REFERENCES ecosystem_categories(id)' },
    { name: 'social_links', ddl: 'TEXT' },
    { name: 'gallery', ddl: 'TEXT' },
  ];
  if (db.backend === 'sqlite') {
    const existing = new Set((await db.prepare('PRAGMA table_info(partners)').all()).map((c) => c.name));
    for (const col of partnerCols) {
      if (!existing.has(col.name)) {
        await db.prepare(`ALTER TABLE partners ADD COLUMN ${col.name} ${col.ddl}`).run();
      }
    }
  } else {
    for (const col of partnerCols) {
      await db.prepare(`ALTER TABLE partners ADD COLUMN IF NOT EXISTS ${col.name} TEXT`).run();
    }
  }
}

// Wave 3 Phase 6: CRM contacts and contact_notes tables.
async function migrateCrmContacts() {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      organisation TEXT,
      interests TEXT,
      source TEXT,
      status TEXT DEFAULT 'new',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS contact_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id INTEGER NOT NULL REFERENCES contacts(id),
      author_id INTEGER REFERENCES users(id),
      note TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  if (db.backend === 'sqlite') {
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_contact_notes_contact ON contact_notes(contact_id)').run();
  }
}

async function migrateRbac() {
  const { backend } = impl;
  try {
    if (backend === 'sqlite') {
      const cols = (await impl.all("PRAGMA table_info(users)")).map(c => c.name);
      if (!cols.includes('status')) {
        await impl.run("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'");
      }
      if (!cols.includes('last_login')) {
        await impl.run("ALTER TABLE users ADD COLUMN last_login DATETIME");
      }
    } else {
      await impl.exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`);
      await impl.exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login DATETIME`);
    }
  } catch (err) {
    if (!err.message.includes('duplicate column') && !err.message.includes('already exists')) {
      console.error('[migrate] RBAC migration warning:', err.message);
    }
  }
}

async function seedPermissions() {
  const { PERMISSIONS } = require('../config/permissions');
  const { ROLE_PERMISSIONS } = require('../config/rolePermissions');

  const existing = await db.prepare('SELECT COUNT(*) as count FROM permissions').get();
  if (existing.count >= PERMISSIONS.length) return;

  const insertPerm = db.prepare(
    `INSERT OR IGNORE INTO permissions (key, name, description, module, action) VALUES (?, ?, ?, ?, ?)`
  );
  for (const p of PERMISSIONS) {
    await insertPerm.run(p.key, p.name, p.description, p.module, p.action);
  }

  const allPerms = await db.prepare('SELECT id, key FROM permissions').all();
  const permMap = {};
  for (const p of allPerms) permMap[p.key] = p.id;

  const insertRolePerm = db.prepare(
    `INSERT OR IGNORE INTO role_permissions (role, permission_id) VALUES (?, ?)`
  );

  for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
    if (perms.length === 1 && perms[0] === '*') {
      for (const p of allPerms) {
        await insertRolePerm.run(role, p.id);
      }
    } else {
      for (const permKey of perms) {
        if (permKey.endsWith('.*')) {
          const module = permKey.split('.')[0];
          for (const p of allPerms) {
            if (p.key === permKey || p.key.startsWith(module + '.')) {
              await insertRolePerm.run(role, p.id);
            }
          }
        } else if (permMap[permKey]) {
          await insertRolePerm.run(role, permMap[permKey]);
        }
      }
    }
  }
  console.log(`[seed] RBAC: ${PERMISSIONS.length} permissions seeded, role mappings applied.`);
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
  await migrateRbac();
  await migrateServiceRequests();
  await migrateAppointmentsStatusCheck();
  await migrateLifecycleStatus();
  await createRevisionsTable();
  await createNotificationsTable();
  await migrateContentWorkflow();
  await migrateEcosystemCategories();
  await migrateCrmContacts();
  await seedIfEmpty();
  await syncAdminPassword();
  await ensureDefaultAdmin();
  await seedPermissions();
  await archiveFakeSeedData();
  await reactivateServiceCatalog();
  await republishBlogPosts();
  await seedPartners();
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
  close() { if (impl.close) impl.close(); },
};

db.ready = init();

// Validate backup JSON before restore
function validateBackup(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    errors.push('Backup data is not an object');
    return { valid: false, errors };
  }
  const required = ['services', 'partners', 'programmes', 'events'];
  for (const key of required) {
    if (!Array.isArray(data[key])) {
      errors.push(`Missing or invalid array: ${key}`);
    }
  }
  if (data.users && !Array.isArray(data.users)) {
    errors.push('Invalid users array');
  }
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  // Check for reasonable sizes
  const maxSize = 100000;
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key]) && data[key].length > maxSize) {
      errors.push(`Suspiciously large ${key} array (${data[key].length} items)`);
    }
  }
  return { valid: errors.length === 0, errors };
}

// Check if a migration is safe (idempotent) by verifying column existence
function columnExists(table, column) {
  try {
    const cols = impl.all(`PRAGMA table_info(${table})`);
    return cols.some((c) => c.name === column);
  } catch {
    return false;
  }
}

// Check if a table exists
function tableExists(table) {
  try {
    const result = impl.get(`SELECT name FROM sqlite_master WHERE type='table' AND name = ?`, [table]);
    return !!result;
  } catch {
    return false;
  }
}

db.validateBackup = validateBackup;
db.columnExists = columnExists;
db.tableExists = tableExists;

module.exports = db;
