import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminToken } from '../utils/api';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', group: 'Pages' },
  { path: '/admin/site-content', label: 'Site Content', group: 'Pages' },
  { path: '/admin/services', label: 'Services', group: 'Pages' },
  { path: '/admin/partners', label: 'Partners', group: 'Pages' },
  { path: '/admin/programmes', label: 'Programmes', group: 'Pages' },
  { path: '/admin/events', label: 'Events', group: 'Pages' },
  { path: '/admin/blog', label: 'Blog / Resources', group: 'Pages' },
  { path: '/admin/gallery', label: 'Gallery', group: 'Pages' },
  { path: '/admin/appointments', label: 'Bookings', group: 'Pages' },
  { path: '/admin/messages', label: 'Messages', group: 'Pages' },
  { path: '/admin/payments', label: 'Payments', group: 'Pages' },
  { path: '/admin/features', label: 'Feature Flags', group: 'Pages' },
  { path: '/admin/providers', label: 'Providers', group: 'Pages' },
  { path: '/admin/system-health', label: 'System Health', group: 'Pages' },
  { path: '/admin/backup', label: 'Backups', group: 'Pages' },
  { path: '/admin/admin-users', label: 'Admin Users', group: 'Pages' },
  { path: '/admin/seo', label: 'SEO Settings', group: 'Pages' },
  { path: '/admin/settings', label: 'Settings', group: 'Pages' },
];

const SEARCH_ENDPOINTS = [
  { url: '/api/admin/services', label: 'Service', group: 'Content', map: (d) => (d.services || []).map((s) => ({ label: s.name, sub: s.category, path: '/admin/services' })) },
  { url: '/api/admin/partners', label: 'Partner', group: 'Content', map: (d) => (d.partners || []).map((p) => ({ label: p.name, sub: p.partnerType, path: '/admin/partners' })) },
  { url: '/api/admin/programmes', label: 'Programme', group: 'Content', map: (d) => (d.programmes || []).map((p) => ({ label: p.title, sub: p.category, path: '/admin/programmes' })) },
  { url: '/api/events/admin', label: 'Event', group: 'Content', map: (d) => (d.events || []).map((e) => ({ label: e.title, sub: e.date, path: '/admin/events' })) },
  { url: '/api/blog/admin', label: 'Blog Post', group: 'Content', map: (d) => (d.posts || []).map((p) => ({ label: p.title, sub: p.status, path: '/admin/blog' })) },
  { url: '/api/admin/patients', label: 'Patient', group: 'People', map: (d) => (d.patients || []).map((p) => ({ label: p.name || p.patient_name, sub: p.email, path: '/admin/patients' })) },
  { url: '/api/admin/appointments', label: 'Appointment', group: 'Operations', map: (d) => (d.appointments || []).map((a) => ({ label: a.patient_name || a.patient_email, sub: a.service_name || a.status, path: '/admin/appointments' })) },
  { url: '/api/messages', label: 'Message', group: 'Content', map: (d) => (Array.isArray(d) ? d : d?.messages || []).map((m) => ({ label: m.name, sub: m.subject || m.email, path: '/admin/messages' })) },
  { url: '/api/admin/gallery', label: 'Media', group: 'Content', map: (d) => (d.images || d.gallery || []).map((g) => ({ label: g.title || g.filename, sub: g.category, path: '/admin/media' })) },
  { url: '/api/testimonials', label: 'Testimonial', group: 'Content', map: (d) => (Array.isArray(d) ? d : d?.testimonials || []).map((t) => ({ label: t.name || t.author, sub: t.content?.substring(0, 50), path: '/admin/testimonials' })) },
];

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const search = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const token = getAdminToken();
    const lower = q.toLowerCase();
    const found = [];

    NAV_ITEMS.forEach((item) => {
      if (item.label.toLowerCase().includes(lower)) {
        found.push({ ...item, type: 'page' });
      }
    });

    await Promise.all(
      SEARCH_ENDPOINTS.map(async (ep) => {
        try {
          const res = await fetch(ep.url, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            const items = ep.map(data);
            items.forEach((item) => {
              if (item.label && item.label.toLowerCase().includes(lower)) {
                found.push({ ...item, type: 'content', group: ep.group });
              }
            });
          }
        } catch {}
      })
    );

    setResults(found.slice(0, 20));
    setLoading(false);
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) onClose();
        else {
          document.dispatchEvent(new Event('open-command-palette'));
        }
      }
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      navigate(results[selectedIndex].path);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search services, partners, pages..."
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded border border-gray-200">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              <div className="animate-spin w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-2" />
              Searching...
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((item, i) => (
                <button
                  key={`${item.path}-${item.label}-${i}`}
                  onClick={() => { navigate(item.path); onClose(); }}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors ${
                    i === selectedIndex ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.type === 'page' ? 'bg-gray-100 text-gray-500' : 'bg-teal-100 text-teal-600'
                  }`}>
                    {item.type === 'page' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    {item.sub && <p className="text-xs text-gray-400 truncate">{item.sub}</p>}
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{item.type === 'page' ? 'Page' : item.group}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && query.length < 2 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              Type to search across services, partners, programmes, and more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
