import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminToken } from '../utils/api';

function useAdminFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const token = getAdminToken();
      const res = await fetch(url, {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return [data, loading];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Never';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 7) return days + 'd ago';
  const weeks = Math.floor(days / 7);
  return weeks + 'w ago';
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === undefined || value === null) return;
    const target = Number(value) || 0;
    const duration = 800;
    const startTime = Date.now();
    const startVal = display;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}

function SkeletonBlock({ className }) {
  return <div className={'animate-pulse bg-gray-100 rounded-xl ' + (className || '')} />;
}

function StatusDot({ status }) {
  const color =
    status === 'healthy' || status === 'active' || status === 'green'
      ? 'bg-emerald-500'
      : status === 'degraded' || status === 'warning' || status === 'yellow'
        ? 'bg-amber-500'
        : 'bg-red-500';
  return (
    <span className={'relative flex h-2.5 w-2.5'}>
      <span className={'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ' + color} />
      <span className={'relative inline-flex h-2.5 w-2.5 rounded-full ' + color} />
    </span>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      {icon}
      <p className="mt-2 text-sm">{text}</p>
    </div>
  );
}

/* ─── Icons (Heroicons-style, strokeWidth 2) ─── */

const IconService = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-4.25-11.396c.251.023.501.05.75.082M12 21a8.966 8.966 0 0 0 5.982-2.275M12 21a8.966 8.966 0 0 1-5.982-2.275M15.75 3.186a24.284 24.284 0 0 1 2.013.445M8.25 3.186a24.284 24.284 0 0 0-2.013.445M17.25 21c.145-.134.285-.272.42-.414M6.75 21c-.145-.134-.285-.272-.42-.414" />
  </svg>
);

const IconPartner = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
  </svg>
);

const IconProgramme = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
  </svg>
);

const IconReach = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

