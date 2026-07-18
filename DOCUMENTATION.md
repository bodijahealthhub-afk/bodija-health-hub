# Bodija Health Hub — Full Documentation

## Overview

Bodija Health Hub (BHH) is a community-based integrated healthcare ecosystem website. It connects clinics, specialists, wellness services, and digital platforms under one hub — making accessible, connected, and continuous care a reality for families in Ibadan, Nigeria.

**Live Website:** https://client-six-eta-66.vercel.app  
**Backend API:** https://bodija-health-hub.onrender.com  
**Admin Panel:** https://client-six-eta-66.vercel.app/admin  
**GitHub:** https://github.com/bodijahealthhub-afk/bodija-health-hub

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 19 + Vite + Tailwind CSS | SPA with responsive UI |
| Backend | Node.js + Express.js | REST API server |
| Database | SQLite (better-sqlite3) | Persistent data storage |
| Hosting (Frontend) | Vercel | Static hosting, CDN, HTTPS |
| Hosting (Backend) | Render | Node.js server hosting |
| Auth | JWT (jsonwebtoken) | Session management |
| Password Hashing | bcryptjs | Secure password storage |
| File Uploads | Multer | Image handling |

---

## Project Structure

```
BodijaHealthHub/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Navbar.jsx     # Main navigation
│   │   │   ├── Footer.jsx     # Site footer
│   │   │   ├── Hero.jsx       # Hero section
│   │   │   ├── Stats.jsx      # Statistics counters
│   │   │   ├── WhyChooseUs.jsx
│   │   │   ├── CTA.jsx        # Call to action
│   │   │   ├── AppDownload.jsx
│   │   │   ├── ServiceCard.jsx
│   │   │   ├── DoctorCard.jsx
│   │   │   ├── TestimonialCard.jsx
│   │   │   ├── AppointmentForm.jsx
│   │   │   ├── BlogCard.jsx
│   │   │   ├── EventCard.jsx
│   │   │   └── GalleryItem.jsx
│   │   ├── pages/             # Public-facing pages
│   │   │   ├── Home.jsx       # Landing page
│   │   │   ├── About.jsx      # About us
│   │   │   ├── Ecosystem.jsx  # Healthcare ecosystem
│   │   │   ├── Partners.jsx   # Partner organizations
│   │   │   ├── Platforms.jsx  # Digital platforms (LiveCare, hEar Menders)
│   │   │   ├── Upcoming.jsx   # BACR project
│   │   │   ├── Contact.jsx    # Contact form + Google Maps
│   │   │   ├── Appointments.jsx # Book appointment wizard
│   │   │   ├── Privacy.jsx    # Privacy policy
│   │   │   ├── Terms.jsx      # Terms of use
│   │   │   ├── FAQ.jsx        # Frequently asked questions
│   │   │   ├── Careers.jsx    # Job openings
│   │   │   ├── Resources.jsx  # Health articles
│   │   │   └── Sitemap.jsx    # Site map
│   │   ├── admin/             # Admin panel (43 files)
│   │   │   ├── AdminLogin.jsx     # Admin login page
│   │   │   ├── AdminLayout.jsx    # Admin layout with sidebar
│   │   │   ├── AdminRoute.jsx     # Auth route guard
│   │   │   ├── Sidebar.jsx        # Admin navigation sidebar
│   │   │   ├── TopBar.jsx         # Admin top bar
│   │   │   ├── Dashboard.jsx      # Admin dashboard
│   │   │   ├── SiteContent.jsx    # Edit all website content
│   │   │   ├── HeroContent.jsx    # Hero section editor
│   │   │   ├── FooterContent.jsx  # Footer editor
│   │   │   ├── NavigationContent.jsx # Nav links editor
│   │   │   ├── PageContent.jsx    # Per-page content editor
│   │   │   ├── SiteSettings.jsx   # Global settings (logo, colors, SEO)
│   │   │   ├── AdminManagement.jsx # Manage admin users
│   │   │   ├── Appointments.jsx   # Manage appointments
│   │   │   ├── Patients.jsx       # Patient management
│   │   │   ├── Doctors.jsx        # Doctor management
│   │   │   ├── Services.jsx       # Service management
│   │   │   ├── Blog.jsx           # Blog post management
│   │   │   ├── Events.jsx         # Event management
│   │   │   ├── Gallery.jsx        # Photo gallery
│   │   │   ├── Messages.jsx       # Contact form messages
│   │   │   ├── Newsletter.jsx     # Newsletter subscribers
│   │   │   ├── Testimonials.jsx   # Patient reviews
│   │   │   ├── MediaLibrary.jsx   # Image management
│   │   │   ├── SeoSettings.jsx    # SEO per page
│   │   │   ├── BackupRestore.jsx  # Data export/import
│   │   │   ├── Settings.jsx       # General settings
│   │   │   ├── DataTable.jsx      # Reusable table
│   │   │   ├── Modal.jsx          # Reusable modal
│   │   │   ├── ImageUpload.jsx    # Image upload component
│   │   │   ├── StatsCard.jsx      # Stats display
│   │   │   ├── SearchBar.jsx      # Search input
│   │   │   ├── Pagination.jsx     # Page navigation
│   │   │   └── StatusBadge.jsx    # Status badges
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state management
│   │   ├── App.jsx            # Main router
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles + Tailwind
│   ├── public/                # Static assets
│   │   ├── bhh-logo.svg       # BHH logo
│   │   ├── favicon.svg        # Site favicon
│   │   └── grid.svg           # Background pattern
│   ├── vercel.json            # Vercel config (proxy to backend)
│   └── vite.config.js         # Vite config
├── server/                    # Backend (Node.js + Express)
│   ├── index.js               # Server entry point
│   ├── .env                   # Environment variables
│   ├── models/
│   │   └── database.js        # SQLite database setup + seed data
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── routes/                # API routes (17 files)
│   │   ├── auth.js            # Login, register, users, password reset
│   │   ├── doctors.js         # Doctor CRUD
│   │   ├── services.js        # Service CRUD
│   │   ├── appointments.js    # Appointment booking
│   │   ├── patients.js        # Patient management
│   │   ├── blog.js            # Blog posts
│   │   ├── events.js          # Events
│   │   ├── gallery.js         # Photo gallery
│   │   ├── testimonials.js    # Patient reviews
│   │   ├── messages.js        # Contact form messages
│   │   ├── newsletter.js      # Newsletter subscriptions
│   │   ├── dashboard.js       # Dashboard statistics
│   │   ├── settings.js        # Site settings
│   │   ├── site-content.js    # Website content (public + admin)
│   │   ├── site-settings.js   # Site settings (admin)
│   │   ├── page-content.js    # Per-page content
│   │   ├── seo.js             # SEO settings
│   │   ├── media.js           # Media library
│   │   └── backup.js          # Data export/import
│   └── uploads/               # Uploaded files
├── package.json               # Root package.json
├── index.js                   # Root entry point (for Render)
├── railway.toml               # Railway config (deprecated)
├── .gitignore
└── DOCUMENTATION.md           # This file
```

