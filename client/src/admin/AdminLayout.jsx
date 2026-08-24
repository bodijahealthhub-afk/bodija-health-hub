import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import CommandPalette from './CommandPalette';
import useAdminFetch from './useAdminFetch';
import { PermissionProvider } from '../context/PermissionContext';

const BREADCRUMB_MAP = {
  dashboard: 'Dashboard',
  appointments: 'Appointments',
  patients: 'Patients',
  services: 'Services',
  'service-categories': 'Service Categories',
  providers: 'Providers',
  partners: 'Partners',
  blog: 'Blog',
  events: 'Events',
  programmes: 'Programmes',
  gallery: 'Gallery',
  messages: 'Messages',
  newsletter: 'Newsletter',
  testimonials: 'Testimonials',
  settings: 'Settings',
  'site-content': 'Site Content',
  'hero-content': 'Hero Content',
  'footer-content': 'Footer Content',
  'navigation-content': 'Navigation',
  'page-content': 'Page Content',
  'site-settings': 'Site Appearance',
  media: 'Media Library',
  seo: 'SEO',
  backup: 'Backups',
  'system-health': 'System Health',
  payments: 'Payments',
  features: 'Feature Flags',
  'admin-users': 'Users',
};

const DYNAMIC_SEGMENTS = new Set(['new']);

function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  if (segments.length < 2 || segments[0] !== 'admin') return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
      <Link to="/admin" className="hover:text-primary transition-colors">Home</Link>
      {segments.slice(1).map((seg, i) => {
        const isLast = i === segments.length - 2;
        const label = DYNAMIC_SEGMENTS.has(seg)
          ? seg.charAt(0).toUpperCase() + seg.slice(1)
          : BREADCRUMB_MAP[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return (
          <span key={i} className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {isLast ? (
              <span className="text-gray-900 font-medium">{label}</span>
            ) : (
              <Link to={`/admin/${seg}`} className="hover:text-primary transition-colors">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

const AdminLayoutInner = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const navigate = useNavigate();
  const location = useLocation();

  const [dashboardData] = useAdminFetch('/api/admin/dashboard');
  const [messagesData] = useAdminFetch('/api/messages');
  const unreadMessages = Array.isArray(messagesData)
    ? messagesData.filter((m) => m.status === 'unread' || !m.read).length
    : messagesData?.messages?.filter((m) => m.status === 'unread' || !m.read).length || 0;
  const pendingBookings = dashboardData?.stats?.pendingAppointments || 0;

  const badges = {};
  if (unreadMessages > 0) badges['/admin/messages'] = unreadMessages;
  if (pendingBookings > 0) badges['/admin/appointments'] = pendingBookings;

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    if (!token) { navigate('/admin/login'); return; }
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { setUser({ name: 'Admin', role: 'admin' }); }
    }
  }, [navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handler = () => setCommandPaletteOpen(true);
    document.addEventListener('open-command-palette', handler);
    return () => document.removeEventListener('open-command-palette', handler);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    if (isMobile) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar
        collapsed={isMobile ? !mobileMenuOpen : sidebarCollapsed}
        onToggle={handleSidebarToggle}
        badges={badges}
      />

      <div
        className={`transition-all duration-300 ${
          isMobile
            ? ''
            : sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        }`}
      >
        <TopBar onMenuToggle={handleSidebarToggle} user={user} onOpenSearch={() => setCommandPaletteOpen(true)} />
        <main className="p-4 lg:p-6 max-w-[1600px]">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>

      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
};

const AdminLayout = () => (
  <PermissionProvider>
    <AdminLayoutInner />
  </PermissionProvider>
);

export default AdminLayout;
