import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiMapPin, FiPhone, FiMail, FiClock, FiArrowRight, FiDownload, FiUsers, FiActivity, FiBell } from 'react-icons/fi'

const actionCards = [
  {
    icon: FiActivity,
    title: 'Get Care Now',
    description: 'Book an appointment or visit one of our partner clinics.',
    link: '/contact',
    linkText: 'Contact Us',
  },
  {
    icon: FiUsers,
    title: 'Join the Ecosystem',
    description: 'Are you a healthcare provider? Partner with BHH.',
    link: '/partners',
    linkText: 'Partner With Us',
  },
  {
    icon: FiDownload,
    title: 'Download LiveCare',
    description: 'Smarter elder care support for your family.',
    link: '/platforms',
    linkText: 'Learn More',
  },
  {
    icon: FiBell,
    title: 'Register for BACR Updates',
    description: 'Be first to know about our upcoming rehabilitation centre.',
    link: '/upcoming',
    linkText: 'Register Interest',
  },
]

const defaultContactDetails = [
  { icon: FiMapPin, label: 'Location', value: 'Bodija, Ibadan', sub: 'Oyo State, Nigeria' },
  { icon: FiPhone, label: 'Phone', value: '+234 800 000 0000', sub: '+234 801 234 5678' },
  { icon: FiMail, label: 'Email', value: 'info@bodijahealthhub.com', sub: 'support@bodijahealthhub.com' },
  { icon: FiClock, label: 'Working Hours', value: 'Mon - Fri: 8:00 AM - 6:00 PM', sub: 'Sat: 9:00 AM - 2:00 PM' },
]

export default function Contact() {
  const [contactDetails, setContactDetails] = useState(defaultContactDetails)
  const [headline, setHeadline] = useState('Ready to Be Part of Something Bigger?')
  const [subtext, setSubtext] = useState('Whether you\'re a patient, a family member, a healthcare provider, or a caregiver — we\'re here to connect you with the care, the partners, and the community you need.')

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/site-content')
        if (res.ok) {
          const data = await res.json()
          if (data.contact_headline) setHeadline(data.contact_headline)
          if (data.contact_description) setSubtext(data.contact_description)

          // Build contact details from API
          const phone = data.phone || '+234 801 234 5678'
          const email = data.email || 'info@bodijahealthhub.com'
          const address = data.address || '12 Bodija Road, Ibadan, Oyo State, Nigeria'
          const hours = data.opening_hours || 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM'

          setContactDetails([
            { icon: FiMapPin, label: 'Location', value: address.split(',')[0] || 'Bodija, Ibadan', sub: address.split(',').slice(1).join(',').trim() || 'Oyo State, Nigeria' },
            { icon: FiPhone, label: 'Phone', value: phone, sub: '' },
            { icon: FiMail, label: 'Email', value: email, sub: '' },
            { icon: FiClock, label: 'Working Hours', value: hours.split(',')[0] || 'Mon - Fri: 8:00 AM - 6:00 PM', sub: hours.split(',').slice(1).join(',').trim() || '' },
          ])
        }
      } catch {
        // Use defaults
      }
    }
    fetchContent()
  }, [])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.fullName || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      setSubmitted(true)
      toast.success('Message sent! We\'ll get back to you soon.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-teal-700 to-emerald-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            {headline}
          </h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto leading-relaxed">
            {subtext}
          </p>
        </div>
      </section>

      {/* Action Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {actionCards.map(({ icon: Icon, title, description, link, linkText }) => (
              <Link
                key={title}
                to={link}
                className="bg-warm-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{description}</p>
                <span className="inline-flex items-center gap-1 text-primary font-medium text-sm group-hover:gap-2 transition-all">
                  {linkText} <FiArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Details & Form */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Details + Map */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {contactDetails.map(({ icon: Icon, label, value, sub }) => (
                    <div key={label} className="bg-white rounded-xl p-5 border border-gray-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{label}</span>
                      </div>
                      <p className="text-gray-700 text-sm font-medium">{value}</p>
                      {sub && <p className="text-gray-500 text-xs">{sub}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-sm h-72 bg-gray-200">
                <iframe
                  title="Bodija Health Hub Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.5!2d3.9!3d7.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMjQnMDAuMCJOIDDCsDA2JzAwLjAiRQ!5e0!3m2!1sen!2sng!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
              <p className="text-gray-500 mb-8">We'll get back to you within 24 hours.</p>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiArrowRight className="w-8 h-8 text-emerald-600 rotate-[-45deg]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 mb-6">Thank you for reaching out. We'll get back to you soon.</p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ fullName: '', email: '', phone: '', role: '', message: '' }) }}
                    className="text-primary font-medium hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        placeholder="0801 234 5678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      >
                        <option value="">Select your role</option>
                        <option value="Patient">Patient</option>
                        <option value="Family">Family</option>
                        <option value="Healthcare Provider">Healthcare Provider</option>
                        <option value="Caregiver">Caregiver</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
