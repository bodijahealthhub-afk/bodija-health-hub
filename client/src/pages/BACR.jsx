import { useState } from 'react'
import { toast } from 'react-toastify'
import { FiActivity, FiMic, FiTool, FiMonitor, FiArrowRight, FiCheckCircle } from 'react-icons/fi'

export default function BACR() {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', areaOfInterest: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const therapies = [
    { icon: FiActivity, name: 'Physiotherapy', desc: 'Physical rehabilitation and mobility recovery for injuries, surgeries, and chronic conditions.' },
    { icon: FiMic, name: 'Speech Therapy', desc: 'Communication and swallowing disorder support for children and adults.' },
    { icon: FiTool, name: 'Occupational Therapy', desc: 'Helping individuals regain independence in daily activities and routines.' },
    { icon: FiMonitor, name: 'Behavioral Therapy', desc: 'Support for behavioral and developmental challenges through evidence-based approaches.' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.fullName || !formData.email) { toast.error('Please fill in required fields'); return }
    setSubmitting(true)
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.fullName, email: formData.email, phone: formData.phone, subject: 'BACR Registration Interest', message: `Area of interest: ${formData.areaOfInterest}` }),
      })
      setSubmitted(true)
      toast.success('Registration submitted!')
    } catch { toast.error('Something went wrong') }
    setSubmitting(false)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">Coming Soon</span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Bodija Advanced Care & Rehabilitation Centre</h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto">A dedicated rehabilitation centre offering comprehensive therapy services for recovery and functional independence.</p>
        </div>
      </section>

      {/* Therapies */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Our Therapy Services</h2>
            <p className="text-gray-500 mt-2">Comprehensive rehabilitation under one roof</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {therapies.map(({ icon: Icon, name, desc }) => (
              <div key={name} className="bg-warm-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Register Interest */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-500">We'll keep you updated on BACR's progress.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Register Your Interest</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text" required value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area of Interest</label>
                    <select value={formData.areaOfInterest} onChange={e => setFormData(p => ({ ...p, areaOfInterest: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500">
                      <option value="">Select</option>
                      <option>Physiotherapy</option>
                      <option>Speech Therapy</option>
                      <option>Occupational Therapy</option>
                      <option>Behavioral Therapy</option>
                      <option>General Information</option>
                    </select>
                  </div>
                  <button type="submit" disabled={submitting} className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Register Interest'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
