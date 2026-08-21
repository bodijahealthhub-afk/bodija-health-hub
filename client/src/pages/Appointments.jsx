import { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'
import { FiCheck, FiArrowLeft, FiExternalLink, FiHeart, FiUsers, FiCalendar, FiBookOpen, FiLink, FiActivity } from 'react-icons/fi'
import { useFeatures } from '../context/FeatureContext'

const CATEGORIES = [
  {
    value: 'appointment',
    title: 'Healthcare Service',
    description: 'Book a service with Bodija Health Hub. Our team will reach out to confirm a time that suits you.',
    icon: FiHeart,
    feature: 'appointment_booking',
  },
  {
    value: 'partner_appointment',
    title: 'Partner Provider',
    description: 'Request an appointment with one of our trusted partner providers.',
    icon: FiUsers,
    feature: 'appointment_booking',
  },
  {
    value: 'programme',
    title: 'Community Programme',
    description: 'Register your interest in a BHH community programme or initiative.',
    icon: FiActivity,
    feature: 'programme_registration',
  },
  {
    value: 'event',
    title: 'Event / Health Talk',
    description: 'Register for an upcoming BHH event or health talk.',
    icon: FiCalendar,
    feature: 'event_registration',
  },
  {
    value: 'training',
    title: 'Training',
    description: 'Register for BHH trainings and capacity building programmes.',
    icon: FiBookOpen,
    feature: 'training_registration',
  },
  {
    value: 'external',
    title: 'External Partner Portal',
    description: 'Book directly on a partner external booking portal.',
    icon: FiLink,
    feature: 'external_partner_booking',
  },
]

const TITLES = {
  appointment: 'Book a Healthcare Service',
  partner_appointment: 'Request a Partner Appointment',
  programme: 'Register for a Programme',
  event: 'Register for an Event',
  training: 'Register for Training',
  external: 'External Partner Booking',
}

const emptyForm = {
  service_id: '',
  provider_id: '',
  category: '',
  preferred_date: '',
  preferred_time: '',
  patient_name: '',
  patient_email: '',
  patient_phone: '',
  patient_age: '',
  notes: '',
}

export default function Appointments() {
  const { isEnabled } = useFeatures()
  const [services, setServices] = useState([])
  const [providers, setProviders] = useState([])
  const [bookingType, setBookingType] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch('/api/appointments/booking-options')
        if (res.ok) {
          const data = await res.json()
          setServices(Array.isArray(data.services) ? data.services : [])
          setProviders(Array.isArray(data.providers) ? data.providers : [])
        }
      } catch {}
    }
    fetchOptions()
  }, [])

  const categories = useMemo(
    () => CATEGORIES.filter((c) => isEnabled(c.feature)),
    [isEnabled]
  )

  const selected = CATEGORIES.find((c) => c.value === bookingType)
  const externalProviders = useMemo(
    () => providers.filter((p) => p.external_booking_url),
    [providers]
  )
  const typeProviders = useMemo(() => {
    if (bookingType === 'external') return externalProviders
    if (bookingType === 'partner_appointment') return providers.filter((p) => p.booking_method === 'EXTERNAL')
    return providers
  }, [bookingType, providers, externalProviders])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    let error = ''
    if (name === 'patient_name' && (!value || value.trim().length < 2)) error = 'Name must be at least 2 characters'
    else if (name === 'patient_email') {
      if (!value) error = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email'
    } else if (name === 'patient_age' && value && (isNaN(value) || Number(value) < 1 || Number(value) > 120)) {
      error = 'Please enter a valid age (1-120)'
    }
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const reset = () => {
    setBookingType(null)
    setForm(emptyForm)
    setSubmitted(null)
    setErrors({})
    setTouched({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.patient_name || form.patient_name.trim().length < 2) newErrors.patient_name = 'Name must be at least 2 characters'
    if (!form.patient_email) newErrors.patient_email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.patient_email)) newErrors.patient_email = 'Please enter a valid email'
    if ((bookingType === 'partner_appointment' || bookingType === 'external') && !form.provider_id) {
      newErrors.provider_id = 'Please choose a provider'
    }
    setErrors(newErrors)
    setTouched({ patient_name: true, patient_email: true })
    if (Object.keys(newErrors).length > 0) return

    const payload = {
      booking_type: bookingType,
      patient_name: form.patient_name,
      patient_email: form.patient_email,
      patient_phone: form.patient_phone || null,
      patient_age: form.patient_age ? Number(form.patient_age) : null,
      service_id: form.service_id ? Number(form.service_id) : null,
      provider_id: form.provider_id ? Number(form.provider_id) : null,
      category: form.category || null,
      preferred_date: form.preferred_date || null,
      preferred_time: form.preferred_time || null,
      notes: form.notes || null,
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const created = await res.json()
        setSubmitted(created)
        toast.success('Booking submitted successfully!')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to submit booking')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    const canRedirect = submitted.bookingType === 'external' && submitted.externalBookingUrl
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Booking Submitted!</h1>
          <p className="text-gray-500 mb-6">
            We've received your request. Our team will contact you shortly to confirm.
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 text-left text-sm space-y-2 mb-6">
            <p className="flex justify-between"><span className="text-gray-500">Reference</span><span className="font-medium text-gray-900">{submitted.bookingReference}</span></p>
            <p className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium text-gray-900">{TITLES[submitted.bookingType] || 'Booking'}</span></p>
            {(submitted.providerName || submitted.service) && (
              <p className="flex justify-between"><span className="text-gray-500">Details</span><span className="font-medium text-gray-900 text-right">{submitted.providerName || ''}{submitted.providerName && submitted.service ? ' — ' : ''}{submitted.service || ''}</span></p>
            )}
            <p className="flex justify-between"><span className="text-gray-500">Preferred date</span><span className="font-medium text-gray-900">{submitted.preferredDate || 'Flexible'}</span></p>
            <p className="flex justify-between"><span className="text-gray-500">Preferred time</span><span className="font-medium text-gray-900">{submitted.preferredTime || 'Flexible'}</span></p>
          </div>

          {canRedirect && (
            <a
              href={submitted.externalBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mb-3 py-3 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              Continue on Partner Portal <FiExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            Make Another Booking
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-teal-700 to-emerald-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">Book &amp; Register</span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Book a Service, Programme, or Event</h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto">
            Choose what you'd like to book. For healthcare appointments, tell us what you need and we'll confirm a time with you.
          </p>
        </div>
      </section>

      <section className="py-20 bg-warm-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {!bookingType ? (
            <>
              {categories.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Online booking is temporarily unavailable</h2>
                  <p className="text-gray-500">Please contact us directly and our team will be happy to help.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setBookingType(cat.value)}
                        className="bg-white rounded-2xl p-6 text-left border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">{cat.title}</h3>
                        <p className="text-sm text-gray-500">{cat.description}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="max-w-3xl mx-auto">
              <button
                onClick={() => setBookingType(null)}
                className="inline-flex items-center gap-2 text-primary font-medium text-sm mb-6 hover:underline"
              >
                <FiArrowLeft /> All booking options
              </button>

              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{TITLES[bookingType]}</h2>
                <p className="text-gray-500 mb-8">{selected ? selected.description : ''}</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {(bookingType === 'appointment' || bookingType === 'partner_appointment') && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {bookingType === 'partner_appointment' && (
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Provider *</label>
                          <select name="provider_id" value={form.provider_id} onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all ${
                              touched.provider_id && errors.provider_id ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-primary'
                            }`}>
                            <option value="">Select a partner provider</option>
                            {typeProviders.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}{p.location ? ` — ${p.location}` : ''}</option>
                            ))}
                          </select>
                          {touched.provider_id && errors.provider_id && <p className="text-red-500 text-xs mt-1">{errors.provider_id}</p>}
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Service (optional)</label>
                        <select name="service_id" value={form.service_id} onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary">
                          <option value="">I'm not sure yet / General enquiry</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}{s.category ? ` — ${s.category}` : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {(bookingType === 'programme' || bookingType === 'event' || bookingType === 'training') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {bookingType === 'programme' ? 'Which programme are you interested in?' : bookingType === 'event' ? 'Which event or health talk?' : 'Which training?'} *
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                        placeholder={
                          bookingType === 'programme' ? 'e.g. Community Nutrition Programme'
                            : bookingType === 'event' ? 'e.g. Monthly Health Talk'
                            : 'e.g. First Aid & CPR Training'
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  )}

                  {bookingType === 'external' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Partner Portal *</label>
                      <select name="provider_id" value={form.provider_id} onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all ${
                          touched.provider_id && errors.provider_id ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-primary'
                        }`}>
                        <option value="">Select a partner to continue on their portal</option>
                        {externalProviders.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      {touched.provider_id && errors.provider_id && <p className="text-red-500 text-xs mt-1">{errors.provider_id}</p>}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred date (optional)</label>
                      <input type="date" name="preferred_date" value={form.preferred_date} onChange={handleChange} min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred time (optional)</label>
                      <select name="preferred_time" value={form.preferred_time} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary">
                        <option value="">Flexible</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input type="text" name="patient_name" value={form.patient_name} onChange={handleChange} onBlur={handleBlur}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all ${
                          touched.patient_name && errors.patient_name ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-primary'
                        }`} placeholder="Your name" />
                      {touched.patient_name && errors.patient_name && <p className="text-red-500 text-xs mt-1">{errors.patient_name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input type="email" name="patient_email" value={form.patient_email} onChange={handleChange} onBlur={handleBlur}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all ${
                          touched.patient_email && errors.patient_email ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-primary'
                        }`} placeholder="your@email.com" />
                      {touched.patient_email && errors.patient_email && <p className="text-red-500 text-xs mt-1">{errors.patient_email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input type="tel" name="patient_phone" value={form.patient_phone} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary" placeholder="0801 234 5678" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input type="number" name="patient_age" value={form.patient_age} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Age" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Anything we should know?" />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Submitting...' : 'Submit Booking Request'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
