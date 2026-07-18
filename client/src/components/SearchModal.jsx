import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiX, FiFileText, FiUsers, FiCalendar, FiActivity, FiArrowRight } from 'react-icons/fi'

const builtinPages = [
  { title: 'Home', path: '/', category: 'Pages' },
  { title: 'About Us', path: '/about', category: 'Pages' },
  { title: 'The Ecosystem', path: '/ecosystem', category: 'Pages' },
  { title: 'Our Partners', path: '/partners', category: 'Pages' },
  { title: 'Our Platforms', path: '/platforms', category: 'Pages' },
  { title: 'Upcoming Projects', path: '/upcoming', category: 'Pages' },
  { title: 'Contact Us', path: '/contact', category: 'Pages' },
  { title: 'Book Appointment', path: '/appointments', category: 'Pages' },
  { title: 'FAQ', path: '/faq', category: 'Pages' },
  { title: 'Careers', path: '/careers', category: 'Pages' },
  { title: 'Resources', path: '/resources', category: 'Pages' },
  { title: 'LiveCare', path: '/platforms/livecare', category: 'Platforms' },
  { title: 'hEar Menders', path: '/platforms/hearmenders', category: 'Platforms' },
  { title: 'Community Impact', path: '/community', category: 'Community' },
  { title: 'Success Stories', path: '/success-stories', category: 'Stories' },
  { title: 'Newsroom', path: '/newsroom', category: 'News' },
  { title: 'BACR Rehabilitation', path: '/bacr', category: 'Partners' },
]

const categoryIcons = {
  Pages: FiFileText,
  Platforms: FiActivity,
  Community: FiUsers,
  Stories: FiFileText,
  News: FiFileText,
  Partners: FiUsers,
  Doctors: FiUsers,
  Blog: FiFileText,
  Events: FiCalendar,
}

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100)
    }
    if (!isOpen) {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          const apiResults = []
          if (data.services) data.services.forEach(s => apiResults.push({ ...s, category: 'Services' }))
          if (data.doctors) data.doctors.forEach(d => apiResults.push({ ...d, category: 'Doctors' }))
          if (data.blog) data.blog.forEach(b => apiResults.push({ ...b, category: 'Blog', path: `/blog/${b.slug || b.id}` }))
          if (data.events) data.events.forEach(e => apiResults.push({ ...e, category: 'Events', path: `/events/${e.slug || e.id}` }))
          // Filter builtin pages
          const pageResults = builtinPages
            .filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
            .map(p => ({ ...p, category: 'Pages' }))
          setResults([...pageResults, ...apiResults].slice(0, 10))
        } else {
          // Fallback to builtin pages only
          const pageResults = builtinPages
            .filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
            .map(p => ({ ...p, category: 'Pages' }))
          setResults(pageResults.slice(0, 10))
        }
      } catch {
        const pageResults = builtinPages
          .filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
          .map(p => ({ ...p, category: 'Pages' }))
        setResults(pageResults.slice(0, 10))
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (item) => {
    if (item.path) navigate(item.path)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <FiSearch className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search services, doctors, articles, events..."
            className="flex-1 text-lg text-gray-900 placeholder-gray-400 outline-none bg-transparent"
          />
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 && (
            <div className="px-6 py-8 text-center text-gray-400">
              <FiSearch className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Type to search across services, doctors, blog posts, and more</p>
            </div>
          )}

          {query.length >= 2 && loading && (
            <div className="px-6 py-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto" />
            </div>
          )}

          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-400">
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((item, i) => {
                const Icon = categoryIcons[item.category] || FiFileText
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title || item.name}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <FiArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">ESC</kbd> to close</span>
          <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}
