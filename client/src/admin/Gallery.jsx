import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import GalleryForm from './GalleryForm';
import Modal from './Modal';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/gallery', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setImages(data.images || []);
        }
      } catch {
        // Mock data
        setImages([
          { id: 1, title: 'Modern Reception Area', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400', category: 'Facility', album: 'Main Building', createdAt: '2026-07-01' },
          { id: 2, title: 'Consultation Room', url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400', category: 'Facility', album: 'Main Building', createdAt: '2026-07-02' },
          { id: 3, title: 'Dr. Adewale', url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', category: 'Team', album: 'Doctors', createdAt: '2026-07-03' },
          { id: 4, title: 'Laboratory Equipment', url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400', category: 'Equipment', album: 'Lab', createdAt: '2026-07-04' },
          { id: 5, title: 'Waiting Lounge', url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400', category: 'Facility', album: 'Main Building', createdAt: '2026-07-05' },
          { id: 6, title: 'Dental Clinic', url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400', category: 'Facility', album: 'Dental Wing', createdAt: '2026-07-06' },
          { id: 7, title: 'Dr. Amina', url: 'https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=400', category: 'Team', album: 'Doctors', createdAt: '2026-07-07' },
          { id: 8, title: 'MRI Scanner', url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400', category: 'Equipment', album: 'Radiology', createdAt: '2026-07-08' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    let result = [...images];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (img) =>
          img.title.toLowerCase().includes(q) ||
          img.category.toLowerCase().includes(q) ||
          img.album.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter((img) => img.category === categoryFilter);
    }
    setFilteredImages(result);
  }, [images, searchQuery, categoryFilter]);

  const categories = [...new Set(images.map((img) => img.category))];

  const handleSave = async (imageData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('title', imageData.title);
      formData.append('category', imageData.category);
      formData.append('album', imageData.album);
      if (imageData.file) {
        formData.append('image', imageData.file);
      }

      const url = editingImage
        ? `/api/gallery/${editingImage.id}`
        : '/api/gallery';
      const method = editingImage ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    } catch {
      // Update locally
    }

    if (editingImage) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === editingImage.id ? { ...img, ...imageData } : img
        )
      );
    } else {
      setImages((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...imageData,
          url: imageData.file ? URL.createObjectURL(imageData.file) : '',
          createdAt: new Date().toISOString().split('T')[0],
        },
      ]);
    }
    setShowForm(false);
    setEditingImage(null);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Update locally
    }
    setImages((prev) => prev.filter((img) => img.id !== id));
    setDeleteConfirm(null);
    setDeleting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-gray-500 mt-1">Manage photo gallery</p>
        </div>
        <button
          onClick={() => {
            setEditingImage(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Upload Photo
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <SearchBar
            placeholder="Search photos..."
            onSearch={setSearchQuery}
            className="flex-1"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">No photos found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
            >
              <div className="aspect-square relative">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setEditingImage(image);
                      setShowForm(true);
                    }}
                    className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(image)}
                    className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-900 text-sm truncate">{image.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{image.category} • {image.album}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingImage(null);
        }}
        title={editingImage ? 'Edit Photo' : 'Upload Photo'}
        size="lg"
      >
        <GalleryForm
          image={editingImage}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingImage(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Photo"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
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
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Gallery;