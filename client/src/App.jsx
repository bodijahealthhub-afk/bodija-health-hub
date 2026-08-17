import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PatientAuthProvider } from './portal/PatientAuthContext'
import { useFeatures } from './context/FeatureContext'
import useSeo from './hooks/useSeo'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FeatureUnavailable from './components/FeatureUnavailable'

// Core public pages (loaded eagerly for fast landing)
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Appointments from './pages/Appointments'

// Secondary public pages (code-split)
const Ecosystem = lazy(() => import('./pages/Ecosystem'))
const Partners = lazy(() => import('./pages/Partners'))
const Platforms = lazy(() => import('./pages/Platforms'))
const Upcoming = lazy(() => import('./pages/Upcoming'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Careers = lazy(() => import('./pages/Careers'))
const Resources = lazy(() => import('./pages/Resources'))
const Services = lazy(() => import('./pages/Services'))
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'))
const Sitemap = lazy(() => import('./pages/Sitemap'))
const LiveCare = lazy(() => import('./pages/LiveCare'))
const HearMenders = lazy(() => import('./pages/HearMenders'))
const BACR = lazy(() => import('./pages/BACR'))
const PartnerDetail = lazy(() => import('./pages/PartnerDetail'))
const Community = lazy(() => import('./pages/Community'))
const SuccessStories = lazy(() => import('./pages/SuccessStories'))
const Newsroom = lazy(() => import('./pages/Newsroom'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const Events = lazy(() => import('./pages/Events'))
const EventDetail = lazy(() => import('./pages/EventDetail'))
const Programmes = lazy(() => import('./pages/Programmes'))

// Admin (code-split — biggest chunk)
const AdminLogin = lazy(() => import('./admin/AdminLogin'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const AdminRoute = lazy(() => import('./admin/AdminRoute'))
const AdminDashboard = lazy(() => import('./admin/Dashboard'))
const AdminAppointments = lazy(() => import('./admin/Appointments'))
const AdminPatients = lazy(() => import('./admin/Patients'))
const AdminServices = lazy(() => import('./admin/Services'))
const AdminServiceCategories = lazy(() => import('./admin/ServiceCategories'))
const AdminProviders = lazy(() => import('./admin/Providers'))
const AdminPartners = lazy(() => import('./admin/Partners'))
const AdminBlog = lazy(() => import('./admin/Blog'))
const AdminEvents = lazy(() => import('./admin/Events'))
const AdminProgrammes = lazy(() => import('./admin/Programmes'))
const AdminGallery = lazy(() => import('./admin/Gallery'))
const AdminMessages = lazy(() => import('./admin/Messages'))
const AdminNewsletter = lazy(() => import('./admin/Newsletter'))
const AdminTestimonials = lazy(() => import('./admin/Testimonials'))
const AdminSettings = lazy(() => import('./admin/Settings'))
const AdminManagement = lazy(() => import('./admin/AdminManagement'))
const AdminSiteContent = lazy(() => import('./admin/SiteContent'))
const AdminHeroContent = lazy(() => import('./admin/HeroContent'))
const AdminFooterContent = lazy(() => import('./admin/FooterContent'))
const AdminNavigationContent = lazy(() => import('./admin/NavigationContent'))
const AdminPageContent = lazy(() => import('./admin/PageContent'))
const AdminSiteSettings = lazy(() => import('./admin/SiteSettings'))
const AdminMediaLibrary = lazy(() => import('./admin/MediaLibrary'))
const AdminSeoSettings = lazy(() => import('./admin/SeoSettings'))
const AdminBackupRestore = lazy(() => import('./admin/BackupRestore'))
const AdminSystemHealth = lazy(() => import('./admin/SystemHealth'))
const AdminPayments = lazy(() => import('./admin/Payments'))
const AdminFeatures = lazy(() => import('./admin/Features'))

// Patient portal
const PortalLayout = lazy(() => import('./portal/PortalLayout'))
const PortalLogin = lazy(() => import('./portal/Login'))
const PortalRegister = lazy(() => import('./portal/Register'))
const PortalDashboard = lazy(() => import('./portal/Dashboard'))
const PortalAppointments = lazy(() => import('./portal/Appointments'))
const PortalPayments = lazy(() => import('./portal/Payments'))

const DEFAULT_WHATSAPP = '2348012345678'

function formatWhatsApp(number) {
  if (!number) return DEFAULT_WHATSAPP
  let digits = number.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = '234' + digits.slice(1)
  if (digits.startsWith('+')) digits = digits.slice(1)
  if (digits.length <= 10) digits = '234' + digits
  return digits
}

function WhatsAppButton() {
  const [number, setNumber] = useState(DEFAULT_WHATSAPP)

  useEffect(() => {
    let active = true
    fetch('/api/site-content')
      .then(res => (res.ok ? res.json() : {}))
      .then(data => {
        if (!active) return
        const raw = data.contact_whatsapp || data.whatsapp
        if (raw) setNumber(formatWhatsApp(raw))
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  )
}

// Maps public routes to the feature flag that controls them. When a flag is
// disabled, the route renders a "Coming Soon" page instead.
const FEATURE_ROUTES = {
  '/services': { key: 'services', name: 'Services' },
  '/appointments': { key: 'appointment_booking', name: 'Book a Service / Appointment' },
  '/contact': { key: 'contact_form', name: 'Contact' },
  '/faq': { key: 'faq', name: 'FAQ' },
  '/careers': { key: 'careers', name: 'Careers' },
  '/upcoming': { key: 'upcoming_projects', name: 'Upcoming Projects' },
  '/partners': { key: 'partners_section', name: 'Partner Network' },
  '/platforms': { key: 'platforms_section', name: 'Platforms' },
  '/newsroom': { key: 'blog', name: 'Newsroom' },
  '/events': { key: 'events', name: 'Events' },
  '/programmes': { key: 'programme_registration', name: 'Programmes' },
  '/livecare': { key: 'livecare', name: 'LiveCare' },
  '/hear-menders': { key: 'hear_menders', name: 'hEar Menders' },
}

function FeatureGate({ featureKey, featureName, children }) {
  const { isEnabled } = useFeatures()
  if (!isEnabled(featureKey)) {
    return <FeatureUnavailable featureName={featureName} />
  }
  return children
}

function PageLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
    </div>
  )
}

function PublicLayout() {
  const { loading } = useAuth()
  const location = useLocation()
  useSeo(location.pathname)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/ecosystem" element={<Ecosystem />} />
            <Route path="/partners" element={<FeatureGate {...FEATURE_ROUTES['/partners']}><Partners /></FeatureGate>} />
            <Route path="/platforms" element={<FeatureGate {...FEATURE_ROUTES['/platforms']}><Platforms /></FeatureGate>} />
            <Route path="/upcoming" element={<FeatureGate {...FEATURE_ROUTES['/upcoming']}><Upcoming /></FeatureGate>} />
            <Route path="/contact" element={<FeatureGate {...FEATURE_ROUTES['/contact']}><Contact /></FeatureGate>} />
            <Route path="/appointments" element={<FeatureGate {...FEATURE_ROUTES['/appointments']}><Appointments /></FeatureGate>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<FeatureGate {...FEATURE_ROUTES['/faq']}><FAQ /></FeatureGate>} />
            <Route path="/careers" element={<FeatureGate {...FEATURE_ROUTES['/careers']}><Careers /></FeatureGate>} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/services" element={<FeatureGate {...FEATURE_ROUTES['/services']}><Services /></FeatureGate>} />
            <Route path="/services/:idOrSlug" element={<FeatureGate {...FEATURE_ROUTES['/services']}><ServiceDetail /></FeatureGate>} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/livecare" element={<FeatureGate {...FEATURE_ROUTES['/livecare']}><LiveCare /></FeatureGate>} />
            <Route path="/hear-menders" element={<FeatureGate {...FEATURE_ROUTES['/hear-menders']}><HearMenders /></FeatureGate>} />
            <Route path="/bacr" element={<BACR />} />
            <Route path="/partner/:idOrSlug" element={<FeatureGate featureKey="partners_section" featureName="Partner Network"><PartnerDetail /></FeatureGate>} />
            <Route path="/community" element={<Community />} />
            <Route path="/success-stories" element={<SuccessStories />} />
            <Route path="/newsroom" element={<FeatureGate {...FEATURE_ROUTES['/newsroom']}><Newsroom /></FeatureGate>} />
            <Route path="/newsroom/:slug" element={<FeatureGate {...FEATURE_ROUTES['/newsroom']}><BlogPost /></FeatureGate>} />
            <Route path="/events" element={<FeatureGate {...FEATURE_ROUTES['/events']}><Events /></FeatureGate>} />
            <Route path="/events/:slug" element={<FeatureGate {...FEATURE_ROUTES['/events']}><EventDetail /></FeatureGate>} />
            <Route path="/programmes" element={<FeatureGate {...FEATURE_ROUTES['/programmes']}><Programmes /></FeatureGate>} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/*" element={<PublicLayout />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="patients" element={<AdminPatients />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="service-categories" element={<AdminServiceCategories />} />
              <Route path="providers" element={<AdminProviders />} />
              <Route path="partners" element={<AdminPartners />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="programmes" element={<AdminProgrammes />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="site-content" element={<AdminSiteContent />} />
              <Route path="hero-content" element={<AdminHeroContent />} />
              <Route path="footer-content" element={<AdminFooterContent />} />
              <Route path="navigation-content" element={<AdminNavigationContent />} />
              <Route path="page-content" element={<AdminPageContent />} />
              <Route path="site-settings" element={<AdminSiteSettings />} />
              <Route path="media" element={<AdminMediaLibrary />} />
              <Route path="seo" element={<AdminSeoSettings />} />
              <Route path="backup" element={<AdminBackupRestore />} />
              <Route path="system-health" element={<AdminSystemHealth />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="features" element={<AdminFeatures />} />
              <Route path="admin-users" element={<AdminManagement />} />
            </Route>
          </Route>

          {/* Patient portal routes */}
          <Route
            path="/portal"
            element={
              <FeatureGate featureKey="patient_portal" featureName="Patient Portal">
                <PatientAuthProvider><PortalLayout /></PatientAuthProvider>
              </FeatureGate>
            }
          >
            <Route index element={<PortalDashboard />} />
            <Route path="appointments" element={<PortalAppointments />} />
            <Route path="payments" element={<PortalPayments />} />
          </Route>
          <Route path="/portal/login" element={<FeatureGate featureKey="patient_portal" featureName="Patient Portal"><PortalLogin /></FeatureGate>} />
          <Route path="/portal/register" element={<FeatureGate featureKey="patient_portal" featureName="Patient Portal"><PortalRegister /></FeatureGate>} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
