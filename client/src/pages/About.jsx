import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiLink, FiClock, FiEye, FiTarget } from 'react-icons/fi'

const defaultCoreValues = [
  {
    icon: FiHeart,
    title: 'Accessible',
    description: 'Quality care should never be out of reach. We bring healthcare closer to the people who need it most — through physical locations, community outreach, and digital solutions.',
  },
  {
    icon: FiLink,
    title: 'Connected',
    description: 'Clinics, specialists, diagnostics, and digital tools — all working together. We bridge the gaps between different aspects of care so patients never feel lost in the system.',
  },
  {
    icon: FiClock,
    title: 'Continuous',
    description: 'Healthcare doesn\'t stop at a single visit. We support ongoing, whole-person wellness — from preventive care to chronic disease management and rehabilitation.',
  },
]

export default function About() {
  const [content, setContent] = useState({
    about_headline: 'A Healthcare Ecosystem, Not Just a Clinic',
    about_description: 'Bodija Health Hub is an integrated healthcare network designed to ensure that patients receive coordinated, comprehensive care at every stage of their health journey.\n\nBy connecting primary care, specialist consultations, diagnostics, therapy, and digital health solutions under one umbrella, we eliminate the gaps that often leave families navigating the healthcare system alone.\n\nOur model is built on the belief that when healthcare providers, specialists, and digital platforms work in harmony, patients don\'t just get treated — they get cared for, consistently and completely.',
    about_mission: 'To build and sustain an integrated healthcare network that brings together clinics, specialists, diagnostics, therapy, and digital health solutions — making quality, coordinated care accessible to every individual and family in our community.',
    about_vision: 'To be the most trusted integrated healthcare ecosystem in Ibadan and beyond — where every family has access to connected, continuous, and compassionate care.',
  })

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/site-content')
        if (res.ok) {
          const data = await res.json()
          setContent(prev => ({ ...prev, ...data }))
        }
      } catch {
        // Use defaults
      }
    }
    fetchContent()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">
              About Us
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              About Bodija Health Hub
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              More Than a Service. A Connected Health Ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* Description & Pull Quote */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
                Our Story
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {content.about_headline}
              </h2>
              {content.about_description.split('\n\n').map((para, i) => (
                <p key={i} className="text-gray-500 leading-relaxed mb-4">
                  {para}
                </p>
              ))}
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-emerald-50 rounded-3xl p-10 border border-primary/10">
              <blockquote className="text-xl sm:text-2xl font-medium text-gray-900 leading-relaxed italic">
                "Because care works best when people and systems work together."
              </blockquote>
              <div className="mt-6 w-12 h-1 bg-primary rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Core Values
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What We Stand For
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {defaultCoreValues.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-warm-white rounded-3xl p-10 border border-gray-100">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <FiEye className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-500 leading-relaxed">
                {content.about_vision}
              </p>
            </div>
            <div className="bg-warm-white rounded-3xl p-10 border border-gray-100">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <FiTarget className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-500 leading-relaxed">
                {content.about_mission}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Be Part of Something Bigger?
          </h2>
          <p className="text-teal-100 text-lg mb-10 max-w-2xl mx-auto">
            Join us in building a healthcare ecosystem that truly serves the community.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}
