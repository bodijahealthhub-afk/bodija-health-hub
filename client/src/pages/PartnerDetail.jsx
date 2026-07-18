import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowRight, FiCheckCircle, FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi'

const fallbackPartners = {
  'livecare': {
    name: 'LiveCare',
    tagline: 'Smarter Care. Trusted Support.',
    description: 'LiveCare is a dedicated elder care platform designed to bring peace of mind to families and trusted support to aging adults. From daily wellness check-ins to emergency alerts and caregiver coordination, LiveCare ensures that your loved ones are never far from the care they need.',
    image: '',
    services: ['Daily wellness monitoring', 'Emergency alert system', 'Caregiver coordination', 'Family access & updates', 'Remote health tracking'],
    contact_email: 'care@livecare.ng',
    contact_phone: '+234 800 123 4567',
  },
  'hearmenders': {
    name: 'hEar Menders',
    tagline: 'Your Digital Hearing Solution.',
    description: 'hEar Menders is a digital hearing platform built to make hearing care accessible, continuous, and convenient. Backed by the expertise of hEar Max Centre, it connects patients to audiology support, hearing assessments, and ongoing care — all from the comfort of home.',
    image: '',
    services: ['Virtual hearing assessments', 'Audiology consultations', 'Hearing aid support', 'Ongoing care management', 'Educational resources'],
    contact_email: 'info@hearmax.ng',
    contact_phone: '+234 800 234 5678',
  },
}

export default function PartnerDetail() {
  const { slug } = useParams()
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPartner = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/site-content')
        if (res.ok) {
          const data = await res.json()
          const partnerKey = slug?.toLowerCase()
          const apiPartner = data.partners?.find(p =>
            p.slug === partnerKey || p.name?.toLowerCase().replace(/\s+/g, '') === partnerKey
          )
          if (apiPartner) {
            setPartner(apiPartner)
          } else if (fallbackPartners[partnerKey]) {
            setPartner(fallbackPartners[partnerKey])
          }
        } else if (fallbackPartners[slug?.toLowerCase()]) {
          setPartner(fallbackPartners[slug.toLowerCase()])
        }
      } catch {
        if (fallbackPartners[slug?.toLowerCase()]) {
          setPartner(fallbackPartners[slug.toLowerCase()])
        }
      } finally {
        setLoading(false)
      }
    }
    fetchPartner()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Partner Not Found</h1>
        <p className="text-gray-500 mb-8">The partner you're looking for doesn't exist.</p>
        <Link to="/partners" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
          View All Partners <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">Partner</span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{partner.name}</h1>
            {partner.tagline && (
              <p className="text-xl text-teal-300 font-medium mb-6">{partner.tagline}</p>
            )}
            <p className="text-lg text-gray-300 leading-relaxed">{partner.description}</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">About</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Do</h2>
              <p className="text-gray-500 leading-relaxed mb-4">{partner.about || partner.description}</p>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-emerald-50 rounded-3xl p-10 border border-primary/10">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                {partner.mission || 'To deliver accessible, connected, and continuous care that puts patients and families first.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      {partner.services && partner.services.length > 0 && (
        <section className="py-20 bg-warm-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">Services</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What We Offer</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {partner.services.map((service, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 font-medium">{service}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary to-teal-700 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-teal-100 mb-8 max-w-xl mx-auto">
              Interested in {partner.name}? Reach out to learn more about our services or to schedule a consultation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              {partner.contact_phone && (
                <a href={`tel:${partner.contact_phone}`} className="flex items-center gap-2 text-teal-100 hover:text-white transition-colors">
                  <FiPhone className="w-4 h-4" /> {partner.contact_phone}
                </a>
              )}
              {partner.contact_email && (
                <a href={`mailto:${partner.contact_email}`} className="flex items-center gap-2 text-teal-100 hover:text-white transition-colors">
                  <FiMail className="w-4 h-4" /> {partner.contact_email}
                </a>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-colors">
                Contact Us <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/appointments" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
