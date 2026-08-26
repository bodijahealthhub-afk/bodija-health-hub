import { useState, useEffect } from 'react';
import DataTable from './DataTable';
import StatusBadge from './StatusBadge';
import SearchBar from './SearchBar';
import AppointmentDetail from './AppointmentDetail';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const TYPE_LABELS = {
  appointment: 'Healthcare',
  partner_appointment: 'Partner',
  programme: 'Programme',
  event: 'Event',
  training: 'Training',
  external: 'External',
};

const STATUS_OPTIONS = ['requested', 'new', 'under_review', 'reviewed', 'contacted', 'confirmed', 'rescheduled', 'in_progress', 'completed', 'cancelled', 'declined', 'expired', 'no_show', 'archived'];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/appointments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setAppointments(data.appointments || []);
        }
      } catch {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  useEffect(() => {
    let result = [...appointments];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          (a.patientName || '').toLowerCase().includes(q) ||
          (a.providerName || '').toLowerCase().includes(q) ||
          (a.service || '').toLowerCase().includes(q) ||
          (a.bookingReference || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      result = result.filter((a) => (a.bookingType || 'appointment') === typeFilter);
    }
    if (providerFilter !== 'all') {
      result = result.filter((a) => a.providerName === providerFilter);
    }
    setFilteredAppointments(result);
  }, [appointments, searchQuery, statusFilter, typeFilter, providerFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
        if (selectedAppointment?.id === id) setSelectedAppointment(updated);
        return;
      }
    } catch {
      // Update locally
    }
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (selectedAppointment?.id === id) {
      setSelectedAppointment((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const typeBadge = (type) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
      {TYPE_LABELS[type] || type || 'Booking'}
    </span>
  );

  const columns = [
    {
      key: 'bookingReference',
      label: 'Ref',
      render: (val) => <span className="font-mono text-xs text-gray-500">{val || '—'}</span>,
    },
    {
      key: 'patientName',
      label: 'Name',
      render: (val) => <span className="font-medium">{val}</span>,
    },
    { key: 'bookingType', label: 'Type', render: (val) => typeBadge(val) },
    {
      key: 'providerName',
      label: 'Provider / Service',
      render: (val, row) => (
        <span>{row.providerName || 'Bodija Health Hub'}{row.service ? ` · ${row.service}` : ''}</span>
      ),
    },
    {
      key: 'preferredDate',
      label: 'Date',
      render: (val, row) => <span>{val || row.date || 'Flexible'}</span>,
    },
    {
      key: 'preferredTime',
      label: 'Time',
      render: (val, row) => <span>{val || row.time || 'Flexible'}</span>,
    },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => {
        const actionable = ['requested', 'pending'].includes(row.status);
        return (
          <div className="flex items-center gap-1">
            {actionable && (
              <button
                onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'confirmed'); }}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Confirm
              </button>
            )}
            {actionable && (
              <button
                onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'declined'); }}
                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Decline
              </button>
            )}
            {row.status === 'confirmed' && (
              <button
                onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'completed'); }}
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Complete
              </button>
            )}
            {!['cancelled', 'completed', 'declined', 'expired', 'archived'].includes(row.status) && (
              <button
                onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'cancelled'); }}
                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Cancel
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const providers = [...new Set(appointments.map((a) => a.providerName).filter(Boolean))];

  const handleBulkStatus = async (action, ids) => {
    const statusMap = { confirm: 'confirmed', decline: 'declined', cancel: 'cancelled', complete: 'completed' };
    const newStatus = statusMap[action];
    if (!newStatus) return;
    const token = localStorage.getItem('adminToken');
    for (const id of ids) {
      try {
        const res = await fetch(`/api/admin/appointments/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          const updated = await res.json();
          setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
        }
      } catch { /* continue */ }
    }
  };

  const bulkActions = [
    { key: 'confirm', label: 'Confirm', icon: <FiCheckCircle className="w-4 h-4 text-blue-600" /> },
    { key: 'complete', label: 'Complete', icon: <FiCheckCircle className="w-4 h-4 text-green-600" /> },
    { key: 'decline', label: 'Decline', icon: <FiXCircle className="w-4 h-4 text-red-600" /> },
    { key: 'cancel', label: 'Cancel', icon: <FiXCircle className="w-4 h-4 text-red-600" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
        <p className="text-gray-500 mt-1">Manage bookings, registrations, and service requests across the BHH ecosystem</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <SearchBar placeholder="Search by name, reference, provider..." onSearch={setSearchQuery} className="flex-1" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All Types</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All Providers</option>
            {providers.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredAppointments}
          pageSize={10}
          onRowClick={(row) => { setSelectedAppointment(row); setShowDetail(true); }}
          onBulkAction={handleBulkStatus}
          bulkActions={bulkActions}
        />
      )}

      {/* Detail Modal */}
      <AppointmentDetail
        appointment={selectedAppointment}
        isOpen={showDetail}
        onClose={() => { setShowDetail(false); setSelectedAppointment(null); }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default Appointments;