---

## Database Schema

### Tables

| Table | Fields | Purpose |
|-------|--------|---------|
| users | id, name, email, password_hash, role, avatar, phone, created_at | Admin/user accounts |
| doctors | id, user_id, name, specialization, bio, experience_years, photo, department, available_days, consultation_fee, is_active | Doctor profiles |
| services | id, name, description, category, price, image, icon, is_active | Healthcare services |
| appointments | id, patient_name, patient_email, patient_phone, patient_age, doctor_id, service_id, date, time, status, notes, payment_status | Patient appointments |
| patients | id, name, email, phone, age, gender, address, blood_group, medical_history | Patient records |
| blog_posts | id, title, slug, content, excerpt, category, featured_image, author_id, status, views | Health blog articles |
| events | id, title, description, date, location, image, type, is_active | Community events |
| gallery | id, title, image_url, category, album | Photo gallery |
| testimonials | id, patient_name, content, rating, photo, is_active | Patient reviews |
| messages | id, name, email, phone, subject, message, is_read | Contact form submissions |
| newsletter_subscribers | id, email, is_active | Newsletter subscribers |
| contact_info | id, key, value | Contact details (phone, email, address) |
| site_content | id, key, value, updated_at | All website content (editable from admin) |
| site_settings | id, key, value, updated_at | Global settings (logo, colors, SEO) |
| page_sections | id, page_id, sort_order, title, content, image, button_text, button_link | Per-page content sections |
| media | id, name, url, thumbnail, category, size, mime_type | Media library |
| seo_settings | id, page_id, meta_title, meta_description, og_title, og_description, og_image, twitter_card, canonical, noindex, nofollow | SEO per page |

### User Roles

| Role | Access Level |
|------|-------------|
| super_admin | Full access to everything |
| admin | Full admin access |
| content_manager | Blog, events, testimonials, gallery |
| doctor | Limited admin access |
| receptionist | Appointments, patients |
| accountant | Financial reports |

---

## API Endpoints

### Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/services | List all services |
| GET | /api/services/:id | Get service details |
| GET | /api/doctors | List all doctors |
| GET | /api/doctors/:id | Get doctor details |
| GET | /api/blog | List published blog posts |
| GET | /api/blog/:slug | Get blog post by slug |
| GET | /api/events | List active events |
| GET | /api/testimonials | List active testimonials |
| GET | /api/gallery | List gallery images |
| GET | /api/site-content | Get all website content |
| GET | /api/site-content/:section | Get content for specific section |
| GET | /api/settings | Get site settings |
| GET | /api/page-content/:pageId | Get page sections |
| GET | /api/seo/:pageId | Get SEO settings for page |
| POST | /api/messages | Submit contact form |
| POST | /api/newsletter/subscribe | Subscribe to newsletter |
| POST | /api/appointments | Book an appointment |
| POST | /api/auth/login | Login and get JWT token |
| POST | /api/auth/register | Register new user |

