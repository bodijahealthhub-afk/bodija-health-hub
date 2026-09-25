import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiActivity, FiZap, FiCheckCircle, FiUsers, FiHeart, FiLink, FiArrowRight, FiMonitor, FiHeadphones, FiMic, FiTool, FiShield } from 'react-icons/fi'

const defaultServices = [
  { icon: FiShield, name: 'Preventive Care & Wellness', description: 'Routine check-ups, screenings, and wellness programs designed to catch problems early.' },
  { icon: FiZap, name: 'Diagnostics & Laboratory', description: 'Accurate, timely diagnostic services supporting clinical decisions across the hub.' },
  { icon: FiUsers, name: 'Specialist Consultations', description: 'Access to a growing network of specialists within one trusted ecosystem.' },
  { icon: FiHeart, name: 'Elder Care & Assisted Living', description: 'Structured, dignified home care for elderly individuals and their families. (Powered by LiveCare)' },
  { icon: FiActivity, name: 'Chronic Disease Management', description: 'Long-term monitoring and support for kidney disease and hypertension.' },
  { icon: FiTool, name: 'Rehabilitation Services', description: 'Physical, occupational, speech, and behavioral therapy. (Coming Soon — BACR)' },
  { icon: FiHeadphones, name: 'Audiology & Hearing Health', description: 'Audiology assessments, hearing aids, and ENT specialist access.' },
  { icon: FiLink, name: 'Community Health Outreach', description: 'Health education, screenings, and outreach programs beyond clinic walls.' },
]

const included = [
  'Primary Care',
  'Specialist care and referrals',
  'Diagnostics and laboratory services',
  'Audiology',
  'Physiotherapy, speech therapy, and behavioral therapy',
  'Chronic condition management',
  'Long-term wellness and elder care support',
  'Digital Solutions',
]

export default function Ecosystem() {
  const [content, setContent] = useState({
    ecosystem_headline: 'One Hub. Many Hands. Whole-Person Care.',
    ecosystem_description: 'Care does not exist in isolation. At Bodija Health Hub, we have built a living ecosystem where every partner, platform, and service works together as one coordinated system designed around you.',
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
                What the Ecosystem Includes
              </span>
              <div className="space-y-4 mt-6">
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
              BHH is building and supporting digital solutions that extend the reach of quality care beyond clinic walls.
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
              <p className="text-gray-500 text-sm leading-relaxed">A structured elder care and assisted living platform connecting families to trained, verified caregivers — with real-time session updates and coordinated home care support.</p>
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
              <p className="text-gray-500 text-sm leading-relaxed">A digital platform giving you instant access to licensed audiologists and ENT specialists — powered by hEar Max Centre and built for smarter, stress-free hearing care.</p>
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
            Rather than functioning as separate healthcare silos, the goal is integration — creating a system where care becomes easier to access, monitor, and coordinate.
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
            <p className="text-lg text-gray-500 max-w-3xl mx-auto mt-4">
              Our network covers the full spectrum of healthcare needs — from prevention to recovery, from newborn to elder, from routine monitoring to specialist support.
            </p>
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
