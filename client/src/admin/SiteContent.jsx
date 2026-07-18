import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const tabs = [
  { id: 'hero', label: 'Hero Section' },
  { id: 'about', label: 'About Us' },
  { id: 'ecosystem', label: 'Ecosystem' },
  { id: 'partners', label: 'Partners' },
  { id: 'platforms', label: 'Platforms' },
  { id: 'contact', label: 'Contact' },
  { id: 'footer', label: 'Footer' },
  { id: 'seo', label: 'SEO' },
]

export default function SiteContent() {
  const [activeTab, setActiveTab] = useState('hero')
  const [content, setContent] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      console.log('Fetch attempt - token:', token ? 'exists' : 'MISSING')
      if (!token) {
        toast.error('Not logged in')
        setLoading(false)
        return
      }
      const res = await fetch('/api/admin/site-content', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      console.log('Fetch response:', res.status)
      if (res.ok) {
        const data = await res.json()
        console.log('Fetch data keys:', Object.keys(data))
        console.log('Fetch hero_headline:', data.hero_headline)
        setContent(data)
      } else {
        toast.error('Failed to load content: ' + res.status)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      toast.error('Failed to load content: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const token = localStorage.getItem('adminToken')
    console.log('=== SAVE DEBUG ===')
    console.log('Token:', token ? token.substring(0, 20) + '...' : 'MISSING')
    console.log('Content keys:', Object.keys(content))
    console.log('Content sample:', JSON.stringify(content).substring(0, 200))
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(content)
      })
      const responseText = await res.text()
      console.log('Response status:', res.status)
      console.log('Response body:', responseText.substring(0, 200))
      if (res.ok) {
        toast.success('Content saved successfully!')
      } else {
        toast.error('Failed to save: ' + responseText)
      }
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to save content: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (key, value) => {
    setContent(prev => ({ ...prev, [key]: value }))
  }

  const renderHeroTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
        <input
          type="text"
          value={content.hero_headline || ''}
          onChange={(e) => updateField('hero_headline', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Wellness Starts Here."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subtext</label>
        <textarea
          value={content.hero_subtext || ''}
          onChange={(e) => updateField('hero_subtext', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Describe your healthcare ecosystem..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button 1 Text</label>
          <input
            type="text"
            value={content.hero_cta1_text || ''}
            onChange={(e) => updateField('hero_cta1_text', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Explore the Ecosystem"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button 1 Link</label>
          <input
            type="text"
            value={content.hero_cta1_link || ''}
            onChange={(e) => updateField('hero_cta1_link', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="/ecosystem"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button 2 Text</label>
          <input
            type="text"
            value={content.hero_cta2_text || ''}
            onChange={(e) => updateField('hero_cta2_text', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Meet Our Partners"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button 2 Link</label>
          <input
            type="text"
            value={content.hero_cta2_link || ''}
            onChange={(e) => updateField('hero_cta2_link', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="/partners"
          />
        </div>
      </div>
    </div>
  )

  const renderAboutTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
        <input
          type="text"
          value={content.about_headline || ''}
          onChange={(e) => updateField('about_headline', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={content.about_description || ''}
          onChange={(e) => updateField('about_description', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mission</label>
        <textarea
          value={content.about_mission || ''}
          onChange={(e) => updateField('about_mission', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Vision</label>
        <textarea
          value={content.about_vision || ''}
          onChange={(e) => updateField('about_vision', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>
  )

  const renderEcosystemTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
        <input
          type="text"
          value={content.ecosystem_headline || ''}
          onChange={(e) => updateField('ecosystem_headline', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={content.ecosystem_description || ''}
          onChange={(e) => updateField('ecosystem_description', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>
  )

  const renderPartnersTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
        <input
          type="text"
          value={content.partners_headline || ''}
          onChange={(e) => updateField('partners_headline', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={content.partners_description || ''}
          onChange={(e) => updateField('partners_description', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>
  )

  const renderPlatformsTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
        <input
          type="text"
          value={content.platforms_headline || ''}
          onChange={(e) => updateField('platforms_headline', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={content.platforms_description || ''}
          onChange={(e) => updateField('platforms_description', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>
  )

  const renderContactTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
        <input type="text" value={content.contact_headline || ''} onChange={(e) => updateField('contact_headline', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea value={content.contact_description || ''} onChange={(e) => updateField('contact_description', e.target.value)} rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input type="tel" value={content.contact_phone || ''} onChange={(e) => updateField('contact_phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="+234 801 234 5678" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
          <input type="tel" value={content.contact_whatsapp || ''} onChange={(e) => updateField('contact_whatsapp', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="+234 801 234 5678" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input type="email" value={content.contact_email || ''} onChange={(e) => updateField('contact_email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="info@bodijahealthhub.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
          <input type="text" value={content.contact_hours || ''} onChange={(e) => updateField('contact_hours', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Mon-Fri: 8AM - 6PM" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <input type="text" value={content.contact_address || ''} onChange={(e) => updateField('contact_address', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Bodija, Ibadan, Oyo State, Nigeria" />
      </div>
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
            <input type="url" value={content.social_instagram || ''} onChange={(e) => updateField('social_instagram', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
            <input type="url" value={content.social_facebook || ''} onChange={(e) => updateField('social_facebook', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter/X URL</label>
            <input type="url" value={content.social_twitter || ''} onChange={(e) => updateField('social_twitter', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="https://twitter.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
            <input type="url" value={content.social_linkedin || ''} onChange={(e) => updateField('social_linkedin', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="https://linkedin.com/..." />
          </div>
        </div>
      </div>
    </div>
  )

  const renderFooterTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
        <input
          type="text"
          value={content.footer_tagline || ''}
          onChange={(e) => updateField('footer_tagline', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text</label>
        <input
          type="text"
          value={content.footer_copyright || ''}
          onChange={(e) => updateField('footer_copyright', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>
  )

  const renderSeoTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site Title</label>
        <input
          type="text"
          value={content.seo_title || ''}
          onChange={(e) => updateField('seo_title', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
        <textarea
          value={content.seo_description || ''}
          onChange={(e) => updateField('seo_description', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
        <input
          type="text"
          value={content.seo_keywords || ''}
          onChange={(e) => updateField('seo_keywords', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="healthcare, Ibadan, clinic, specialists"
        />
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'hero': return renderHeroTab()
      case 'about': return renderAboutTab()
      case 'ecosystem': return renderEcosystemTab()
      case 'partners': return renderPartnersTab()
      case 'platforms': return renderPlatformsTab()
      case 'contact': return renderContactTab()
      case 'footer': return renderFooterTab()
      case 'seo': return renderSeoTab()
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Site Content</h1>
        <p className="text-gray-500 mt-1">Edit all website content from one place</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