### Admin Endpoints (JWT Auth Required)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | /api/auth/me | Any | Get current user profile |
| PUT | /api/auth/profile | Any | Update own profile |
| GET | /api/auth/users | admin, super_admin | List all users |
| POST | /api/auth/create-admin | admin, super_admin | Create new admin user |
| PUT | /api/auth/reset-password | admin, super_admin | Reset user password |
| DELETE | /api/auth/users/:id | admin, super_admin | Delete user |
| PUT | /api/site-content | admin, super_admin | Update website content |
| PUT | /api/site-content/:section | admin, super_admin | Update specific section |
| GET/PUT | /api/admin/site-settings | admin, super_admin | Manage site settings |
| GET | /api/admin/site-content | admin, super_admin | Get all site content |
| GET/PUT | /api/admin/page-content/:pageId | admin, super_admin | Manage page content |
| GET/PUT | /api/admin/seo/:pageId | admin, super_admin | Manage SEO |
| GET/POST/DELETE | /api/admin/media | admin, super_admin | Media library |
| GET/POST | /api/admin/backups | admin, super_admin | Export/import data |
| GET | /api/dashboard/stats | admin, super_admin | Dashboard statistics |
| GET/POST/PUT/DELETE | /api/appointments | Various | Appointment management |
| GET/POST/PUT/DELETE | /api/patients | Various | Patient management |
| GET/POST/PUT/DELETE | /api/doctors | admin, super_admin | Doctor management |
| GET/POST/PUT/DELETE | /api/services | Various | Service management |
| GET/POST/PUT/DELETE | /api/blog | Various | Blog management |
| GET/POST/PUT/DELETE | /api/events | Various | Event management |
| GET/POST/PUT/DELETE | /api/gallery | Various | Gallery management |
| GET/POST/PUT/DELETE | /api/testimonials | Various | Testimonial management |
| GET | /api/messages | admin, super_admin | View messages |
| PUT | /api/messages/:id/read | admin, super_admin | Mark message as read |
| GET | /api/newsletter/subscribers | admin, super_admin | View subscribers |

---

## Frontend Routes

| Route | Page | Description |
|-------|------|-------------|
| / | Home | Landing page with hero, stats, services, CTA |
| /about | About | About BHH, mission, vision, values |
| /ecosystem | Ecosystem | Healthcare ecosystem overview |
| /partners | Partners | Partner organizations |
| /platforms | Platforms | LiveCare and hEar Menders |
| /upcoming | Upcoming | BACR rehabilitation centre |
| /contact | Contact | Contact form, Google Maps, social links |
| /appointments | Appointments | 4-step booking wizard |
| /privacy | Privacy | Privacy policy |
| /terms | Terms | Terms of use |
| /faq | FAQ | Frequently asked questions |
| /careers | Careers | Job openings and application form |
| /resources | Resources | Health articles and resources |
| /sitemap | Sitemap | Site map with all links |
| /admin/login | Admin Login | Admin authentication |
| /admin | Dashboard | Admin dashboard with stats |
| /admin/site-content | Site Content | Edit all website content (8 tabs) |
| /admin/hero-content | Hero Content | Hero section editor |
| /admin/footer-content | Footer | Footer editor |
| /admin/navigation-content | Navigation | Nav links editor |
| /admin/page-content | Page Content | Per-page content editor |
| /admin/site-settings | Site Settings | Logo, colors, SEO, analytics |
| /admin/admin-users | Admin Users | Manage admin accounts |
| /admin/appointments | Appointments | Manage appointments |
| /admin/patients | Patients | Patient management |
| /admin/doctors | Doctors | Doctor management |
| /admin/services | Services | Service management |
| /admin/blog | Blog | Blog post management |
| /admin/events | Events | Event management |
| /admin/gallery | Gallery | Photo gallery |
| /admin/messages | Messages | Contact form messages |
| /admin/newsletter | Newsletter | Newsletter subscribers |
| /admin/testimonials | Testimonials | Patient reviews |
| /admin/media | Media Library | Image management |
| /admin/seo | SEO Settings | Per-page SEO |
| /admin/backup | Backup & Restore | Data export/import |
| /admin/settings | Settings | General settings |

---

## Authentication Flow

1. User logs in at `/admin/login`
2. Credentials sent to `POST /api/auth/login`
3. Server validates email/password with bcrypt
4. JWT token returned (expires in 7 days)
5. Token stored in `localStorage` as `adminToken`
6. All admin API calls include `Authorization: Bearer <token>`
7. Server middleware verifies token and checks user role
8. If token invalid/expired, user redirected to login

