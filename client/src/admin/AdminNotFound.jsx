import { Link } from 'react-router-dom'

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl font-bold text-gray-300">404</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        The admin page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
