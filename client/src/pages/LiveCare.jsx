import { FiHeart, FiShield, FiUsers, FiClock, FiBell, FiSmartphone, FiCheckCircle, FiArrowRight, FiPhone } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const features = [
  { icon: FiHeart, title: 'Daily Wellness Check-Ins', description: 'Automated and personalized wellness calls to ensure your loved ones are safe and healthy every day.' },
  { icon: FiBell, title: 'Emergency Alert System', description: 'Instant SOS alerts with real-time GPS location shared to family and emergency contacts.' },
  { icon: FiUsers, title: 'Caregiver Coordination', description: 'Seamlessly schedule, track, and manage professional caregivers through one centralized dashboard.' },
  { icon: FiClock, title: 'Medication Reminders', description: 'Smart medication tracking with push notifications to ensure no dose is missed.' },
  { icon: FiShield, title: 'Family Dashboard', description: 'Real-time visibility into your loved one\'s daily activities, health metrics, and care schedule.' },
  { icon: FiSmartphone, title: 'Remote Health Tracking', description: 'Sync with wearable devices to monitor heart rate, activity levels, and sleep patterns.' },
]

const steps = [
  { num: '01', title: 'Download the App', description: 'Available on iOS and Android. Set up an account in under 2 minutes.' },
  { num: '02', title: 'Add Your Loved One', description: 'Create a profile, set health preferences, and add emergency contacts.' },
  { num: '03', title: 'Connect & Monitor', description: 'Pair with a wearable device and start receiving daily wellness insights.' },
  { num: '04', title: 'Stay Connected', description: 'Get real-time updates, coordinate care, and rest easy knowing they are supported.' },
]

const testimonials = [
  { name: 'Adunni O.', role: 'Daughter', quote: 'LiveCare has given our family peace of mind. My mother lives alone in Ibadan, and I can check on her wellbeing from Lagos every single day.', rating: 5 },
  { name: 'Femi A.', role: 'Son', quote: 'The emergency alert feature saved my father\'s life. He fell in the bathroom and the SOS was triggered immediately. Help arrived in minutes.', rating: 5 },
  { name: 'Grace M.', role: 'Granddaughter', quote: 'I love the medication reminders. My grandfather used to forget his blood pressure pills — now he never misses a dose.', rating: 5 },
]

export default function LiveCare() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">LiveCare</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Smarter Care.<br />Trusted Support.
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-10 max-w-xl">
                A dedicated elder care platform bringing peace of mind to families and trusted support to aging adults — connecting them to care, every hour of every day.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-colors">
                  Download for iOS <FiArrowRight className="w-5 h-5" />
                </a>
                <a href="#" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                  Download for Android
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold mb-1">24/7</div>
                    <div className="text-sm text-gray-400">Monitoring</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold mb-1">5 min</div>
                    <div className="text-sm text-gray-400">Emergency Response</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold mb-1">1000+</div>
                    <div className="text-sm text-gray-400">Families Served</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold mb-1">98%</div>
                    <div className="text-sm text-gray-400">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything Your Family Needs</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">From daily check-ins to emergency response, LiveCare covers every aspect of elder care.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-warm-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow group">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Getting Started is Simple</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ num, title, description }) => (
              <div key={num} className="relative">
                <div className="text-5xl font-bold text-primary/10 mb-4">{num}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Trusted by Families</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(({ name, role, quote, rating }) => (
              <div key={name} className="bg-warm-white rounded-2xl p-8 border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 italic">"{quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{name}</p>
                  <p className="text-sm text-gray-500">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Start Caring Today</h2>
          <p className="text-teal-100 text-lg mb-10 max-w-2xl mx-auto">
            Download LiveCare and give your family the peace of mind they deserve. Setup takes less than 2 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              App Store
            </a>
            <a href="#" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 1.33-2.983 1.725-2.254-2.254 2.935-2.801zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" /></svg>
              Google Play
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
