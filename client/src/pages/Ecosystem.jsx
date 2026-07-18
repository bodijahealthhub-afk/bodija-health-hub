import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiActivity, FiZap, FiCheckCircle, FiUsers, FiHeart, FiLink, FiArrowRight, FiMonitor, FiHeadphones, FiMic, FiTool } from 'react-icons/fi'

const defaultServices = [
  { icon: FiActivity, name: 'Primary Care', description: 'Routine check-ups, family medicine, preventive health, and wellness visits to keep you and your family healthy.' },
  { icon: FiZap, name: 'Specialist Consultations', description: 'Access to experienced specialists across multiple disciplines for focused, expert medical guidance.' },
  { icon: FiCheckCircle, name: 'Diagnostics & Laboratory', description: 'Fast, accurate diagnostic testing, imaging, and laboratory services for informed medical decisions.' },
  { icon: FiHeadphones, name: 'Hearing & Audiology', description: 'Comprehensive hearing assessments, diagnostics, and support through our audiology partners.' },
  { icon: FiTool, name: 'Physiotherapy & Speech Therapy', description: 'Physical rehabilitation, speech therapy, occupational therapy, and behavioral therapy services.' },
  { icon: FiHeart, name: 'Chronic Disease Management', description: 'Ongoing monitoring and care for diabetes, hypertension, kidney health, and other chronic conditions.' },
  { icon: FiUsers, name: 'Elder Care', description: 'Specialized support and care services designed for aging adults and their families.' },
  { icon: FiMonitor, name: 'Digital Health Solutions', description: 'Telehealth platforms and digital tools that extend the reach of quality care beyond clinic walls.' },
]

const included = [
  'Primary Care',
  'Specialist Care',
  'Diagnostics',
  'Audiology',
  'Physiotherapy, Speech & Behavioral Therapy',
  'Chronic Condition Management',
  'Elder Care',
]

export default function Ecosystem() {
  const [content, setContent] = useState({
    ecosystem_headline: 'One Hub. Many Hands. Whole-Person Care.',
    ecosystem_description: 'Care doesn\'t exist in isolation — and neither should the systems that support it. At Bodija Health Hub, we\'ve built an ecosystem where every service connects, every specialist coordinates, and every patient benefits from truly integrated healthcare.',
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
      <section className="relative bg-gradient-to-br from-primary via-teal-700 to-emerald-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              The Ecosystem Behind the Care
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              {content.ecosystem_headline}
            </h1>
            <p className="text-lg text-teal-100 leading-relaxed">
              {content.ecosystem_description}
            </p>
          </div>
        </div>
      </section>

      {/* What the Ecosystem Includes */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
                What's Included
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                A Complete Healthcare Network
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Our ecosystem is designed to cover every stage of your health journey — from routine wellness checks to specialized treatment, rehabilitation, and ongoing chronic care management.
              </p>
              <div className="space-y-4">
                {included.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiCheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-emerald-50 rounded-3xl p-10 border border-primary/10">
              <blockquote className="text-xl sm:text-2xl font-medium text-gray-900 leading-relaxed italic">
                "Because care works best when people and systems work together."
              </blockquote>
              <div className="mt-6 w-12 h-1 bg-primary rounded-full" />
              <p className="mt-6 text-gray-500 leading-relaxed">
                When your primary care doctor, specialist, lab, therapist, and digital health platform all communicate seamlessly — you get care that's not just available, but truly connected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Solutions */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Digital Solutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Care Beyond Clinic Walls
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              BHH is building and supporting digital solutions that extend the reach of quality care — connecting patients to providers, families to updates, and communities to wellness resources.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link
              to="/platforms"
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                <FiMonitor className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">LiveCare</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Smarter care and trusted support for elder wellness — bringing peace of mind to families.</p>
              <span className="inline-flex items-center gap-1 text-primary font-medium text-sm mt-4 group-hover:gap-2 transition-all">
                Learn More <FiArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link
              to="/platforms"
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
                <FiMic className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">hEar Menders</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Your digital hearing solution — accessible hearing care and audiology support.</p>
              <span className="inline-flex items-center gap-1 text-primary font-medium text-sm mt-4 group-hover:gap-2 transition-all">
                Learn More <FiArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Ecosystem Statement */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl sm:text-2xl font-medium text-gray-900 leading-relaxed">
            Our ecosystem is not about doing everything ourselves — it's about bringing the right partners together so that every patient receives coordinated, comprehensive care without having to navigate the system alone.
          </p>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Our Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What We Offer
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {defaultServices.map(({ icon: Icon, name, description }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Be Part of Something Bigger?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-colors"
            >
              Get Started <FiArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/partners"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-colors"
            >
              Meet Our Partners
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
