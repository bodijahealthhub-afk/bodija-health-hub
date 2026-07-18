import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiActivity, FiHeart, FiHeadphones, FiThermometer } from 'react-icons/fi'

const icons = [FiActivity, FiHeart, FiHeadphones, FiThermometer]
const colors = ['primary', 'emerald', 'blue', 'orange']
const colorMap = {
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
}

export default function Partners() {
  const [content, setContent] = useState({
    partners_headline: 'Our Partner Network',
    partners_description: 'A network of specialized organizations sharing our commitment to accessible, quality, and patient-centered care.',
  })
  const [partners, setPartners] = useState([])

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/site-content')
        if (res.ok) {
          const data = await res.json()
          setContent(prev => ({ ...prev, ...data }))
          
          // Build partners from API data
          const partnerList = []
          for (let i = 1; i <= 4; i++) {
            if (data[`partner${i}_name`]) {
              partnerList.push({
                name: data[`partner${i}_name`],
                description: data[`partner${i}_description`] || '',
                services: (data[`partner${i}_services`] || '').split(',').map(s => s.trim()).filter(Boolean),
                image: data[`partner${i}_image`] || '',
              })
            }
          }
          if (partnerList.length > 0) setPartners(partnerList)
        }
      } catch {}
    }
    fetchContent()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">Our Partners</span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">{content.partners_headline}</h1>
            <p className="text-lg text-gray-300 leading-relaxed">{content.partners_description}</p>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {partners.map((partner, i) => {
              const Icon = icons[i % icons.length]
              const color = colors[i % colors.length]
              const colors2 = colorMap[color]
              return (
                <div key={i} className="bg-warm-white rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-6">
                    {partner.image ? (
                      <img src={partner.image} alt={partner.name} className="w-14 h-14 rounded-2xl object-cover" />
                    ) : (
                      <div className={`w-14 h-14 ${colors2.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-7 h-7 ${colors2.text}`} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{partner.name}</h3>
                    </div>
                  </div>
                  <p className="text-gray-500 leading-relaxed mb-6">{partner.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {partner.services.map((service) => (
                      <span key={service} className={`px-3 py-1 ${colors2.bg} ${colors2.text} text-xs font-medium rounded-full`}>
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
              We're always looking for like-minded organizations that share our commitment to accessible, connected, and continuous care.
            </p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors">
              Partner With Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
