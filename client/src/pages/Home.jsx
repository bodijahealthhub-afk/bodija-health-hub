import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiHeart, FiLink2, FiClock, FiArrowRight, FiActivity, FiZap,
  FiCheckCircle, FiUsers, FiCalendar, FiChevronRight, FiStar,
  FiShield, FiDatabase, FiTool, FiGlobe, FiSmile, FiArrowUpRight,
  FiBookOpen, FiTrendingUp, FiInbox, FiRefreshCw, FiSearch,
} from 'react-icons/fi'
import { useFeatures } from '../context/FeatureContext'
import WelcomeModal from '../components/WelcomeModal'
import ScrollReveal from '../components/ScrollReveal'
import AnimatedCounter from '../components/AnimatedCounter'
import BackendStatusBanner from '../components/BackendStatusBanner'
import { cachedFetch } from '../utils/api'
import { ServicesSkeleton, EventsSkeleton, BlogSkeletons, TestimonialsSkeleton } from '../components/SkeletonLoader'

const coreValues = [
  { icon: FiHeart, title: 'Accessible', desc: 'Quality care should never be out of reach.' },
  { icon: FiLink2, title: 'Connected', desc: 'Clinics, specialists, diagnostics, and digital tools \u2014 all working together.' },
  { icon: FiClock, title: 'Continuous', desc: 'Healthcare doesn\'t stop at a single visit. We support ongoing wellness.' },
]

