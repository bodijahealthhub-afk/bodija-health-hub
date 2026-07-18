import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';

const SiteSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [settings, setSettings] = useState({
    site_name: 'Bodija Health Hub',
    site_tagline: 'Your Trusted Healthcare Partner',
    site_logo: '',
    site_favicon: '',
    primary_color: '#0D9488',
    secondary_color: '#0F766E',
    accent_color: '#14B8A6',
    background_color: '#FFFFFF',
    text_color: '#1F2937',
    seo_meta_title: 'Bodija Health Hub - Quality Healthcare in Ibadan',
    seo_meta_description: 'Bodija Health Hub provides comprehensive healthcare services in Ibadan, Nigeria.',
    seo_keywords: 'healthcare, hospital, Ibadan, Nigeria',
    social_image: '',
    analytics_id: '',
    maintenance_mode: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        console.log('Fetching settings - token:', token ? 'exists' : 'MISSING');
        const res = await fetch('/api/admin/site-settings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetch response:', res.status);
        if (res.ok) {
          const data = await res.json();
          console.log('Fetched data:', data);
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) { console.error('Fetch error:', err); }
      setLoading(false);
    };
    fetchSettings();
  }, []);

    const refetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/site-settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch {}
  };
  const updateField = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('adminToken');
    console.log('Save attempt - token:', token ? 'exists' : 'MISSING');
    console.log('Settings to save:', settings);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const responseText = await res.text();
      console.log('Save response:', res.status, responseText);
      if (res.ok) {
        setToast({ type: 'success', message: 'Settings saved!' }); refetchSettings();
      } else {
        setToast({ type: 'error', message: 'Failed: ' + responseText });
      }
    } catch (err) {
      console.error('Save error:', err);
      setToast({ type: 'error', message: 'Network error: ' + err.message });
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
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
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2">
          {saving && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">General</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input type="text" value={settings.site_name} onChange={(e) => updateField('site_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
            <input type="text" value={settings.site_tagline} onChange={(e) => updateField('site_tagline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
          </div>
          <ImageUpload currentImage={settings.site_logo} onUpload={handleImageUpload('site_logo')} onRemove={() => updateField('site_logo', '')} label="Site Logo" />
          <ImageUpload currentImage={settings.site_favicon} onUpload={handleImageUpload('site_favicon')} onRemove={() => updateField('site_favicon', '')} label="Favicon" />
        </div>

        {/* Colors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Brand Colors</h2>
          {[
            { key: 'primary_color', label: 'Primary' },
            { key: 'secondary_color', label: 'Secondary' },
            { key: 'accent_color', label: 'Accent' },
            { key: 'background_color', label: 'Background' },
            { key: 'text_color', label: 'Text' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 w-24">{label}</label>
              <input type="color" value={settings[key]} onChange={(e) => updateField(key, e.target.value)}
                className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer" />
              <input type="text" value={settings[key]} onChange={(e) => updateField(key, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
            </div>
          ))}
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">SEO Defaults</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
            <input type="text" value={settings.seo_meta_title} onChange={(e) => updateField('seo_meta_title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
            <textarea value={settings.seo_meta_description} onChange={(e) => updateField('seo_meta_description', e.target.value)} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
            <input type="text" value={settings.seo_keywords} onChange={(e) => updateField('seo_keywords', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="Comma-separated" />
          </div>
        </div>

        {/* Social & Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Social & Analytics</h2>
          <ImageUpload currentImage={settings.social_image} onUpload={handleImageUpload('social_image')} onRemove={() => updateField('social_image', '')} label="Social Share Image" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
            <input type="text" value={settings.analytics_id} onChange={(e) => updateField('analytics_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="G-XXXXXXXXXX" />
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.maintenance_mode} onChange={(e) => updateField('maintenance_mode', e.target.checked)} className="sr-only peer" />
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


