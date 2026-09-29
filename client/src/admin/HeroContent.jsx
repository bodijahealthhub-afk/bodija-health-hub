import { useState, useEffect } from 'react';
import { clearCache } from '../utils/api';

const SLIDE_DEFAULTS = {
  slide1_org: 'BODIJA HEALTH HUB',
  slide1_logo: '/hero/bhh-mark-white.png',
  slide1_image: '/hero/slide-1.jpg',
  slide1_active: '1',
  slide1_order: '1',
  slide1_duration: '4000',
  slide1_position: '68% 45%',
  slide1_eyebrow: "Ibadan's Integrated Healthcare Ecosystem",
  slide1_title: 'Wellness Starts Here.',
  slide1_subtext: 'A community-based integrated healthcare ecosystem — bringing clinics, specialists, and quality digital solutions together for every family in Ibadan.',
  slide1_cta1_text: 'Book Appointment',
  slide1_cta1_link: '/appointments',
  slide1_cta2_text: 'Visit Website',
  slide1_cta2_link: '',
  slide2_org: 'BACR',
  slide2_logo: '/hero/bacr-mark-white.png',
  slide2_image: '/hero/slide-2.jpg',
  slide2_active: '1',
  slide2_order: '2',
  slide2_duration: '4000',
  slide2_position: '65% 50%',
  slide2_eyebrow: 'Bodija Advanced Care & Rehabilitation Centre',
  slide2_title: 'Restoring Function. Rebuilding Lives.',
  slide2_subtext: "Recovery is not just physical — it is personal. BACR is Ibadan's dedicated rehabilitation centre, designed to support individuals on every step of their journey back to independence, strength, and quality of life.",
  slide2_cta1_text: 'Book Appointment',
  slide2_cta1_link: '/appointments',
  slide2_cta2_text: 'Visit Website',
  slide2_cta2_link: '',
  slide3_org: 'BACR',
  slide3_logo: '/hero/bacr-mark-white.png',
  slide3_image: '/hero/slide-3.jpg',
  slide3_active: '1',
  slide3_order: '3',
  slide3_duration: '4000',
  slide3_position: '58% 45%',
  slide3_eyebrow: 'Bodija Advanced Care & Rehabilitation Centre',
  slide3_title: 'Every Step Forward Matters.',
  slide3_subtext: 'From physiotherapy and speech therapy to occupational and behavioral support — our specialist-led programmes are built to restore what matters most: your movement, your voice, your independence.',
  slide3_cta1_text: 'Book Appointment',
  slide3_cta1_link: '/appointments',
  slide3_cta2_text: 'Visit Website',
  slide3_cta2_link: '',
};

const SLIDE_FIELD_LABELS = {
  org: 'Organization Name',
  logo: 'Logo (URL)',
  image: 'Background Image (URL)',
  active: 'Visibility',
  order: 'Order',
  duration: 'Duration (ms)',
  position: 'Image Focus (object-position)',
  eyebrow: 'Eyebrow',
  title: 'Headline / Tagline',
  subtext: 'Subtext',
  cta1_text: 'Primary Button Text',
  cta1_link: 'Primary Button Link',
  cta2_text: 'Secondary Button Text',
  cta2_link: 'Secondary Button Link',
};

const SLIDE_FIELDS = [
  'org', 'logo', 'image', 'active', 'order', 'duration', 'position',
  'eyebrow', 'title', 'subtext', 'cta1_text', 'cta1_link', 'cta2_text', 'cta2_link',
];
const SLIDE_FIELD_RE = /^hero_slide[123]_(org|logo|image|active|order|duration|position|eyebrow|title|subtext|cta1_text|cta1_link|cta2_text|cta2_link)$/;

