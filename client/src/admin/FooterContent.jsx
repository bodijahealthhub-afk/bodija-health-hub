import { useState, useEffect } from 'react';

const FooterContent = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [footer, setFooter] = useState({
    tagline: 'Your Trusted Healthcare Partner in Ibadan. Providing compassionate, comprehensive medical services for individuals and families.',
    quickLinks: [
      { label: 'Home', url: '/' },
      { label: 'About Us', url: '/about' },
      { label: 'Services', url: '/services' },
      { label: 'Blog', url: '/blog' },
      { label: 'Contact', url: '/contact' },
    ],
    platformLinks: [
      { label: 'LiveCare', url: '/platforms/livecare' },
      { label: 'hEar Menders', url: '/platforms/hear-menders' },
    ],
    socialLinks: {
      facebook: 'https://facebook.com/bodijahealthhub',
      instagram: 'https://instagram.com/bodijahealthhub',
      twitter: 'https://twitter.com/bodijahealthhub',
      linkedin: 'https://linkedin.com/company/bodijahealthhub',
      youtube: '',
    },
    copyright: `© ${new Date().getFullYear()} Bodija Health Hub. All rights reserved.`,
  });

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('/api/admin/site-content/footer', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFooter((prev) => ({ ...prev, ...data }));
        }
      } catch { /* use defaults */ }
      setLoading(false);
    };
    fetchFooter();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/site-content/footer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(footer),
      });
      if (res.ok) {
        setToast({ type: 'success', message: 'Footer content saved successfully' });
      } else {
        setToast({ type: 'error', message: 'Failed to save footer content' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const addQuickLink = () => {
    setFooter((prev) => ({
      ...prev,
      quickLinks: [...prev.quickLinks, { label: '', url: '' }],
    }));
  };

  const updateQuickLink = (index, field, value) => {
    const links = [...footer.quickLinks];
    links[index] = { ...links[index], [field]: value };
    setFooter((prev) => ({ ...prev, quickLinks: links }));
  };

  const removeQuickLink = (index) => {
    setFooter((prev) => ({
      ...prev,
      quickLinks: prev.quickLinks.filter((_, i) => i !== index),
    }));
  };

  const moveQuickLink = (index, direction) => {
    const links = [...footer.quickLinks];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= links.length) return;
    [links[index], links[swapIndex]] = [links[swapIndex], links[index]];
    setFooter((prev) => ({ ...prev, quickLinks: links }));
  };

  const addPlatformLink = () => {
    setFooter((prev) => ({
      ...prev,
      platformLinks: [...prev.platformLinks, { label: '', url: '' }],
    }));
  };

  const updatePlatformLink = (index, field, value) => {
    const links = [...footer.platformLinks];
    links[index] = { ...links[index], [field]: value };
    setFooter((prev) => ({ ...prev, platformLinks: links }));
  };

  const removePlatformLink = (index) => {
    setFooter((prev) => ({
      ...prev,
      platformLinks: prev.platformLinks.filter((_, i) => i !== index),
    }));
  };

  const updateSocialLink = (platform, value) => {
    setFooter((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Footer Content</h1>
          <p className="text-gray-500 mt-1">Edit the website footer</p>
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Footer Content</h1>
          <p className="text-gray-500 mt-1">Edit the website footer</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tagline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Tagline</h2>
          <textarea
            value={footer.tagline}
            onChange={(e) => setFooter((prev) => ({ ...prev, tagline: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Quick Links</h2>
            <button onClick={addQuickLink} className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add
            </button>
          </div>
          <div className="space-y-2">
            {footer.quickLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveQuickLink(i, -1)}
                    disabled={i === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveQuickLink(i, 1)}
                    disabled={i === footer.quickLinks.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => updateQuickLink(i, 'label', e.target.value)}
                  className="w-32 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <input
                  type="text"
                  placeholder="URL (e.g. /about)"
                  value={link.url}
                  onChange={(e) => updateQuickLink(i, 'url', e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  onClick={() => removeQuickLink(i)}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Platform Links</h2>
            <button onClick={addPlatformLink} className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add
            </button>
          </div>
          <div className="space-y-2">
            {footer.platformLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => updatePlatformLink(i, 'label', e.target.value)}
                  className="w-32 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updatePlatformLink(i, 'url', e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  onClick={() => removePlatformLink(i)}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Social Media Links</h2>
          {Object.entries(footer.socialLinks).map(([platform, url]) => (
            <div key={platform}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{platform}</label>
              <input
                type="url"
                value={url}
                onChange={(e) => updateSocialLink(platform, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder={`https://${platform}.com/...`}
              />
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 lg:col-span-2">
          <h2 className="font-semibold text-gray-900">Copyright Text</h2>
          <input
            type="text"
            value={footer.copyright}
            onChange={(e) => setFooter((prev) => ({ ...prev, copyright: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="bg-slate-800 rounded-xl p-6 text-white">
        <h2 className="font-semibold mb-4 text-slate-300">Footer Preview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center font-bold text-xs">BHH</div>
              <span className="font-semibold">Bodija Health Hub</span>
            </div>
            <p className="text-slate-400 text-sm">{footer.tagline}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-1 text-sm text-slate-400">
              {footer.quickLinks.map((link, i) => (
                <li key={i}>{link.label || 'Link'}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Platforms</h3>
            <ul className="space-y-1 text-sm text-slate-400">
              {footer.platformLinks.map((link, i) => (
                <li key={i}>{link.label || 'Platform'}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700 text-center text-sm text-slate-500">
          {footer.copyright}
        </div>
      </div>
    </div>
  );
};

export default FooterContent;
