import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowRight, FiPhone, FiMail, FiMapPin, FiClock, FiCalendar } from 'react-icons/fi'

export default function ServiceDetail() {
  const { idOrSlug } = useParams()
  const [service, setService] = useState(null)
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true)
      setProvider(null)
      try {
        const res = await fetch(`/api/services/${idOrSlug}`)
        if (res.ok) {
          const data = await res.json()
          setService(data)
          if (data.providerId) {
            fetch(`/api/providers/${data.providerId}`)
              .then((r) => (r.ok ? r.json() : null))
              .then((p) => setProvider(p))
              .catch(() => {})
          }
        }
      } catch {
        // handled below
      } finally {
        setLoading(false)
      }
    }
    fetchService()
  }, [idOrSlug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Service Not Found</h1>
        <p className="text-gray-500 mb-8">The service you're looking for doesn't exist.</p>
        <Link to="/services" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
          View All Services <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  const externalBooking = service.bookingType === 'EXTERNAL' && service.bookingUrl
  const infoRows = [
    { icon: FiMapPin, label: 'Location', value: service.location },
    { icon: FiClock, label: 'Booking', value: service.bookingType ? service.bookingType.replace('_', ' ').toLowerCase() : null },
  ].filter((row) => row.value)

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/services" className="inline-flex items-center gap-2 text-gray-300 hover:text-white text-sm mb-6 transition-colors">
            ← All Services
          </Link>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">{service.icon || '🩺'}</span>
            </div>
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 flex-wrap mb-3">
                {service.category && (
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm font-medium">{service.category}</span>
                )}
                {service.featured && (
                  <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm font-medium">★ Featured</span>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">{service.name}</h1>
              <p className="text-xl text-teal-300 font-medium mb-4">
                {service.price ? `₦${Number(service.price).toLocaleString()}` : 'Pricing on request'}
              </p>
              {service.short_description && (
                <p className="text-lg text-gray-300 leading-relaxed">{service.short_description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {service.description && (
                <>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">About This Service</h2>
                  <p className="text-gray-500 leading-relaxed whitespace-pre-line">{service.description}</p>
                </>
              )}

              {provider && (
                <div className="mt-12 bg-warm-white rounded-3xl p-8 border border-gray-100">
                  <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">Provided By</span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{provider.name}</h3>
                  <p className="text-gray-500 leading-relaxed mb-6">{provider.description}</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {provider.contactPhone && (
                      <a href={`tel:${provider.contactPhone}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                        <FiPhone className="w-4 h-4" /> {provider.contactPhone}
                      </a>
                    )}
                    {provider.contactEmail && (
                      <a href={`mailto:${provider.contactEmail}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                        <FiMail className="w-4 h-4" /> {provider.contactEmail}
                      </a>
                    )}
                    {provider.location && (
                      <span className="inline-flex items-center gap-2 text-gray-600">
                        <FiMapPin className="w-4 h-4" /> {provider.location}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/partner/${provider.slug || provider.id}`}
                    className="inline-flex items-center gap-2 mt-6 text-primary font-medium hover:underline"
                  >
                    View provider profile <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Service Details</h3>
                <div className="space-y-4">
                  {infoRows.map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <row.icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 uppercase">{row.label}</p>
                        <p className="text-sm text-gray-700 capitalize">{row.value}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <FiCalendar className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Appointments</p>
                      <p className="text-sm text-gray-700">Available for booking</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary to-teal-700 rounded-3xl p-8 text-white">
                <h3 className="text-xl font-bold mb-3">Ready to Book?</h3>
                <p className="text-teal-100 text-sm mb-6 leading-relaxed">
                  Schedule your {service.name.toLowerCase()} appointment with our team today.
                </p>
                {externalBooking ? (
                  <a
                    href={service.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-colors w-full justify-center"
                  >
                    Book via Partner Portal <FiArrowRight className="w-5 h-5" />
                  </a>
                ) : (
                  <Link
                    to={`/appointments?service=${service.slug || service.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-colors w-full justify-center"
                  >
                    Book Appointment <FiArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>

              {service.bookingType === 'PARTNER_REQUEST' && (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
                  <div className="flex items-center gap-3">
                    <FiClock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      This service is provided by a partner and may be confirmed after a request.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
