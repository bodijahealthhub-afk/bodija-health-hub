import { Link } from 'react-router-dom'

export default function ServiceCard({ service }) {
  return (
    <Link
      to={`/services/${service.slug || service.id}`}
      className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
        <span className="text-2xl">{service.icon || '🩺'}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
        {service.name}
      </h3>
      {service.category && (
        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full w-fit mb-3">
          {service.category}
        </span>
      )}
      <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-1">
        {service.short_description || service.description || 'Comprehensive healthcare service provided by our experienced team.'}
      </p>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {service.price ? (
          <span className="text-lg font-bold text-primary">₦{Number(service.price).toLocaleString()}</span>
        ) : (
          <span className="text-sm font-medium text-primary">Pricing on request</span>
        )}
        <span className="text-sm font-medium text-primary group-hover:underline">
          Learn more →
        </span>
      </div>
    </Link>
  )
}
