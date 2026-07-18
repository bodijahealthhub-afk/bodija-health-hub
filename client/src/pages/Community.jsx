import { useState, useEffect } from 'react'
import AnimatedCounter from '../components/AnimatedCounter'
import { FiHeart, FiUsers, FiMapPin, FiActivity } from 'react-icons/fi'

export default function Community() {
  const [content, setContent] = useState({})
  useEffect(() => { fetch('/api/site-content').then(r => r.json()).then(setContent).catch(() => {}) }, [])

  const stats = [
    { icon: FiHeart, value: 5000, suffix: '+', label: 'Lives Impacted' },
    { icon: FiUsers, value: 50, suffix: '+', label: 'Healthcare Professionals' },
    { icon: FiMapPin, value: 20, suffix: '+', label: 'Outreach Locations' },
    { icon: FiActivity, value: 100, suffix: '+', label: 'Community Outreaches' },
  ]

  const stories = [
    { title: 'Free Hearing Screening Camp', location: 'Bodija Community Center', date: 'March 2026', desc: 'Provided free hearing assessments to over 200 community members.' },
    { title: 'Hypertension Awareness Walk', location: 'UI Postgraduate School', date: 'January 2026', desc: 'Health education walk reaching 500+ participants with free blood pressure checks.' },
    { title: 'Child Health Vaccination Drive', location: 'Bodija Primary School', date: 'November 2025', desc: 'Vaccinated over 150 children in partnership with local health authorities.' },
  ]

  return (
    <div>
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">Community Impact</span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Making a Difference Together</h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto">Beyond our walls, BHH reaches into communities with health education, screenings, and outreach programs.</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {stats.map(({ icon: Icon, value, suffix, label }) => (
              <div key={label} className="text-center p-6 bg-warm-white rounded-2xl border border-gray-100">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-emerald-600" />
                </div>
                <AnimatedCounter target={value} suffix={suffix} className="text-4xl font-bold text-gray-900" />
                <p className="text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-8">Outreach Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {stories.map((story, i) => (
              <div key={i} className="bg-warm-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                <span className="text-xs text-emerald-600 font-medium">{story.date}</span>
                <h3 className="font-bold text-gray-900 mt-2 mb-1">{story.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{story.location}</p>
                <p className="text-sm text-gray-600">{story.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
