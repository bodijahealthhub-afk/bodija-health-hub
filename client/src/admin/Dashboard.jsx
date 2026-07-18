import { useState, useEffect } from 'react';
import StatsCard from './StatsCard';
import StatusBadge from './StatusBadge';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 12,
    totalPatients: 348,
    totalDoctors: 18,
    monthlyRevenue: '₦2,450,000',
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats || stats);
          setRecentAppointments(data.recentAppointments || []);
        }
      } catch {
        // Use mock data
        setRecentAppointments([
          { id: 1, patient: 'Adebayo Oladipo', doctor: 'Dr. Adewale', service: 'General Checkup', date: '2026-07-14', time: '09:00 AM', status: 'confirmed' },
          { id: 2, patient: 'Chioma Nwosu', doctor: 'Dr. Olumide', service: 'Dental Cleaning', date: '2026-07-14', time: '10:30 AM', status: 'pending' },
          { id: 3, patient: 'Fatima Abubakar', doctor: 'Dr. Amina', service: 'Prenatal Checkup', date: '2026-07-14', time: '11:00 AM', status: 'completed' },
          { id: 4, patient: 'Emeka Okonkwo', doctor: 'Dr. Adewale', service: 'Blood Test', date: '2026-07-14', time: '02:00 PM', status: 'cancelled' },
          { id: 5, patient: 'Aisha Bello', doctor: 'Dr. Olumide', service: 'Eye Examination', date: '2026-07-14', time: '03:30 PM', status: 'confirmed' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Mini calendar
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  // Simple bar chart data
  const weeklyData = [
    { day: 'Mon', count: 8 },
    { day: 'Tue', count: 12 },
    { day: 'Wed', count: 6 },
    { day: 'Thu', count: 15 },
    { day: 'Fri', count: 10 },
    { day: 'Sat', count: 4 },
  ];
  const maxCount = Math.max(...weeklyData.map((d) => d.count));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={<svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          value={stats.todayAppointments}
          label="Today's Appointments"
          trend="+2 from yesterday"
          trendUp={true}
        />
        <StatsCard
          icon={<svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          value={stats.totalPatients}
          label="Total Patients"
          trend="+12 this month"
          trendUp={true}
        />
        <StatsCard
          icon={<svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          value={stats.totalDoctors}
          label="Total Doctors"
          trend="All active"
          trendUp={true}
        />
        <StatsCard
          icon={<svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          value={stats.monthlyRevenue}
          label="Monthly Revenue"
          trend="+18% from last month"
          trendUp={true}
        />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentAppointments.map((apt, idx) => (
                  <tr key={apt.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{apt.patient}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{apt.doctor}</td>
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
          {/* Mini Calendar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="py-1 font-medium text-gray-500">{d}</div>
              ))}
              {calendarDays.map((day, i) => (
                <div
                  key={i}
                  className={`py-1.5 rounded-lg ${
                    day === today.getDate()
                      ? 'bg-teal-600 text-white font-medium'
                      : day
                      ? 'text-gray-700 hover:bg-gray-100 cursor-pointer'
                      : ''
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">This Week</h2>
            <div className="flex items-end justify-between h-40 gap-2">
              {weeklyData.map((item) => (
                <div key={item.day} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-teal-500 rounded-t-md transition-all hover:bg-teal-600"
                    style={{ height: `${(item.count / maxCount) * 100}%`, minHeight: '8px' }}
                  />
                  <span className="text-xs text-gray-500 mt-2">{item.day}</span>
                </div>
              ))}
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
              <a href="/admin/patients/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Add Patient</span>
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
