import { useState, useEffect } from 'react';
import DataTable from './DataTable';
import SearchBar from './SearchBar';
import ProgrammeForm from './ProgrammeForm';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

const Programmes = () => {
  const [programmes, setProgrammes] = useState([]);
  const [filteredProgrammes, setFilteredProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState(null);

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/programmes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setProgrammes(data.programmes || []);
        }
      } catch {
        setProgrammes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProgrammes();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredProgrammes(
        programmes.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            (p.location || '').toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredProgrammes(programmes);
    }
  }, [programmes, searchQuery]);

  const handleSave = async (programmeData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingProgramme
        ? `/api/admin/programmes/${editingProgramme.id}`
        : '/api/admin/programmes';
      const method = editingProgramme ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(programmeData),
      });
    } catch {
      // Update locally
    }
    if (editingProgramme) {
      setProgrammes((prev) =>
        prev.map((p) => (p.id === editingProgramme.id ? { ...p, ...programmeData } : p))
      );
    } else {
      setProgrammes((prev) => [...prev, { id: Date.now(), ...programmeData, status: 'active' }]);
    }
    setShowForm(false);
    setEditingProgramme(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this programme?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/admin/programmes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Update locally
    }
    setProgrammes((prev) => prev.filter((p) => p.id !== id));
  };

  const columns = [
    { key: 'title', label: 'Title', render: (val) => <span className="font-medium">{val}</span> },
    { key: 'category', label: 'Category', render: (val) => val || '—' },
    { key: 'schedule', label: 'Schedule', render: (val) => val || '—' },
    { key: 'location', label: 'Location', render: (val) => val || '—' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setEditingProgramme(row); setShowForm(true); }}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
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
          <h1 className="text-2xl font-bold text-gray-900">Programmes</h1>
          <p className="text-gray-500 mt-1">Manage community programmes and initiatives</p>
        </div>
        <button
          onClick={() => { setEditingProgramme(null); setShowForm(true); }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Programme
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <SearchBar placeholder="Search programmes..." onSearch={setSearchQuery} className="w-full md:w-96" />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredProgrammes}
          pageSize={10}
        />
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingProgramme(null); }}
        title={editingProgramme ? 'Edit Programme' : 'Add New Programme'}
        size="lg"
      >
        <ProgrammeForm
          programme={editingProgramme}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingProgramme(null); }}
        />
      </Modal>
    </div>
  );
};

export default Programmes;
