import { useState } from 'react'
import { toast } from 'react-toastify'
import { FiActivity, FiMic, FiTool, FiMonitor, FiArrowRight } from 'react-icons/fi'

const services = [
  { icon: FiActivity, name: 'Physiotherapy', description: 'Physical rehabilitation and mobility recovery for injuries, surgeries, and chronic conditions.' },
  { icon: FiMic, name: 'Speech Therapy', description: 'Communication and swallowing disorder support for children and adults.' },
  { icon: FiTool, name: 'Occupational Therapy', description: 'Helping individuals regain independence in daily activities and routines.' },
  { icon: FiMonitor, name: 'Behavioral Therapy', description: 'Support for behavioral and developmental challenges through evidence-based approaches.' },
]

export default function Upcoming() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    areaOfInterest: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.fullName || !formData.email || !formData.areaOfInterest) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      await fetch('/api/upcoming-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      setSubmitted(true)
      toast.success('Registration submitted! We\'ll keep you updated.')
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              Coming Soon
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Upcoming Projects
            </h1>
            <p className="text-lg text-teal-100 leading-relaxed">
              Expanding our ecosystem with dedicated facilities and services to meet the growing needs of our community.
            </p>
          </div>
        </div>
      </section>

      {/* BACR Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
                Coming Soon
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Bodija Advanced Care & Rehabilitation Centre
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                A dedicated rehabilitation centre designed to provide specialized therapy services under one roof — bringing together physiotherapy, speech therapy, occupational therapy, and behavioral therapy in a purpose-built facility.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                BACR will serve individuals recovering from injuries, managing chronic conditions, or needing ongoing therapeutic support — extending the BHH ecosystem's commitment to whole-person, continuous care.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {services.map(({ icon: Icon, name, description }) => (
                  <div key={name} className="bg-warm-white rounded-xl p-5 border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Form */}
            <div className="bg-warm-white rounded-3xl p-8 md:p-10 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Register Your Interest</h3>
              <p className="text-gray-500 mb-8">
                Be the first to know when BACR launches. Register your interest and we'll keep you updated.
              </p>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiArrowRight className="w-8 h-8 text-emerald-600 rotate-[-45deg]" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h4>
                  <p className="text-gray-500 mb-6">We'll keep you updated on BACR's progress.</p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ fullName: '', email: '', phone: '', areaOfInterest: '' }) }}
                    className="text-primary font-medium hover:underline"
                  >
                    Register another interest
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                      placeholder="0801 234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Area of Interest *</label>
                    <select
                      name="areaOfInterest"
                      value={formData.areaOfInterest}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                    >
                      <option value="">Select a service</option>
                      <option value="Physiotherapy">Physiotherapy</option>
                      <option value="Speech Therapy">Speech Therapy</option>
                      <option value="Occupational Therapy">Occupational Therapy</option>
                      <option value="Behavioral Therapy">Behavioral Therapy</option>
                      <option value="General Information">General Information</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Register Interest'}
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
