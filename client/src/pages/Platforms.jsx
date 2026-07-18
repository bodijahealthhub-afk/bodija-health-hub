import { useState, useEffect } from 'react'
import { FiMonitor, FiMic, FiArrowRight, FiHeart, FiUsers, FiShield } from 'react-icons/fi'

const defaultPlatforms = [
  {
    name: 'LiveCare',
    tagline: 'Smarter Care. Trusted Support.',
    icon: FiMonitor,
    color: 'primary',
    description: 'LiveCare is a dedicated elder care platform designed to bring peace of mind to families and trusted support to aging adults. From daily wellness check-ins to emergency alerts and caregiver coordination, LiveCare ensures that your loved ones are never far from the care they need.',
    features: [
      'Daily wellness monitoring',
      'Emergency alert system',
      'Caregiver coordination',
      'Family access & updates',
      'Remote health tracking',
    ],
    link: '#',
  },
  {
    name: 'hEar Menders',
    tagline: 'Your Digital Hearing Solution.',
    icon: FiMic,
    color: 'emerald',
    description: 'hEar Menders is a digital hearing platform built to make hearing care accessible, continuous, and convenient. Backed by the expertise of hEar Max Centre, it connects patients to audiology support, hearing assessments, and ongoing care — all from the comfort of home.',
    features: [
      'Virtual hearing assessments',
      'Audiology consultations',
      'Hearing aid support',
      'Ongoing care management',
      'Educational resources',
    ],
    link: '#',
  },
]

const colorStyles = {
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20',
    gradient: 'from-primary/5 to-teal-50',
    button: 'bg-primary text-white hover:bg-primary/90',
  },
  emerald: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    gradient: 'from-emerald-50 to-green-50',
    button: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
}

export default function Platforms() {
  const [headline, setHeadline] = useState('Our Platforms')
  const [description, setDescription] = useState('BHH is building and supporting digital solutions that extend the reach of quality care beyond clinic walls — connecting patients to providers, families to peace of mind, and communities to wellness.')

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/site-content')
        if (res.ok) {
          const data = await res.json()
          if (data.platforms_headline) setHeadline(data.platforms_headline)
          if (data.platforms_description) setDescription(data.platforms_description)
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
              Digital Solutions
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

      {/* Platform Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {defaultPlatforms.map(({ name, tagline, icon: Icon, color, description, features, link }) => {
              const styles = colorStyles[color]
              return (
                <div
                  key={name}
                  className={`bg-gradient-to-br ${styles.gradient} rounded-3xl border ${styles.border} overflow-hidden`}
                >
                  <div className="p-8 md:p-12">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-16 h-16 ${styles.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-8 h-8 ${styles.text}`} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">{name}</h2>
                        <p className={`text-lg font-medium ${styles.text}`}>{tagline}</p>
                      </div>
                    </div>
                    <p className="text-gray-500 leading-relaxed mb-8 max-w-3xl">
                      {description}
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                      {features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <div className={`w-2 h-2 ${styles.bg} rounded-full flex-shrink-0`} />
                          <span className="text-sm text-gray-700 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-8 py-4 ${styles.button} font-semibold rounded-full transition-colors`}
                    >
                      Visit Website
                      <FiArrowRight className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Digital */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Why Digital
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Extending Care Beyond Clinic Walls
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-5">
                <FiHeart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Continuous Support</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Care doesn't end when you leave the clinic. Our platforms keep you connected to support around the clock.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                <FiUsers className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Family Access</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Families stay informed and involved — with real-time updates and coordinated care visibility.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                <FiShield className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Trusted Quality</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Every digital solution is backed by our partner network's clinical expertise and commitment to excellence.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
