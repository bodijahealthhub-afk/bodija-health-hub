import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';

const FALLBACK_CATEGORIES = ['Consultation', 'Dental', 'Laboratory', 'Eye Care', "Women's Health", 'Preventive', 'Diagnostic', 'Therapy', 'Surgery', 'Emergency'];
const BOOKING_TYPES = ['BHH_MANAGED', 'PARTNER_REQUEST', 'EXTERNAL'];

const ServiceForm = ({ service, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    category: '',
    price: '',
    icon: '',
    image: null,
    featured: false,
    display_order: 0,
    booking_type: '',
    booking_url: '',
    provider_id: '',
    location: '',
    status: 'active',
  });
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catsRes, provRes] = await Promise.all([
          fetch('/api/service-categories'),
          fetch('/api/admin/providers', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }),
        ]);
        if (catsRes.ok) {
          const cats = await catsRes.json();
          if (Array.isArray(cats) && cats.length) {
            const names = cats.filter((c) => c.status === 'active').map((c) => c.name);
            if (names.length) setCategories((prev) => Array.from(new Set([...names, ...prev])));
          }
        }
        if (provRes.ok) {
          const data = await provRes.json();
          setProviders(data.providers || []);
        }
      } catch {
        // keep fallback options
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        slug: service.slug || '',
        short_description: service.shortDescription || service.short_description || '',
        description: service.description || '',
        category: service.category || '',
        price: service.price || '',
        icon: service.icon || '',
        image: null,
        featured: Boolean(service.featured),
        display_order: service.displayOrder || service.display_order || 0,
        booking_type: service.bookingType || service.booking_type || '',
        booking_url: service.bookingUrl || service.booking_url || '',
        provider_id: service.providerId || service.provider_id || '',
        location: service.location || '',
        status: service.status || 'active',
      });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheck = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Service Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Slug</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="Leave blank to auto-generate"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={inputCls}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Price (₦)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Provider</label>
          <select
            name="provider_id"
            value={formData.provider_id}
            onChange={handleChange}
            className={inputCls}
          >
            <option value="">No provider</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Booking Type</label>
          <select name="booking_type" value={formData.booking_type} onChange={handleChange} className={inputCls}>
            <option value="">Default</option>
            {BOOKING_TYPES.map((bt) => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Booking URL</label>
          <input
            type="url"
            name="booking_url"
            value={formData.booking_url}
            onChange={handleChange}
            placeholder="https://"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Bodija, Ibadan"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Display Order</label>
          <input
            type="number"
            name="display_order"
            value={formData.display_order}
            onChange={handleChange}
            min="0"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Icon (emoji)</label>
          <input
            type="text"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            placeholder="e.g. 🩺"
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleCheck}
            className="w-4 h-4 text-teal-600"
          />
          <span className="text-sm text-gray-700">Featured on homepage</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="status"
            value="active"
            checked={formData.status === 'active'}
            onChange={handleChange}
            className="w-4 h-4 text-teal-600"
          />
          <span className="text-sm text-gray-700">Active</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="status"
            value="inactive"
            checked={formData.status === 'inactive'}
            onChange={handleChange}
            className="w-4 h-4 text-teal-600"
          />
          <span className="text-sm text-gray-700">Inactive</span>
        </label>
      </div>

      <div>
        <label className={labelCls}>Short Description</label>
        <textarea
          name="short_description"
          value={formData.short_description}
          onChange={handleChange}
          rows={2}
          className={inputCls}
          placeholder="One-line summary shown on cards and search"
        />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={inputCls}
          placeholder="Describe the service..."
        />
      </div>

      <ImageUpload
        currentImage={service?.image}
        onUpload={(file) => setFormData((prev) => ({ ...prev, image: file }))}
        onRemove={() => setFormData((prev) => ({ ...prev, image: null }))}
        label="Service Image"
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
        >
          {service ? 'Update Service' : 'Add Service'}
        </button>
      </div>
    </form>
  );
};

export default ServiceForm;