const HeroContent = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [slides, setSlides] = useState(SLIDE_DEFAULTS);
  const [previewSlide, setPreviewSlide] = useState(0);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('/api/admin/site-content/hero', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const slideKeys = {};
          for (const [key, value] of Object.entries(data)) {
            if (SLIDE_FIELD_RE.test(key)) {
              slideKeys[key.slice('hero_'.length)] = value;
            }
          }
          if (Object.keys(slideKeys).length > 0) {
            setSlides((prev) => ({ ...prev, ...slideKeys }));
          }
        }
      } catch { /* use defaults */ }
      setLoading(false);
    };
    fetchHero();
  }, []);

  const updateField = (field, value) => {
    setSlides((prev) => ({ ...prev, [field]: value }));
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
        body: JSON.stringify(slides),
      });
      if (res.ok) {
        clearCache('/api/site-content');
        setToast({ type: 'success', message: 'Hero carousel saved successfully' });
      } else {
        setToast({ type: 'error', message: 'Failed to save hero carousel' });
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
          <p className="text-gray-500 mt-1">Edit the hero carousel on your homepage</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  const preview = slides[`slide${previewSlide + 1}_title`]
    ? {
        org: slides[`slide${previewSlide + 1}_org`] || '',
        logo: slides[`slide${previewSlide + 1}_logo`] || '',
        image: slides[`slide${previewSlide + 1}_image`] || '',
        eyebrow: slides[`slide${previewSlide + 1}_eyebrow`] || '',
        title: slides[`slide${previewSlide + 1}_title`] || '',
        subtext: slides[`slide${previewSlide + 1}_subtext`] || '',
        cta1Text: slides[`slide${previewSlide + 1}_cta1_text`] || '',
        cta1Link: slides[`slide${previewSlide + 1}_cta1_link`] || '',
        cta2Text: slides[`slide${previewSlide + 1}_cta2_text`] || '',
        cta2Link: slides[`slide${previewSlide + 1}_cta2_link`] || '',
      }
    : null;

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
          <p className="text-gray-500 mt-1">Edit the 3-slide hero carousel on your homepage</p>
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
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Slide {n}</h2>
              {SLIDE_FIELDS.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{SLIDE_FIELD_LABELS[field]}</label>
                  {field === 'subtext' ? (
                    <textarea
                      value={slides[`slide${n}_${field}`] || ''}
                      onChange={(e) => updateField(`slide${n}_${field}`, e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  ) : field === 'active' ? (
                    <select
                      value={slides[`slide${n}_${field}`] !== '0' ? '1' : '0'}
                      onChange={(e) => updateField(`slide${n}_${field}`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="1">Visible</option>
                      <option value="0">Hidden</option>
                    </select>
                  ) : (
                    <input
                      type={field === 'order' || field === 'duration' ? 'number' : 'text'}
                      value={slides[`slide${n}_${field}`] || ''}
                      onChange={(e) => updateField(`slide${n}_${field}`, e.target.value)}
                      placeholder={field === 'cta2_link' ? 'Leave empty until the website exists' : field === 'position' ? 'center' : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  )}
                  {field === 'cta2_link' && (
                    <p className="text-xs text-gray-400 mt-1">While empty, the button shows as disabled (&quot;coming soon&quot;).</p>
                  )}
                  {field === 'duration' && (
                    <p className="text-xs text-gray-400 mt-1">Auto-advance time per slide in milliseconds (4000 = 4s).</p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Live Preview</h2>
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-teal-600 to-teal-800 min-h-[400px] flex items-center">
            {preview?.image && (
              <img src={preview.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B7F74]/95 via-emerald-900/70 to-emerald-900/15" />
            <div className="relative z-10 p-8 text-white max-w-lg">
              {preview && (
                <>
                  {preview.logo && (
                    <img src={preview.logo} alt="" className="h-9 w-auto mb-3" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  )}
                  <h3 className="text-2xl font-black tracking-tight mb-2">{preview.org || 'ORGANIZATION NAME'}</h3>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium mb-4 border border-white/10">
                    {preview.eyebrow}
                  </span>
                  <p className="text-xl font-extrabold mb-3 leading-tight">{preview.title || 'Your headline here'}</p>
                  <p className="text-teal-100 mb-6 text-sm leading-relaxed">{preview.subtext || 'Your subtext here'}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-6 py-2.5 bg-white text-teal-700 rounded-lg text-sm font-semibold">
                      {preview.cta1Text || 'Primary Button'}
                    </span>
                    <span className={`px-6 py-2.5 border-2 border-white text-white rounded-lg text-sm font-semibold ${preview.cta2Link ? '' : 'opacity-60'}`}>
                      {preview.cta2Text || 'Secondary Button'}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPreviewSlide(i)}
                  aria-label={`Preview slide ${i + 1}`}
                  className={`transition-all rounded-full ${i === previewSlide ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