const ecosystemCards = [
  { icon: FiHeart, title: 'Primary Care', desc: 'Foundation of your health journey with trusted general practitioners.', color: 'bg-rose-50 text-rose-600', border: 'border-rose-100' },
  { icon: FiZap, title: 'Specialist Consultations', desc: 'Expert referrals across cardiology, dermatology, and more.', color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
  { icon: FiDatabase, title: 'Diagnostics & Lab', desc: 'On-site laboratory and imaging for fast, accurate results.', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
  { icon: FiTool, title: 'Therapy & Rehab', desc: 'Physiotherapy, audiology, and rehabilitation services.', color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
  { icon: FiGlobe, title: 'Digital Health', desc: 'Telemedicine, health records, and wellness tracking tools.', color: 'bg-teal-50 text-teal-600', border: 'border-teal-100' },
  { icon: FiUsers, title: 'Community Programmes', desc: 'Screenings, education, and wellness initiatives for all ages.', color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
]

const impactStats = [
  { value: 5000, suffix: '+', label: 'Patients Served', icon: FiSmile },
  { value: 15, suffix: '+', label: 'Partner Organisations', icon: FiLink2 },
  { value: 20, suffix: '+', label: 'Health Services', icon: FiTool },
  { value: 3, suffix: '+', label: 'Years of Care', icon: FiCalendar },
]

const serviceIcons = {
  'primary-care': FiActivity, 'specialist-consultations': FiZap,
  'diagnostics-laboratory': FiCheckCircle, 'hearing-audiology': FiUsers,
  'physiotherapy': FiActivity, 'chronic-disease-management': FiZap,
  'elder-care': FiCheckCircle, 'digital-health-solutions': FiUsers,
  default: FiActivity,
}

function resolveServiceIcon(s) {
  if (s && typeof s.icon === 'string' && serviceIcons[s.icon]) return serviceIcons[s.icon]
  const name = (s?.name || '').toLowerCase().replace(/\s+/g, '-')
  return serviceIcons[name] || serviceIcons.default
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-12">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export default function Home() {
  const { isEnabled } = useFeatures()
  const [content, setContent] = useState({
    hero_headline: 'Wellness Starts Here.',
    hero_subtext: 'Bodija Health Hub is a community-based integrated healthcare ecosystem bringing clinics, specialists, and quality digital solutions together \u2014 making accessible, connected, and continuous care a reality for every family in Ibadan.',
    hero_cta1_text: 'Explore the Ecosystem',
    hero_cta1_link: '/ecosystem',
    hero_cta2_text: 'Meet Our Partners',
    hero_cta2_link: '/partners',
    about_headline: 'A Healthcare Ecosystem, Not Just a Clinic',
    about_description: 'Bodija Health Hub is an integrated healthcare network designed to ensure patients receive coordinated, comprehensive care at every stage of their health journey.',
    ecosystem_headline: 'One Hub. Many Hands. Whole-Person Care.',
    ecosystem_description: 'Health doesn\'t exist in isolation \u2014 and neither should care. Our ecosystem brings together trusted partners across multiple disciplines to support every aspect of your well-being.',
    contact_whatsapp: '',
    contact_phone: '',
  })
  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [blogPosts, setBlogPosts] = useState([])
  const [blogLoading, setBlogLoading] = useState(true)
  const [programmes, setProgrammes] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [testimonialsLoading, setTestimonialsLoading] = useState(true)

  useEffect(() => {
    cachedFetch('/api/site-content')
      .then(d => { if (d) setContent(prev => ({ ...prev, ...d })) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    cachedFetch('/api/services')
      .then(d => { if (Array.isArray(d)) setServices(d) })
      .catch(() => {})
      .finally(() => setServicesLoading(false))
  }, [])

  useEffect(() => {
    if (!isEnabled('events')) { setEventsLoading(false); return }
    cachedFetch('/api/events')
      .then(d => { if (Array.isArray(d)) setEvents(d.slice(0, 3)) })
      .catch(() => {})
      .finally(() => setEventsLoading(false))
  }, [isEnabled])

  useEffect(() => {
    if (!isEnabled('blog')) { setBlogLoading(false); return }
    cachedFetch('/api/blog?limit=3')
      .then(d => { if (d?.posts) setBlogPosts(d.posts.slice(0, 3)) })
      .catch(() => {})
      .finally(() => setBlogLoading(false))
  }, [isEnabled])

  useEffect(() => {
    if (!isEnabled('programme_registration')) return
    cachedFetch('/api/programmes')
      .then(d => { if (Array.isArray(d)) setProgrammes(d.slice(0, 3)) })
      .catch(() => {})
  }, [isEnabled])

  useEffect(() => {
    cachedFetch('/api/testimonials')
      .then(d => { if (Array.isArray(d)) setTestimonials(d.slice(0, 3)) })
      .catch(() => {})
      .finally(() => setTestimonialsLoading(false))
  }, [])

  return (
    <div className="overflow-hidden">
      <BackendStatusBanner />

      {/* Hero */}
      {isEnabled('home_hero') && (
        <section className="relative min-h-[92vh] flex items-center bg-gradient-to-br from-primary via-teal-700 to-emerald-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.06]" />
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-emerald-500/[0.08] rounded-full blur-3xl" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40 w-full">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/10">
                <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                Bodija Health Hub
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
                {(content.hero_headline || '').split(' ').map((word, i) => (
                  <span key={i} className="inline-block hero-word" style={{ animationDelay: `${0.3 + i * 0.12}s` }}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed mb-10 max-w-2xl">
                {content.hero_subtext}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={content.hero_cta1_link || '/ecosystem'} className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-all duration-200 shadow-lg shadow-black/10">
                  {content.hero_cta1_text}
                  <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to={content.hero_cta2_link || '/partners'} className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200">
                  {content.hero_cta2_text}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trust Bar */}
      <ScrollReveal>
        <section className="py-6 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Trusted by leading healthcare partners</p>
            <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap opacity-50">
              {[FiHeart, FiShield, FiActivity, FiStar, FiCheckCircle, FiUsers].map((Icon, i) => (
                <Icon key={i} className="w-7 h-7 text-gray-400" />
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* About */}
      {isEnabled('ecosystem_section') && (
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <ScrollReveal>
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">Our Approach</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {content.about_headline || 'A Healthcare Ecosystem, Not Just a Clinic'}
                </h2>
                <p className="text-gray-500 leading-relaxed mb-4 text-lg">
                  {content.about_description || 'Bodija Health Hub is an integrated healthcare network designed to ensure patients receive coordinated, comprehensive care at every stage of their health journey.'}
                </p>
                <p className="text-gray-500 leading-relaxed mb-8">
                  By connecting primary care, specialist consultations, diagnostics, therapy, and digital health solutions under one umbrella, we eliminate the gaps that often leave families navigating the healthcare system alone.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/ecosystem" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                    Learn About Our Ecosystem <FiChevronRight className="w-4 h-4" />
                  </Link>
                  <Link to="/about" className="inline-flex items-center gap-2 text-gray-500 font-medium hover:text-primary transition-colors">
                    Our Full Story <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <div className="bg-gradient-to-br from-primary/5 via-emerald-50/50 to-teal-50/30 rounded-3xl p-10 border border-primary/10">
                  <blockquote className="text-xl sm:text-2xl font-medium text-gray-900 leading-relaxed italic">
                    &ldquo;Because care works best when people and systems work together.&rdquo;
                  </blockquote>
                  <div className="mt-6 w-12 h-1 bg-primary rounded-full" />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      )}

      {/* Core Values */}
      {isEnabled('ecosystem_section') && (
        <section className="py-20 bg-warm-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-14">
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">Core Values</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Built on What Matters</h2>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-8">
              {coreValues.map(({ icon: Icon, title, desc }, i) => (
                <ScrollReveal key={title} delay={i * 100}>
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center h-full">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                    <p className="text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Impact Stats */}
      <ScrollReveal>
        <section className="py-16 bg-gradient-to-r from-primary to-emerald-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {impactStats.map(({ value, suffix, label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center">
                  <Icon className="w-6 h-6 text-white/60 mb-2" />
                  <div className="text-3xl sm:text-4xl font-bold mb-1">
                    <AnimatedCounter target={value} suffix={suffix} />
                  </div>
                  <div className="text-sm text-white/70 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Featured Services */}
      {isEnabled('services') && (
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-14">
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">Our Services</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{content.ecosystem_headline || 'One Hub. Many Hands. Whole-Person Care.'}</h2>
                <p className="text-gray-500 max-w-3xl mx-auto">{content.ecosystem_description}</p>
              </div>
            </ScrollReveal>
            {servicesLoading ? (
              <ServicesSkeleton />
            ) : services.length === 0 ? (
              <EmptyState
                icon={FiInbox}
                title="No services available yet"
                description="Our service catalogue is being prepared. Check back soon or explore our ecosystem."
                action={<Link to="/ecosystem" className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline">Explore Ecosystem <FiArrowRight className="w-4 h-4" /></Link>}
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.slice(0, 8).map((service, i) => {
                  const Icon = resolveServiceIcon(service)
                  return (
                    <ScrollReveal key={service.id || service.name} delay={i * 80}>
                      <div className="group bg-warm-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                          <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{service.shortDescription || service.short_description || service.description}</p>
                      </div>
                    </ScrollReveal>
                  )
                })}
              </div>
            )}
            {services.length > 0 && (
              <ScrollReveal>
                <div className="text-center mt-10">
                  <Link to="/services" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                    View All Services <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>
            )}
          </div>
        </section>
      )}

      {/* Ecosystem Cards */}
      {isEnabled('ecosystem_section') && (
        <section className="py-20 bg-warm-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-14">
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">The Ecosystem</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How We Work Together</h2>
                <p className="text-gray-500 max-w-3xl mx-auto">Every part of our ecosystem is designed to connect seamlessly with the others.</p>
              </div>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ecosystemCards.map(({ icon: Icon, title, desc, color, border }, i) => (
                <ScrollReveal key={title} delay={i * 80}>
                  <div className={`bg-white rounded-2xl p-7 border ${border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full`}>
                    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">What People Say</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Trusted by Our Community</h2>
            </div>
          </ScrollReveal>
          {testimonialsLoading ? (
            <TestimonialsSkeleton />
          ) : testimonials.length === 0 ? (
            <EmptyState
              icon={FiStar}
              title="No testimonials yet"
              description="Patient stories will appear here as our community grows."
            />
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <ScrollReveal key={t.id} delay={i * 100}>
                  <div className="bg-warm-white rounded-2xl p-8 border border-gray-100 h-full flex flex-col">
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating || 5)].map((_, j) => (
                        <FiStar key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 leading-relaxed italic flex-1">&ldquo;{t.content}&rdquo;</p>
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <p className="font-semibold text-gray-900 text-sm">{t.name || t.patient_name}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Programmes & Events */}
      {(isEnabled('programme_registration') || isEnabled('events')) && (
        <section className="py-20 bg-warm-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Programmes */}
              {isEnabled('programme_registration') && (
                <div>
                  <ScrollReveal>
                    <div className="mb-8">
                      <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">Programmes</span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Health Programmes</h2>
                    </div>
                  </ScrollReveal>
                  {programmes.length === 0 ? (
                    <EmptyState
                      icon={FiTrendingUp}
                      title="No programmes running"
                      description="New health programmes are on the way. Stay tuned."
                    />
                  ) : (
                    <div className="space-y-4">
                      {programmes.map((p, i) => (
                        <ScrollReveal key={p.id} delay={i * 100}>
                          <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                              <FiTrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">{p.title}</h3>
                              <p className="text-xs text-gray-500">{p.schedule || p.category}</p>
                            </div>
                            <Link to="/programmes" className="text-primary shrink-0">
                              <FiChevronRight className="w-5 h-5" />
                            </Link>
                          </div>
                        </ScrollReveal>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Events */}
              {isEnabled('events') && (
                <div>
                  <ScrollReveal>
                    <div className="mb-8">
                      <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">Events</span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Upcoming Events</h2>
                    </div>
                  </ScrollReveal>
                  {eventsLoading ? (
                    <EventsSkeleton />
                  ) : events.length === 0 ? (
                    <EmptyState
                      icon={FiCalendar}
                      title="No upcoming events"
                      description="Check back soon for health screenings, outreaches, and community events."
                      action={<Link to="/events" className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline">View All Events <FiArrowRight className="w-4 h-4" /></Link>}
                    />
                  ) : (
                    <div className="space-y-4">
                      {events.map((e, i) => (
                        <ScrollReveal key={e.id} delay={i * 100}>
                          <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                              <FiCalendar className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">{e.title}</h3>
                              <p className="text-xs text-gray-500">{e.date}{e.location ? ` - ${e.location}` : ''}</p>
                            </div>
                            <Link to="/events" className="text-primary shrink-0">
                              <FiChevronRight className="w-5 h-5" />
                            </Link>
                          </div>
                        </ScrollReveal>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Resources Preview */}
      {isEnabled('blog') && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">Resources</span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Latest Insights</h2>
                </div>
                {blogPosts.length > 0 && (
                  <Link to="/newsroom" className="hidden sm:inline-flex items-center gap-2 text-primary font-semibold hover:underline text-sm">
                    View All <FiArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </ScrollReveal>
            {blogLoading ? (
              <BlogSkeletons />
            ) : blogPosts.length === 0 ? (
              <EmptyState
                icon={FiBookOpen}
                title="No resources published yet"
                description="Health articles and guides will be available soon."
                action={<Link to="/newsroom" className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline">Visit Newsroom <FiArrowRight className="w-4 h-4" /></Link>}
              />
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {blogPosts.map((post, i) => (
                  <ScrollReveal key={post.id} delay={i * 100}>
                    <Link to={`/newsroom/${post.slug}`} className="group block bg-warm-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 h-full">
                      {post.featured_image && (
                        <div className="aspect-[16/10] bg-gray-200 overflow-hidden">
                          <img src={post.featured_image} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-6">
                        {post.category && <span className="text-xs font-semibold text-primary uppercase tracking-wide">{post.category}</span>}
                        <h3 className="font-semibold text-gray-900 mt-2 mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                        <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-4 group-hover:gap-2 transition-all">
                          Read more <FiArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}
            {blogPosts.length > 0 && (
              <div className="sm:hidden text-center mt-8">
                <Link to="/newsroom" className="inline-flex items-center gap-2 text-primary font-semibold">View All <FiArrowRight className="w-4 h-4" /></Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Community CTA */}
      {isEnabled('cta_section') && (
        <section className="py-20 bg-warm-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="bg-gradient-to-br from-primary to-teal-700 rounded-3xl p-10 sm:p-16 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
                <div className="relative">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Be Part of Something Bigger?</h2>
                  <p className="text-teal-100 text-lg mb-10 max-w-2xl mx-auto">
                    Whether you are a patient, a healthcare provider, or a community partner \u2014 there is a place for you in the Bodija Health Hub ecosystem.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link to="/contact" className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-colors shadow-lg">
                      Get Started <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link to="/ecosystem" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      <WelcomeModal />
    </div>
  )
}
