import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiSearch, FiArrowLeft } from 'react-icons/fi'
import { ServicesSkeleton } from '../components/SkeletonLoader'
import ScrollReveal from '../components/ScrollReveal'

const CONCERNS = [
  { label: 'General health check', category: 'Primary Care' },
  { label: 'Pain or discomfort', category: 'Specialist' },
  { label: 'Mental health', category: 'Therapy & Counseling' },
  { label: 'Child health', category: 'Pediatrics' },
  { label: 'Women\'s health', category: 'Gynecology' },
  { label: 'Lab test or scan', category: 'Diagnostics & Lab' },
  { label: 'Physiotherapy or rehab', category: 'Therapy & Rehab' },
  { label: 'Vaccination', category: 'Primary Care' },
]

const AGE_GROUPS = [
  { label: 'Infant or toddler (0–3)', filter: 'pediatric,child' },
  { label: 'Child (4–12)', filter: 'pediatric,child' },
  { label: 'Teenager (13–17)', filter: 'teen,adolescent' },
  { label: 'Adult (18–64)', filter: '' },
  { label: 'Senior (65+)', filter: 'geriatric,elderly,senior' },
]

function ServiceWizard({ onSelect }) {
  const [step, setStep] = useState(0)
  const [concern, setConcern] = useState(null)
  const [ageGroup, setAgeGroup] = useState(null)

  const handleComplete = (age) => {
    setAgeGroup(age)
    onSelect({ concern, ageGroup: age })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <span className="text-xl">🩺</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Quick Service Finder</h3>
          <p className="text-sm text-gray-500">Answer a quick question to find the right service</p>
        </div>
      </div>

      {step === 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-3">What do you need help with?</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {CONCERNS.map((c) => (
              <button
                key={c.label}
                onClick={() => { setConcern(c); setStep(1) }}
                className={`text-left px-4 py-3 rounded-xl border transition-all hover:border-primary hover:bg-primary/5 ${
                  concern?.label === c.label ? 'border-primary bg-primary/5' : 'border-gray-100'
                }`}
              >
                <span className="text-sm font-medium text-gray-900">{c.label}</span>
                <span className="text-xs text-gray-500 block">{c.category}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setStep(0)} className="text-gray-400 hover:text-gray-600">
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <p className="text-sm font-medium text-gray-700">Who is this for?</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {AGE_GROUPS.map((a) => (
              <button
                key={a.label}
                onClick={() => handleComplete(a)}
                className="text-left px-4 py-3 rounded-xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="text-sm font-medium text-gray-900">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Services() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [wizardHint, setWizardHint] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [svcRes, catRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/service-categories'),
        ])
        if (svcRes.ok) {
          const data = await svcRes.json()
          if (Array.isArray(data)) setServices(data)
        }
        if (catRes.ok) {
          const cats = await catRes.json()
          if (Array.isArray(cats)) setCategories(cats)
        }
      } catch {
        // leave empty states
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleWizardSelect = ({ concern }) => {
    if (concern) {
      setActiveCategory(concern.category)
      setWizardHint(concern.label)
    }
  }

  const filtered = services
    .filter((s) => {
      if (activeCategory && s.category !== activeCategory) return false
      if (query) {
        const q = query.toLowerCase()
        return (
          s.name.toLowerCase().includes(q) ||
          (s.short_description || s.description || '').toLowerCase().includes(q) ||
          (s.category || '').toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (a.display_order ?? a.displayOrder ?? 0) - (b.display_order ?? b.displayOrder ?? 0))

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">Our Services</span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Care for Every Stage of Your Health Journey</h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              From everyday consultations to specialized care, our services are delivered by trusted providers across the Bodija Health Hub ecosystem.
            </p>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ServiceWizard onSelect={handleWizardSelect} />

          {/* Category filter */}
          {(categories.length > 0 || query) && (
            <div className="mb-10 space-y-4">
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveCategory('')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === '' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCategory(activeCategory === c.name ? '' : c.name)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === c.name ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {c.icon ? `${c.icon} ` : ''}{c.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="relative max-w-md">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search services..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>
          )}
          {(activeCategory || query) && (
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-gray-500">Showing {filtered.length} of {services.length} services</p>
              <button
                onClick={() => { setActiveCategory(''); setQuery('') }}
                className="text-sm text-primary font-medium hover:underline"
              >Clear filters</button>
            </div>
          )}

          {loading ? (
            <ServicesSkeleton />
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No services found</h3>
              <p className="text-gray-500 mb-8">
                {query || activeCategory
                  ? 'Try adjusting your search or filters.'
                  : 'Our service catalog is being updated. Please check back soon.'}
              </p>
              <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
                Contact Us <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((service, i) => (
                <ScrollReveal key={service.id} delay={i * 80}>
                <Link
                  key={service.id}
                  to={`/services/${service.slug || service.id}`}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="text-2xl">{service.icon || '🩺'}</span>
                    </div>
                    {service.featured && (
                      <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">★ Featured</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  {service.category && (
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full w-fit mb-3">
                      {service.category}
                    </span>
                  )}
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-1">
                    {service.short_description || service.description || 'Comprehensive healthcare service provided by our trusted partners.'}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {service.price ? (
                      <span className="text-lg font-bold text-primary">₦{Number(service.price).toLocaleString()}</span>
                    ) : (
                      <span className="text-sm font-medium text-primary">Pricing on request</span>
                    )}
                    <span className="text-sm font-medium text-primary group-hover:underline">Learn more →</span>
                  </div>
                </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
