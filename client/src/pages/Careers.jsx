import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiArrowRight, FiHeart, FiAward, FiTrendingUp, FiUsers, FiMapPin, FiBriefcase } from 'react-icons/fi'

const openings = [
  {
    title: 'Registered Nurse',
    department: 'Clinical Services',
    location: 'Bodija, Ibadan',
    type: 'Full-time',
    description: 'Provide compassionate patient care across our partner clinics. Experience in primary care or chronic disease management preferred.',
  },
  {
    title: 'Audiologist',
    department: 'hEar Max Centre',
    location: 'Bodija, Ibadan',
    type: 'Full-time',
    description: 'Conduct hearing assessments and manage patient hearing care plans. Must hold relevant audiology certification.',
  },
  {
    title: 'Digital Health Coordinator',
    department: 'Technology',
    location: 'Bodija, Ibadan / Remote',
    type: 'Full-time',
    description: 'Support the rollout and management of LiveCare and hEar Menders platforms. Tech-savvy with healthcare experience a plus.',
  },
  {
    title: 'Physiotherapist',
    department: 'Rehabilitation',
    location: 'Bodija, Ibadan',
    type: 'Full-time / Part-time',
    description: 'Deliver physical rehabilitation services. Experience with elder care and mobility recovery programs valued.',
  },
]

const benefits = [
  {
    icon: FiHeart,
    title: 'Health Insurance',
    description: 'Comprehensive health coverage for you and your family through our partner network.',
  },
  {
    icon: FiAward,
    title: 'Training & Development',
    description: 'Ongoing professional development through workshops, certifications, and mentorship.',
  },
  {
    icon: FiTrendingUp,
    title: 'Career Growth',
    description: 'Clear career progression paths within a rapidly growing healthcare ecosystem.',
  },
  {
    icon: FiUsers,
    title: 'Team Environment',
    description: 'Work alongside passionate healthcare professionals who share your commitment to community wellness.',
  },
]

export default function Careers() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    coverLetter: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.position) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      setSubmitted(true)
      toast.success('Application submitted! We\'ll be in touch.')
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
              Careers
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Join Our Team
            </h1>
            <p className="text-lg text-teal-100 leading-relaxed">
              At Bodija Health Hub, we're building something meaningful — a connected healthcare ecosystem that truly serves the community. We need passionate, skilled people to help us make it a reality.
            </p>
          </div>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Why BHH
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              More Than a Job. A Purpose.
            </h2>
            <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed">
              When you join BHH, you're not just filling a role — you're contributing to a mission to make quality, coordinated healthcare accessible to every family. Our team is our greatest asset, and we invest in our people.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-warm-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Open Positions
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Current Openings
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We're always looking for talented individuals to join our growing team. Here are our current opportunities:
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {openings.map(({ title, department, location, type, description }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-primary font-medium text-sm">{department}</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    {type}
                  </span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{description}</p>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <FiMapPin className="w-4 h-4" />
                  {location}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Apply Now
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Submit Your Application
            </h2>
            <p className="text-gray-500">
              Don't see a perfect fit? Send us your details anyway — we're always open to great talent.
            </p>
          </div>

          <div className="bg-warm-white rounded-3xl p-8 md:p-10 border border-gray-100">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiArrowRight className="w-8 h-8 text-emerald-600 rotate-[-45deg]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-gray-500 mb-6">Thank you for your interest in joining BHH. We'll review your application and get back to you soon.</p>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', position: '', coverLetter: '' }) }}
                  className="text-primary font-medium hover:underline"
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    >
                      <option value="">Select a position</option>
                      {openings.map(({ title }) => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                      <option value="Other">Other / General Interest</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
                  <div className="w-full px-4 py-3 border border-gray-300 border-dashed rounded-xl bg-white text-center hover:border-primary transition-colors cursor-pointer">
                    <FiBriefcase className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Drag and drop your resume, or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, or DOCX (max 5MB)</p>
                    <input type="file" accept=".pdf,.doc,.docx" className="sr-only" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter</label>
                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                    placeholder="Tell us why you'd be a great fit..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-500 text-sm">
                Prefer to email? Send your CV and cover letter to{' '}
                <a href="mailto:careers@bodijahealthhub.com" className="text-primary font-medium hover:underline">
                  careers@bodijahealthhub.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