---

## Content Management System

All website content is stored in the `site_content` database table as key-value pairs. The admin panel provides a user-friendly interface to edit this content.

### Editable Content Sections

| Section | Keys | What's Editable |
|---------|------|-----------------|
| Hero | hero_headline, hero_subtext, hero_cta1_text, hero_cta1_link, hero_cta2_text, hero_cta2_link | Headline, subtext, CTA buttons |
| About | about_headline, about_description, about_mission, about_vision | Section text |
| Ecosystem | ecosystem_headline, ecosystem_description | Section text |
| Partners | partners_headline, partners_description, partner1-4_name/description/services/image | Partner cards |
| Platforms | platforms_headline, platforms_description | Section text |
| Contact | contact_headline, contact_description, contact_phone, contact_email, contact_address, contact_whatsapp, contact_hours | Contact details |
| Footer | footer_tagline, footer_copyright, footer_quick_links, footer_platform_links, footer_social_links | Footer content |
| Navigation | nav_links, nav_cta_text, nav_cta_url | Nav links and CTA |
| SEO | seo_title, seo_description, seo_keywords | Default SEO |

### Site Settings

| Setting | Key | What's Editable |
|---------|-----|-----------------|
| General | site_name, site_tagline, site_logo, site_favicon | Site identity |
| Colors | primary_color, secondary_color, accent_color, background_color, text_color | Brand colors |
| SEO | seo_meta_title, seo_meta_description, seo_keywords | Default SEO |
| Social | social_image | Social share image |
| Analytics | analytics_id | Google Analytics |
| Maintenance | maintenance_mode | Maintenance mode toggle |

---

## Deployment

### Frontend (Vercel)

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Framework:** Vite
- **Rewrites:** `/api/*` → `https://bodija-health-hub.onrender.com/api/*`
- **SPA fallback:** All non-asset routes → `/index.html`

### Backend (Render)

- **Build command:** `npm install` (root)
- **Start command:** `node index.js`
- **Port:** 10000 (from PORT env var)
- **Database:** SQLite at `./data/database.sqlite`
- **Auto-deploy:** On GitHub push to master

---

## Default Credentials

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin | admin@bodijahealthhub.com | admin123 | admin |

---

## Environment Variables

### Backend (.env)

| Variable | Value | Purpose |
|----------|-------|---------|
| JWT_SECRET | bhh_secret_key_2026 | JWT token signing |
| PORT | 10000 | Server port |
| DB_PATH | ./data/database.sqlite | Database file path |

### Frontend (vercel.json)

| Setting | Value | Purpose |
|---------|-------|---------|
| Rewrites /api/* | https://bodija-health-hub.onrender.com/api/* | Proxy API calls to backend |

---

## Key Features Summary

### Public Website
- Responsive design (mobile-first)
- Hero section with animated stats
- 8 healthcare services with individual pages
- 4 partner organizations with details
- 2 digital platforms (LiveCare, hEar Menders)
- Online appointment booking (4-step wizard)
- Contact form with Google Maps
- Health blog with categories
- Photo gallery with lightbox
- Patient testimonials
- Newsletter subscription
- WhatsApp floating button
- SEO optimized

### Admin Panel (43 components)
- Dashboard with real-time stats
- Full content management (edit any text on the site)
- Logo and favicon upload
- Brand color customization
- SEO settings per page
- Appointment management (view, confirm, complete, cancel)
- Patient management (add, edit, view records)
- Doctor management (add, edit, availability)
- Service management (add, edit, pricing)
- Blog management (write, edit, publish)
- Event management (create, edit, delete)
- Gallery management (upload, organize, delete)
- Message inbox (view, mark read, delete)
- Newsletter subscriber management
- Testimonial management
- Media library
- Admin user management (add, delete, reset passwords)
- Data backup and restore
- Site settings (name, tagline, logo, colors, SEO, analytics)

---

## API Response Formats

### Success
```json
{
  "key1": "value1",
  "key2": "value2"
}
```

### Error
```json
{
  "error": "Error message"
}
```

### Paginated
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pages": 10
}
```

---

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- Admin endpoints require valid JWT + appropriate role
- CORS configured for frontend domain
- SQL injection prevented by parameterized queries
- File uploads limited to images
- Body size limit: 50MB (for base64 images)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Admin panel shows old version | Press Ctrl+Shift+R to hard refresh |
| Changes don't persist | Check browser console for errors |
| API returns 401 | Token expired — re-login |
| Image upload fails | Check file size (max 5MB recommended) |
| Backend offline | Check Render dashboard for deploy status |
| Frontend shows 404 | Vercel may need redeploy |

---

*Last updated: July 2026*
