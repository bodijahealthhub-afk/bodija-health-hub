import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', group: 'Dashboard' },
  { path: '/admin/services', label: 'Services', group: 'BHH Ecosystem' },
  { path: '/admin/service-categories', label: 'Service Categories', group: 'BHH Ecosystem' },
  { path: '/admin/providers', label: 'Providers', group: 'BHH Ecosystem' },
  { path: '/admin/programmes', label: 'Programmes', group: 'BHH Ecosystem' },
  { path: '/admin/partners', label: 'Partners', group: 'BHH Ecosystem' },
  { path: '/admin/site-content', label: 'Site Content', group: 'Content & Marketing' },
  { path: '/admin/blog', label: 'News/Blog', group: 'Content & Marketing' },
  { path: '/admin/events', label: 'Events', group: 'Content & Marketing' },
  { path: '/admin/gallery', label: 'Gallery', group: 'Content & Marketing' },
  { path: '/admin/testimonials', label: 'Testimonials', group: 'Content & Marketing' },
  { path: '/admin/seo', label: 'SEO', group: 'Content & Marketing' },
  { path: '/admin/appointments', label: 'Service Requests', group: 'Communications' },
  { path: '/admin/messages', label: 'Messages', group: 'Communications' },
  { path: '/admin/newsletter', label: 'Newsletter', group: 'Communications' },
  { path: '/admin/navigation-content', label: 'Navigation', group: 'Site Configuration' },
  { path: '/admin/hero-content', label: 'Hero Section', group: 'Site Configuration' },
  { path: '/admin/footer-content', label: 'Footer', group: 'Site Configuration' },
  { path: '/admin/page-content', label: 'Page Content', group: 'Site Configuration' },
  { path: '/admin/media', label: 'Media Library', group: 'Site Configuration' },
  { path: '/admin/payments', label: 'Payments', group: 'Site Configuration' },
  { path: '/admin/settings', label: 'Settings', group: 'Site Configuration' },
  { path: '/admin/site-settings', label: 'Site Appearance', group: 'Site Configuration' },
  { path: '/admin/features', label: 'Feature Flags', group: 'Administration' },
  { path: '/admin/admin-users', label: 'Users', group: 'Administration' },
  { path: '/admin/system-health', label: 'System Health', group: 'Administration' },
  { path: '/admin/backup', label: 'Backups', group: 'Administration' },
];

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
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

  const search = useCallback((q) => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    const lower = q.toLowerCase();
    // Navigation matches
    const navFound = NAV_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(lower) || item.group.toLowerCase().includes(lower)
    ).map((item) => ({ type: 'nav', ...item }));

    // Debounced API search for data results
    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`/api/search/admin?q=${encodeURIComponent(q)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const dataResults = [];
          for (const [entity, items] of Object.entries(data)) {
            for (const item of (items || []).slice(0, 3)) {
              const label = item.name || item.title || item.patient_name || item.booking_reference || '';
              const targetMap = {
                services: `/admin/services`,
                partners: `/admin/partners`,
                blog: `/admin/blog`,
                events: `/admin/events`,
                programmes: `/admin/programmes`,
                appointments: `/admin/appointments`,
                contacts: `/admin/contacts`,
              };
              dataResults.push({
                type: 'data',
                label,
                sublabel: item.category || item.status || item.booking_type || '',
                group: entity.charAt(0).toUpperCase() + entity.slice(1),
                path: targetMap[entity] || '/admin',
              });
            }
          }
          setResults([...navFound, ...dataResults].slice(0, 20));
        } else {
          setResults(navFound);
        }
      } catch {
        setResults(navFound);
      }
      setSelectedIndex(0);
    }, 300);

    // Show nav results immediately
    setResults(navFound);
    setSelectedIndex(0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 150);
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

  const groupedResults = results.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

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
            placeholder="Search pages..."
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded border border-gray-200">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {results.length > 0 && (
            <div className="py-2">
              {Object.entries(groupedResults).map(([group, items]) => (
                <div key={group}>
                  <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                    {group}
                  </div>
                  {items.map((item) => {
                    const idx = results.indexOf(item);
                    return (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); onClose(); }}
                        className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors ${
                          idx === selectedIndex ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{item.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {query.length < 2 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              Type to search pages and sections
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
