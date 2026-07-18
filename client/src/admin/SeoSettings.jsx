import { useState, useEffect } from 'react';
import Modal from './Modal';

const PAGES = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'about', label: 'About Us', path: '/about' },
  { id: 'services', label: 'Services', path: '/services' },
  { id: 'platforms', label: 'Platforms', path: '/platforms' },
  { id: 'livecare', label: 'LiveCare', path: '/platforms/livecare' },
  { id: 'hearmenders', label: 'hEar Menders', path: '/platforms/hear-menders' },
  { id: 'blog', label: 'Blog', path: '/blog' },
  { id: 'contact', label: 'Contact', path: '/contact' },
  { id: 'careers', label: 'Careers', path: '/careers' },
  { id: 'faq', label: 'FAQ', path: '/faq' },
];

const SeoSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activePage, setActivePage] = useState('home');
  const [robotsModal, setRobotsModal] = useState(false);
  const [sitemapModal, setSitemapModal] = useState(false);

  const [pages, setPages] = useState({});

  const [robots, setRobots] = useState('User-agent: *\nAllow: /\n\nSitemap: https://bodijahealthhub.com/sitemap.xml');
  const [sitemap, setSitemap] = useState('');

  useEffect(() => {
    const fetchSeo = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('/api/admin/seo', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPages(data.pages || {});
          if (data.robots) setRobots(data.robots);
          if (data.sitemap) setSitemap(data.sitemap);
        }
      } catch { /* use defaults */
        const defaults = {};
        PAGES.forEach((p) => {
          defaults[p.id] = {
            metaTitle: `${p.label} - Bodija Health Hub`,
            metaDescription: '',
            ogTitle: '',
            ogDescription: '',
            ogImage: '',
            twitterCard: 'summary_large_image',
            twitterTitle: '',
            twitterDescription: '',
            twitterImage: '',
            canonical: `https://bodijahealthhub.com${p.path}`,
            noindex: false,
            nofollow: false,
          };
        });
        setPages(defaults);
      }
      setLoading(false);
    };
    fetchSeo();
  }, []);

  const currentPage = pages[activePage] || {
    metaTitle: '',
    metaDescription: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    canonical: '',
    noindex: false,
    nofollow: false,
  };

  const updatePageSeo = (field, value) => {
    setPages((prev) => ({
      ...prev,
      [activePage]: { ...(prev[activePage] || {}), [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pages, robots, sitemap }),
      });
      if (res.ok) {
        setToast({ type: 'success', message: 'SEO settings saved successfully' });
      } else {
        setToast({ type: 'error', message: 'Failed to save SEO settings' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleGenerateSitemap = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/seo/sitemap/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSitemap(data.sitemap || '');
        setSitemapModal(true);
        setToast({ type: 'success', message: 'Sitemap generated successfully' });
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to generate sitemap' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveRobots = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/admin/seo/robots', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: robots }),
      });
      setRobotsModal(false);
      setToast({ type: 'success', message: 'robots.txt saved successfully' });
    } catch {
      setToast({ type: 'error', message: 'Failed to save robots.txt' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
          <p className="text-gray-500 mt-1">Manage search engine optimization for all pages</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
          <p className="text-gray-500 mt-1">Manage search engine optimization for all pages</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRobotsModal(true)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            robots.txt
          </button>
          <button
            onClick={handleGenerateSitemap}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate Sitemap
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Page selector */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            {PAGES.map((page) => (
              <button
                key={page.id}
                onClick={() => setActivePage(page.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePage === page.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {page.label}
              </button>
            ))}
          </div>
        </div>

        {/* SEO Form */}
        <div className="flex-1 space-y-6">
          {/* Basic SEO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Basic SEO</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={currentPage.metaTitle}
                onChange={(e) => updatePageSeo('metaTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className={`text-xs mt-1 ${currentPage.metaTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                {currentPage.metaTitle.length}/60 characters
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                value={currentPage.metaDescription}
                onChange={(e) => updatePageSeo('metaDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className={`text-xs mt-1 ${currentPage.metaDescription.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                {currentPage.metaDescription.length}/160 characters
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
              <input
                type="url"
                value={currentPage.canonical}
                onChange={(e) => updatePageSeo('canonical', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentPage.noindex}
                  onChange={(e) => updatePageSeo('noindex', e.target.checked)}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">No Index</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentPage.nofollow}
                  onChange={(e) => updatePageSeo('nofollow', e.target.checked)}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">No Follow</span>
              </label>
            </div>
          </div>

          {/* Open Graph */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Open Graph (Facebook)</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
              <input
                type="text"
                value={currentPage.ogTitle}
                onChange={(e) => updatePageSeo('ogTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Leave blank to use meta title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
              <textarea
                value={currentPage.ogDescription}
                onChange={(e) => updatePageSeo('ogDescription', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Leave blank to use meta description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
              <input
                type="url"
                value={currentPage.ogImage}
                onChange={(e) => updatePageSeo('ogImage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="1200x630 recommended"
              />
            </div>
          </div>

          {/* Twitter Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Twitter Card</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
              <select
                value={currentPage.twitterCard}
                onChange={(e) => updatePageSeo('twitterCard', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Title</label>
              <input
                type="text"
                value={currentPage.twitterTitle}
                onChange={(e) => updatePageSeo('twitterTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Leave blank to use OG title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Description</label>
              <textarea
                value={currentPage.twitterDescription}
                onChange={(e) => updatePageSeo('twitterDescription', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Leave blank to use OG description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Image URL</label>
              <input
                type="url"
                value={currentPage.twitterImage}
                onChange={(e) => updatePageSeo('twitterImage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="Leave blank to use OG image"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Search Preview</h2>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-blue-700 text-lg hover:underline cursor-pointer">
                {currentPage.metaTitle || 'Page Title'}
              </p>
              <p className="text-green-700 text-sm mt-1">
                {currentPage.canonical || 'https://bodijahealthhub.com/'}
              </p>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {currentPage.metaDescription || 'Page description will appear here...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* robots.txt Modal */}
      <Modal
        isOpen={robotsModal}
        onClose={() => setRobotsModal(false)}
        title="Edit robots.txt"
        size="lg"
      >
        <div className="space-y-4">
          <textarea
            value={robots}
            onChange={(e) => setRobots(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-mono"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setRobotsModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRobots}
              disabled={saving}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm flex items-center gap-2"
            >
              {saving && <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />}
              Save robots.txt
            </button>
          </div>
        </div>
      </Modal>

      {/* Sitemap Modal */}
      <Modal
        isOpen={sitemapModal}
        onClose={() => setSitemapModal(false)}
        title="Generated Sitemap"
        size="lg"
      >
        <div className="space-y-4">
          <pre className="p-4 bg-gray-50 rounded-lg text-xs font-mono overflow-auto max-h-96 whitespace-pre-wrap">
            {sitemap || 'No sitemap generated yet.'}
          </pre>
          <div className="flex justify-end">
            <button
              onClick={() => {
                navigator.clipboard.writeText(sitemap);
                setToast({ type: 'success', message: 'Sitemap copied to clipboard' });
                setTimeout(() => setToast(null), 2000);
              }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy to Clipboard
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SeoSettings;
