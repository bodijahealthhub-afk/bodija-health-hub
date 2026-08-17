import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiCalendar, FiMapPin } from 'react-icons/fi'

const typeLabels = { event: 'Event', screening: 'Screening', outreach: 'Outreach' }

export default function EventDetail() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${slug}`)
        if (!res.ok) throw new Error('Not found')
        const data = await res.json()
        setEvent(data)
        document.title = data.title
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Event not found</h1>
          <p className="text-gray-500 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/events" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
            <FiArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
        </div>
      </div>
    )
  }

  const dateObj = event.date ? new Date(event.date) : null

  return (
    <div>
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {event.type && (
            <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">
              {typeLabels[event.type] || event.type}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold mb-6">{event.title}</h1>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-300">
            {dateObj && !isNaN(dateObj) && (
              <span className="flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />{' '}
                {dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1"><FiMapPin className="w-4 h-4" /> {event.location}</span>
            )}
          </div>
        </div>
      </section>

      <article className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          {event.image && (
            <img src={event.image} alt={event.title} className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-10" />
          )}
          {event.description && (
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </div>
          )}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link to="/events" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
              <FiArrowLeft className="w-4 h-4" /> Back to Events
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
