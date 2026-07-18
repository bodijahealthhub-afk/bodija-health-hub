import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronDown, FiChevronUp, FiSearch, FiArrowRight } from 'react-icons/fi'

const faqData = [
  {
    question: 'How do I book an appointment?',
    answer: 'You can book an appointment by calling our front desk at +234 800 000 0000, visiting any of our partner clinics in person, or reaching out through our Contact page. Our team will match you with the right provider and schedule a convenient time. For digital consultations via LiveCare or hEar Menders, you can book directly through the respective platforms.',
  },
  {
    question: 'What services does BHH offer?',
    answer: 'Bodija Health Hub provides a wide range of healthcare services through our ecosystem, including Primary Care, Specialist Consultations, Diagnostics & Laboratory, Hearing & Audiology, Physiotherapy, Chronic Disease Management, Elder Care, and Digital Health Solutions (LiveCare and hEar Menders). Our goal is to provide connected, comprehensive care for every stage of your health journey.',
  },
  {
    question: 'Do I need a referral?',
    answer: 'For most primary care services, no referral is needed — you can book directly. However, certain specialist consultations and procedures may require a referral from your primary care provider. Our team will advise you during the booking process if a referral is necessary for your specific case.',
  },
  {
    question: 'What insurance do you accept?',
    answer: 'BHH works with a growing network of insurance providers. Coverage and acceptance vary by partner clinic and service type. We recommend contacting our team before your appointment to verify your insurance coverage. We also offer flexible self-pay options for patients without insurance.',
  },
  {
    question: 'How do I access LiveCare?',
    answer: 'LiveCare is our digital elder care platform designed to support aging adults and their families. To get started, contact us through our Contact page or call +234 800 000 0000. Our team will set up your account, connect you with a caregiver network, and walk you through the platform\'s features including daily wellness check-ins, emergency alerts, and family access.',
  },
  {
    question: 'How do I access hEar Menders?',
    answer: 'hEar Menders is our digital hearing care platform. To access it, you can visit hEar Max Centre for an initial hearing assessment, or reach out through our Contact page for a virtual consultation. The platform provides virtual hearing assessments, audiology consultations, hearing aid support, and ongoing care management — all from the comfort of your home.',
  },
  {
    question: 'What are your working hours?',
    answer: 'Our partner clinics generally operate Monday through Friday from 8:00 AM to 6:00 PM, and Saturday from 9:00 AM to 2:00 PM. Specific hours may vary by location and service. Digital platforms like LiveCare and hEar Menders offer extended availability for virtual consultations and wellness monitoring. For holiday schedules, please contact us directly.',
  },
  {
    question: 'Where are you located?',
    answer: 'Bodija Health Hub is headquartered in Bodija, Ibadan, Oyo State, Nigeria. Our ecosystem includes multiple partner clinics and service points across the city. You can find specific location details on our Contact page or by calling our front desk. We are continuously expanding to serve more communities.',
  },
  {
    question: 'How can I become a partner?',
    answer: 'We welcome healthcare providers, specialists, clinics, and technology partners who share our vision of integrated, accessible care. Visit our Partners page or contact us at info@bodijahealthhub.com to learn about partnership opportunities. Our team will guide you through the onboarding process and discuss how you can be part of the BHH ecosystem.',
  },
  {
    question: 'Is there a patient portal?',
    answer: 'Yes. BHH is developing integrated patient access through our digital platforms. LiveCare provides family and patient dashboards for elder care, while hEar Menders offers hearing health management. A unified patient portal for accessing medical records, test results, and appointment history across the ecosystem is on our roadmap. Stay updated by registering your interest on our Upcoming page.',
  },
]

export default function FAQ() {
  const [search, setSearch] = useState('')
  const [openIndex, setOpenIndex] = useState(null)

  const filtered = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase()),
  )

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-teal-700 to-emerald-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto leading-relaxed mb-10">
            Find answers to common questions about our services, platforms, and how Bodija Health Hub works for you.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-white/50 outline-none text-sm"
            />
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">No questions match your search.</p>
              <button onClick={() => setSearch('')} className="text-primary font-medium hover:underline">
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item, i) => {
                const isOpen = openIndex === i
                return (
                  <div
                    key={i}
                    className="bg-warm-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggle(i)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
                      {isOpen ? (
                        <FiChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <FiChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Still Have Questions?
          </h2>
          <p className="text-teal-100 text-lg mb-10 max-w-2xl mx-auto">
            Our team is ready to help. Reach out to us and we'll get back to you as soon as possible.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-teal-50 transition-colors"
          >
            Contact Us
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
