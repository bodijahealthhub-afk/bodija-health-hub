import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiTag } from 'react-icons/fi'

const categories = ['All', 'Hearing', 'Chronic Disease', 'Elder Care', 'Child Health', 'Mental Health']

const articles = [
  {
    title: 'Understanding Hearing Loss',
    excerpt: 'Hearing loss affects millions of people worldwide, yet many go untreated for years. Learn about the common causes, early warning signs, and the range of solutions available through modern audiology.',
    category: 'Hearing',
    readTime: '5 min read',
  },
  {
    title: 'Managing Hypertension',
    excerpt: 'High blood pressure is one of the most common chronic conditions in Nigeria. Discover practical strategies for monitoring, lifestyle changes, and when to seek specialist care.',
    category: 'Chronic Disease',
    readTime: '4 min read',
  },
  {
    title: 'Diabetes Prevention Tips',
    excerpt: 'Type 2 diabetes is largely preventable. This guide covers dietary adjustments, physical activity, risk factors, and the importance of regular screening for early detection.',
    category: 'Chronic Disease',
    readTime: '6 min read',
  },
  {
    title: 'Elder Care Best Practices',
    excerpt: 'Caring for aging adults requires patience, knowledge, and the right support. Learn about daily wellness routines, caregiver coordination, and how digital tools like LiveCare can help.',
    category: 'Elder Care',
    readTime: '5 min read',
  },
  {
    title: 'Child Vaccination Guide',
    excerpt: 'Vaccinations are one of the most effective tools for protecting children from serious diseases. Understand the recommended schedule, common concerns, and where to access immunization services.',
    category: 'Child Health',
    readTime: '4 min read',
  },
  {
    title: 'Mental Health Awareness',
    excerpt: 'Mental health is an essential part of overall well-being. Break the stigma, recognize the signs of common mental health conditions, and learn about the support available in our community.',
    category: 'Mental Health',
    readTime: '5 min read',
  },
]

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? articles
    : articles.filter((a) => a.category === activeCategory)

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-teal-700 to-emerald-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            Health Resources
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Health Resources
          </h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto leading-relaxed">
            Stay informed with trusted health articles, guides, and tips from the Bodija Health Hub team and our network of healthcare professionals.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <FiTag className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-warm-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No articles in this category yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((article) => (
                <article
                  key={article.title}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow group"
                >
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-emerald-50 flex items-center justify-center">
                    <span className="text-primary/30 text-6xl font-bold">{article.title.charAt(0)}</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                        {article.category}
                      </span>
                      <span className="text-gray-400 text-xs">{article.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                      {article.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1 text-primary font-medium text-sm group-hover:gap-2 transition-all cursor-pointer">
                      Read More <FiArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Have a Health Question?
          </h2>
          <p className="text-teal-100 text-lg mb-10 max-w-2xl mx-auto">
            Our team of healthcare professionals is here to help. Reach out and we'll provide the guidance you need.
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
