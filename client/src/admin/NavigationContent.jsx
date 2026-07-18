import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';

const NavigationContent = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [nav, setNav] = useState({
    logo: '',
    logoText: 'Bodija Health Hub',
    links: [
      { label: 'Home', url: '/' },
      { label: 'About', url: '/about' },
      { label: 'Services', url: '/services' },
      { label: 'Platforms', url: '/platforms' },
      { label: 'Blog', url: '/blog' },
      { label: 'Contact', url: '/contact' },
    ],
    ctaButton: { text: 'Book Appointment', url: '/appointments' },
    phone: '+234 801 234 5678',
  });

  useEffect(() => {
    const fetchNav = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('/api/admin/site-content/navigation', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNav((prev) => ({ ...prev, ...data }));
        }
      } catch { /* use defaults */ }
      setLoading(false);
    };
    fetchNav();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/site-content/navigation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nav),
      });
      if (res.ok) {
        setToast({ type: 'success', message: 'Navigation saved successfully' });
      } else {
        setToast({ type: 'error', message: 'Failed to save navigation' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const addLink = () => {
    setNav((prev) => ({
      ...prev,
      links: [...prev.links, { label: '', url: '' }],
    }));
  };

  const updateLink = (index, field, value) => {
    const links = [...nav.links];
    links[index] = { ...links[index], [field]: value };
    setNav((prev) => ({ ...prev, links }));
  };

  const removeLink = (index) => {
    setNav((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const moveLink = (index, direction) => {
    const links = [...nav.links];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= links.length) return;
    [links[index], links[swapIndex]] = [links[swapIndex], links[index]];
    setNav((prev) => ({ ...prev, links }));
  };

  const handleLogoUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setNav((prev) => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Navigation</h1>
          <p className="text-gray-500 mt-1">Edit the website navigation bar</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Navigation</h1>
          <p className="text-gray-500 mt-1">Edit the website navigation bar</p>
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
        {/* Logo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Logo</h2>
          <ImageUpload
            currentImage={nav.logo}
            onUpload={handleLogoUpload}
            onRemove={() => setNav((prev) => ({ ...prev, logo: '' }))}
            label="Logo Image"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo Text (if no image)</label>
            <input
              type="text"
              value={nav.logoText}
              onChange={(e) => setNav((prev) => ({ ...prev, logoText: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        {/* CTA Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">CTA Button</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
            <input
              type="text"
              value={nav.ctaButton.text}
              onChange={(e) => setNav((prev) => ({
                ...prev,
                ctaButton: { ...prev.ctaButton, text: e.target.value },
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button URL</label>
            <input
              type="text"
              value={nav.ctaButton.url}
              onChange={(e) => setNav((prev) => ({
                ...prev,
                ctaButton: { ...prev.ctaButton, url: e.target.value },
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={nav.phone}
              onChange={(e) => setNav((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Navigation Links</h2>
            <button onClick={addLink} className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Link
            </button>
          </div>
          <div className="space-y-2">
            {nav.links.map((link, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveLink(i, -1)}
                    disabled={i === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveLink(i, 1)}
                    disabled={i === nav.links.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <span className="text-xs text-gray-400 w-5 text-center">{i + 1}</span>
                <input
                  type="text"
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => updateLink(i, 'label', e.target.value)}
                  className="w-36 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <input
                  type="text"
                  placeholder="URL (e.g. /about)"
                  value={link.url}
                  onChange={(e) => updateLink(i, 'url', e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  onClick={() => removeLink(i)}
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
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-900 mb-3 text-sm">Preview</h2>
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            {nav.logo ? (
              <img src={nav.logo} alt="Logo" className="h-8 w-8 object-contain" />
            ) : (
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center font-bold text-white text-xs">BHH</div>
            )}
            <span className="font-semibold text-gray-900">{nav.logoText}</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {nav.links.map((link, i) => (
              <span key={i} className="text-sm text-gray-600 hover:text-teal-600">{link.label || 'Link'}</span>
            ))}
          </div>
          <span className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium">
            {nav.ctaButton.text || 'CTA'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NavigationContent;
