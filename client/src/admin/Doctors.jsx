import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import DoctorForm from './DoctorForm';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/doctors', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setDoctors(data.doctors || []);
        }
      } catch {
        setDoctors([
          { id: 1, name: 'Dr. Adewale Olaniyan', email: 'adewale@bodija.com', specialization: 'General Practice', department: 'General Medicine', experience: 12, consultationFee: 5000, availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], status: 'active', bio: 'Experienced general practitioner with 12 years in family medicine.' },
          { id: 2, name: 'Dr. Olumide Adebayo', email: 'olumide@bodija.com', specialization: 'Dentistry', department: 'Dental', experience: 8, consultationFee: 7000, availableDays: ['Monday', 'Wednesday', 'Friday'], status: 'active', bio: 'Specialist in cosmetic and restorative dentistry.' },
          { id: 3, name: 'Dr. Amina Bello', email: 'amina@bodija.com', specialization: 'Obstetrics & Gynecology', department: 'Women\'s Health', experience: 15, consultationFee: 8000, availableDays: ['Tuesday', 'Thursday', 'Saturday'], status: 'active', bio: 'Dedicated OB-GYN with expertise in prenatal care.' },
          { id: 4, name: 'Dr. Chukwuemeka Obi', email: 'chukwuemeka@bodija.com', specialization: 'Pediatrics', department: 'Pediatrics', experience: 10, consultationFee: 6000, availableDays: ['Monday', 'Tuesday', 'Thursday'], status: 'active', bio: 'Compassionate pediatrician caring for children from birth to adolescence.' },
          { id: 5, name: 'Dr. Fatima Yusuf', email: 'fatima@bodija.com', specialization: 'Ophthalmology', department: 'Eye Care', experience: 7, consultationFee: 6500, availableDays: ['Wednesday', 'Friday'], status: 'inactive', bio: 'Ophthalmologist specializing in vision correction and eye diseases.' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredDoctors(
        doctors.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.specialization.toLowerCase().includes(q) ||
            d.department.toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredDoctors(doctors);
    }
  }, [doctors, searchQuery]);

  const handleSave = async (doctorData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingDoctor
        ? `/api/admin/doctors/${editingDoctor.id}`
        : '/api/admin/doctors';
      const method = editingDoctor ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(doctorData),
      });
    } catch {
      // Update locally
    }
    if (editingDoctor) {
      setDoctors((prev) =>
        prev.map((d) => (d.id === editingDoctor.id ? { ...d, ...doctorData } : d))
      );
    } else {
      setDoctors((prev) => [...prev, { id: Date.now(), ...doctorData, status: 'active' }]);
    }
    setShowForm(false);
    setEditingDoctor(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/admin/doctors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Update locally
    }
    setDoctors((prev) => prev.filter((d) => d.id !== id));
  };

  const toggleStatus = async (id) => {
    const doctor = doctors.find((d) => d.id === id);
    const newStatus = doctor.status === 'active' ? 'inactive' : 'active';
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/admin/doctors/${id}/status`, {
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
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-500 mt-1">Manage medical staff</p>
        </div>
        <button
          onClick={() => { setEditingDoctor(null); setShowForm(true); }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Doctor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <SearchBar placeholder="Search doctors..." onSearch={setSearchQuery} className="w-full md:w-96" />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-teal-700">{doctor.name.replace('Dr. ', '').charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-500">{doctor.specialization}</p>
                    </div>
                  </div>
                  <StatusBadge status={doctor.status} />
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p><span className="font-medium text-gray-700">Department:</span> {doctor.department}</p>
                  <p><span className="font-medium text-gray-700">Experience:</span> {doctor.experience} years</p>
                  <p><span className="font-medium text-gray-700">Fee:</span> ₦{doctor.consultationFee?.toLocaleString()}</p>
                  <p><span className="font-medium text-gray-700">Available:</span> {doctor.availableDays?.join(', ')}</p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => toggleStatus(doctor.id)}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                      doctor.status === 'active'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {doctor.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => { setEditingDoctor(doctor); setShowForm(true); }}
                    className="flex-1 px-3 py-2 text-sm bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doctor.id)}
                    className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingDoctor(null); }}
        title={editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
        size="lg"
      >
        <DoctorForm
          doctor={editingDoctor}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingDoctor(null); }}
        />
      </Modal>
    </div>
  );
};

export default Doctors;
