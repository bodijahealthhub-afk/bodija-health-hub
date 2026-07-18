import { useState, useEffect } from 'react'
import { FiStar, FiQuote } from 'react-icons/fi'

export default function SuccessStories() {
  const [testimonials, setTestimonials] = useState([])
  useEffect(() => { fetch('/api/testimonials').then(r => r.json()).then(setTestimonials).catch(() => {}) }, [])

  const stories = [
    ...testimonials.map(t => ({ name: t.patient_name, content: t.content, rating: t.rating, type: 'Patient' })),
    { name: 'Mrs. Adekunle', content: 'After my husband\'s stroke, BHH\'s home care service through LiveCare helped him recover at home. The caregivers were professional and compassionate.', rating: 5, type: 'Family' },
    { name: 'Nurse Adewale', content: 'Working with BHH has been incredible. The integrated ecosystem means I can coordinate with specialists seamlessly for my patients.', rating: 5, type: 'Caregiver' },
  ]

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary via-teal-700 to-emerald-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">Success Stories</span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Real Stories, Real Impact</h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto">Hear from patients, families, and caregivers whose lives have been transformed by BHH.</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story, i) => (
              <div key={i} className="bg-warm-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <FiQuote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-gray-600 leading-relaxed mb-6">"{story.content}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{story.name}</p>
                    <p className="text-xs text-primary font-medium">{story.type}</p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: story.rating || 5 }).map((_, j) => (
                      <FiStar key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
