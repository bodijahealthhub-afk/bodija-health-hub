import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';

const HeroContent = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [hero, setHero] = useState({
    headline: 'Quality Healthcare for Every Family',
    subtext: 'Bodija Health Hub provides comprehensive, compassionate healthcare services in the heart of Ibadan. Your well-being is our priority.',
    cta1: { text: 'Book Appointment', link: '/appointments' },
    cta2: { text: 'Our Services', link: '/services' },
    image: '',
  });

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('/api/admin/site-content/hero', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setHero((prev) => ({ ...prev, ...data }));
        }
      } catch { /* use defaults */ }
      setLoading(false);
    };
    fetchHero();
  }, []);

  const updateField = (field, value) => {
    setHero((prev) => ({ ...prev, [field]: value }));
  };

  const updateCta = (ctaKey, field, value) => {
    setHero((prev) => ({
      ...prev,
      [ctaKey]: { ...prev[ctaKey], [field]: value },
    }));
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setHero((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/site-content/hero', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(hero),
      });
      if (res.ok) {
        setToast({ type: 'success', message: 'Hero content saved successfully' });
      } else {
        setToast({ type: 'error', message: 'Failed to save hero content' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Section</h1>
          <p className="text-gray-500 mt-1">Edit the main hero section of your homepage</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Hero Section</h1>
          <p className="text-gray-500 mt-1">Edit the main hero section of your homepage</p>
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
        {/* Editor */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Content</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
              <input
                type="text"
                value={hero.headline}
                onChange={(e) => updateField('headline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className="text-xs text-gray-400 mt-1">{hero.headline.length}/100 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtext</label>
              <textarea
                value={hero.subtext}
                onChange={(e) => updateField('subtext', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className="text-xs text-gray-400 mt-1">{hero.subtext.length}/300 characters</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Call to Action Buttons</h2>
            <div className="p-4 bg-teal-50 rounded-lg space-y-3">
              <h3 className="text-sm font-medium text-teal-800">Primary CTA</h3>
              <input
                type="text"
                placeholder="Button text"
                value={hero.cta1.text}
                onChange={(e) => updateCta('cta1', 'text', e.target.value)}
                className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
              <input
                type="text"
                placeholder="Link (e.g. /appointments)"
                value={hero.cta1.link}
                onChange={(e) => updateCta('cta1', 'link', e.target.value)}
                className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Secondary CTA</h3>
              <input
                type="text"
                placeholder="Button text"
                value={hero.cta2.text}
                onChange={(e) => updateCta('cta2', 'text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
              <input
                type="text"
                placeholder="Link (e.g. /services)"
                value={hero.cta2.link}
                onChange={(e) => updateCta('cta2', 'link', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Hero Image</h2>
            <ImageUpload
              currentImage={hero.image}
              onUpload={handleImageUpload}
              onRemove={() => updateField('image', '')}
              label="Hero Background Image"
            />
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Live Preview</h2>
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-teal-600 to-teal-800 min-h-[400px] flex items-center">
            {hero.image && (
              <img
                src={hero.image}
                alt="Hero"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
            )}
            <div className="relative z-10 p-8 text-white max-w-lg">
              <h2 className="text-3xl font-bold mb-4 leading-tight">{hero.headline || 'Your Headline Here'}</h2>
              <p className="text-teal-100 mb-6 text-sm leading-relaxed">{hero.subtext || 'Your subtext here'}</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-6 py-2.5 bg-white text-teal-700 rounded-lg text-sm font-semibold">
                  {hero.cta1.text || 'Primary Button'}
                </span>
                <span className="px-6 py-2.5 border-2 border-white text-white rounded-lg text-sm font-semibold">
                  {hero.cta2.text || 'Secondary Button'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
