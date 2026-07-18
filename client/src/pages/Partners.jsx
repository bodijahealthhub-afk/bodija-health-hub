import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiActivity, FiHeart, FiHeadphones, FiThermometer } from 'react-icons/fi'

const defaultPartners = [
  {
    name: 'Beacon Health Diagnostics',
    icon: FiActivity,
    color: 'primary',
    description: 'Providing comprehensive diagnostic and laboratory support to the BHH ecosystem — ensuring accurate, timely testing that empowers informed medical decisions.',
    services: ['Laboratory Testing', 'Diagnostic Imaging', 'Health Screenings', 'Specialized Diagnostics'],
  },
  {
    name: 'Live Longa',
    icon: FiHeart,
    color: 'emerald',
    description: 'Delivering primary care, preventive care, and wellness checks — the frontline of community health and the foundation of early intervention.',
    services: ['Primary Care', 'Preventive Health', 'Wellness Checks', 'Family Medicine'],
  },
  {
    name: 'hEar Max Centre',
    icon: FiHeadphones,
    color: 'blue',
    description: 'Specialists in hearing and audiology support, and the foundation behind the hEar Menders digital hearing platform — making hearing care accessible and continuous.',
    services: ['Hearing Assessments', 'Audiology Support', 'Hearing Aid Fitting', 'Digital Hearing Solutions'],
  },
  {
    name: 'Bodija Kidney & Hypertension Clinic',
    icon: FiThermometer,
    color: 'orange',
    description: 'Focused on kidney health and hypertension monitoring — providing specialized care for conditions that affect thousands in our community.',
    services: ['Kidney Health Monitoring', 'Hypertension Management', 'Chronic Disease Support', 'Nephrology Consultations'],
  },
]

const colorMap = {
  primary: { bg: 'bg-primary/10', text: 'text-primary', ring: 'ring-primary/20' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-200' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', ring: 'ring-orange-200' },
}

export default function Partners() {
  const [headline, setHeadline] = useState('Our Partner Network')
  const [description, setDescription] = useState('The Bodija Health Hub ecosystem is powered by a network of specialized healthcare organizations — each bringing expertise, trust, and commitment to community wellness.')

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/site-content')
        if (res.ok) {
          const data = await res.json()
          if (data.partners_headline) setHeadline(data.partners_headline)
          if (data.partners_description) setDescription(data.partners_description)
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
              Our Partners
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              {headline}
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {defaultPartners.map(({ name, icon: Icon, color, description, services }) => {
              const colors = colorMap[color]
              return (
                <div
                  key={name}
                  className="bg-warm-white rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-7 h-7 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{name}</h3>
                    </div>
                  </div>
                  <p className="text-gray-500 leading-relaxed mb-6">{description}</p>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service) => (
                      <span
                        key={service}
                        className={`px-3 py-1 ${colors.bg} ${colors.text} text-xs font-medium rounded-full`}
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Are you a healthcare provider interested in joining the BHH ecosystem?
            </h2>
            <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
              We're always looking for like-minded organizations that share our commitment to accessible, connected, and continuous care for the community.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
