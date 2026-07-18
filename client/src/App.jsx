import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Ecosystem from './pages/Ecosystem'
import Partners from './pages/Partners'
import Platforms from './pages/Platforms'
import Upcoming from './pages/Upcoming'
import Contact from './pages/Contact'
import Appointments from './pages/Appointments'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import FAQ from './pages/FAQ'
import Careers from './pages/Careers'
import Resources from './pages/Resources'
import Sitemap from './pages/Sitemap'

// Admin imports
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminRoute from './admin/AdminRoute'
import AdminDashboard from './admin/Dashboard'
import AdminAppointments from './admin/Appointments'
import AdminPatients from './admin/Patients'
import AdminDoctors from './admin/Doctors'
import AdminServices from './admin/Services'
import AdminBlog from './admin/Blog'
import AdminEvents from './admin/Events'
import AdminGallery from './admin/Gallery'
import AdminMessages from './admin/Messages'
import AdminNewsletter from './admin/Newsletter'
import AdminTestimonials from './admin/Testimonials'
import AdminSettings from './admin/Settings'
import AdminManagement from './admin/AdminManagement'
import AdminSiteContent from './admin/SiteContent'
import AdminHeroContent from './admin/HeroContent'
import AdminFooterContent from './admin/FooterContent'
import AdminNavigationContent from './admin/NavigationContent'
import AdminPageContent from './admin/PageContent'
import AdminSiteSettings from './admin/SiteSettings'
import AdminMediaLibrary from './admin/MediaLibrary'
import AdminSeoSettings from './admin/SeoSettings'
import AdminBackupRestore from './admin/BackupRestore'

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/2348000000000"
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

function PublicLayout() {
  const { loading } = useAuth()

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/ecosystem" element={<Ecosystem />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/platforms" element={<Platforms />} />
          <Route path="/upcoming" element={<Upcoming />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/sitemap" element={<Sitemap />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
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
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="events" element={<AdminEvents />} />
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
            <Route path="backup" element={<AdminBackupRestore />}`n          <Route path="admin-users" element={<AdminManagement />} /> />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

