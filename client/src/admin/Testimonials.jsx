import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import TestimonialForm from './TestimonialForm';
import Modal from './Modal';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/testimonials', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data.testimonials || []);
        }
      } catch {
        // Mock data
        setTestimonials([
          { id: 1, name: 'Adebayo Oladipo', content: 'Excellent service! Dr. Adewale was very professional and thorough. The facility is clean and modern. Highly recommend Bodija Health Hub.', rating: 5, active: true, createdAt: '2026-07-01' },
          { id: 2, name: 'Chioma Nwosu', content: 'Great dental service. The staff was friendly and the procedure was painless. Will definitely come back.', rating: 4, active: true, createdAt: '2026-07-03' },
          { id: 3, name: 'Fatima Abubakar', content: 'The prenatal care package is comprehensive. Dr. Amina explained everything clearly and made me feel comfortable throughout.', rating: 5, active: true, createdAt: '2026-07-05' },
          { id: 4, name: 'Emeka Okonkwo', content: 'Good experience overall. The waiting time was a bit long but the service quality made up for it.', rating: 3, active: false, createdAt: '2026-07-07' },
          { id: 5, name: 'Aisha Bello', content: 'Best eye care in Ibadan! Dr. Olumide is very knowledgeable and patient. The eye examination was thorough.', rating: 5, active: true, createdAt: '2026-07-09' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredTestimonials(
        testimonials.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.content.toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredTestimonials(testimonials);
    }
  }, [testimonials, searchQuery]);

  const handleSave = async (testimonialData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingTestimonial
        ? `/api/testimonials/${editingTestimonial.id}`
        : '/api/testimonials';
      const method = editingTestimonial ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(testimonialData),
      });
    } catch {
      // Update locally
    }

    if (editingTestimonial) {
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === editingTestimonial.id ? { ...t, ...testimonialData } : t
        )
      );
    } else {
      setTestimonials((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...testimonialData,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ]);
    }
    setShowForm(false);
    setEditingTestimonial(null);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Update locally
    }
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (id) => {
    setToggling(id);
    const testimonial = testimonials.find((t) => t.id === id);
    const newActive = !testimonial.active;
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...testimonial, active: newActive }),
      });
    } catch {
      // Update locally
    }
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: newActive } : t))
    );
    setToggling(null);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-500 mt-1">Manage patient testimonials</p>
        </div>
        <button
          onClick={() => {
            setEditingTestimonial(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Testimonial
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <SearchBar
          placeholder="Search testimonials..."
          onSearch={setSearchQuery}
          className="w-full md:w-96"
        />
      </div>

      {/* Testimonials Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500">No testimonials found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${
                !testimonial.active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="font-medium text-teal-600">
                      {testimonial.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <div className="flex items-center gap-1">{renderStars(testimonial.rating)}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(testimonial.id)}
                  disabled={toggling === testimonial.id}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    testimonial.active ? 'bg-teal-600' : 'bg-gray-300'
                  } ${toggling === testimonial.id ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      testimonial.active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{testimonial.content}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">{testimonial.createdAt}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingTestimonial(testimonial);
                      setShowForm(true);
                    }}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(testimonial)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTestimonial(null);
        }}
        title={editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
        size="lg"
      >
        <TestimonialForm
          testimonial={editingTestimonial}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingTestimonial(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Testimonial"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this testimonial from "{deleteConfirm?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirm?.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Testimonials;