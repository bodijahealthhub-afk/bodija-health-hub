import { FiCalendar, FiMapPin, FiClock } from 'react-icons/fi'

export default function EventCard({ event }) {
  const date = new Date(event.date || event.startDate)
  const day = date.getDate()
  const month = date.toLocaleString('default', { month: 'short' })

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="aspect-[16/9] bg-gradient-to-br from-secondary/10 to-primary/10 overflow-hidden">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🎉</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-14 h-14 bg-primary rounded-xl flex flex-col items-center justify-center text-white">
            <span className="text-xs font-medium uppercase">{month}</span>
            <span className="text-lg font-bold leading-none">{day}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {event.location && (
                <span className="flex items-center gap-1">
                  <FiMapPin className="w-3.5 h-3.5" /> {event.location}
                </span>
              )}
              {event.time && (
                <span className="flex items-center gap-1">
                  <FiClock className="w-3.5 h-3.5" /> {event.time}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
          {event.description}
        </p>
      </div>
    </div>
  )
}
