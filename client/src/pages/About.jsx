import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiLink, FiClock } from 'react-icons/fi'
import ScrollReveal from '../components/ScrollReveal'
import PageSections from '../components/PageSections'

const defaultCoreValues = [
  {
    icon: FiHeart,
    title: 'Accessible',
    description: 'Quality care reachable for every family.',
  },
  {
    icon: FiLink,
    title: 'Connected',
    description: 'Specialists, diagnostics, and services linked under one system.',
  },
  {
    icon: FiClock,
    title: 'Continuous',
    description: 'Support at every stage of life, from newborns to elders.',
  },
]

export default function About() {
  const [content, setContent] = useState({
    about_headline: 'More Than a Service. A Connected Health Ecosystem.',
    about_description: 'We are an integrated healthcare network redefining how families in Ibadan access and experience care. By coordinating clinics, specialists, wellness services, and digital platforms under one hub, we close the gaps that typically fall between separate healthcare providers — ensuring seamless, continuous support from prevention to recovery.',
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
          <ScrollReveal>
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
          </ScrollReveal>
        </div>
      </section>

      {/* Description & Pull Quote */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
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
            </ScrollReveal>
            <ScrollReveal direction="right">
            <div className="bg-gradient-to-br from-primary/5 to-emerald-50 rounded-3xl p-10 border border-primary/10">
              <blockquote className="text-xl sm:text-2xl font-medium text-gray-900 leading-relaxed italic">
                "Because care works best when people and systems work together."
              </blockquote>
              <div className="mt-6 w-12 h-1 bg-primary rounded-full" />
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Core Values
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What We Stand For
            </h2>
          </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {defaultCoreValues.map(({ icon: Icon, title, description }, i) => (
              <ScrollReveal key={title} delay={i * 100}>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{description}</p>
              </div>
              </ScrollReveal>
            ))}
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
            Whether you are a patient, a family, a healthcare provider, or a caregiver — BHH has a place for you.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>

      <PageSections pageId="about" />
    </div>
  )
}
