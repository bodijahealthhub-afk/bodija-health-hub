import { useState, useEffect } from 'react';
import StatsCard from './StatsCard';
import StatusBadge from './StatusBadge';
import { BarChart, LineChart, Donut } from './AdminCharts';

const STATUS_COLORS = {
  pending: '#F59E0B',
  confirmed: '#0D9488',
  completed: '#10B981',
  cancelled: '#EF4444',
};

const formatNaira = (n) => `₦${Number(n || 0).toLocaleString('en-US')}`;

function dayLabel(dateStr, range) {
  const d = new Date(dateStr + 'T00:00:00');
  if (range === 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setRecentAppointments(data.recentAppointments || []);
        }
      } catch {}
    };
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/admin/dashboard/analytics?days=${range}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch {}
    };
    Promise.all([fetchDashboard(), fetchAnalytics()]).finally(() => setLoading(false));
  }, [range]);

  const appointmentSeries = analytics
    ? analytics.daily.map((d) => ({ label: dayLabel(d.date, range), value: d.appointments }))
    : [];
  const revenueSeries = analytics
    ? analytics.daily.map((d) => ({ label: dayLabel(d.date, range), value: d.revenue }))
    : [];
  const statusSegments = analytics
    ? (analytics.statusBreakdown || []).map((s) => ({
        label: s.status,
        value: Number(s.count || 0),
        color: STATUS_COLORS[s.status] || '#9CA3AF',
      }))
    : [];

  const summary = analytics?.rangeSummary || null;

  // Mini calendar
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                range === d ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={<svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          value={loading ? '—' : (stats?.todayAppointments ?? 0)}
          label="Today's Appointments"
          trend={summary ? `${summary.totalAppointments} in last ${range} days` : 'Live'}
          trendUp={true}
        />
        <StatsCard
          icon={<svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          value={loading ? '—' : (stats?.totalPatients ?? 0)}
          label="Total Patients"
          trend={summary ? `+${summary.newPatients} new in period` : 'Total'}
          trendUp={true}
        />
        <StatsCard
          icon={<svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          value={loading ? '—' : (stats?.pendingAppointments ?? 0)}
          label="Pending Appointments"
          trend="Awaiting confirmation"
          trendUp={true}
        />
        <StatsCard
          icon={<svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          value={loading ? '—' : (stats?.monthlyRevenue || '₦0')}
          label="Monthly Revenue"
          trend={summary ? `${formatNaira(summary.totalRevenue)} in period` : 'This month'}
          trendUp={true}
        />
      </div>

      {/* Summary strip */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Appointments', value: summary.totalAppointments },
            { label: 'Completed', value: summary.totalCompleted },
            { label: 'Completion rate', value: `${summary.completionRate}%` },
            { label: 'Revenue', value: formatNaira(summary.totalRevenue) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
              <p className="text-xs font-medium text-gray-500">{s.label}</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Appointments — last {range} days</h2>
          <BarChart data={appointmentSeries} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue — last {range} days</h2>
          <LineChart data={revenueSeries} format={formatNaira} />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Appointments</h2>
            <a href="/admin/appointments" className="text-sm text-teal-600 hover:text-teal-700">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentAppointments.length === 0 && !loading && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">No appointments yet</td></tr>
                )}
                {recentAppointments.map((apt, idx) => (
                  <tr key={apt.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{apt.patient}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{apt.service}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{apt.time}</td>
                    <td className="px-6 py-4"><StatusBadge status={apt.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Appointments by Status</h2>
            <Donut segments={statusSegments} />
          </div>

          {/* Top services */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Top Services</h2>
            {(!analytics?.topServices || analytics.topServices.length === 0) ? (
              <p className="text-sm text-gray-400">No bookings in this period</p>
            ) : (
              <div className="space-y-3">
                {analytics.topServices.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate mr-3">{s.name}</span>
                    <span className="font-semibold text-gray-900 flex-shrink-0">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unread messages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Unread Messages</h2>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900">{stats?.unreadMessages ?? 0}</span>
              <a href="/admin/messages" className="text-sm text-teal-600 hover:text-teal-700">View inbox</a>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a href="/admin/appointments/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <span className="text-sm font-medium text-gray-700">New Appointment</span>
              </a>
              <a href="/admin/payments" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <span className="text-sm font-medium text-gray-700">View Payments</span>
              </a>
              <a href="/admin/messages" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-sm font-medium text-gray-700">View Messages</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
