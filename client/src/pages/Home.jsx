import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  FiHeart, FiLink2, FiClock, FiArrowRight, FiActivity, FiZap,
  FiCheckCircle, FiUsers, FiCalendar, FiChevronRight, FiChevronLeft, FiStar,
  FiShield, FiDatabase, FiTool, FiGlobe, FiArrowUpRight,
  FiBookOpen, FiTrendingUp, FiInbox, FiRefreshCw, FiSearch,
} from 'react-icons/fi'
import { useFeatures } from '../context/FeatureContext'
import WelcomeModal from '../components/WelcomeModal'
import ScrollReveal from '../components/ScrollReveal'
import AnimatedCounter from '../components/AnimatedCounter'
import BackendStatusBanner from '../components/BackendStatusBanner'
import PageSections from '../components/PageSections'
import { cachedFetch } from '../utils/api'
import { ServicesSkeleton, EventsSkeleton, BlogSkeletons, TestimonialsSkeleton } from '../components/SkeletonLoader'

const coreValues = [
  { icon: FiHeart, title: 'Accessible', desc: 'Quality care reachable for every family.' },
  { icon: FiLink2, title: 'Connected', desc: 'Specialists, diagnostics, and services linked under one system.' },
  { icon: FiClock, title: 'Continuous', desc: 'Support at every stage of life, from newborns to elders.' },
]

