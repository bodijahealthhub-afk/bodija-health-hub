import { useState, useEffect } from 'react';
import DataTable from './DataTable';
import StatusBadge from './StatusBadge';
import SearchBar from './SearchBar';
import AppointmentDetail from './AppointmentDetail';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
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
        // Mock data
        setAppointments([
          { id: 1, patientName: 'Adebayo Oladipo', email: 'adebayo@email.com', phone: '+234 801 234 5678', doctor: 'Dr. Adewale', service: 'General Checkup', date: '2026-07-14', time: '09:00 AM', status: 'confirmed', notes: '' },
          { id: 2, patientName: 'Chioma Nwosu', email: 'chioma@email.com', phone: '+234 802 345 6789', doctor: 'Dr. Olumide', service: 'Dental Cleaning', date: '2026-07-14', time: '10:30 AM', status: 'pending', notes: '' },
          { id: 3, patientName: 'Fatima Abubakar', email: 'fatima@email.com', phone: '+234 803 456 7890', doctor: 'Dr. Amina', service: 'Prenatal Checkup', date: '2026-07-14', time: '11:00 AM', status: 'completed', notes: 'Patient is in good health' },
          { id: 4, patientName: 'Emeka Okonkwo', email: 'emeka@email.com', phone: '+234 804 567 8901', doctor: 'Dr. Adewale', service: 'Blood Test', date: '2026-07-14', time: '02:00 PM', status: 'cancelled', notes: 'Patient rescheduled' },
          { id: 5, patientName: 'Aisha Bello', email: 'aisha@email.com', phone: '+234 805 678 9012', doctor: 'Dr. Olumide', service: 'Eye Examination', date: '2026-07-14', time: '03:30 PM', status: 'confirmed', notes: '' },
          { id: 6, patientName: 'Oluwaseun Adeyemi', email: 'oluwaseun@email.com', phone: '+234 806 789 0123', doctor: 'Dr. Amina', service: 'Consultation', date: '2026-07-15', time: '09:30 AM', status: 'pending', notes: '' },
          { id: 7, patientName: 'Ngozi Okafor', email: 'ngozi@email.com', phone: '+234 807 890 1234', doctor: 'Dr. Adewale', service: 'Follow-up', date: '2026-07-15', time: '11:00 AM', status: 'confirmed', notes: '' },
        ]);
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
          a.patientName.toLowerCase().includes(q) ||
          a.doctor.toLowerCase().includes(q) ||
          a.service.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }
    if (doctorFilter !== 'all') {
      result = result.filter((a) => a.doctor === doctorFilter);
    }
    setFilteredAppointments(result);
  }, [appointments, searchQuery, statusFilter, doctorFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/admin/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
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

  const columns = [
    { key: 'patientName', label: 'Patient', render: (val) => <span className="font-medium">{val}</span> },
    { key: 'doctor', label: 'Doctor' },
    { key: 'service', label: 'Service' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          {row.status === 'pending' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'confirmed'); }}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Confirm
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
          {row.status !== 'cancelled' && row.status !== 'completed' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'cancelled'); }}
              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  const doctors = [...new Set(appointments.map((a) => a.doctor))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage all patient appointments</p>
        </div>
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <SearchBar placeholder="Search appointments..." onSearch={setSearchQuery} className="flex-1" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All Doctors</option>
            {doctors.map((doc) => (
              <option key={doc} value={doc}>{doc}</option>
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
