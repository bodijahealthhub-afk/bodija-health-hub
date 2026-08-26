import { useState, useEffect } from 'react';
import { FiCalendar, FiMessageSquare, FiUsers, FiBookOpen, FiActivity, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`/api/admin/analytics?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (!data || !data.overview) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          Failed to load analytics data.
        </div>
      </div>
    );
  }

  const { overview: o } = data;

  const kpis = [
    { label: 'Total Bookings', value: o.totalBookings, period: o.periodBookings, icon: FiCalendar, color: 'bg-blue-50 text-blue-600' },
    { label: 'Messages', value: o.totalMessages, period: o.periodMessages, icon: FiMessageSquare, color: 'bg-green-50 text-green-600' },
    { label: 'Contacts', value: o.totalContacts, period: o.newContacts, icon: FiUsers, color: 'bg-purple-50 text-purple-600' },
    { label: 'Blog Posts', value: o.totalPosts, period: o.periodPosts, icon: FiBookOpen, color: 'bg-amber-50 text-amber-600' },
    { label: 'Active Services', value: o.activeServices, icon: FiActivity, color: 'bg-teal-50 text-teal-600' },
    { label: 'Subscribers', value: o.totalSubscribers, icon: FiUsers, color: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Platform performance metrics</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="12m">Last 12 months</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              {kpi.period !== undefined && (
                <span className="text-xs font-medium text-gray-500">+{kpi.period} this period</span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Bookings by Status */}
      {data.bookingsByStatus && data.bookingsByStatus.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Bookings by Status</h2>
          <div className="space-y-3">
            {data.bookingsByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{item.status || 'unknown'}</span>
                <div className="flex items-center gap-3">
                  <div className="w-40 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (item.count / o.totalBookings) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-10 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings by Type */}
      {data.bookingsByType && data.bookingsByType.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Bookings by Type</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.bookingsByType.map((item) => (
              <div key={item.booking_type} className="bg-gray-50 rounded-lg p-3">
                <span className="text-sm font-medium text-gray-700 capitalize">{item.booking_type || 'appointment'}</span>
                <p className="text-xl font-bold text-gray-900">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 14-Day Trend */}
      {data.trend && data.trend.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">14-Day Booking Trend</h2>
          <div className="flex items-end gap-1 h-32">
            {data.trend.map((day) => {
              const max = Math.max(...data.trend.map((d) => d.count), 1);
              const height = Math.max(4, (day.count / max) * 100);
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1" title={`${day.date}: ${day.count}`}>
                  <div
                    className="w-full bg-teal-500 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-gray-400">{day.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
