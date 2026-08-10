import { Link } from 'react-router-dom'
import { FiClock } from 'react-icons/fi'

// Rendered when a visitor lands on a page whose feature flag is disabled.
export default function FeatureUnavailable({ featureName }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-16">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FiClock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Coming Soon</h1>
        <p className="text-gray-500 leading-relaxed mb-8">
          {featureName
            ? `The ${featureName} isn't available to the public just yet. We're working hard behind the scenes and will open it up soon.`
            : "This page isn't available to the public just yet. We're working hard behind the scenes and will open it up soon."}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-colors"
          >
            Back to Home
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
