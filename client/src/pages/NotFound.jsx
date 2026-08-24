import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl font-bold text-primary">404</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md text-lg">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
