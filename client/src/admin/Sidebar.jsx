import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useFeatures } from '../context/FeatureContext';

const STORAGE_KEY = 'bhh_sidebar_expanded';

const navGroups = [
  {
    label: 'MAIN',
    items: [
      { path: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['admin', 'super_admin', 'receptionist', 'doctor', 'content_manager'] },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { path: '/admin/site-content', label: 'Site Content', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', roles: ['admin', 'super_admin'] },
      { path: '/admin/services', label: 'Services', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', roles: ['admin', 'super_admin'], featureKey: 'services' },
      { path: '/admin/partners', label: 'Partners', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', roles: ['admin', 'super_admin'], featureKey: 'partners_section' },
      { path: '/admin/programmes', label: 'Programmes', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', roles: ['admin', 'super_admin', 'content_manager'], featureKey: 'programme_registration' },
      { path: '/admin/events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', roles: ['admin', 'super_admin', 'content_manager'], featureKey: 'events' },
      { path: '/admin/blog', label: 'Resources', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', roles: ['admin', 'super_admin', 'content_manager'], featureKey: 'blog' },
      { path: '/admin/gallery', label: 'Gallery', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', roles: ['admin', 'super_admin', 'content_manager'] },
      { path: '/admin/testimonials', label: 'Testimonials', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', roles: ['admin', 'super_admin', 'content_manager'], featureKey: 'testimonials' },
    ],
  },
  {
    label: 'ECOSYSTEM',
    items: [
      { path: '/admin/providers', label: 'Providers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', roles: ['admin', 'super_admin'] },
      { path: '/admin/service-categories', label: 'Categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', roles: ['admin', 'super_admin'], featureKey: 'services' },
      { path: '/admin/features', label: 'Feature Flags', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z', roles: ['admin', 'super_admin'] },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { path: '/admin/appointments', label: 'Bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', roles: ['admin', 'super_admin', 'receptionist'] },
      { path: '/admin/patients', label: 'Patients', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['admin', 'super_admin', 'receptionist'] },
      { path: '/admin/messages', label: 'Messages', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: ['admin', 'super_admin', 'receptionist'], featureKey: 'contact_form' },
      { path: '/admin/newsletter', label: 'Newsletter', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: ['admin', 'super_admin'], featureKey: 'newsletter' },
      { path: '/admin/payments', label: 'Payments', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', roles: ['admin', 'super_admin', 'accountant'], featureKey: 'payment_system' },
    ],
  },
  {
    label: 'WEBSITE',
    items: [
      { path: '/admin/navigation-content', label: 'Navigation', icon: 'M4 6h16M4 12h16M4 18h16', roles: ['admin', 'super_admin'] },
      { path: '/admin/hero-content', label: 'Hero Section', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', roles: ['admin', 'super_admin'] },
      { path: '/admin/footer-content', label: 'Footer', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', roles: ['admin', 'super_admin'] },
      { path: '/admin/seo', label: 'SEO', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', roles: ['admin', 'super_admin'] },
      { path: '/admin/media', label: 'Media Library', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', roles: ['admin', 'super_admin'] },
      { path: '/admin/page-content', label: 'Page Content', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['admin', 'super_admin'] },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { path: '/admin/admin-users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['admin', 'super_admin'] },
      { path: '/admin/system-health', label: 'System Health', icon: 'M9 17g-6 0a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2m-6-4l3 3m0 0l-3 3m3-3H3', roles: ['admin', 'super_admin'] },
      { path: '/admin/backup', label: 'Backups', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', roles: ['admin', 'super_admin'] },
      { path: '/admin/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', roles: ['admin', 'super_admin'] },
    ],
  },
];

const Sidebar = ({ collapsed, onToggle, userRole = 'admin' }) => {
  const { isEnabled } = useFeatures();
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

  const filterByRole = (items) =>
    items.filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;
      if (!item.roles.includes(userRole)) return false;
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
              {userRole.replace('_', ' ')}
            </span>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10">
          {navGroups.map((group) => {
            const visibleItems = filterByRole(group.items);
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
                  {visibleItems.map((item) => (
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
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  ))}
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
