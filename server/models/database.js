const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
// Load .env from project root (works for both local and Render)
const rootDir = path.resolve(__dirname, '../..');
require('dotenv').config({ path: path.join(rootDir, '.env') });

// Use DB_PATH from env, or default to server/database.sqlite for local dev
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');
const db = new Database(path.isAbsolute(dbPath) ? dbPath : path.join(rootDir, dbPath));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
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
    description TEXT,
    category TEXT,
    price REAL DEFAULT 0,
    image TEXT,
    icon TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    patient_email TEXT,
    patient_phone TEXT,
    patient_age INTEGER,
    doctor_id INTEGER REFERENCES doctors(id),
    service_id INTEGER REFERENCES services(id),
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','completed','cancelled')),
    notes TEXT,
    payment_status TEXT DEFAULT 'unpaid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
`);

// Seed data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const adminHash = bcrypt.hashSync('admin123', 10);

  // Admin user
  db.prepare(`INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)`).run(
    'Admin User', 'admin@bodijahealthhub.com', adminHash, 'admin', '+234 801 234 5678'
  );

  // Doctor users
  const doctorUsers = [
    { name: 'Dr. Adaeze Okafor', email: 'adaeze@bodijahealthhub.com', phone: '+234 802 345 6789' },
    { name: 'Dr. Emeka Adeyemi', email: 'emeka@bodijahealthhub.com', phone: '+234 803 456 7890' },
    { name: 'Dr. Fatima Bello', email: 'fatima@bodijahealthhub.com', phone: '+234 804 567 8901' },
    { name: 'Dr. Olumide Olatunji', email: 'olumide@bodijahealthhub.com', phone: '+234 805 678 9012' },
    { name: 'Dr. Ngozi Eze', email: 'ngozi@bodijahealthhub.com', phone: '+234 806 789 0123' },
    { name: 'Dr. Tunde Bakare', email: 'tunde@bodijahealthhub.com', phone: '+234 807 890 1234' },
  ];

  const insertUser = db.prepare(`INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, 'doctor', ?)`);
  const doctorIds = [];
  for (const doc of doctorUsers) {
    const result = insertUser.run(doc.name, doc.email, adminHash, doc.phone);
    doctorIds.push(result.lastInsertRowid);
  }

  // Doctors
  const insertDoctor = db.prepare(`INSERT INTO doctors (user_id, name, specialization, bio, experience_years, department, available_days, consultation_fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const doctorData = [
    [doctorIds[0], 'Dr. Adaeze Okafor', 'Audiology', 'Specialist in hearing disorders and auditory assessment with over 12 years of clinical experience.', 12, 'Audiology', 'Mon,Tue,Wed,Thu,Fri', 15000],
    [doctorIds[1], 'Dr. Emeka Adeyemi', 'General Practice', 'Experienced general practitioner dedicated to comprehensive family healthcare.', 8, 'General Medicine', 'Mon,Tue,Wed,Thu,Fri', 10000],
    [doctorIds[2], 'Dr. Fatima Bello', 'Pediatrics', 'Compassionate pediatrician specializing in child health and developmental milestones.', 10, 'Child Health', 'Mon,Tue,Thu,Fri', 12000],
    [doctorIds[3], 'Dr. Olumide Olatunji', 'Internal Medicine', 'Expert in managing chronic diseases including hypertension and diabetes.', 15, 'Internal Medicine', 'Mon,Wed,Fri', 15000],
    [doctorIds[4], 'Dr. Ngozi Eze', 'Speech Therapy', 'Certified speech-language pathologist helping patients overcome communication challenges.', 7, 'Speech Therapy', 'Mon,Tue,Wed,Thu', 12000],
    [doctorIds[5], 'Dr. Tunde Bakare', 'Nephrology', 'Specialist in kidney care and dialysis management.', 11, 'Kidney Care', 'Tue,Wed,Thu,Fri', 18000],
  ];
  for (const doc of doctorData) {
    insertDoctor.run(...doc);
  }

  // Services (all 16)
  const insertService = db.prepare(`INSERT INTO services (name, description, category, price, icon) VALUES (?, ?, ?, ?, ?)`);
  const services = [
    ['General Consultation', 'Comprehensive health assessment and medical consultation with our experienced doctors.', 'Primary Care', 10000, 'stethoscope'],
    ['Audiology', 'Complete hearing health services including diagnosis, treatment, and prevention of hearing disorders.', 'Specialized Care', 15000, 'ear'],
    ['Hearing Tests', 'Professional audiometric testing to evaluate hearing ability and identify hearing loss.', 'Diagnostics', 8000, 'hearing'],
    ['Hearing Aids', 'Premium hearing aid fitting, programming, and after-sales support services.', 'Devices', 50000, 'volume-up'],
    ['Speech Therapy', 'Expert speech and language therapy for children and adults with communication disorders.', 'Therapy', 12000, 'comments'],
    ['Laboratory Services', 'Full-range diagnostic laboratory services with quick and accurate results.', 'Diagnostics', 5000, 'flask'],
    ['Hypertension Clinic', 'Specialized monitoring and management of high blood pressure and related conditions.', 'Chronic Care', 8000, 'heart'],
    ['Diabetes Care', 'Comprehensive diabetes management including monitoring, counseling, and treatment.', 'Chronic Care', 8000, 'tint'],
    ['Kidney Care', 'Expert nephrology services for kidney disease prevention, diagnosis, and management.', 'Specialized Care', 18000, 'kidneys'],
    ['Elderly Care', 'Compassionate healthcare services tailored for senior citizens and age-related conditions.', 'Primary Care', 10000, 'users'],
    ['Child Health', 'Complete pediatric care from immunizations to developmental assessments.', 'Primary Care', 8000, 'baby'],
    ['Wellness Screening', 'Preventive health screenings to detect potential health issues early.', 'Preventive', 15000, 'clipboard-check'],
    ['Home Care LiveCare', 'Professional healthcare services delivered in the comfort of your home.', 'Home Care', 25000, 'home'],
    ['Preventive Health', 'Health programs focused on disease prevention through lifestyle modification.', 'Preventive', 10000, 'shield'],
    ['Vaccination', 'Full range of vaccinations for children and adults to prevent infectious diseases.', 'Preventive', 5000, 'syringe'],
    ['Health Outreach Programs', 'Community health education, screening camps, and wellness outreach events.', 'Community', 0, 'hand-holding-heart'],
  ];
  for (const svc of services) {
    insertService.run(...svc);
  }

  // Blog posts
  const insertBlog = db.prepare(`INSERT INTO blog_posts (title, slug, content, excerpt, category, author_id, status) VALUES (?, ?, ?, ?, ?, 1, 'published')`);
  insertBlog.run(
    'Understanding Hearing Loss: Causes, Symptoms, and Treatment Options',
    'understanding-hearing-loss',
    'Hearing loss affects millions of people worldwide and can significantly impact quality of life. In this comprehensive guide, we explore the common causes of hearing loss, from age-related degeneration to exposure to loud noise. Learn about the early warning signs, including difficulty following conversations, turning up the volume on devices, and withdrawing from social situations. Our audiology team explains the latest treatment options, from hearing aids to cochlear implants, and shares preventive measures you can take today to protect your hearing health. Regular hearing screenings are recommended for adults over 50, and early detection is key to effective treatment.',
    'Hearing loss affects millions worldwide. Learn about causes, early warning signs, and the latest treatment options from our audiology experts.',
    'Audiology'
  );
  insertBlog.run(
    'Managing Hypertension: A Guide to Healthy Blood Pressure',
    'managing-hypertension',
    'Hypertension, often called the "silent killer," affects nearly half of all adults. This article covers essential strategies for managing blood pressure through lifestyle changes and, when necessary, medication. Discover the DASH diet approach, learn about the importance of regular exercise, and understand how stress management plays a role in blood pressure control. Our internal medicine specialists share practical tips for daily monitoring at home, understanding your readings, and knowing when to seek medical attention. We also discuss the connection between hypertension and other conditions like diabetes and kidney disease.',
    'Hypertension is a leading cause of heart disease. Our experts share practical strategies for managing your blood pressure effectively.',
    'Heart Health'
  );
  insertBlog.run(
    'Child Health: Essential Vaccinations Every Parent Should Know About',
    'child-health-vaccinations',
    'Vaccinations remain one of the most important tools in protecting children from serious diseases. This guide provides parents with a comprehensive overview of the vaccination schedule, from birth through adolescence. Learn about the diseases vaccines prevent, common side effects, and why timely vaccination is crucial. Our pediatric team addresses common concerns and misconceptions about vaccines, explains the difference between routine and optional vaccinations, and provides tips for making vaccination visits less stressful for both children and parents. Stay informed about the latest additions to the national immunization program.',
    'Protect your child with the right vaccinations at the right time. Our pediatric guide covers everything parents need to know about immunization.',
    'Child Health'
  );
  insertBlog.run(
    'Diabetes Management: Living Well with Diabetes',
    'diabetes-management',
    'Managing diabetes effectively requires a comprehensive approach that combines medical care, nutrition, exercise, and self-monitoring. This article explores evidence-based strategies for blood sugar control, including meal planning with Nigerian food options, the role of physical activity, and proper medication adherence. Our diabetes care team shares insights on monitoring techniques, recognizing complications early, and maintaining emotional well-being while managing a chronic condition. Learn about the latest advancements in diabetes care and how our multidisciplinary team supports patients in achieving their health goals.',
    'Effective diabetes management is possible with the right knowledge and support. Learn practical tips for living well with diabetes.',
    'Diabetes Care'
  );

  // Testimonials
  const insertTestimonial = db.prepare(`INSERT INTO testimonials (patient_name, content, rating, is_active) VALUES (?, ?, ?, 1)`);
  insertTestimonial.run('Adebayo Johnson', 'The audiology team at Bodija Health Hub changed my life. After years of struggling with hearing loss, I can finally enjoy conversations with my family again. The hearing aid fitting was professional and the follow-up care has been excellent.', 5);
  insertTestimonial.run('Chinwe Okonkwo', 'Dr. Bello is an amazing pediatrician. She is patient, thorough, and genuinely cares about her young patients. My children actually look forward to their check-ups! The facility is clean and welcoming.', 5);
  insertTestimonial.run('Ibrahim Mohammed', 'I have been managing my hypertension at Bodija Health Hub for two years now. The doctors are knowledgeable and the staff are always friendly. The hypertension clinic has helped me understand and control my blood pressure properly.', 4);
  insertTestimonial.run('Funke Adeyemi', 'The home care service has been a blessing for my elderly mother. The nurses are professional, compassionate, and highly skilled. It gives our family peace of mind knowing she receives quality care at home.', 5);
  insertTestimonial.run('Oluwaseun Akinola', 'I visited for a wellness screening and was impressed by the thoroughness of the check-up. The staff took time to explain every result and provided practical health advice. Highly recommend their preventive health services!', 5);

  // Contact info
  const insertContact = db.prepare(`INSERT INTO contact_info (key, value) VALUES (?, ?)`);
  insertContact.run('phone', '+234 801 234 5678');
  insertContact.run('email', 'info@bodijahealthhub.com');
  insertContact.run('address', '12 Bodija Road, Ibadan, Oyo State, Nigeria');
  insertContact.run('facebook', 'https://facebook.com/bodijahealthhub');
  insertContact.run('twitter', 'https://twitter.com/bodijahealthhub');
  insertContact.run('instagram', 'https://instagram.com/bodijahealthhub');
  insertContact.run('whatsapp', '+234 801 234 5678');
  insertContact.run('opening_hours', 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM');

  // Site content defaults
  const insertSiteContent = db.prepare(`INSERT OR IGNORE INTO site_content (key, value) VALUES (?, ?)`);
  const siteContentDefaults = [
    // Hero
    ['hero_headline', 'Quality Healthcare for Every Family'],
    ['hero_subtext', 'Bodija Health Hub provides comprehensive, compassionate healthcare services in the heart of Ibadan. Your well-being is our priority.'],
    ['hero_cta1_text', 'Book Appointment'],
    ['hero_cta1_link', '/appointments'],
    ['hero_cta2_text', 'Our Services'],
    ['hero_cta2_link', '/services'],
    ['hero_image', ''],
    // About
    ['about_headline', 'A Healthcare Ecosystem, Not Just a Clinic'],
    ['about_description', 'Bodija Health Hub is an integrated healthcare network designed to ensure that patients receive coordinated, comprehensive care at every stage of their health journey.\n\nBy connecting primary care, specialist consultations, diagnostics, therapy, and digital health solutions under one umbrella, we eliminate the gaps that often leave families navigating the healthcare system alone.\n\nOur model is built on the belief that when healthcare providers, specialists, and digital platforms work in harmony, patients don\'t just get treated — they get cared for, consistently and completely.'],
    ['about_mission', 'To build and sustain an integrated healthcare network that brings together clinics, specialists, diagnostics, therapy, and digital health solutions — making quality, coordinated care accessible to every individual and family in our community.'],
    ['about_vision', 'To be the most trusted integrated healthcare ecosystem in Ibadan and beyond — where every family has access to connected, continuous, and compassionate care.'],
    // Ecosystem
    ['ecosystem_headline', 'One Hub. Many Hands. Whole-Person Care.'],
    ['ecosystem_description', 'Care doesn\'t exist in isolation — and neither should the systems that support it. At Bodija Health Hub, we\'ve built an ecosystem where every service connects, every specialist coordinates, and every patient benefits from truly integrated healthcare.'],
    // Partners
    ['partners_headline', 'Our Partner Network'],
    ['partners_description', 'The Bodija Health Hub ecosystem is powered by a network of specialized healthcare organizations — each bringing expertise, trust, and commitment to community wellness.'],
    // Platforms
    ['platforms_headline', 'Our Platforms'],
    ['platforms_description', 'BHH is building and supporting digital solutions that extend the reach of quality care beyond clinic walls — connecting patients to providers, families to peace of mind, and communities to wellness.'],
    // Contact
    ['contact_headline', 'Ready to Be Part of Something Bigger?'],
    ['contact_description', 'Whether you\'re a patient, a family member, a healthcare provider, or a caregiver — we\'re here to connect you with the care, the partners, and the community you need.'],
    // Footer
    ['footer_tagline', 'Your Trusted Healthcare Partner in Ibadan. Providing compassionate, comprehensive medical services for individuals and families.'],
    ['footer_copyright', '© 2025 Bodija Health Hub. All rights reserved.'],
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
    // SEO
    ['seo_title', 'Bodija Health Hub - Quality Healthcare in Ibadan'],
    ['seo_description', 'Bodija Health Hub provides comprehensive healthcare services including general consultation, audiology, laboratory services, and more in Ibadan, Nigeria.'],
    ['seo_keywords', 'healthcare, hospital, Ibadan, Nigeria, doctor, consultation, audiology, laboratory'],
    // Navigation
    ['nav_logo', ''],
    ['nav_logo_text', 'Bodija Health Hub'],
    ['nav_links', JSON.stringify([
      { label: 'Home', url: '/' },
      { label: 'About Us', url: '/about' },
      { label: 'The Ecosystem', url: '/ecosystem' },
      { label: 'Our Partners', url: '/partners' },
      { label: 'Our Platforms', url: '/platforms' },
      { label: 'Upcoming Projects', url: '/upcoming' },
      { label: 'Contact Us', url: '/contact' },
    ])],
    ['nav_cta_text', 'Get Started'],
    ['nav_cta_url', '/contact'],
    ['nav_phone', '+234 801 234 5678'],
  ];
  for (const [key, value] of siteContentDefaults) {
    insertSiteContent.run(key, value);
  }

  // SEO page settings defaults
  const insertSeo = db.prepare(`INSERT OR IGNORE INTO seo_settings (page_id, meta_title, meta_description, canonical) VALUES (?, ?, ?, ?)`);
  const seoPages = [
    ['home', 'Bodija Health Hub - Quality Healthcare in Ibadan', 'Bodija Health Hub provides comprehensive healthcare services in Ibadan, Nigeria.', 'https://bodijahealthhub.com/'],
    ['about', 'About Us - Bodija Health Hub', 'Learn about Bodija Health Hub, an integrated healthcare network in Ibadan.', 'https://bodijahealthhub.com/about'],
    ['services', 'Our Services - Bodija Health Hub', 'Explore our comprehensive healthcare services.', 'https://bodijahealthhub.com/services'],
    ['platforms', 'Our Platforms - Bodija Health Hub', 'Discover our digital health platforms.', 'https://bodijahealthhub.com/platforms'],
    ['blog', 'Blog - Bodija Health Hub', 'Health tips and news from our experts.', 'https://bodijahealthhub.com/blog'],
    ['contact', 'Contact Us - Bodija Health Hub', 'Get in touch with Bodija Health Hub.', 'https://bodijahealthhub.com/contact'],
    ['ecosystem', 'The Ecosystem - Bodija Health Hub', 'Our connected healthcare ecosystem.', 'https://bodijahealthhub.com/ecosystem'],
    ['partners', 'Our Partners - Bodija Health Hub', 'Meet our healthcare partner network.', 'https://bodijahealthhub.com/partners'],
    ['careers', 'Careers - Bodija Health Hub', 'Join our team at Bodija Health Hub.', 'https://bodijahealthhub.com/careers'],
    ['faq', 'FAQ - Bodija Health Hub', 'Frequently asked questions.', 'https://bodijahealthhub.com/faq'],
  ];
  for (const [pageId, title, desc, canonical] of seoPages) {
    insertSeo.run(pageId, title, desc, canonical);
  }

  // Site settings defaults
  const insertSiteSetting = db.prepare(`INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)`);
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
    insertSiteSetting.run(key, value);
  }
}

module.exports = db;
