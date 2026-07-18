import { useState, useEffect } from 'react';
import DataTable from './DataTable';
import SearchBar from './SearchBar';
import PatientForm from './PatientForm';
import PatientDetail from './PatientDetail';
import Modal from './Modal';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/patients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setPatients(data.patients || []);
        }
      } catch {
        setPatients([
          { id: 1, name: 'Adebayo Oladipo', email: 'adebayo@email.com', phone: '+234 801 234 5678', age: 32, gender: 'Male', lastVisit: '2026-07-10', bloodGroup: 'O+', address: '12 Bodija Avenue, Ibadan' },
          { id: 2, name: 'Chioma Nwosu', email: 'chioma@email.com', phone: '+234 802 345 6789', age: 28, gender: 'Female', lastVisit: '2026-07-08', bloodGroup: 'A+', address: '45 Dugbe Road, Ibadan' },
          { id: 3, name: 'Fatima Abubakar', email: 'fatima@email.com', phone: '+234 803 456 7890', age: 35, gender: 'Female', lastVisit: '2026-07-12', bloodGroup: 'B-', address: '78 Mokola Hill, Ibadan' },
          { id: 4, name: 'Emeka Okonkwo', email: 'emeka@email.com', phone: '+234 804 567 8901', age: 45, gender: 'Male', lastVisit: '2026-06-28', bloodGroup: 'AB+', address: '23 Iwo Road, Ibadan' },
          { id: 5, name: 'Aisha Bello', email: 'aisha@email.com', phone: '+234 805 678 9012', age: 24, gender: 'Female', lastVisit: '2026-07-14', bloodGroup: 'O-', address: '56 Jericho, Ibadan' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredPatients(
        patients.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.phone.includes(q)
        )
      );
    } else {
      setFilteredPatients(patients);
    }
  }, [patients, searchQuery]);

  const handleSave = async (patientData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingPatient
        ? `/api/admin/patients/${editingPatient.id}`
        : '/api/admin/patients';
      const method = editingPatient ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patientData),
      });
    } catch {
      // Update locally
    }
    if (editingPatient) {
      setPatients((prev) =>
        prev.map((p) => (p.id === editingPatient.id ? { ...p, ...patientData } : p))
      );
    } else {
      setPatients((prev) => [...prev, { id: Date.now(), ...patientData }]);
    }
    setShowForm(false);
    setEditingPatient(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/admin/patients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Update locally
    }
    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  const columns = [
    { key: 'name', label: 'Name', render: (val) => <span className="font-medium">{val}</span> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'age', label: 'Age' },
    { key: 'lastVisit', label: 'Last Visit' },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedPatient(row); setShowDetail(true); }}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            View
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setEditingPatient(row); setShowForm(true); }}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 mt-1">Manage patient records</p>
        </div>
        <button
          onClick={() => { setEditingPatient(null); setShowForm(true); }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Patient
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <SearchBar placeholder="Search patients..." onSearch={setSearchQuery} className="w-full md:w-96" />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredPatients}
          pageSize={10}
          onRowClick={(row) => { setSelectedPatient(row); setShowDetail(true); }}
        />
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingPatient(null); }}
        title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
        size="lg"
      >
        <PatientForm
          patient={editingPatient}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingPatient(null); }}
        />
      </Modal>

      {/* Detail Modal */}
      <PatientDetail
        patient={selectedPatient}
        isOpen={showDetail}
        onClose={() => { setShowDetail(false); setSelectedPatient(null); }}
      />
    </div>
  );
};

export default Patients;
