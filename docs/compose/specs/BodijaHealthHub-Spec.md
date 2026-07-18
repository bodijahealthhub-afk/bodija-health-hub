# Bodija Health Hub - Feature Specification

## Overview

Bodija Health Hub is a full-stack healthcare website for a Nigerian healthcare clinic located in Bodija, Ibadan. The platform provides public-facing information and services for patients, along with an admin panel for clinic staff to manage operations.

## Target Audience

- **Primary:** Patients seeking healthcare services in Ibadan, Nigeria
- **Secondary:** Potential patients exploring services
- **Internal:** Clinic staff managing operations (Admin, Doctor, Staff roles)

## Geographic Context

- Nigerian healthcare clinic (Bodija, Ibadan)
- Mobile-first design critical for Nigerian market
- Paystack payment integration (popular in Nigeria)
- Currency: Nigerian Naira (₦)

## Technical Requirements

### Architecture

- **Monorepo:** npm workspaces with client/, server/, shared/ directories
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite with Prisma ORM
- **Authentication:** JWT with httpOnly cookies and refresh token rotation
- **API:** RESTful design

### Database Scale

- Single location clinic
- Expected <10,000 patients
- SQLite appropriate for expected scale

## Features

### Public Pages

1. **Home Page**
   - Hero section with clinic introduction
   - Featured services
   - Call-to-action for appointment booking
   - Testimonials carousel
   - Recent blog posts

2. **About Page**
   - Clinic history and mission
   - Values and vision
   - Team introduction

3. **Services Page**
   - Service categories
   - 16+ individual service pages including:
     - General Consultation
     - Dental Care
     - Eye Care
     - Pediatrics
     - Maternity
     - Laboratory
     - Pharmacy
     - Radiology
     - Surgery
     - Emergency Care
     - Cardiology
     - Dermatology
     - ENT (Ear, Nose, Throat)
     - Orthopedics
     - Gynecology
     - Urology
   - Each service page with description, benefits, pricing (if applicable)

4. **Online Appointment Booking**
   - Request-based workflow (patients submit booking requests)
   - Preferred time selection
   - Service selection
   - Patient information form
   - Confirmation and tracking

5. **Meet Our Specialists**
   - Doctor profiles with specialties
   - Qualifications and experience
   - Availability schedule

6. **Health Blog**
   - Rich text content (TipTap editor)
   - Categories and tags
   - Search functionality
   - Individual post pages

7. **Outreach & Events**
   - Community health programs
   - Upcoming events
   - Event details and registration

8. **Gallery**
   - Photo gallery with categories
   - Image viewing and navigation

9. **Testimonials**
   - Patient reviews and ratings
   - Approved testimonials display

10. **Contact**
    - Contact form
    - Clinic location (map)
    - Phone, email, address
    - Working hours

11. **Download Apps Section**
    - HearMenders app information
    - LiveCare app information
    - App store links (informational only - apps are pre-existing)

12. **Donate/Partner**
    - Donation form with Paystack integration
    - Donation purposes (general, equipment, outreach, scholarship)
    - Partner opportunities

### Admin Panel

1. **Dashboard**
   - Key metrics (patients, appointments, doctors, blog posts)
   - Recent activity
   - Quick actions

2. **Patient Management**
   - Patient list with search and filters
   - Patient profiles
   - Medical history
   - Appointment history

3. **Appointment Management**
   - Appointment list (pending, confirmed, cancelled, completed)
   - Status updates
   - Doctor assignment
   - Notes and scheduling

4. **Doctor Management**
   - Doctor profiles
   - Specialties and qualifications
   - Schedule management
   - Availability status

5. **Service Management**
   - Service list
   - Add/edit/delete services
   - Pricing management
   - Service categories

6. **Blog Management**
   - Rich text editor (TipTap)
   - Draft/publish workflow
   - Categories and tags
   - Image uploads

7. **Events Management**
   - Event creation and editing
   - Date and location management
   - Publish status

8. **Gallery Management**
   - Image uploads with processing
   - Categories and sorting
   - Image deletion

9. **Messages**
   - Contact form submissions
   - Read/unread status
   - Message details

10. **Newsletter**
    - Subscriber list
    - Newsletter composition
    - Send to subscribers
    - Unsubscribe management

11. **Analytics**
    - Page views tracking
    - Appointment trends
    - Patient demographics
    - Popular services
    - Blog views

12. **User Roles**
    - Admin, Doctor, Staff roles
    - Role-based access control
    - User management

13. **Settings**
    - Site information
    - Contact details
    - Social media links
    - System configuration

### Authentication System

- JWT with httpOnly cookies
- Refresh token rotation
- RBAC (Admin, Doctor, Staff)
- Patient accounts optional for appointment tracking
- Secure password hashing (bcrypt)

### API Endpoints

- RESTful design
- Proper HTTP methods and status codes
- Input validation
- Error handling
- Rate limiting

## Non-Functional Requirements

### Performance

- Mobile-first responsive design
- Optimized images with automatic resizing
- Fast page loads

### Security

- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF protection
- Rate limiting
- Secure authentication

### Scalability

- SQLite for current scale (<10K patients)
- Architecture supports future database migration if needed

### SEO

- Client-side rendering sufficient for current needs
- Meta tags for social sharing
- Semantic HTML

### Internationalization

- English only for now
- Architecture supports future i18n

### Offline Capability

- PWA not required initially
- Architecture supports future PWA addition

## Open Questions

1. **Payment Integration:** Paystack chosen (popular in Nigeria, Stripe-owned)
2. **Email Service:** Nodemailer with SMTP (configurable)
3. **Image Optimization:** Automatic resizing on upload via Sharp
4. **SEO:** Client-side rendering sufficient
5. **Internationalization:** English only
6. **Offline Capability:** Not required initially

## Success Criteria

- Fully functional public website with all pages
- Admin panel with complete CRUD operations
- Secure authentication system
- Working appointment booking flow
- Blog with rich text editing
- Donation system with Paystack
- Newsletter subscription
- Analytics tracking
- Responsive design across all devices
- Production deployment ready

## Constraints

- Single developer/small team
- Greenfield project (empty directory)
- Budget constraints (use free/open-source tools where possible)
- Timeline: Phased implementation over 6 phases
