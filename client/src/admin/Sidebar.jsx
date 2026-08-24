import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useFeatures } from '../context/FeatureContext';
import { usePermissions } from '../context/PermissionContext';

const STORAGE_KEY = 'bhh_sidebar_expanded';

const navGroups = [
  {
    label: 'DASHBOARD',
    items: [
      { path: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', permission: 'dashboard.view' },
    ],
  },
  {
    label: 'BHH ECOSYSTEM',
    items: [
      { path: '/admin/services', label: 'Services', icon: 'M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-4.25-11.396c.251.023.501.05.75.082M12 21a8.966 8.966 0 0 0 5.982-2.275M12 21a8.966 8.966 0 0 1-5.982-2.275M15.75 3.186a24.284 24.284 0 0 1 2.013.445M8.25 3.186a24.284 24.284 0 0 0-2.013.445M17.25 21c.145-.134.285-.272.42-.414M6.75 21c-.145-.134-.285-.272-.42-.414', permission: 'services.view', featureKey: 'services' },
      { path: '/admin/service-categories', label: 'Service Categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', permission: 'service_categories.view', featureKey: 'services' },
      { path: '/admin/providers', label: 'Providers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', permission: 'providers.view' },
      { path: '/admin/programmes', label: 'Programmes', icon: 'M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342', permission: 'programmes.view', featureKey: 'programme_registration' },
      { path: '/admin/partners', label: 'Partners', icon: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z', permission: 'partners.view', featureKey: 'partners_section' },
    ],
  },
  {
    label: 'CONTENT & MARKETING',
    items: [
      { path: '/admin/site-content', label: 'Site Content', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', permission: 'content.view' },
      { path: '/admin/blog', label: 'News/Blog', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', permission: 'blog.view', featureKey: 'blog' },
      { path: '/admin/events', label: 'Events', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5', permission: 'events.view', featureKey: 'events' },
      { path: '/admin/gallery', label: 'Gallery', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', permission: 'gallery.view' },
      { path: '/admin/testimonials', label: 'Testimonials', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', permission: 'testimonials.view', featureKey: 'testimonials' },
      { path: '/admin/seo', label: 'SEO', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', permission: 'seo.view' },
    ],
  },
  {
    label: 'COMMUNICATIONS',
    items: [
      { path: '/admin/appointments', label: 'Bookings', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5', permission: 'bookings.view' },
      { path: '/admin/messages', label: 'Messages', icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75', permission: 'messages.view', featureKey: 'contact_form' },
      { path: '/admin/newsletter', label: 'Newsletter', icon: 'M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z', permission: 'newsletter.view', featureKey: 'newsletter' },
    ],
  },
  {
    label: 'SITE CONFIGURATION',
    items: [
      { path: '/admin/navigation-content', label: 'Navigation', icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5', permission: 'navigation.view' },
      { path: '/admin/hero-content', label: 'Hero Section', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 18V6.75a2.25 2.25 0 012.25-2.25h15a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0119.5 20.25H4.5A2.25 2.25 0 012.25 18z', permission: 'hero.view' },
      { path: '/admin/footer-content', label: 'Footer', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', permission: 'footer.view' },
      { path: '/admin/page-content', label: 'Page Content', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', permission: 'page_content.view' },
      { path: '/admin/media', label: 'Media Library', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', permission: 'media.view' },
      { path: '/admin/payments', label: 'Payments', icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z', permission: 'payments.view', featureKey: 'payment_system' },
      { path: '/admin/settings', label: 'Settings', icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z', permission: 'settings.view' },
      { path: '/admin/site-settings', label: 'Site Appearance', icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42', permission: 'site_settings.view' },
    ],
  },
  {
    label: 'ADMINISTRATION',
    items: [
      { path: '/admin/features', label: 'Feature Flags', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z', permission: 'feature_flags.view' },
      { path: '/admin/admin-users', label: 'Users', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0Zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', permission: 'users.view' },
      { path: '/admin/system-health', label: 'System Health', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z', permission: 'system_health.view' },
      { path: '/admin/backup', label: 'Backups', icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z', permission: 'backups.view' },
    ],
  },
];

const Sidebar = ({ collapsed, onToggle, badges = {} }) => {
  const { isEnabled } = useFeatures();
  const { hasPermission, role: userRole } = usePermissions();
  const [expandedGroups, setExpandedGroups] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return navGroups.map((g) => g.label);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  const toggleGroup = (label) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const filterByPermission = (items) =>
    items.filter((item) => {
      if (!item.permission) return true;
      if (!hasPermission(item.permission)) return false;
      if (item.featureKey && !isEnabled(item.featureKey)) return false;
      return true;
    });

  return (
    <>
      {!collapsed && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={onToggle} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-[#0f172a] text-slate-300 transition-all duration-300 flex flex-col ${
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-[72px]' : 'w-64'
        }`}
      >
        <div className="flex items-center h-16 px-4 border-b border-white/5">
          {!collapsed && (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20">
                <span className="font-bold text-white text-sm">B</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white text-sm truncate">Bodija Health</p>
                <p className="text-[11px] text-slate-500 truncate">Admin Console</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        {!collapsed && (
          <div className="px-4 py-3 border-b border-white/5">
            <span className="inline-block px-2.5 py-1 text-[11px] font-medium rounded-md bg-teal-500/10 text-teal-400 capitalize">
              {(userRole || 'admin').replace('_', ' ')}
            </span>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10">
          {navGroups.map((group) => {
            const visibleItems = filterByPermission(group.items);
            if (visibleItems.length === 0) return null;
            const isExpanded = expandedGroups.includes(group.label);

            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                    isExpanded ? 'text-slate-400' : 'text-slate-600'
                  } hover:text-slate-300 ${collapsed ? 'justify-center' : ''}`}
                >
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{group.label}</span>
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ease-out ${
                    isExpanded || collapsed ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  {visibleItems.map((item) => {
                    const badgeCount = badges[item.path];
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin'}
                        onClick={() => window.innerWidth < 1024 && onToggle()}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                            collapsed ? 'justify-center' : ''
                          } ${
                            isActive
                              ? 'bg-teal-500/10 text-teal-400 shadow-sm'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white'
                          }`
                        }
                      >
                        <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                        </svg>
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {badgeCount > 0 && (
                              <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-bold rounded-full bg-red-500 text-white">
                                {badgeCount > 99 ? '99+' : badgeCount}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className={`p-3 border-t border-white/5 ${collapsed ? 'hidden' : ''}`}>
          <div className="px-3 py-2 rounded-lg bg-white/5">
            <p className="text-[11px] text-slate-500 text-center">v1.2 &middot; Premium</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
