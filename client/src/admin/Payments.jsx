import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';

const STATUS_STYLES = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

const formatNaira = (n) => `₦${Number(n || 0).toLocaleString('en-US')}`;

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/payments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setPayments(data.payments || []);
        }
      } catch {}
      finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredPayments(
        payments.filter(
          (p) =>
            p.reference.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            (p.patient_name || '').toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredPayments(payments);
    }
  }, [payments, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">Online payments received via Paystack.</p>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by reference, email or patient..." />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointment</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">Loading...</td></tr>
              )}
              {!loading && filteredPayments.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">No payments yet</td></tr>
              )}
              {filteredPayments.map((p, idx) => (
                <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-6 py-4 text-sm font-mono text-gray-700">{p.reference}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.patient_name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.appointment_date || '—'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{formatNaira(p.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full capitalize ${STATUS_STYLES[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
