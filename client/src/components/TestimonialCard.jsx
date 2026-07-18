import { FiStar } from 'react-icons/fi'

export default function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`w-5 h-5 ${i < (testimonial.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
      <blockquote className="text-gray-600 leading-relaxed mb-6 italic">
        "{testimonial.content || testimonial.message || testimonial.text}"
      </blockquote>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">
            {(testimonial.name || testimonial.patientName || 'A Patient').charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{testimonial.name || testimonial.patientName || 'A Patient'}</p>
          <p className="text-xs text-gray-500">{testimonial.title || 'Satisfied Patient'}</p>
        </div>
      </div>
    </div>
  )
}
