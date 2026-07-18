import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiArrowRight } from 'react-icons/fi'

export default function Newsroom() {
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  useEffect(() => { fetch('/api/blog').then(r => r.json()).then(d => setPosts(Array.isArray(d) ? d : d.posts || [])).catch(() => {}) }, [])

  const filtered = search ? posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || (p.excerpt || '').toLowerCase().includes(search.toLowerCase())) : posts

  return (
    <div>
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">Newsroom</span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Latest News & Updates</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">Stay informed with the latest from Bodija Health Hub.</p>
          <div className="mt-8 max-w-md mx-auto relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search news..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-400 focus:ring-2 focus:ring-white/50" />
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No news articles found.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((post, i) => (
                <Link key={i} to={`/blog/${post.slug}`} className="bg-warm-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow group">
                  {post.featured_image && <img src={post.featured_image} alt={post.title} className="w-full h-48 object-cover" />}
                  <div className="p-6">
                    <span className="text-xs text-primary font-medium">{post.category || 'News'}</span>
                    <h3 className="font-bold text-gray-900 mt-2 mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                    <span className="inline-flex items-center gap-1 text-primary font-medium text-sm mt-4 group-hover:gap-2 transition-all">Read More <FiArrowRight className="w-4 h-4" /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
