import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { clearCache } from '../utils/api'

const tabs = [
  { id: 'hero', label: 'Hero Section' },
  { id: 'homepage', label: 'Homepage' },
  { id: 'about', label: 'About Us' },
  { id: 'ecosystem', label: 'Ecosystem' },
  { id: 'partners', label: 'Partners' },
  { id: 'platforms', label: 'Platforms' },
  { id: 'services', label: 'Services Page' },
  { id: 'contact', label: 'Contact' },
  { id: 'footer', label: 'Footer' },
  { id: 'seo', label: 'SEO' },
]

const Field = ({ label, value, onChange, placeholder, textarea }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    {textarea ? (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    ) : (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    )}
  </div>
)

const ListField = ({ label, hint, value, onChange, itemFields, addLabel = 'Add row' }) => {
  let items = []
  try {
    const parsed = JSON.parse(value || '[]')
    if (Array.isArray(parsed)) items = parsed
  } catch {
    items = []
  }
  const update = (i, key, v) =>
    onChange(JSON.stringify(items.map((it, idx) => (idx === i ? { ...it, [key]: v } : it))))
  const add = () =>
    onChange(JSON.stringify([...items, Object.fromEntries(itemFields.map((f) => [f.key, '']))]))
  const remove = (i) => onChange(JSON.stringify(items.filter((_, idx) => idx !== i)))
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    const tmp = next[i]
    next[i] = next[j]
    next[j] = tmp
    onChange(JSON.stringify(next))
  }
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-3">{hint}</p>}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex flex-wrap gap-2 items-center bg-gray-50 rounded-lg p-2">
            {itemFields.map((f) => (
              <input
                key={f.key}
                type="text"
                value={item[f.key] ?? ''}
                onChange={(e) => update(i, f.key, e.target.value)}
                placeholder={f.label}
                className="flex-1 min-w-[140px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ))}
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} aria-label="Move up" className="px-2 py-1 text-gray-400 hover:text-gray-700">↑</button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Move down" className="px-2 py-1 text-gray-400 hover:text-gray-700">↓</button>
              <button type="button" onClick={() => remove(i)} aria-label="Remove row" className="px-2 py-1 text-red-400 hover:text-red-600">×</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-gray-400">No rows yet.</p>}
      </div>
      <button type="button" onClick={add} className="mt-3 text-sm text-primary font-semibold hover:underline">+ {addLabel}</button>
    </div>
  )
}

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
      if (!token) {
        toast.error('Not logged in')
        setLoading(false)
        return
      }
      const res = await fetch('/api/admin/site-content', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
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
      if (res.ok) {
        clearCache('/api/site-content')
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
      {[1, 2, 3].map((n) => (
        <div key={n} className="border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Slide {n}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
              <input
                type="text"
                value={content[`hero_slide${n}_org`] || ''}
                onChange={(e) => updateField(`hero_slide${n}_org`, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="BHH"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo (URL)</label>
              <input
                type="text"
                value={content[`hero_slide${n}_logo`] || ''}
                onChange={(e) => updateField(`hero_slide${n}_logo`, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="/hero/bhh-mark-white.png"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name Display</label>
            <select
              value={content[`hero_slide${n}_org_style`] || 'text'}
              onChange={(e) => updateField(`hero_slide${n}_org_style`, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="text">Big text (under logo mark)</option>
              <option value="logo">Inside logo lockup (name in logo)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Image (URL)</label>
            <input
              type="text"
              value={content[`hero_slide${n}_image`] || ''}
              onChange={(e) => updateField(`hero_slide${n}_image`, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="/hero/slide-1.jpg"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Active</label>
              <select
                value={content[`hero_slide${n}_active`] !== '0' ? '1' : '0'}
                onChange={(e) => updateField(`hero_slide${n}_active`, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="1">Visible</option>
                <option value="0">Hidden</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <input
                type="number"
                min="1"
                max="9"
                value={content[`hero_slide${n}_order`] || n}
                onChange={(e) => updateField(`hero_slide${n}_order`, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (ms)</label>
              <input
                type="number"
                min="1000"
                step="500"
                value={content[`hero_slide${n}_duration`] || '4000'}
                onChange={(e) => updateField(`hero_slide${n}_duration`, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image Focus</label>
              <input
                type="text"
                value={content[`hero_slide${n}_position`] || ''}
                onChange={(e) => updateField(`hero_slide${n}_position`, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="center"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Eyebrow</label>
            <input
              type="text"
              value={content[`hero_slide${n}_eyebrow`] || ''}
              onChange={(e) => updateField(`hero_slide${n}_eyebrow`, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Bodija Health Hub"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Headline / Tagline</label>
            <input
              type="text"
              value={content[`hero_slide${n}_title`] || ''}
              onChange={(e) => updateField(`hero_slide${n}_title`, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Wellness Starts Here."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtext</label>
            <textarea
              value={content[`hero_slide${n}_subtext`] || ''}
              onChange={(e) => updateField(`hero_slide${n}_subtext`, e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe this slide..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Text</label>
              <input
                type="text"
                value={content[`hero_slide${n}_cta1_text`] || ''}
                onChange={(e) => updateField(`hero_slide${n}_cta1_text`, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Book Appointment"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Link</label>
              <input
                type="text"
                value={content[`hero_slide${n}_cta1_link`] || ''}
                onChange={(e) => updateField(`hero_slide${n}_cta1_link`, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="/appointments"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Text</label>
              <input
                type="text"
                value={content[`hero_slide${n}_cta2_text`] || ''}
                onChange={(e) => updateField(`hero_slide${n}_cta2_text`, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Visit Website"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Link</label>
              <input
                type="text"
                value={content[`hero_slide${n}_cta2_link`] || ''}
                onChange={(e) => updateField(`hero_slide${n}_cta2_link`, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Leave empty until the website exists"
              />
              <p className="text-xs text-gray-400 mt-1">While empty, the button shows as disabled (&quot;coming soon&quot;).</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderHomepageTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Bar</h3>
        <Field label="Section Title" value={content.home_trust_title} onChange={(v) => updateField('home_trust_title', v)} placeholder="Our Existing Partner Network" />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">About Section</h3>
        <p className="text-xs text-gray-400 mb-4">Headline and description are edited in the &quot;About Us&quot; tab.</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Eyebrow Badge" value={content.home_about_eyebrow} onChange={(v) => updateField('home_about_eyebrow', v)} placeholder="Our Approach" />
          <Field label="Quote" value={content.home_about_quote} onChange={(v) => updateField('home_about_quote', v)} placeholder="Because care works best..." />
          <Field label="Primary Link Text" value={content.home_about_link1_text} onChange={(v) => updateField('home_about_link1_text', v)} placeholder="Learn About Our Ecosystem" />
          <Field label="Primary Link URL" value={content.home_about_link1_url} onChange={(v) => updateField('home_about_link1_url', v)} placeholder="/ecosystem" />
          <Field label="Secondary Link Text" value={content.home_about_link2_text} onChange={(v) => updateField('home_about_link2_text', v)} placeholder="Our Full Story" />
          <Field label="Secondary Link URL" value={content.home_about_link2_url} onChange={(v) => updateField('home_about_link2_url', v)} placeholder="/about" />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Values</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Eyebrow Badge" value={content.home_values_eyebrow} onChange={(v) => updateField('home_values_eyebrow', v)} placeholder="Core Values" />
          <Field label="Section Heading" value={content.home_values_title} onChange={(v) => updateField('home_values_title', v)} placeholder="Built on What Matters" />
        </div>
        <ListField
          label="Value Cards"
          hint="Each card shows a title and a short description. Icons follow the row order."
          value={content.home_values}
          onChange={(v) => updateField('home_values', v)}
          itemFields={[{ key: 'title', label: 'Title' }, { key: 'desc', label: 'Description' }]}
          addLabel="Add value"
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Stats</h3>
        <ListField
          label="Stat Items"
          hint="Value should be a number. Suffix is optional (e.g. +, %). Icons follow the row order."
          value={content.home_stats}
          onChange={(v) => updateField('home_stats', v)}
          itemFields={[{ key: 'value', label: 'Value' }, { key: 'suffix', label: 'Suffix' }, { key: 'label', label: 'Label' }]}
          addLabel="Add stat"
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Featured Services</h3>
        <p className="text-xs text-gray-400 mb-4">Section heading and description are edited in the &quot;Ecosystem&quot; tab.</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Eyebrow Badge" value={content.home_services_eyebrow} onChange={(v) => updateField('home_services_eyebrow', v)} placeholder="Our Services" />
          <Field label="Link Text" value={content.home_services_link_text} onChange={(v) => updateField('home_services_link_text', v)} placeholder="View All Services" />
          <Field label="Link URL" value={content.home_services_link_url} onChange={(v) => updateField('home_services_link_url', v)} placeholder="/services" />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ecosystem Cards</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Eyebrow Badge" value={content.home_eco_eyebrow} onChange={(v) => updateField('home_eco_eyebrow', v)} placeholder="The Ecosystem" />
          <Field label="Section Heading" value={content.home_eco_title} onChange={(v) => updateField('home_eco_title', v)} placeholder="The Ecosystem Behind the Care" />
        </div>
        <div className="mb-4">
          <Field label="Section Description" textarea value={content.home_eco_desc} onChange={(v) => updateField('home_eco_desc', v)} placeholder="Care does not exist in isolation..." />
        </div>
        <ListField
          label="Cards"
          hint="Description is optional — leave it empty for a title-only card. Colors and icons follow the row order."
          value={content.home_ecosystem_cards}
          onChange={(v) => updateField('home_ecosystem_cards', v)}
          itemFields={[{ key: 'title', label: 'Title' }, { key: 'desc', label: 'Description (optional)' }]}
          addLabel="Add card"
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Testimonials</h3>
        <Field label="Eyebrow Badge" value={content.home_testi_eyebrow} onChange={(v) => updateField('home_testi_eyebrow', v)} placeholder="What People Say" />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Programmes &amp; Events</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Programmes Eyebrow" value={content.home_programmes_eyebrow} onChange={(v) => updateField('home_programmes_eyebrow', v)} placeholder="Programmes" />
          <Field label="Programmes Heading" value={content.home_programmes_title} onChange={(v) => updateField('home_programmes_title', v)} placeholder="Health Programmes" />
          <Field label="Events Eyebrow" value={content.home_events_eyebrow} onChange={(v) => updateField('home_events_eyebrow', v)} placeholder="Events" />
          <Field label="Events Heading" value={content.home_events_title} onChange={(v) => updateField('home_events_title', v)} placeholder="Upcoming Events" />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Eyebrow Badge" value={content.home_blog_eyebrow} onChange={(v) => updateField('home_blog_eyebrow', v)} placeholder="Resources" />
          <Field label="Section Heading" value={content.home_blog_title} onChange={(v) => updateField('home_blog_title', v)} placeholder="Latest Insights" />
          <Field label="Link Text" value={content.home_blog_link_text} onChange={(v) => updateField('home_blog_link_text', v)} placeholder="View All" />
          <Field label="Link URL" value={content.home_blog_link_url} onChange={(v) => updateField('home_blog_link_url', v)} placeholder="/newsroom" />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Community CTA</h3>
        <p className="text-xs text-gray-400 mb-4">Headline and description are shared with the &quot;Contact&quot; tab.</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Headline" value={content.contact_headline} onChange={(v) => updateField('contact_headline', v)} placeholder="Ready to Be Part of Something Bigger?" />
          <Field label="Primary Button Text" value={content.home_cta_btn1_text} onChange={(v) => updateField('home_cta_btn1_text', v)} placeholder="Get Started" />
          <Field label="Primary Button URL" value={content.home_cta_btn1_url} onChange={(v) => updateField('home_cta_btn1_url', v)} placeholder="/contact" />
          <Field label="Secondary Button Text" value={content.home_cta_btn2_text} onChange={(v) => updateField('home_cta_btn2_text', v)} placeholder="Join the Ecosystem" />
          <Field label="Secondary Button URL" value={content.home_cta_btn2_url} onChange={(v) => updateField('home_cta_btn2_url', v)} placeholder="/partners" />
        </div>
        <div className="mt-4">
          <Field label="Description" textarea value={content.contact_description} onChange={(v) => updateField('contact_description', v)} placeholder="Whether you are a patient, a family..." />
        </div>
      </div>
    </div>
  )

  const renderServicesPageTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Hero</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Page Title" value={content.services_hero_title} onChange={(v) => updateField('services_hero_title', v)} placeholder="Our Services" />
          <Field label="Page Description" textarea value={content.services_hero_desc} onChange={(v) => updateField('services_hero_desc', v)} placeholder="Our network covers the full spectrum..." />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Service Finder</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Finder Title" value={content.services_finder_title} onChange={(v) => updateField('services_finder_title', v)} placeholder="Quick Service Finder" />
          <Field label="Finder Subtitle" value={content.services_finder_subtitle} onChange={(v) => updateField('services_finder_subtitle', v)} placeholder="Answer a quick question to find the right service" />
          <Field label="Step 1 Question" value={content.services_finder_q1} onChange={(v) => updateField('services_finder_q1', v)} placeholder="What do you need help with?" />
          <Field label="Step 2 Question" value={content.services_finder_q2} onChange={(v) => updateField('services_finder_q2', v)} placeholder="Who is this for?" />
        </div>
        <div className="mt-4 space-y-4">
          <ListField
            label="Concerns (Step 1)"
            hint="Each concern maps to a service category — the category must match a category in Services → Categories."
            value={content.services_finder_concerns}
            onChange={(v) => updateField('services_finder_concerns', v)}
            itemFields={[{ key: 'label', label: 'Concern' }, { key: 'category', label: 'Service category' }]}
            addLabel="Add concern"
          />
          <ListField
            label="Age Groups (Step 2)"
            hint="Filter is a comma-separated keyword list matched against services, or empty for all ages."
            value={content.services_finder_ages}
            onChange={(v) => updateField('services_finder_ages', v)}
            itemFields={[{ key: 'label', label: 'Age group' }, { key: 'filter', label: 'Filter keywords' }]}
            addLabel="Add age group"
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
      case 'homepage': return renderHomepageTab()
      case 'about': return renderAboutTab()
      case 'ecosystem': return renderEcosystemTab()
      case 'partners': return renderPartnersTab()
      case 'platforms': return renderPlatformsTab()
      case 'services': return renderServicesPageTab()
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
