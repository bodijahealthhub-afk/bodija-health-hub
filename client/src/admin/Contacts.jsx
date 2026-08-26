import { useState, useEffect } from 'react';
import DataTable from './DataTable';
import StatusBadge from './StatusBadge';
import SearchBar from './SearchBar';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('/api/admin/contacts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setContacts(data.contacts || []);
        }
      } catch {
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const filtered = contacts.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.organisation || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
        if (selectedContact?.id === id) setSelectedContact(updated);
      }
    } catch { /* continue */ }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (val) => <span className="font-medium">{val}</span>,
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'organisation', label: 'Organisation' },
    {
      key: 'source',
      label: 'Source',
      render: (val) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
          {val || 'unknown'}
        </span>
      ),
    },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val || 'new'} /> },
    {
      key: 'created_at',
      label: 'Created',
      render: (val) => <span className="text-gray-500">{val ? new Date(val).toLocaleDateString() : '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <p className="text-gray-500 mt-1">Manage CRM contacts and outreach leads</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <SearchBar placeholder="Search by name, email, organisation..." onSearch={setSearchQuery} className="flex-1" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          pageSize={10}
          onRowClick={(row) => { setSelectedContact(row); setShowDetail(true); }}
        />
      )}

      {/* Detail Modal */}
      {showDetail && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selectedContact.name}</h2>
                <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Email:</span> {selectedContact.email || '—'}</div>
                <div><span className="text-gray-500">Phone:</span> {selectedContact.phone || '—'}</div>
                <div><span className="text-gray-500">Organisation:</span> {selectedContact.organisation || '—'}</div>
                <div><span className="text-gray-500">Source:</span> {selectedContact.source || '—'}</div>
                <div><span className="text-gray-500">Status:</span> <StatusBadge status={selectedContact.status || 'new'} /></div>
                <div><span className="text-gray-500">Created:</span> {selectedContact.created_at ? new Date(selectedContact.created_at).toLocaleDateString() : '—'}</div>
              </div>
              {selectedContact.interests && (
                <div className="text-sm"><span className="text-gray-500">Interests:</span> {selectedContact.interests}</div>
              )}
              {selectedContact.notes && (
                <div className="text-sm"><span className="text-gray-500">Notes:</span> {selectedContact.notes}</div>
              )}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                {['new', 'contacted', 'qualified', 'archived'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(selectedContact.id, s)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      selectedContact.status === s
                        ? 'bg-teal-100 text-teal-700 border-teal-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
