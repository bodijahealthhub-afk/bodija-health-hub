import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiLink, FiClock, FiArrowRight, FiActivity, FiZap, FiCheckCircle, FiUsers } from 'react-icons/fi'

const defaultCoreValues = [
  {
    icon: FiHeart,
    title: 'Accessible',
    description: 'Quality care should never be out of reach. We bring healthcare closer to the people who need it most.',
  },
  {
    icon: FiLink,
    title: 'Connected',
    description: 'Clinics, specialists, diagnostics, and digital tools — all working together for seamless care.',
  },
  {
    icon: FiClock,
    title: 'Continuous',
    description: 'Healthcare doesn\'t stop at a single visit. We support ongoing, whole-person wellness.',
  },
]

const defaultServices = [
  { icon: FiActivity, name: 'Primary Care', description: 'Routine check-ups, family medicine, and preventive health.' },
  { icon: FiZap, name: 'Specialist Consultations', description: 'Access to experienced specialists across multiple disciplines.' },
  { icon: FiCheckCircle, name: 'Diagnostics & Laboratory', description: 'Fast, accurate diagnostic testing and imaging services.' },
  { icon: FiUsers, name: 'Hearing & Audiology', description: 'Comprehensive hearing assessments and support.' },
  { icon: FiActivity, name: 'Physiotherapy', description: 'Physical rehabilitation and mobility recovery.' },
  { icon: FiZap, name: 'Chronic Disease Management', description: 'Ongoing care for diabetes, hypertension, and kidney health.' },
  { icon: FiCheckCircle, name: 'Elder Care', description: 'Specialized support for aging adults and their families.' },
  { icon: FiUsers, name: 'Digital Health Solutions', description: 'Telehealth platforms extending care beyond clinic walls.' },
]

export default function Home() {
  const [content, setContent] = useState({
    hero_headline: 'Wellness Starts Here.',
    hero_subtext: 'Bodija Health Hub is a community-based integrated healthcare ecosystem bringing clinics, specialists, and quality digital solutions together — making accessible, connected, and continuous care a reality for every family in Ibadan.',
    hero_cta1_text: 'Explore the Ecosystem',
    hero_cta1_link: '/ecosystem',
    hero_cta2_text: 'Meet Our Partners',
    hero_cta2_link: '/partners',
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-teal-700 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              Bodija Health Hub
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {content.hero_headline}
            </h1>
            <p className="text-lg text-teal-100 leading-relaxed mb-10 max-w-2xl">
              {content.hero_subtext}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={content.hero_cta1_link || '/ecosystem'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-colors"
              >
                {content.hero_cta1_text}
                <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={content.hero_cta2_link || '/partners'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-colors"
              >
                {content.hero_cta2_text}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Ecosystem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
                Our Approach
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {content.ecosystem_headline || 'More Than a Service. A Connected Health Ecosystem.'}
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                {content.ecosystem_description || 'Bodija Health Hub is not just another healthcare facility — it is an integrated healthcare network designed to ensure that patients receive coordinated, comprehensive care at every stage of their health journey.'}
              </p>
              <p className="text-gray-500 leading-relaxed">
                By connecting primary care, specialist consultations, diagnostics, therapy, and digital health solutions under one umbrella, we eliminate the gaps that often leave families navigating the healthcare system alone.
              </p>
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
              Built on What Matters
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {defaultCoreValues.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              The Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              One Hub. Many Hands. Whole-Person Care.
            </h2>
            <p className="text-gray-500 max-w-3xl mx-auto">
              Health doesn't exist in isolation — and neither should care. Our ecosystem brings together trusted partners across multiple disciplines to support every aspect of your well-being.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {defaultServices.map(({ icon: Icon, name, description }) => (
              <div key={name} className="bg-warm-white rounded-2xl p-6 hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Be Part of Something Bigger?
          </h2>
          <p className="text-teal-100 text-lg mb-10 max-w-2xl mx-auto">
            Whether you're a patient, a healthcare provider, or a community partner — there's a place for you in the Bodija Health Hub ecosystem.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-colors"
            >
              Get Started
              <FiArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/ecosystem"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