const ecosystemCards = [
  { icon: FiHeart, title: 'Primary Care', color: 'bg-rose-50 text-rose-600', border: 'border-rose-100' },
  { icon: FiZap, title: 'Specialist care and referrals', color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
  { icon: FiDatabase, title: 'Diagnostics and laboratory services', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
  { icon: FiTool, title: 'Audiology', color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
  { icon: FiActivity, title: 'Physiotherapy, speech therapy, and behavioral therapy', color: 'bg-teal-50 text-teal-600', border: 'border-teal-100' },
  { icon: FiShield, title: 'Chronic condition management', color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
  { icon: FiClock, title: 'Long-term wellness and elder care support', color: 'bg-rose-50 text-rose-600', border: 'border-rose-100' },
  { icon: FiGlobe, title: 'Digital Solutions', color: 'bg-teal-50 text-teal-600', border: 'border-teal-100' },
]

const impactStats = [
  { value: 8, suffix: '', label: 'Our Services', icon: FiTool },
  { value: 4, suffix: '', label: 'Our Partners', icon: FiLink2 },
  { value: 3, suffix: '', label: 'Our Platforms', icon: FiGlobe },
  { value: 3, suffix: '', label: 'Core Values', icon: FiHeart },
]

function parseList(raw, fallback) {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? parsed : fallback
  } catch {
    return fallback
  }
}

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
    hero_slide1_eyebrow: '',
    hero_slide1_title: 'Wellness Starts Here.',
    hero_slide1_subtext: 'A community-based integrated healthcare ecosystem — bringing clinics, specialists, and quality digital solutions together for every family in Ibadan.',
    hero_slide1_cta1_text: 'Explore Ecosystem',
    hero_slide1_cta1_link: '/ecosystem',
    hero_slide1_cta2_text: 'Our Services',
    hero_slide1_cta2_link: '/services',
    hero_slide2_eyebrow: 'Bodija Health Hub presents',
    hero_slide2_title: 'Restoring Function. Rebuilding Lives.',
    hero_slide2_subtext: "Recovery is not just physical — it is personal. BACR is Ibadan's dedicated rehabilitation centre, designed to support individuals on every step of their journey back to independence, strength, and quality of life.",
    hero_slide2_cta1_text: 'Book Appointment',
    hero_slide2_cta1_link: '/appointments',
    hero_slide2_cta2_text: 'Visit Website',
    hero_slide2_cta2_link: '',
    hero_slide3_eyebrow: '',
    hero_slide3_title: 'Every Step Forward Matters.',
    hero_slide3_subtext: 'From physiotherapy and speech therapy to occupational and behavioral support — our specialist-led programmes are built to restore what matters most: your movement, your voice, your independence.',
    hero_slide3_cta1_text: 'Book Appointment',
    hero_slide3_cta1_link: '/appointments',
    hero_slide3_cta2_text: 'Visit Website',
    hero_slide3_cta2_link: '',
    hero_slide1_org: 'BHH',
    hero_slide1_logo: '/hero/bhh-lockup-white.png',
    hero_slide1_image: '/hero/slide-1.jpg',
    hero_slide1_active: '1',
    hero_slide1_order: '3',
    hero_slide1_org_style: 'logo',
    hero_slide1_duration: '4000',
    hero_slide1_position: '68% 45%',
    hero_slide2_org: 'BACR',
    hero_slide2_logo: '/hero/bacr-mark-white.png',
    hero_slide2_image: '/hero/slide-2.jpg',
    hero_slide2_active: '1',
    hero_slide2_order: '1',
    hero_slide2_org_style: 'logo',
    hero_slide2_duration: '7000',
    hero_slide2_position: '65% 50%',
    hero_slide3_org: 'BACR',
    hero_slide3_logo: '/hero/bacr-mark-white.png',
    hero_slide3_image: '/hero/slide-3.jpg',
    hero_slide3_active: '1',
    hero_slide3_order: '2',
    hero_slide3_org_style: 'logo',
    hero_slide3_duration: '4000',
    hero_slide3_position: '58% 45%',
    about_headline: 'More Than a Service. A Connected Health Ecosystem.',
    about_description: 'We are an integrated healthcare network redefining how families in Ibadan access and experience care. By coordinating clinics, specialists, wellness services, and digital platforms under one hub, we close the gaps that typically fall between separate healthcare providers — ensuring seamless, continuous support from prevention to recovery.',
    ecosystem_headline: 'One Hub. Many Hands. Whole-Person Care.',
    ecosystem_description: 'Care does not exist in isolation. At Bodija Health Hub, we have built a living ecosystem where every partner, platform, and service works together as one coordinated system designed around you.',
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
  const [heroSlide, setHeroSlide] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)
  const [heroTimerKey, setHeroTimerKey] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [failedAssets, setFailedAssets] = useState({})
  const [imagesReady, setImagesReady] = useState(false)
  const touchStartX = useRef(null)

  const allHeroSlides = [1, 2, 3].map(n => ({
    org: content[`hero_slide${n}_org`] || '',
    orgStyle: content[`hero_slide${n}_org_style`] || 'text',
    logo: content[`hero_slide${n}_logo`] || '',
    image: content[`hero_slide${n}_image`] || '',
    position: content[`hero_slide${n}_position`] || 'center',
    eyebrow: content[`hero_slide${n}_eyebrow`] || '',
    title: content[`hero_slide${n}_title`] || '',
    subtext: content[`hero_slide${n}_subtext`] || '',
    cta1Text: content[`hero_slide${n}_cta1_text`] || 'Book Appointment',
    cta1Link: content[`hero_slide${n}_cta1_link`] || '/appointments',
    cta2Text: content[`hero_slide${n}_cta2_text`] || 'Visit Website',
    cta2Link: content[`hero_slide${n}_cta2_link`] || '',
    duration: parseInt(content[`hero_slide${n}_duration`], 10) || 4000,
    active: content[`hero_slide${n}_active`] !== '0',
    order: parseInt(content[`hero_slide${n}_order`], 10) || n,
  }))
  const activeSlides = allHeroSlides
    .filter(s => s.active)
    .sort((a, b) => a.order - b.order)
  const heroSlides = activeSlides.length ? activeSlides : allHeroSlides
  const heroCount = heroSlides.length
  const heroIndex = heroSlide % heroCount
  const activeHeroSlide = heroSlides[heroIndex]
  const slideDuration = activeHeroSlide?.duration || 4000

  useEffect(() => {
    if (!window.matchMedia) return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e) => setReducedMotion(e.matches)
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    }
    mq.addListener(onChange)
    return () => mq.removeListener(onChange)
  }, [])

  useEffect(() => {
    const id = setTimeout(() => setImagesReady(true), 0)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (heroPaused || reducedMotion) return undefined
    const id = setInterval(() => setHeroSlide(s => (s + 1) % heroCount), slideDuration)
    return () => clearInterval(id)
  }, [heroPaused, reducedMotion, heroTimerKey, heroCount, slideDuration])

  const goToHeroSlide = (i) => {
    setHeroSlide(i)
    setHeroTimerKey(k => k + 1)
  }
  const heroNext = () => goToHeroSlide((heroIndex + 1) % heroCount)
  const heroPrev = () => goToHeroSlide((heroIndex - 1 + heroCount) % heroCount)
  const markAssetFailed = (url) => setFailedAssets(prev => ({ ...prev, [url]: true }))

  useEffect(() => {
    cachedFetch('/api/site-content', { useCache: false })
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

      {/* Hero Carousel */}
      {isEnabled('home_hero') && (
        <section
          className="relative min-h-[70vh] md:min-h-[75vh] md:max-h-[880px] flex items-center bg-gradient-to-br from-primary via-teal-700 to-emerald-800 text-white overflow-hidden"
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
          onFocus={() => setHeroPaused(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHeroPaused(false) }}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            touchStartX.current = null
            if (Math.abs(dx) > 50) { if (dx < 0) heroNext(); else heroPrev() }
          }}
          aria-label="Hero carousel"
          aria-roledescription="carousel"
        >
          {heroSlides[0]?.image && !failedAssets[heroSlides[0].image] && (
            <link rel="preload" as="image" href={heroSlides[0].image} />
          )}
          <div className="absolute inset-0">
            {imagesReady && heroSlides.map((s, i) => (
              s.image && !failedAssets[s.image] ? (
                <img
                  key={`${i}-${s.image}`}
                  src={s.image}
                  alt=""
                  aria-hidden="true"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-[800ms] ease-out ${i === heroIndex ? 'opacity-100' : 'opacity-0'} ${reducedMotion ? '' : (i === heroIndex ? 'scale-100' : 'scale-105')}`}
                  style={{ objectPosition: s.position }}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  onError={() => markAssetFailed(s.image)}
                />
              ) : null
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B7F74]/95 via-emerald-900/70 to-emerald-900/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.06]" />
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-14 md:pb-20">
            <div className="relative min-h-[540px] sm:min-h-[520px] md:min-h-[520px] max-w-3xl">
              {heroSlides.map((s, i) => {
                const active = i === heroIndex
                const rise = reducedMotion ? '' : 'translate-y-0'
                const sink = reducedMotion ? '' : 'translate-y-3'
                const layerCls = active
                  ? `opacity-100 ${rise} pointer-events-auto`
                  : `opacity-0 ${sink} pointer-events-none`
                const el = (delay) => `transition-all duration-700 ${active ? `opacity-100 ${rise} ${delay}` : `opacity-0 ${sink}`}`
                return (
                  <div
                    key={i}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`Slide ${i + 1} of ${heroCount}`}
                    aria-hidden={!active}
                    className={`absolute inset-0 transition-all duration-700 ${layerCls}`}
                  >
                    {s.eyebrow && (
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/10 mb-5 ${el('delay-100')}`}>
                        <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                        {s.eyebrow}
                      </span>
                    )}
                    {s.orgStyle === 'logo' && s.logo && !failedAssets[s.logo] ? (
                      <h1 className={`mb-6 ${el('')}`}>
                        <img
                          src={s.logo}
                          alt={s.org}
                          className="block h-40 sm:h-52 md:h-56 w-auto"
                          onError={() => markAssetFailed(s.logo)}
                        />
                      </h1>
                    ) : (
                      <>
                        {s.logo && !failedAssets[s.logo] && (
                          <img
                            src={s.logo}
                            alt=""
                            aria-hidden="true"
                            className={`block h-9 md:h-11 w-auto mb-4 ${el('')}`}
                            onError={() => markAssetFailed(s.logo)}
                          />
                        )}
                        {s.org && (
                          <h1 className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[1.05] mb-4 ${el('')}`}>
                            {s.org}
                          </h1>
                        )}
                      </>
                    )}
                    <h2 key={`${i}-${active}`} className={`block text-xl sm:text-2xl lg:text-3xl font-extrabold leading-[1.2] mb-5 ${el('delay-200')}`}>
                      {(s.title || '').split(' ').map((word, w) => (
                        <span key={w} className="inline-block hero-word" style={{ animationDelay: `${0.3 + w * 0.12}s` }}>{`${word} `}</span>
                      ))}
                    </h2>
                    <p className={`text-base sm:text-lg text-white/85 leading-relaxed mb-8 max-w-2xl ${el('delay-300')}`}>
                      {s.subtext}
                    </p>
                    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${el('delay-400')}`}>
                      <Link to={s.cta1Link} className="group inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-all duration-200 shadow-lg shadow-black/10">
                        {s.cta1Text}
                        <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                      {s.cta2Link ? (
                        <Link to={s.cta2Link} className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200">
                          {s.cta2Text}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          title="Website coming soon"
                          aria-disabled="true"
                          className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 opacity-60 cursor-not-allowed"
                        >
                          {s.cta2Text}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-8 flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={heroPrev}
                aria-label="Previous slide"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
              >
                <FiChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <div className="flex items-center gap-3 sm:gap-4">
                {heroSlides.map((s, i) => {
                  const active = i === heroIndex
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goToHeroSlide(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      aria-current={active ? 'true' : undefined}
                      className="group flex items-center gap-2"
                    >
                      <span className={`text-[11px] font-semibold tabular-nums transition-colors ${active ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="relative block h-0.5 w-8 sm:w-12 rounded-full bg-white/25 overflow-hidden">
                        {active && (
                          <span
                            key={`${heroIndex}-${heroTimerKey}`}
                            className="absolute inset-y-0 left-0 bg-white rounded-full hero-progress"
                            style={{ animationDuration: `${s.duration}ms`, animationPlayState: heroPaused ? 'paused' : 'running' }}
                          />
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={heroNext}
                aria-label="Next slide"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
              >
                <FiChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Trust Bar */}
      <ScrollReveal>
        <section className="py-6 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">{content.home_trust_title || 'Our Existing Partner Network'}</p>
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
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">{content.home_about_eyebrow || 'Our Approach'}</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {content.about_headline || 'More Than a Service. A Connected Health Ecosystem.'}
                </h2>
                <p className="text-gray-500 leading-relaxed mb-4 text-lg">
                  {content.about_description || 'We are an integrated healthcare network redefining how families in Ibadan access and experience care. By coordinating clinics, specialists, wellness services, and digital platforms under one hub, we close the gaps that typically fall between separate healthcare providers — ensuring seamless, continuous support from prevention to recovery.'}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to={content.home_about_link1_url || '/ecosystem'} className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                    {content.home_about_link1_text || 'Learn About Our Ecosystem'} <FiChevronRight className="w-4 h-4" />
                  </Link>
                  <Link to={content.home_about_link2_url || '/about'} className="inline-flex items-center gap-2 text-gray-500 font-medium hover:text-primary transition-colors">
                    {content.home_about_link2_text || 'Our Full Story'} <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <div className="bg-gradient-to-br from-primary/5 via-emerald-50/50 to-teal-50/30 rounded-3xl p-10 border border-primary/10">
                  <blockquote className="text-xl sm:text-2xl font-medium text-gray-900 leading-relaxed italic">
                    &ldquo;{content.home_about_quote || 'Because care works best when people and systems work together.'}&rdquo;
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
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">{content.home_values_eyebrow || 'Core Values'}</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{content.home_values_title || 'Built on What Matters'}</h2>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-8">
              {parseList(content.home_values, coreValues).map((v, i) => {
                const base = coreValues[i % coreValues.length]
                const Icon = base.icon
                const title = v.title ?? base.title
                const desc = v.desc ?? base.desc
                return (
                <ScrollReveal key={i} delay={i * 100}>
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center h-full">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                    <p className="text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </ScrollReveal>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Impact Stats */}
      <ScrollReveal>
        <section className="py-16 bg-gradient-to-r from-primary to-emerald-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {parseList(content.home_stats, impactStats).map((s, i) => {
                const base = impactStats[i % impactStats.length]
                const Icon = base.icon
                return (
                <div key={i} className="flex flex-col items-center">
                  <Icon className="w-6 h-6 text-white/60 mb-2" />
                  <div className="text-3xl sm:text-4xl font-bold mb-1">
                    <AnimatedCounter target={s.value ?? base.value} suffix={s.suffix ?? base.suffix} />
                  </div>
                  <div className="text-sm text-white/70 font-medium">{s.label ?? base.label}</div>
                </div>
                )
              })}
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
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">{content.home_services_eyebrow || 'Our Services'}</span>
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
                  <Link to={content.home_services_link_url || '/services'} className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                    {content.home_services_link_text || 'View All Services'} <FiArrowRight className="w-4 h-4" />
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
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">{content.home_eco_eyebrow || 'The Ecosystem'}</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{content.home_eco_title || 'The Ecosystem Behind the Care'}</h2>
                <p className="text-gray-500 max-w-3xl mx-auto">{content.home_eco_desc || 'Care does not exist in isolation. At Bodija Health Hub, we have built a living ecosystem where every partner, platform, and service works together as one coordinated system designed around you.'}</p>
              </div>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {parseList(content.home_ecosystem_cards, ecosystemCards).map((c, i) => {
                const base = ecosystemCards[i % ecosystemCards.length]
                const { icon: Icon, title, desc, color, border } = { ...base, ...c }
                return (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className={`bg-white rounded-2xl p-7 border ${border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full`}>
                    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">{title}</h3>
                    {desc && <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>}
                  </div>
                </ScrollReveal>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">{content.home_testi_eyebrow || 'What People Say'}</span>
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
                      <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">{content.home_programmes_eyebrow || 'Programmes'}</span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{content.home_programmes_title || 'Health Programmes'}</h2>
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
                      <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">{content.home_events_eyebrow || 'Events'}</span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{content.home_events_title || 'Upcoming Events'}</h2>
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
                  <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">{content.home_blog_eyebrow || 'Resources'}</span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{content.home_blog_title || 'Latest Insights'}</h2>
                </div>
                {blogPosts.length > 0 && (
                  <Link to={content.home_blog_link_url || '/newsroom'} className="hidden sm:inline-flex items-center gap-2 text-primary font-semibold hover:underline text-sm">
                    {content.home_blog_link_text || 'View All'} <FiArrowRight className="w-4 h-4" />
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
                <Link to={content.home_blog_link_url || '/newsroom'} className="inline-flex items-center gap-2 text-primary font-semibold">{content.home_blog_link_text || 'View All'} <FiArrowRight className="w-4 h-4" /></Link>
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
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">{content.contact_headline || 'Ready to Be Part of Something Bigger?'}</h2>
                  <p className="text-teal-100 text-lg mb-10 max-w-2xl mx-auto">
                    {content.contact_description || 'Whether you are a patient, a family, a healthcare provider, or a caregiver — BHH has a place for you.'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link to={content.home_cta_btn1_url || '/contact'} className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-colors shadow-lg">
                      {content.home_cta_btn1_text || 'Get Started'} <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link to={content.home_cta_btn2_url || '/partners'} className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                      {content.home_cta_btn2_text || 'Join the Ecosystem'}
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      <PageSections pageId="home" />

      <WelcomeModal />
    </div>
  )
}
