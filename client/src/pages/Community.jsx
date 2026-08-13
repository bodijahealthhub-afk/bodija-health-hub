import { useState, useEffect } from 'react'
import AnimatedCounter from '../components/AnimatedCounter'
import { FiHeart, FiUsers, FiMapPin, FiActivity } from 'react-icons/fi'

const iconFor = (name) => {
  switch (name) {
    case 'heart': return FiHeart
    case 'users': return FiUsers
    case 'pin': return FiMapPin
    case 'activity': return FiActivity
    default: return FiHeart
  }
}

export default function Community() {
  const [content, setContent] = useState({})
  const [stats, setStats] = useState([])
  const [stories, setStories] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/site-content')
        if (!res.ok) return
        const data = await res.json()
        setContent(data)
        try { setStats(JSON.parse(data.community_stats || '[]')) } catch { setStats([]) }
        try { setStories(JSON.parse(data.community_stories || '[]')) } catch { setStories([]) }
      } catch {
        // leave empty states
      }
    }
    load()
  }, [])

  return (
    <div>
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">Community Impact</span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">{content.community_headline || 'Making a Difference Together'}</h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto">
            {content.community_description || 'BHH reaches into communities with health education, screenings, and outreach programmes.'}
          </p>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, i) => {
                const Icon = iconFor(stat.icon)
                return (
                  <div key={i} className="text-center p-6 bg-warm-white rounded-2xl border border-gray-100">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-emerald-600" />
                    </div>
                    <AnimatedCounter target={Number(stat.value) || 0} suffix={stat.suffix || ''} className="text-4xl font-bold text-gray-900" />
                    <p className="text-gray-500 mt-1">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className={stats.length > 0 ? 'pb-20 bg-white' : 'py-20 bg-white'}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Outreach Stories</h2>
          {stories.length === 0 ? (
            <div className="text-center py-12 bg-warm-white rounded-2xl border border-gray-100">
              <p className="text-gray-500 text-lg">Stories are being gathered. Check back soon.</p>
            </div>
          ) : (
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
          )}
        </div>
      </section>
    </div>
  )
}
