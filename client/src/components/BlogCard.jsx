import { Link } from 'react-router-dom'

export default function BlogCard({ post }) {
  return (
    <Link
      to={`/blog/${post._id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
        {post.featuredImage || post.image ? (
          <img
            src={post.featuredImage || post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
        )}
      </div>
      <div className="p-6">
        {post.category && (
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
            {post.category}
          </span>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
          {post.excerpt || post.summary}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
          {post.author && <span>By {post.author.name || post.author}</span>}
        </div>
      </div>
    </Link>
  )
}
