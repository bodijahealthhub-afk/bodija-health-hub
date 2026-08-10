import { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { useFeatures } from '../context/FeatureContext';
import { toast } from 'react-toastify';

const STATUS_STYLES = {
  active: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-amber-100 text-amber-700',
  coming_soon: 'bg-sky-100 text-sky-700',
  disabled: 'bg-gray-100 text-gray-600',
  archived: 'bg-slate-200 text-slate-600',
};

const defaultForm = {
  key: '',
  name: '',
  description: '',
  status: 'draft',
  enabled: false,
  public_visible: true,
  navigation_visible: true,
  admin_visible: true,
  requires_admin_confirmation: false,
};

const Features = () => {
  const { refresh } = useFeatures();
  const [flags, setFlags] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('flags');
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const token = localStorage.getItem('adminToken');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [flagsRes, auditRes] = await Promise.all([
        fetch('/api/admin/features', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/audit-logs?limit=50', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (flagsRes.ok) setFlags(await flagsRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
    } catch {
      toast.error('Failed to load features');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const api = async (url, method, body) => {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    return res;
  };

  const handleToggle = async (flag) => {
    try {
      const res = await api(`/api/admin/features/${flag.key}/toggle`, 'POST');
      if (res.ok) {
        toast.success(`${flag.name} ${flag.enabled ? 'disabled' : 'enabled'}`);
        await fetchAll();
        refresh();
      } else {
        toast.error('Failed to toggle feature');
      }
    } catch {
      toast.error('Failed to toggle feature');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api(`/api/admin/features/${editing.key}`, 'PUT', editing);
      if (res.ok) {
        toast.success('Feature updated');
        setEditing(null);
        await fetchAll();
        refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to update feature');
      }
    } catch {
      toast.error('Failed to update feature');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await api('/api/admin/features', 'POST', creating);
      if (res.ok) {
        toast.success('Feature created');
        setCreating(null);
        await fetchAll();
        refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to create feature');
      }
    } catch {
      toast.error('Failed to create feature');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (flag) => {
    try {
      const res = await api(`/api/admin/features/${flag.key}/archive`, 'POST');
      if (res.ok) {
        toast.success(flag.status === 'archived' ? 'Feature restored' : 'Feature archived');
        await fetchAll();
        refresh();
      } else {
        toast.error('Failed to update feature');
      }
    } catch {
      toast.error('Failed to update feature');
    }
  };

  const filteredFlags = flags.filter((f) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return f.key.toLowerCase().includes(q) || f.name.toLowerCase().includes(q);
  });

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString();
  };

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none';

  const Toggle = ({ checked, onChange, disabled }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
        checked ? 'bg-teal-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Features</h1>
          <p className="text-gray-500 mt-1">Enable, disable, and manage what visitors can see and use.</p>
        </div>
        <button
          onClick={() => setCreating(defaultForm)}
          className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          New Feature
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 w-fit">
        {[
          { id: 'flags', label: 'Feature Flags' },
          { id: 'audit', label: 'Audit Log' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t.id ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'flags' && (
        <>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features..."
              className={`${inputCls} max-w-xs`}
            />
            <span className="text-sm text-gray-500">{filteredFlags.length} features</span>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
              <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFlags.map((flag) => (
                <div key={flag.key} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{flag.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[flag.status] || STATUS_STYLES.draft}`}>
                          {flag.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{flag.key}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${flag.enabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {flag.enabled ? 'On' : 'Off'}
                      </span>
                      <Toggle checked={flag.enabled} onChange={() => handleToggle(flag)} />
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed">{flag.description || 'No description'}</p>

                  {/* Visibility */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'public_visible', label: 'Public' },
                      { key: 'navigation_visible', label: 'Navigation' },
                      { key: 'admin_visible', label: 'Admin' },
                    ].map((v) => (
                      <button
                        key={v.key}
                        onClick={() => setEditing({ ...flag, [v.key]: !flag[v.key] }) && null}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                          flag[v.key]
                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : 'bg-gray-50 text-gray-400 border-gray-200'
                        }`}
                        title={`${v.label} visibility`}
                      >
                        {v.label}
                      </button>
                    ))}
                    {flag.requires_admin_confirmation && (
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full border border-purple-200 bg-purple-50 text-purple-700">
                        Confirm required
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                    <button
                      onClick={() => setEditing({ ...flag })}
                      className="px-3 py-1.5 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchive(flag)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {flag.status === 'archived' ? 'Restore' : 'Archive'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'audit' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No audit entries yet</td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{log.action.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{log.entity_type}<span className="text-gray-400 font-mono ml-1">{log.entity_id}</span></td>
                      <td className="px-6 py-3 text-sm text-gray-600">{log.actor || '—'}</td>
                      <td className="px-6 py-3 text-xs text-gray-500 max-w-md truncate">
                        {log.after_state ? (() => {
                          try {
                            const parsed = JSON.parse(log.after_state);
                            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                              return Object.entries(parsed)
                                .filter(([k]) => ['enabled', 'status', 'name'].includes(k))
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(', ');
                            }
                            return log.after_state;
                          } catch {
                            return log.after_state;
                          }
                        })() : log.after_state}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(log.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit modal */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title={`Edit — ${editing?.key || ''}`} size="lg">
        {editing && (
          <div className="space-y-5">
            <Field label="Name">
              <input className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label="Description">
              <textarea className={`${inputCls} resize-none`} rows={3} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <select className={inputCls} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="coming_soon">Coming Soon</option>
                  <option value="disabled">Disabled</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
            </div>
            <div className="space-y-3">
              {[
                { key: 'enabled', label: 'Enabled' },
                { key: 'public_visible', label: 'Visible to the public' },
                { key: 'navigation_visible', label: 'Visible in navigation' },
                { key: 'admin_visible', label: 'Visible in admin' },
                { key: 'requires_admin_confirmation', label: 'Requires confirmation before enabling' },
              ].map((t) => (
                <div key={t.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{t.label}</span>
                  <Toggle checked={Boolean(editing[t.key])} onChange={() => setEditing({ ...editing, [t.key]: !editing[t.key] })} />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create modal */}
      <Modal isOpen={!!creating} onClose={() => setCreating(null)} title="New Feature" size="lg">
        {creating && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Key">
                <input className={inputCls} value={creating.key} onChange={(e) => setCreating({ ...creating, key: e.target.value.trim().replace(/\s+/g, '_') })} placeholder="e.g. telehealth" />
              </Field>
              <Field label="Name">
                <input className={inputCls} value={creating.name} onChange={(e) => setCreating({ ...creating, name: e.target.value })} placeholder="e.g. Telehealth" />
              </Field>
            </div>
            <Field label="Description">
              <textarea className={`${inputCls} resize-none`} rows={3} value={creating.description} onChange={(e) => setCreating({ ...creating, description: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <select className={inputCls} value={creating.status} onChange={(e) => setCreating({ ...creating, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="coming_soon">Coming Soon</option>
                  <option value="disabled">Disabled</option>
                </select>
              </Field>
            </div>
            <div className="space-y-3">
              {[
                { key: 'enabled', label: 'Enabled' },
                { key: 'public_visible', label: 'Visible to the public' },
                { key: 'navigation_visible', label: 'Visible in navigation' },
                { key: 'admin_visible', label: 'Visible in admin' },
              ].map((t) => (
                <div key={t.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{t.label}</span>
                  <Toggle checked={Boolean(creating[t.key])} onChange={() => setCreating({ ...creating, [t.key]: !creating[t.key] })} />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button onClick={() => setCreating(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !creating.key || !creating.name}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Feature'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Features;
