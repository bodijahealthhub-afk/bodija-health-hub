import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiCalendar, FiUser, FiEye } from 'react-icons/fi'

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog/${slug}`)
        if (!res.ok) throw new Error('Not found')
        const data = await res.json()
        setPost(data)
        document.title = data.meta_title || data.title
        const metaDesc = document.querySelector('meta[name="description"]')
        if (metaDesc && data.meta_description) metaDesc.setAttribute('content', data.meta_description)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Article not found</h1>
          <p className="text-gray-500 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link to="/newsroom" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
            <FiArrowLeft className="w-4 h-4" /> Back to Newsroom
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {post.category && (
            <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">{post.category}</span>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold mb-6">{post.title}</h1>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-300">
            {post.author_name && (
              <span className="flex items-center gap-1"><FiUser className="w-4 h-4" /> {post.author_name}</span>
            )}
            {post.created_at && (
              <span className="flex items-center gap-1">
                <FiCalendar className="w-4 h-4" /> {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
            {post.views != null && (
              <span className="flex items-center gap-1"><FiEye className="w-4 h-4" /> {post.views} views</span>
            )}
          </div>
        </div>
      </section>

      <article className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          {post.featured_image && (
            <img src={post.featured_image} alt={post.title} loading="lazy" className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-10" />
          )}
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link to="/newsroom" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
              <FiArrowLeft className="w-4 h-4" /> Back to Newsroom
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
