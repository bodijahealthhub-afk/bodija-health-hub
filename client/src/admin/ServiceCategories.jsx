import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { toast } from 'react-toastify';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  display_order: 0,
  status: 'active',
};

const ServiceCategories = () => {
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/service-categories', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      } else {
        toast.error('Failed to load service categories');
      }
    } catch {
      toast.error('Failed to load service categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFiltered(
        categories.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.slug || '').toLowerCase().includes(q) ||
            (c.description || '').toLowerCase().includes(q)
        )
      );
    } else {
      setFiltered(categories);
    }
  }, [categories, searchQuery]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || '',
      slug: c.slug || '',
      description: c.description || '',
      icon: c.icon || '',
      display_order: c.display_order || 0,
      status: c.status || 'active',
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name) {
      alert('Category name is required');
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/service-categories/${editing.id}` : '/api/admin/service-categories';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (res.ok) {
        const saved = await res.json();
        setCategories((prev) =>
          editing
            ? prev.map((c) => (c.id === editing.id ? saved : c))
            : [...prev, saved]
        );
        toast.success(editing ? 'Category updated' : 'Category created');
        setShowForm(false);
        setEditing(null);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to save category');
      }
    } catch {
      toast.error('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (c) => {
    const next = c.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/service-categories/${c.id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCategories((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
        return;
      }
    } catch {
      // fall through to local update
    }
    setCategories((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: next } : x)));
  };

  const handleArchive = async (c) => {
    if (!window.confirm(`Archive "${c.name}"? Archived categories are hidden from the public site.`)) return;
    try {
      const res = await fetch(`/api/admin/service-categories/${c.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Category archived');
        setCategories((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: 'inactive' } : x)));
      } else {
        toast.error('Failed to archive category');
      }
    } catch {
      toast.error('Failed to archive category');
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Categories</h1>
          <p className="text-gray-500 mt-1">Organize services into browsable categories</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <SearchBar placeholder="Search categories..." onSearch={setSearchQuery} className="w-full md:w-96" />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((c, idx) => (
                <tr key={c.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {c.icon && <span className="text-xl">{c.icon}</span>}
                      <div>
                        <p className="font-medium text-gray-900">{c.name}</p>
                        {c.description && <p className="text-sm text-gray-500 line-clamp-1">{c.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{c.slug || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.display_order}</td>
                  <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(c)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title={c.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </button>
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleArchive(c)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">No categories found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Edit Category' : 'Add New Category'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Category Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className={inputCls} placeholder="e.g. Women's Health" />
          </div>
          <div>
            <label className={labelCls}>Slug</label>
            <input type="text" name="slug" value={form.slug} onChange={handleChange} className={inputCls} placeholder="Leave blank to auto-generate" />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} className={inputCls} placeholder="Short description of this category" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Icon (emoji)</label>
              <input type="text" name="icon" value={form.icon} onChange={handleChange} className={inputCls} placeholder="e.g. 🩺" />
            </div>
            <div>
              <label className={labelCls}>Display Order</label>
              <input type="number" name="display_order" value={form.display_order} onChange={handleChange} className={inputCls} min="0" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm disabled:opacity-50">
              {saving ? 'Saving...' : (editing ? 'Save Changes' : 'Add Category')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceCategories;
