import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';

const SiteSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [settings, setSettings] = useState({
    siteName: 'Bodija Health Hub',
    tagline: 'Your Trusted Healthcare Partner',
    logo: '',
    favicon: '',
    colors: {
      primary: '#0D9488',
      secondary: '#0F766E',
      accent: '#14B8A6',
      background: '#FFFFFF',
      text: '#1F2937',
    },
    seo: {
      metaTitle: 'Bodija Health Hub - Quality Healthcare in Ibadan',
      metaDescription: 'Bodija Health Hub provides comprehensive healthcare services including general consultation, dental care, laboratory services, and more in Ibadan, Nigeria.',
      keywords: 'healthcare, hospital, Ibadan, Nigeria, doctor, consultation, dental, laboratory',
    },
    socialImage: '',
    analyticsId: '',
    maintenanceMode: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('/api/admin/site-settings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch { /* use defaults */ }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const updateField = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const updateColor = (color, value) => {
    setSettings((prev) => ({
      ...prev,
      colors: { ...prev.colors, [color]: value },
    }));
  };

  const updateSeo = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      seo: { ...prev.seo, [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setToast({ type: 'success', message: 'Site settings saved successfully' });
      } else {
        setToast({ type: 'error', message: 'Failed to save settings' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleImageUpload = (field) => (file) => {
    const reader = new FileReader();
    reader.onloadend = () => updateField(field, reader.result);
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-500 mt-1">Global site configuration</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-500 mt-1">Global site configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Maintenance Mode Banner */}
      {settings.maintenanceMode && (
        <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-xl flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="font-medium text-yellow-800">Maintenance Mode is Active</p>
            <p className="text-sm text-yellow-700">The website is currently showing a maintenance page to visitors.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">General</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => updateField('siteName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <ImageUpload
            currentImage={settings.logo}
            onUpload={handleImageUpload('logo')}
            onRemove={() => updateField('logo', '')}
            label="Site Logo"
          />
          <ImageUpload
            currentImage={settings.favicon}
            onUpload={handleImageUpload('favicon')}
            onRemove={() => updateField('favicon', '')}
            label="Favicon (32x32 recommended)"
          />
        </div>

        {/* Colors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Brand Colors</h2>
          {Object.entries(settings.colors).map(([name, value]) => (
            <div key={name} className="flex items-center gap-3">
              <label className="block text-sm font-medium text-gray-700 w-24 capitalize">{name}</label>
              <input
                type="color"
                value={value}
                onChange={(e) => updateColor(name, e.target.value)}
                className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => updateColor(name, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-mono"
              />
            </div>
          ))}
          <div className="p-4 rounded-lg border border-gray-200" style={{ backgroundColor: settings.colors.background }}>
            <p className="text-sm" style={{ color: settings.colors.text }}>
              Preview text in <span style={{ color: settings.colors.primary }}>primary</span> and{' '}
              <span style={{ color: settings.colors.secondary }}>secondary</span> colors.
            </p>
          </div>
        </div>

        {/* SEO Defaults */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">SEO Defaults</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Meta Title</label>
            <input
              type="text"
              value={settings.seo.metaTitle}
              onChange={(e) => updateSeo('metaTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="text-xs text-gray-400 mt-1">{settings.seo.metaTitle.length}/60 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Meta Description</label>
            <textarea
              value={settings.seo.metaDescription}
              onChange={(e) => updateSeo('metaDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="text-xs text-gray-400 mt-1">{settings.seo.metaDescription.length}/160 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
            <input
              type="text"
              value={settings.seo.keywords}
              onChange={(e) => updateSeo('keywords', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Comma-separated keywords"
            />
          </div>
        </div>

        {/* Social & Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Social & Analytics</h2>
          <ImageUpload
            currentImage={settings.socialImage}
            onUpload={handleImageUpload('socialImage')}
            onRemove={() => updateField('socialImage', '')}
            label="Social Share Image (1200x630 recommended)"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
            <input
              type="text"
              value={settings.analyticsId}
              onChange={(e) => updateField('analyticsId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="G-XXXXXXXXXX"
            />
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => updateField('maintenanceMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
            <div>
              <p className="text-sm font-medium text-gray-700">Maintenance Mode</p>
              <p className="text-xs text-gray-500">Show maintenance page to all visitors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;
