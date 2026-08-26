import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useFeatures } from '../context/FeatureContext'
import { isPathHidden } from '../utils/featureRoutes'

const defaultLinks = [
  { name: 'Home', path: '/' },
  { name: 'Ecosystem', path: '/ecosystem' },
  { name: 'Services', path: '/services' },
  { name: 'Partners', path: '/partners' },
  { name: 'Newsroom', path: '/newsroom' },
  { name: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const [navLinks, setNavLinks] = useState(defaultLinks)
  const { isEnabled } = useFeatures()
  const showBooking = isEnabled('appointment_booking')

  const visibleLinks = navLinks.filter((link) => !isPathHidden(link.path, isEnabled))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img src="/BHH.png" alt="Bodija Health Hub" className="h-10 lg:h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const active = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? scrolled ? 'text-primary' : 'text-white'
                      : scrolled
                        ? 'text-gray-600 hover:text-primary hover:bg-primary/5'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-colors duration-300 ${
                      scrolled ? 'bg-primary' : 'bg-white'
                    }`} />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            {showBooking && (
              <Link
                to="/appointments"
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                  scrolled
                    ? 'border-primary/30 text-primary hover:bg-primary/5'
                    : 'border-white/30 text-white hover:bg-white/10'
                }`}
              >
                Book a Service
              </Link>
            )}
            <Link
              to="/contact"
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                scrolled
                  ? 'bg-primary text-white hover:bg-primary-dark shadow-sm'
                  : 'bg-white text-primary hover:bg-white/90 shadow-sm'
              }`}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
            aria-label="Toggle menu"
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
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
        isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-4 space-y-1 shadow-lg">
          {visibleLinks.map((link) => {
            const active = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'text-primary bg-primary/5'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          <div className="pt-2 space-y-2 border-t border-gray-100 mt-2">
            {showBooking && (
              <Link
                to="/appointments"
                onClick={() => setIsOpen(false)}
                className="block text-center border border-primary/30 text-primary px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/5 transition-colors"
              >
                Book a Service
              </Link>
            )}
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="block text-center bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
