import { FiShield, FiClock, FiHeart, FiUsers, FiAward, FiTrendingUp } from 'react-icons/fi'

const features = [
  {
    icon: FiShield,
    title: 'Trusted & Accredited',
    description: 'Fully licensed healthcare facility with international standards of care and safety.',
  },
  {
    icon: FiClock,
    title: '24/7 Emergency Care',
    description: 'Round-the-clock emergency services with rapid response teams always ready.',
  },
  {
    icon: FiHeart,
    title: 'Patient-Centered Care',
    description: 'Every treatment plan is tailored to your unique needs and preferences.',
  },
  {
    icon: FiUsers,
    title: 'Expert Medical Team',
    description: 'Board-certified physicians and specialists with decades of combined experience.',
  },
  {
    icon: FiAward,
    title: 'Advanced Technology',
    description: 'State-of-the-art diagnostic and treatment equipment for accurate, efficient care.',
  },
  {
    icon: FiTrendingUp,
    title: 'Affordable Excellence',
    description: 'Premium healthcare services at competitive prices with flexible payment options.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-warm-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Exceptional Healthcare,<br className="hidden sm:block" /> Exceptional Results
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            We combine medical excellence with compassionate care to deliver outcomes that transform lives.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
