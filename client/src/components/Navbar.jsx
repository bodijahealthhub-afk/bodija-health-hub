import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useFeatures } from '../context/FeatureContext'
import { isPathHidden } from '../utils/featureRoutes'

const defaultLinks = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'The Ecosystem', path: '/ecosystem' },
  { name: 'Our Partners', path: '/partners' },
  { name: 'Our Platforms', path: '/platforms' },
  { name: 'Events', path: '/events' },
  { name: 'Programmes', path: '/programmes' },
  { name: 'Upcoming Projects', path: '/upcoming' },
  { name: 'Contact Us', path: '/contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const [navLinks, setNavLinks] = useState(defaultLinks)
  const [ctaText, setCtaText] = useState('Get Started')
  const [ctaUrl, setCtaUrl] = useState('/contact')
  const { isEnabled } = useFeatures()

  const visibleLinks = navLinks.filter((link) => !isPathHidden(link.path, isEnabled))
  const showPortal = isEnabled('patient_portal')
  const showBooking = isEnabled('appointment_booking')
  const showCta = !isPathHidden(ctaUrl, isEnabled)

  useEffect(() => {
    const fetchNav = async () => {
      try {
        const res = await fetch('/api/site-content')
        if (res.ok) {
          const data = await res.json()
          if (data.nav_links) {
            try {
              const links = JSON.parse(data.nav_links)
              setNavLinks(links.map(l => ({ name: l.label, path: l.url })))
            } catch {}
          }
          if (data.nav_cta_text) setCtaText(data.nav_cta_text)
          if (data.nav_cta_url) setCtaUrl(data.nav_cta_url)
        }
      } catch {
        // Use defaults
      }
    }
    fetchNav()
  }, [])

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/BHH.png" alt="Bodija Health Hub" className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {visibleLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {showPortal && (
              <Link
                to="/portal"
                className="text-sm font-medium text-primary border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors"
              >
                Patient Portal
              </Link>
            )}
            {showBooking && (
              <Link
                to="/appointments"
                className="text-sm font-medium text-primary border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors"
              >
                Book Now
              </Link>
            )}
            {showCta && (
              <Link
                to={ctaUrl}
                className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                {ctaText}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            {visibleLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {showPortal && (
              <Link
                to="/portal"
                onClick={() => setIsOpen(false)}
                className="block text-primary border border-primary/30 px-5 py-2 rounded-lg text-sm font-medium text-center"
              >
                Patient Portal
              </Link>
            )}
            {showBooking && (
              <Link
                to="/appointments"
                onClick={() => setIsOpen(false)}
                className="block text-primary border border-primary/30 px-5 py-2 rounded-lg text-sm font-medium text-center"
              >
                Book Now
              </Link>
            )}
            {showCta && (
              <Link
                to={ctaUrl}
                onClick={() => setIsOpen(false)}
                className="block bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium text-center mt-3"
              >
                {ctaText}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
