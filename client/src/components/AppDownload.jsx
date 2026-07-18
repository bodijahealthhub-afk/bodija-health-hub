import { Link } from 'react-router-dom'
import { FiSmartphone } from 'react-icons/fi'

export default function AppDownload() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            <FiSmartphone className="w-4 h-4" /> Mobile Apps
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Healthcare in Your Pocket
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Download our mobile apps for on-the-go health management and real-time care.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* HearMenders */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/10">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">HearMenders</h3>
            <p className="text-sm text-gray-500 mb-6">
              Your personal health companion. Track appointments, access records, and connect with your care team.
            </p>
            <Link
              to="/download-apps"
              className="inline-flex items-center px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all"
            >
              Learn More →
            </Link>
          </div>

          {/* LiveCare */}
          <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-2xl p-8 border border-secondary/10">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">LiveCare</h3>
            <p className="text-sm text-gray-500 mb-6">
              Virtual consultations at your fingertips. See a doctor anytime, anywhere through video calls.
            </p>
            <Link
              to="/download-apps"
              className="inline-flex items-center px-6 py-3 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-secondary-dark transition-all"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