const IconAction = ({ path }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const IconChevron = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

/* ─── KPI Card ─── */

function KpiCard({ icon, label, value, gradient }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            <AnimatedNumber value={value} />
          </p>
        </div>
        <div className={'flex-shrink-0 ml-4 flex items-center justify-center w-12 h-12 rounded-xl ' + gradient}>
          <span className="text-white">{icon}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Health Indicator ─── */

function HealthIndicator({ label, subtitle, status }) {
  const dotColor =
    status === 'healthy' || status === 'active'
      ? 'bg-emerald-500'
      : status === 'degraded' || status === 'warning'
        ? 'bg-amber-500'
        : 'bg-red-500';

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className={'flex-shrink-0 w-2.5 h-2.5 rounded-full ' + dotColor} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
          {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
        </div>
      </div>
      <span className="flex-shrink-0 text-xs font-medium text-gray-500 capitalize ml-4">
        {status || 'Unknown'}
      </span>
    </div>
  );
}

/* ─── Activity Item ─── */

function ActivityItem({ entry }) {
  const actionText = entry.action || entry.description || 'Performed an action';
  const userName = entry.user || entry.adminName || entry.performedBy || 'System';
  const timestamp = entry.createdAt || entry.timestamp;

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
        <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700">
          <span className="font-medium text-gray-900">{userName}</span>{' '}
          {actionText}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(timestamp)}</p>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */

export default function Dashboard() {
  const navigate = useNavigate();

  const [healthData, healthLoading] = useAdminFetch('/api/admin/system-health');
  const [servicesData, servicesLoading] = useAdminFetch('/api/admin/services');
  const [partnersData, partnersLoading] = useAdminFetch('/api/admin/partners');
  const [programmesData, programmesLoading] = useAdminFetch('/api/admin/programmes');
  const [eventsData, eventsLoading] = useAdminFetch('/api/events/admin');
  const [messagesData, messagesLoading] = useAdminFetch('/api/messages');
  const [featuresData, featuresLoading] = useAdminFetch('/api/admin/features');
  const [dashboardData, dashboardLoading] = useAdminFetch('/api/admin/dashboard');
  const [auditData, auditLoading] = useAdminFetch('/api/admin/audit-logs?limit=10');
  const [blogData, blogLoading] = useAdminFetch('/api/blog/admin');
  const [testimonialsData, testimonialsLoading] = useAdminFetch('/api/testimonials');
  const [galleryData, galleryLoading] = useAdminFetch('/api/gallery');

  const serverHealthy = healthData?.status?.server === 'healthy';

  const activePartnersCount = partnersData?.partners
    ? partnersData.partners.filter(function (p) {
        return p.status === 'active';
      }).length
    : 0;

  const publishedServicesCount = servicesData?.services
    ? servicesData.services.filter(function (s) {
        return s.status === 'active';
      }).length
    : 0;

  const programmesCount = programmesData?.programmes
    ? programmesData.programmes.length
    : 0;

  const communityReach = dashboardData?.stats?.totalPatients || 0;

  const activeProgrammes = programmesData?.programmes
    ? programmesData.programmes.filter(function (p) {
        return p.status === 'active';
      }).slice(0, 5)
    : [];

  const activeEvents = eventsData?.events
    ? eventsData.events.filter(function (e) {
        return e.status === 'active' || e.status === 'upcoming';
      }).slice(0, 5)
    : [];

  const messages = Array.isArray(messagesData) ? messagesData : messagesData?.messages || [];
  const unreadCount = messages.filter(function (m) {
    return m.status === 'unread' || !m.read;
  }).length;
  const resolvedCount = messages.filter(function (m) {
    return m.status === 'resolved' || m.status === 'closed';
  }).length;
  const latestMessages = messages.slice(0, 3);

  const features = Array.isArray(featuresData) ? featuresData : featuresData?.features || [];

  const auditLogs = Array.isArray(auditData) ? auditData : auditData?.logs || [];
  const blogPosts = blogData?.posts || [];
  const testimonialsList = Array.isArray(testimonialsData)
    ? testimonialsData
    : testimonialsData?.testimonials || [];
  const galleryImages = Array.isArray(galleryData)
    ? galleryData
    : galleryData?.images || [];

  const healthItems = [
    {
      label: 'Backend API',
      subtitle: 'Node.js server',
      status: serverHealthy ? 'healthy' : 'offline',
    },
    {
      label: 'Database',
      subtitle: 'MongoDB Atlas',
      status: healthData?.status?.database || 'unknown',
    },
    {
      label: 'Feature Flags',
      subtitle: 'Configuration service',
      status: healthData?.status?.featureFlags || 'unknown',
    },
    {
      label: 'Backups',
      subtitle: 'Daily snapshots',
      status: healthData?.status?.backups || 'unknown',
    },
    {
      label: 'Email',
      subtitle: 'SMTP service',
      status: healthData?.status?.email || 'unknown',
    },
    {
      label: 'Payments',
      subtitle: 'Stripe integration',
      status: healthData?.status?.payments || 'unknown',
    },
  ];

  const quickActions = [
    { label: 'Add Service', path: '/admin/services/new', iconPath: 'M12 4.5v15m7.5-7.5h-15' },
    { label: 'New Programme', path: '/admin/programmes/new', iconPath: 'M12 4.5v15m7.5-7.5h-15' },
    { label: 'Add Partner', path: '/admin/partners/new', iconPath: 'M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z' },
    { label: 'Write Article', path: '/admin/blog/new', iconPath: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10' },
    { label: 'Upload Media', path: '/admin/media', iconPath: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5' },
    { label: 'Open Inbox', path: '/admin/inbox', iconPath: 'M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.98l7.5-4.04a2.25 2.25 0 0 1 2.134 0l7.5 4.04a2.25 2.25 0 0 1 1.183 1.98V19.5Z' },
  ];

  function getStatusColor(status) {
    if (status === 'Active') return 'text-emerald-600 bg-emerald-50';
    if (status === 'Coming Soon') return 'text-amber-600 bg-amber-50';
    if (status === 'Archived') return 'text-gray-500 bg-gray-50';
    return 'text-red-600 bg-red-50';
  }

  function getFeatureStatus(feature) {
    if (feature.enabled === true || feature.status === 'active') return 'Active';
    if (feature.enabled === false && feature.status === 'coming_soon') return 'Coming Soon';
    if (feature.status === 'archived') return 'Archived';
    return 'Disabled';
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ═══════════════════ DASHBOARD HERO ═══════════════════ */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] p-8 mb-8">
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                {getGreeting()}, Admin
              </h1>
              <p className="mt-1 text-gray-400 text-sm">
                Here&apos;s what&apos;s happening across your health hub today.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <StatusDot status={serverHealthy ? 'healthy' : healthLoading ? 'warning' : 'red'} />
                <span className="text-sm font-medium text-white">
                  {serverHealthy ? 'System Healthy' : healthLoading ? 'Checking...' : 'Offline'}
                </span>
              </div>
              <div className="text-xs text-gray-500 hidden sm:block">
                Last synced {timeAgo(healthData?.lastChecked || healthData?.timestamp)}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════ KPI OVERVIEW ═══════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {healthLoading || partnersLoading ? (
            <>
              <SkeletonBlock className="h-28" />
              <SkeletonBlock className="h-28" />
              <SkeletonBlock className="h-28" />
              <SkeletonBlock className="h-28" />
            </>
          ) : (
            <>
              <KpiCard
                icon={<IconPartner />}
                label="Active Partners"
                value={activePartnersCount}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <KpiCard
                icon={<IconService />}
                label="Published Services"
                value={publishedServicesCount}
                gradient="bg-gradient-to-br from-teal-500 to-emerald-600"
              />
              <KpiCard
                icon={<IconProgramme />}
                label="Programmes"
                value={programmesCount}
                gradient="bg-gradient-to-br from-purple-500 to-purple-600"
              />
              <KpiCard
                icon={<IconReach />}
                label="Community Reach"
                value={communityReach}
                gradient="bg-gradient-to-br from-amber-500 to-orange-500"
              />
            </>
          )}
        </div>

        {/* ═══════════════════ HEALTH + QUICK ACTIONS ═══════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Health Panel */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ecosystem Health</h2>
            {healthLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map(function (n) {
                  return (
                    <div key={n} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-100 animate-pulse" />
                        <SkeletonBlock className="h-4 w-32" />
                      </div>
                      <SkeletonBlock className="h-4 w-16" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {healthItems.map(function (item) {
                  return (
                    <HealthIndicator
                      key={item.label}
                      label={item.label}
                      subtitle={item.subtitle}
                      status={item.status}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-white border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(function (action) {
                return (
                  <button
                    key={action.label}
                    onClick={function () {
                      navigate(action.path);
                    }}
                    className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center transition-all duration-200 hover:shadow-md hover:border-teal-100 hover:bg-teal-50/30 hover:-translate-y-0.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                      <IconAction path={action.iconPath} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════════════════ ACTIVITY + CONTENT PERFORMANCE ═══════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <button
                onClick={function () {
                  navigate('/admin/audit-logs');
                }}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View all <IconChevron />
              </button>
            </div>
            {auditLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(function (n) {
                  return (
                    <div key={n} className="flex items-start gap-3 py-3">
                      <SkeletonBlock className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <SkeletonBlock className="h-4 w-3/4" />
                        <SkeletonBlock className="h-3 w-1/4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : auditLogs.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                }
                text="No recent activity"
              />
            ) : (
              <div className="divide-y divide-gray-50">
                {auditLogs.map(function (entry, idx) {
                  const key = entry._id || entry.id || idx;
                  return <ActivityItem key={key} entry={entry} />;
                })}
              </div>
            )}
          </div>

          {/* Content Performance */}
          <div className="rounded-2xl bg-white border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Overview</h2>
            {blogLoading || servicesLoading || partnersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7].map(function (n) {
                  return (
                    <div key={n} className="flex items-center justify-between py-2">
                      <SkeletonBlock className="h-4 w-24" />
                      <SkeletonBlock className="h-4 w-8" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {[
                  { label: 'Services', count: servicesData?.services?.length || 0 },
                  { label: 'Partners', count: partnersData?.partners?.length || 0 },
                  { label: 'Events', count: eventsData?.events?.length || 0 },
                  { label: 'Programmes', count: programmesCount },
                  { label: 'Blog Posts', count: blogPosts.length },
                  { label: 'Testimonials', count: testimonialsList.length },
                  { label: 'Media', count: galleryImages.length },
                ].map(function (item) {
                  return (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════ PROGRAMMES + EVENTS + INBOX ═══════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* ── Programmes Widget ── */}
          <div className="rounded-2xl bg-white border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Programmes</h2>
              <button
                onClick={function () { navigate('/admin/programmes'); }}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View all <IconChevron />
              </button>
            </div>
            {programmesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(function (n) {
                  return <SkeletonBlock key={n} className="h-14 w-full" />;
                })}
              </div>
            ) : activeProgrammes.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25Z" />
                  </svg>
                }
                text="No active programmes"
              />
            ) : (
              <div className="space-y-2">
                {activeProgrammes.map(function (prog) {
                  const key = prog._id || prog.id || prog.name;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={function () { navigate('/admin/programmes'); }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {prog.name || prog.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {prog.category || 'Health Programme'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Events Widget ── */}
          <div className="rounded-2xl bg-white border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Events</h2>
              <button
                onClick={function () { navigate('/admin/events'); }}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View all <IconChevron />
              </button>
            </div>
            {eventsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(function (n) {
                  return <SkeletonBlock key={n} className="h-14 w-full" />;
                })}
              </div>
            ) : activeEvents.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                }
                text="No upcoming events"
              />
            ) : (
              <div className="space-y-2">
                {activeEvents.map(function (evt) {
                  const key = evt._id || evt.id || evt.title;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={function () { navigate('/admin/events'); }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {evt.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {evt.date ? new Date(evt.date).toLocaleDateString() : 'Date TBA'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Inbox Widget ── */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-white border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
                <button
                  onClick={function () { navigate('/admin/inbox'); }}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  Open Inbox <IconChevron />
                </button>
              </div>

              {/* Stats */}
              {messagesLoading ? (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[1, 2, 3].map(function (n) {
                    return <SkeletonBlock key={n} className="h-16" />;
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="rounded-xl bg-red-50 p-3 text-center">
                    <p className="text-xl font-semibold text-red-600">{unreadCount}</p>
                    <p className="text-[10px] font-medium text-red-500 uppercase tracking-wide">Unread</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3 text-center">
                    <p className="text-xl font-semibold text-emerald-600">{resolvedCount}</p>
                    <p className="text-[10px] font-medium text-emerald-500 uppercase tracking-wide">Resolved</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3 text-center">
                    <p className="text-xl font-semibold text-amber-600">{messages.length}</p>
                    <p className="text-[10px] font-medium text-amber-500 uppercase tracking-wide">Total</p>
                  </div>
                </div>
              )}

              {/* Latest Messages */}
              {messagesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(function (n) {
                    return (
                      <div key={n} className="flex items-center gap-3">
                        <SkeletonBlock className="w-8 h-8 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                          <SkeletonBlock className="h-3 w-24" />
                          <SkeletonBlock className="h-3 w-32" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : latestMessages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No messages yet</p>
              ) : (
                <div className="space-y-3">
                  {latestMessages.map(function (msg) {
                    const key = msg._id || msg.id || msg.createdAt;
                    const senderName = msg.name || msg.sender || msg.from || 'Anonymous';
                    const preview = msg.message || msg.body || msg.text || '';
                    return (
                      <div
                        key={key}
                        className="flex items-start gap-3 cursor-pointer rounded-lg p-2 -m-2 hover:bg-gray-50 transition-colors"
                        onClick={function () { navigate('/admin/inbox'); }}
                      >
                        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-teal-600">
                            {senderName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">{senderName}</p>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">
                              {timeAgo(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{preview}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Feature Status Panel ── */}
            <div className="rounded-2xl bg-white border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Status</h2>
              {featuresLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map(function (n) {
                    return (
                      <div key={n} className="flex items-center justify-between py-2">
                        <SkeletonBlock className="h-4 w-28" />
                        <SkeletonBlock className="h-5 w-16 rounded-full" />
                      </div>
                    );
                  })}
                </div>
              ) : features.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No features configured</p>
              ) : (
                <div className="space-y-2">
                  {features.slice(0, 6).map(function (feat) {
                    const key = feat._id || feat.id || feat.name;
                    const featureStatus = getFeatureStatus(feat);
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {feat.name || feat.label || feat.key}
                        </span>
                        <span
                          className={
                            'text-xs font-semibold px-2.5 py-0.5 rounded-full ' +
                            getStatusColor(featureStatus)
                          }
                        >
                          {featureStatus}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
