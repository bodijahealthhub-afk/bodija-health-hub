import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCalendar, FiMapPin } from 'react-icons/fi'

export default function Programmes() {
  const [programmes, setProgrammes] = useState([])
  const [activeCategory, setActiveCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const res = await fetch('/api/programmes')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) setProgrammes(data)
        }
      } catch {
        // leave empty state
      } finally {
        setLoading(false)
      }
    }
    fetchProgrammes()
  }, [])

  const categories = [...new Set(programmes.map((p) => p.category).filter(Boolean))]
  const filtered = activeCategory
    ? programmes.filter((p) => p.category === activeCategory)
    : programmes

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">Programmes</span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Community Health Programmes</h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Ongoing initiatives that bring health education, prevention, and support to the Bodija community and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-10">
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
                  key={c}
                  onClick={() => setActiveCategory(activeCategory === c ? '' : c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === c ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No programmes listed</h3>
              <p className="text-gray-500 mb-8">
                Our community programmes are being updated. Please check back soon.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
                Contact Us <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((programme) => (
                <div key={programme.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col">
                  {programme.image && (
                    <div className="aspect-[16/9] bg-gradient-to-br from-secondary/10 to-primary/10 overflow-hidden">
                      <img
                        src={programme.image}
                        alt={programme.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {programme.title}
                      </h3>
                    </div>
                    {programme.category && (
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full w-fit mb-3">
                        {programme.category}
                      </span>
                    )}
                    <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3 flex-1">
                      {programme.description}
                    </p>
                    <div className="space-y-2 text-xs text-gray-500 pt-4 border-t border-gray-100">
                      {programme.schedule && (
                        <span className="flex items-center gap-2">
                          <FiCalendar className="w-3.5 h-3.5" /> {programme.schedule}
                          {programme.frequency ? ` (${programme.frequency})` : ''}
                        </span>
                      )}
                      {programme.location && (
                        <span className="flex items-center gap-2">
                          <FiMapPin className="w-3.5 h-3.5" /> {programme.location}
                        </span>
                      )}
                    </div>
                    <Link
                      to="/appointments"
                      className="mt-5 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Register Interest <FiArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
