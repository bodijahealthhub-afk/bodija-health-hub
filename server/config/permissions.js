const PERMISSIONS = [
  // Dashboard
  { key: 'dashboard.view', name: 'View Dashboard', description: 'View admin dashboard and metrics', module: 'dashboard', action: 'view' },

  // Services
  { key: 'services.view', name: 'View Services', description: 'View services list and details', module: 'services', action: 'view' },
  { key: 'services.create', name: 'Create Services', description: 'Create new services', module: 'services', action: 'create' },
  { key: 'services.update', name: 'Update Services', description: 'Edit existing services', module: 'services', action: 'update' },
  { key: 'services.delete', name: 'Delete Services', description: 'Delete services', module: 'services', action: 'delete' },

  // Service Categories
  { key: 'service_categories.view', name: 'View Service Categories', description: 'View service categories', module: 'service_categories', action: 'view' },
  { key: 'service_categories.create', name: 'Create Service Categories', description: 'Create new service categories', module: 'service_categories', action: 'create' },
  { key: 'service_categories.update', name: 'Update Service Categories', description: 'Edit service categories', module: 'service_categories', action: 'update' },
  { key: 'service_categories.delete', name: 'Delete Service Categories', description: 'Delete service categories', module: 'service_categories', action: 'delete' },

  // Providers
  { key: 'providers.view', name: 'View Providers', description: 'View providers list', module: 'providers', action: 'view' },
  { key: 'providers.create', name: 'Create Providers', description: 'Create new providers', module: 'providers', action: 'create' },
  { key: 'providers.update', name: 'Update Providers', description: 'Edit providers', module: 'providers', action: 'update' },
  { key: 'providers.delete', name: 'Delete Providers', description: 'Delete providers', module: 'providers', action: 'delete' },

  // Partners
  { key: 'partners.view', name: 'View Partners', description: 'View partners list', module: 'partners', action: 'view' },
  { key: 'partners.create', name: 'Create Partners', description: 'Create new partners', module: 'partners', action: 'create' },
  { key: 'partners.update', name: 'Update Partners', description: 'Edit partners', module: 'partners', action: 'update' },
  { key: 'partners.delete', name: 'Delete Partners', description: 'Delete partners', module: 'partners', action: 'delete' },

  // Programmes
  { key: 'programmes.view', name: 'View Programmes', description: 'View programmes list', module: 'programmes', action: 'view' },
  { key: 'programmes.create', name: 'Create Programmes', description: 'Create new programmes', module: 'programmes', action: 'create' },
  { key: 'programmes.update', name: 'Update Programmes', description: 'Edit programmes', module: 'programmes', action: 'update' },
  { key: 'programmes.delete', name: 'Delete Programmes', description: 'Delete programmes', module: 'programmes', action: 'delete' },

  // Events
  { key: 'events.view', name: 'View Events', description: 'View events list', module: 'events', action: 'view' },
  { key: 'events.create', name: 'Create Events', description: 'Create new events', module: 'events', action: 'create' },
  { key: 'events.update', name: 'Update Events', description: 'Edit events', module: 'events', action: 'update' },
  { key: 'events.delete', name: 'Delete Events', description: 'Delete events', module: 'events', action: 'delete' },

  // Blog
  { key: 'blog.view', name: 'View Blog Posts', description: 'View blog posts', module: 'blog', action: 'view' },
  { key: 'blog.create', name: 'Create Blog Posts', description: 'Create new blog posts', module: 'blog', action: 'create' },
  { key: 'blog.update', name: 'Update Blog Posts', description: 'Edit blog posts', module: 'blog', action: 'update' },
  { key: 'blog.publish', name: 'Publish Blog Posts', description: 'Publish or unpublish blog posts', module: 'blog', action: 'publish' },
  { key: 'blog.delete', name: 'Delete Blog Posts', description: 'Delete blog posts', module: 'blog', action: 'delete' },

  // Gallery
  { key: 'gallery.view', name: 'View Gallery', description: 'View gallery images', module: 'gallery', action: 'view' },
  { key: 'gallery.create', name: 'Upload to Gallery', description: 'Upload images to gallery', module: 'gallery', action: 'create' },
  { key: 'gallery.update', name: 'Update Gallery', description: 'Edit gallery items', module: 'gallery', action: 'update' },
  { key: 'gallery.delete', name: 'Delete Gallery Items', description: 'Delete gallery images', module: 'gallery', action: 'delete' },

  // Testimonials
  { key: 'testimonials.view', name: 'View Testimonials', description: 'View testimonials', module: 'testimonials', action: 'view' },
  { key: 'testimonials.create', name: 'Create Testimonials', description: 'Create new testimonials', module: 'testimonials', action: 'create' },
  { key: 'testimonials.update', name: 'Update Testimonials', description: 'Edit testimonials', module: 'testimonials', action: 'update' },
  { key: 'testimonials.delete', name: 'Delete Testimonials', description: 'Delete testimonials', module: 'testimonials', action: 'delete' },

  // Bookings / Service Requests
  { key: 'bookings.view', name: 'View Bookings', description: 'View bookings and service requests', module: 'bookings', action: 'view' },
  { key: 'bookings.create', name: 'Create Bookings', description: 'Create new bookings', module: 'bookings', action: 'create' },
  { key: 'bookings.update', name: 'Update Bookings', description: 'Update booking status and details', module: 'bookings', action: 'update' },
  { key: 'bookings.assign', name: 'Assign Bookings', description: 'Assign bookings to team members', module: 'bookings', action: 'assign' },
  { key: 'bookings.cancel', name: 'Cancel Bookings', description: 'Cancel bookings', module: 'bookings', action: 'cancel' },

  // Messages
  { key: 'messages.view', name: 'View Messages', description: 'View contact messages', module: 'messages', action: 'view' },
  { key: 'messages.update', name: 'Update Messages', description: 'Mark messages as read/resolved', module: 'messages', action: 'update' },
  { key: 'messages.delete', name: 'Delete Messages', description: 'Delete messages', module: 'messages', action: 'delete' },

  // Newsletter
  { key: 'newsletter.view', name: 'View Newsletter', description: 'View newsletter subscribers', module: 'newsletter', action: 'view' },
  { key: 'newsletter.manage', name: 'Manage Newsletter', description: 'Manage newsletter subscribers and settings', module: 'newsletter', action: 'manage' },

  // Payments
  { key: 'payments.view', name: 'View Payments', description: 'View payment records', module: 'payments', action: 'view' },
  { key: 'payments.manage', name: 'Manage Payments', description: 'Manage payment settings and processing', module: 'payments', action: 'manage' },

  // Media
  { key: 'media.view', name: 'View Media', description: 'View media library', module: 'media', action: 'view' },
  { key: 'media.upload', name: 'Upload Media', description: 'Upload files to media library', module: 'media', action: 'upload' },
  { key: 'media.delete', name: 'Delete Media', description: 'Delete media files', module: 'media', action: 'delete' },

  // SEO
  { key: 'seo.view', name: 'View SEO Settings', description: 'View SEO configuration', module: 'seo', action: 'view' },
  { key: 'seo.manage', name: 'Manage SEO', description: 'Update SEO settings', module: 'seo', action: 'manage' },

  // Site Content
  { key: 'content.view', name: 'View Site Content', description: 'View site content sections', module: 'content', action: 'view' },
  { key: 'content.update', name: 'Update Site Content', description: 'Update site content sections', module: 'content', action: 'update' },

  // Navigation
  { key: 'navigation.view', name: 'View Navigation', description: 'View navigation configuration', module: 'navigation', action: 'view' },
  { key: 'navigation.update', name: 'Update Navigation', description: 'Update navigation configuration', module: 'navigation', action: 'update' },

  // Hero Section
  { key: 'hero.view', name: 'View Hero Section', description: 'View hero section configuration', module: 'hero', action: 'view' },
  { key: 'hero.update', name: 'Update Hero Section', description: 'Update hero section configuration', module: 'hero', action: 'update' },

  // Footer
  { key: 'footer.view', name: 'View Footer', description: 'View footer configuration', module: 'footer', action: 'view' },
  { key: 'footer.update', name: 'Update Footer', description: 'Update footer configuration', module: 'footer', action: 'update' },

  // Page Content
  { key: 'page_content.view', name: 'View Page Content', description: 'View page content sections', module: 'page_content', action: 'view' },
  { key: 'page_content.update', name: 'Update Page Content', description: 'Update page content sections', module: 'page_content', action: 'update' },

  // Settings
  { key: 'settings.view', name: 'View Settings', description: 'View system settings', module: 'settings', action: 'view' },
  { key: 'settings.manage', name: 'Manage Settings', description: 'Update system settings', module: 'settings', action: 'manage' },

  // Site Settings
  { key: 'site_settings.view', name: 'View Site Appearance', description: 'View site appearance settings', module: 'site_settings', action: 'view' },
  { key: 'site_settings.manage', name: 'Manage Site Appearance', description: 'Update site appearance settings', module: 'site_settings', action: 'manage' },

  // Feature Flags
  { key: 'feature_flags.view', name: 'View Feature Flags', description: 'View feature flag status', module: 'feature_flags', action: 'view' },
  { key: 'feature_flags.manage', name: 'Manage Feature Flags', description: 'Toggle and manage feature flags', module: 'feature_flags', action: 'manage' },

  // Users
  { key: 'users.view', name: 'View Users', description: 'View admin user list', module: 'users', action: 'view' },
  { key: 'users.create', name: 'Create Users', description: 'Create new admin users', module: 'users', action: 'create' },
  { key: 'users.update', name: 'Update Users', description: 'Update admin user details', module: 'users', action: 'update' },
  { key: 'users.disable', name: 'Disable Users', description: 'Enable or disable admin accounts', module: 'users', action: 'disable' },
  { key: 'users.manage_roles', name: 'Manage User Roles', description: 'Change admin user roles', module: 'users', action: 'manage_roles' },

  // System Health
  { key: 'system_health.view', name: 'View System Health', description: 'View system health status', module: 'system_health', action: 'view' },

  // Backups
  { key: 'backups.view', name: 'View Backups', description: 'View backup list', module: 'backups', action: 'view' },
  { key: 'backups.create', name: 'Create Backups', description: 'Create new backups', module: 'backups', action: 'create' },
  { key: 'backups.restore', name: 'Restore Backups', description: 'Restore from backup', module: 'backups', action: 'restore' },

  // Content Revisions
  { key: 'content.revisions.view', name: 'View Content Revisions', description: 'View content revision history', module: 'content', action: 'revisions.view' },
  { key: 'content.revisions.restore', name: 'Restore Content Revisions', description: 'Restore content to a previous revision', module: 'content', action: 'revisions.restore' },

  // Notifications
  { key: 'notifications.view', name: 'View Notifications', description: 'View admin notifications', module: 'notifications', action: 'view' },
  { key: 'notifications.manage', name: 'Manage Notifications', description: 'Mark notifications as read, delete', module: 'notifications', action: 'manage' },

  // Analytics
  { key: 'analytics.view', name: 'View Analytics', description: 'View site analytics and reports', module: 'analytics', action: 'view' },

  // Contacts (CRM)
  { key: 'contacts.view', name: 'View Contacts', description: 'View CRM contact list', module: 'contacts', action: 'view' },
  { key: 'contacts.create', name: 'Create Contacts', description: 'Create new CRM contacts', module: 'contacts', action: 'create' },
  { key: 'contacts.update', name: 'Update Contacts', description: 'Edit CRM contact details', module: 'contacts', action: 'update' },

  // Audit Logs
  { key: 'audit_logs.view', name: 'View Audit Logs', description: 'View audit log entries', module: 'audit_logs', action: 'view' },
];

module.exports = { PERMISSIONS };
