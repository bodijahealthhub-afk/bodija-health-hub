import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

const PARTNER_TYPES = ['healthcare', 'community', 'education', 'corporate', 'nonprofit', 'technology', 'other'];

const emptyForm = {
  name: '',
  slug: '',
  partner_type: 'healthcare',
  description: '',
  location: '',
  website: '',
  contact_email: '',
  contact_phone: '',
  services_offered: '',
  featured: false,
  display_order: 0,
};

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/partners', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setPartners(data.partners || []);
        }
      } catch {
        setPartners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredPartners(
        partners.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.location || '').toLowerCase().includes(q) ||
            (p.contact_email || '').toLowerCase().includes(q) ||
            (p.partner_type || '').toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredPartners(partners);
    }
  }, [partners, searchQuery]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      slug: p.slug || '',
      partner_type: p.partner_type || 'healthcare',
      description: p.description || '',
      location: p.location || '',
      website: p.website || '',
      contact_email: p.contact_email || '',
      contact_phone: p.contact_phone || '',
      services_offered: (p.servicesOffered || []).join(', '),
      featured: Boolean(p.featured),
      display_order: p.displayOrder || p.display_order || 0,
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheck = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleSave = async () => {
    if (!form.name) {
      alert('Partner name is required');
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      const url = editing ? `/api/admin/partners/${editing.id}` : '/api/admin/partners';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const saved = await res.json();
        setPartners((prev) =>
          editing
            ? prev.map((p) => (p.id === editing.id ? saved : p))
            : [...prev, saved]
        );
      }
    } catch {
      setPartners((prev) =>
        editing
          ? prev.map((p) => (p.id === editing.id ? { ...p, ...form } : p))
          : [...prev, { id: Date.now(), ...form, is_active: 1, status: 'active' }]
      );
    }
    setShowForm(false);
    setEditing(null);
  };

  const toggleStatus = async (p) => {
    const next = p.status === 'active' ? 'inactive' : 'active';
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/partners/${p.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPartners((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
        return;
      }
    } catch {
      // Update locally
    }
    setPartners((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, status: next } : x))
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this partner?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/admin/partners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Update locally
    }
    setPartners((prev) => prev.filter((p) => p.id !== id));
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
          <p className="text-gray-500 mt-1">Manage partner organizations in the BHH ecosystem</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Partner
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <SearchBar placeholder="Search partners..." onSearch={setSearchQuery} className="w-full md:w-96" />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPartners.map((p, idx) => (
                <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    {p.contact_email && <p className="text-sm text-gray-500">{p.contact_email}</p>}
                  </td>
                  <td className="px-6 py-4"><span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-md">{p.partner_type}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.location || '—'}</td>
                  <td className="px-6 py-4">
                    {p.website ? (
                      <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline text-sm">
                        Link
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(p)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title={p.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </button>
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPartners.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">No partners found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Edit Partner' : 'Add New Partner'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Partner Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className={inputCls} placeholder="e.g. hEar Max Centre" />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input type="text" name="slug" value={form.slug} onChange={handleChange} className={inputCls} placeholder="Leave blank to auto-generate" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Type</label>
              <select name="partner_type" value={form.partner_type} onChange={handleChange} className={inputCls}>
                {PARTNER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input type="text" name="location" value={form.location} onChange={handleChange} className={inputCls} placeholder="City / Address" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputCls} placeholder="Short description of this partner" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Website</label>
              <input type="url" name="website" value={form.website} onChange={handleChange} className={inputCls} placeholder="https://" />
            </div>
            <div>
              <label className={labelCls}>Contact Email</label>
              <input type="email" name="contact_email" value={form.contact_email} onChange={handleChange} className={inputCls} placeholder="contact@partner.com" />
            </div>
            <div>
              <label className={labelCls}>Contact Phone</label>
              <input type="tel" name="contact_phone" value={form.contact_phone} onChange={handleChange} className={inputCls} placeholder="0801 234 5678" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Services Offered</label>
            <textarea name="services_offered" value={form.services_offered} onChange={handleChange} rows={2} className={inputCls} placeholder="Comma-separated list, e.g. Hearing Tests, Hearing Aids, Audiology" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleCheck} className="w-4 h-4 text-teal-600" />
              <span className="text-sm text-gray-700">Featured partner</span>
            </label>
            <div className="w-48">
              <label className={labelCls}>Display Order</label>
              <input type="number" name="display_order" value={form.display_order} onChange={handleChange} min="0" className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">
              {editing ? 'Save Changes' : 'Add Partner'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Partners;
