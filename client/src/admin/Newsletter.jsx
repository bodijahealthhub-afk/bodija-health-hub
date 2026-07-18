import { useState, useEffect } from 'react';
import StatsCard from './StatsCard';
import SearchBar from './SearchBar';

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/newsletter/subscribers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setSubscribers(data.subscribers || []);
        }
      } catch {
        // Mock data
        setSubscribers([
          { id: 1, email: 'adebayo@email.com', name: 'Adebayo Oladipo', subscribedAt: '2026-07-01', status: 'active' },
          { id: 2, email: 'chioma@email.com', name: 'Chioma Nwosu', subscribedAt: '2026-07-03', status: 'active' },
          { id: 3, email: 'fatima@email.com', name: 'Fatima Abubakar', subscribedAt: '2026-07-05', status: 'active' },
          { id: 4, email: 'emeka@email.com', name: 'Emeka Okonkwo', subscribedAt: '2026-07-07', status: 'unsubscribed' },
          { id: 5, email: 'aisha@email.com', name: 'Aisha Bello', subscribedAt: '2026-07-09', status: 'active' },
          { id: 6, email: 'oluwaseun@email.com', name: 'Oluwaseun Adeyemi', subscribedAt: '2026-07-10', status: 'active' },
          { id: 7, email: 'ngozi@email.com', name: 'Ngozi Okafor', subscribedAt: '2026-07-11', status: 'active' },
          { id: 8, email: 'tunde@email.com', name: 'Tunde Williams', subscribedAt: '2026-07-12', status: 'active' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredSubscribers(
        subscribers.filter(
          (sub) =>
            sub.email.toLowerCase().includes(q) ||
            sub.name.toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredSubscribers(subscribers);
    }
  }, [subscribers, searchQuery]);

  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter((sub) => sub.status === 'active').length;

  const exportToCSV = () => {
    setExporting(true);
    try {
      const headers = ['Name', 'Email', 'Subscribed Date', 'Status'];
      const rows = filteredSubscribers.map((sub) => [
        sub.name,
        sub.email,
        sub.subscribedAt,
        sub.status,
      ]);
      const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch {
      // Handle error silently
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-gray-500 mt-1">Manage newsletter subscribers</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={exporting || filteredSubscribers.length === 0}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? 'Exporting...' : 'Export to CSV'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          icon={<svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          value={totalSubscribers}
          label="Total Subscribers"
          trend="All time"
          trendUp={true}
        />
        <StatsCard
          icon={<svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          value={activeSubscribers}
          label="Active Subscribers"
          trend={`${Math.round((activeSubscribers / totalSubscribers) * 100)}% of total`}
          trendUp={true}
        />
        <StatsCard
          icon={<svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          value={filteredSubscribers.length}
          label="Filtered Results"
          trend="Current view"
          trendUp={true}
        />
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <SearchBar
          placeholder="Search subscribers..."
          onSearch={setSearchQuery}
          className="w-full md:w-96"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">No subscribers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubscribers.map((sub, idx) => (
                <tr key={sub.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-teal-600">
                          {sub.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{sub.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sub.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sub.subscribedAt}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      sub.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Newsletter;