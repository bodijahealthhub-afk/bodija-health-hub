import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiHeadphones, FiMic, FiUsers, FiCheckCircle, FiArrowRight, FiStar } from 'react-icons/fi'

export default function HearMenders() {
  const [content, setContent] = useState({})

  useEffect(() => {
    fetch('/api/site-content').then(r => r.json()).then(setContent).catch(() => {})
  }, [])

  const features = [
    { icon: FiHeadphones, title: 'Virtual Hearing Assessments', desc: 'Complete hearing evaluations from the comfort of your home with licensed audiologists.' },
    { icon: FiMic, title: 'ENT Specialist Access', desc: 'Connect instantly with ear, nose, and throat specialists for expert consultations.' },
    { icon: FiUsers, title: 'Hearing Aid Support', desc: 'Professional fitting, programming, and ongoing support for your hearing devices.' },
    { icon: FiCheckCircle, title: 'Ongoing Care', desc: 'Continuous monitoring and follow-up to ensure your hearing health is always optimized.' },
    { icon: FiStar, title: 'Expert Network', desc: 'Powered by hEar Max Centre with years of audiology excellence and trusted care.' },
    { icon: FiArrowRight, title: 'Stress-Free Experience', desc: 'No more long queues or travel — quality hearing care delivered digitally.' },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">hEar Menders</span>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">{content.platforms_headline || 'Your Digital Hearing Solution'}</h1>
              <p className="text-lg text-blue-100 leading-relaxed mb-8">
                A digital platform giving you instant access to licensed audiologists and ENT specialists — powered by hEar Max Centre and built for smarter, stress-free hearing care.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 font-semibold rounded-full hover:bg-blue-50 transition-colors">
                  Download on Google Play
                </a>
                <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20">
                <div className="w-24 h-24 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiHeadphones className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-2">hEar Menders</h3>
                <p className="text-blue-200 text-center">Your Digital Hearing Solution</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full mb-4">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Everything You Need for Better Hearing</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-warm-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          </div>
          <div className="space-y-8">
            {['Download the App', 'Create Your Profile', 'Book a Hearing Assessment', 'Connect with Specialists', 'Receive Ongoing Care'].map((step, i) => (
              <div key={i} className="flex items-center gap-6">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{step}</h3>
                  <p className="text-sm text-gray-500">Simple steps to better hearing health</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Hearing Care?</h2>
          <p className="text-blue-200 mb-8">Download hEar Menders today and connect with hearing specialists instantly.</p>
          <a href="#" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 font-semibold rounded-full hover:bg-blue-50 transition-colors">
            Download hEar Menders
          </a>
        </div>
      </section>
    </div>
  )
}
