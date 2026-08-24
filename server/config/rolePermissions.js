const ROLE_PERMISSIONS = {
  super_admin: ['*'],

  admin: [
    'dashboard.view',
    'services.*',
    'service_categories.*',
    'providers.*',
    'partners.*',
    'programmes.*',
    'events.*',
    'blog.*',
    'gallery.*',
    'testimonials.*',
    'bookings.*',
    'messages.*',
    'newsletter.*',
    'payments.*',
    'media.*',
    'seo.*',
    'content.*',
    'navigation.*',
    'hero.*',
    'footer.*',
    'page_content.*',
    'settings.view',
    'site_settings.*',
    'feature_flags.*',
    'users.view',
    'users.create',
    'users.update',
    'users.disable',
    'users.manage_roles',
    'system_health.view',
    'backups.*',
    'audit_logs.view',
  ],

  content_manager: [
    'dashboard.view',
    'services.view',
    'content.*',
    'blog.*',
    'events.*',
    'gallery.*',
    'testimonials.*',
    'media.view',
    'media.upload',
    'seo.view',
    'seo.manage',
    'navigation.view',
    'navigation.update',
    'hero.view',
    'hero.update',
    'footer.view',
    'footer.update',
    'page_content.view',
    'page_content.update',
  ],

  receptionist: [
    'dashboard.view',
    'services.view',
    'providers.view',
    'partners.view',
    'programmes.view',
    'events.view',
    'bookings.*',
    'messages.*',
    'newsletter.view',
  ],

  accountant: [
    'dashboard.view',
    'services.view',
    'payments.*',
    'bookings.view',
  ],

  doctor: [],
};

const ROLE_DISPLAY_NAMES = {
  super_admin: 'Super Administrator',
  admin: 'Administrator',
  content_manager: 'Content Manager',
  receptionist: 'Operations Manager',
  accountant: 'Finance Manager',
  doctor: 'Doctor (Archived)',
};

const ACTIVE_ROLES = ['super_admin', 'admin', 'content_manager', 'receptionist', 'accountant'];

module.exports = { ROLE_PERMISSIONS, ROLE_DISPLAY_NAMES, ACTIVE_ROLES };
