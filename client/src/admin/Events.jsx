import { useState, useEffect } from 'react';
import DataTable from './DataTable';
import SearchBar from './SearchBar';
import EventForm from './EventForm';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch {
        setEvents([
          { id: 1, title: 'Free Health Screening', date: '2026-07-20', location: 'Bodija Community Center', type: 'screening', status: 'active', description: 'Free blood pressure, diabetes, and cholesterol screening for all community members.' },
          { id: 2, title: 'Childhood Vaccination Drive', date: '2026-07-25', location: 'Bodija Health Hub', type: 'outreach', status: 'active', description: 'Free vaccinations for children under 5 years old.' },
          { id: 3, title: 'Mental Health Workshop', date: '2026-08-01', location: 'University of Ibadan Auditorium', type: 'event', status: 'active', description: 'Workshop on mental health awareness and stress management.' },
          { id: 4, title: 'Women\'s Health Summit', date: '2026-08-10', location: 'IICC Hall, Ibadan', type: 'event', status: 'active', description: 'Annual summit focusing on women\'s health issues.' },
          { id: 5, title: 'Blood Donation Day', date: '2026-08-15', location: 'Bodija Health Hub', type: 'outreach', status: 'inactive', description: 'Community blood donation event.' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredEvents(
        events.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.location.toLowerCase().includes(q) ||
            e.type.toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredEvents(events);
    }
  }, [events, searchQuery]);

  const handleSave = async (eventData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingEvent
        ? `/api/admin/events/${editingEvent.id}`
        : '/api/admin/events';
      const method = editingEvent ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });
    } catch {
      // Update locally
    }
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? { ...e, ...eventData } : e))
      );
    } else {
      setEvents((prev) => [...prev, { id: Date.now(), ...eventData, status: 'active' }]);
    }
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Update locally
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const getTypeColor = (type) => {
    const colors = {
      screening: 'bg-blue-100 text-blue-800',
      outreach: 'bg-green-100 text-green-800',
      event: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'title', label: 'Title', render: (val) => <span className="font-medium">{val}</span> },
    { key: 'date', label: 'Date' },
    { key: 'location', label: 'Location' },
    { key: 'type', label: 'Type', render: (val) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(val)}`}>{val}</span> },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setEditingEvent(row); setShowForm(true); }}
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
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 mt-1">Manage events, screenings, and outreach programs</p>
        </div>
        <button
          onClick={() => { setEditingEvent(null); setShowForm(true); }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Event
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <SearchBar placeholder="Search events..." onSearch={setSearchQuery} className="w-full md:w-96" />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredEvents}
          pageSize={10}
        />
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingEvent(null); }}
        title={editingEvent ? 'Edit Event' : 'Add New Event'}
        size="lg"
      >
        <EventForm
          event={editingEvent}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingEvent(null); }}
        />
      </Modal>
    </div>
  );
};

export default Events;
