import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import EventCard from '../components/EventCard'

const typeLabels = {
  event: 'Events',
  screening: 'Screenings',
  outreach: 'Outreach',
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [activeType, setActiveType] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) setEvents(data)
        }
      } catch {
        // leave empty state
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const types = [...new Set(events.map((e) => e.type || 'event').filter(Boolean))]
  const filtered = activeType
    ? events.filter((e) => (e.type || 'event') === activeType)
    : events

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">Events</span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Community Events & Health Talks</h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Screenings, outreach programmes, and health talks hosted by the Bodija Health Hub ecosystem and its partners.
            </p>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {types.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => setActiveType('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeType === '' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveType(activeType === t ? '' : t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeType === t ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {typeLabels[t] || t}
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
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No events scheduled</h3>
              <p className="text-gray-500 mb-8">
                There are no events listed right now. Check back soon for our next community programme.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
                Contact Us <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((event) => (
                <Link key={event.id} to={`/events/${event.id}`} className="block">
                  <EventCard event={event} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
