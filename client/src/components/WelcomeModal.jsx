import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiX, FiArrowRight, FiHeart } from 'react-icons/fi'
import { useFeatures } from '../context/FeatureContext'

const STORAGE_KEY = 'bhh_welcome_modal_seen'

export default function WelcomeModal() {
  const { isEnabled } = useFeatures()
  const [visible, setVisible] = useState(false)
  const [content, setContent] = useState({
    title: 'Welcome to Bodija Health Hub',
    subtitle: 'Discover quality, coordinated healthcare for your whole family — right here in the heart of Ibadan.',
    cta_text: 'Explore Our Services',
    cta_link: '/services',
  })

  useEffect(() => {
    if (!isEnabled('welcome_modal')) return
    if (localStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(timer)
  }, [isEnabled])

  useEffect(() => {
    if (!visible) return
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/site-content')
        if (res.ok) {
          const data = await res.json()
          setContent((prev) => ({
            title: data.welcome_modal_title || prev.title,
            subtitle: data.welcome_modal_subtitle || prev.subtitle,
            cta_text: data.welcome_modal_cta_text || prev.cta_text,
            cta_link: data.welcome_modal_cta_link || prev.cta_link,
          }))
        }
      } catch {
        // Use defaults
      }
    }
    fetchContent()
  }, [visible])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="welcome-modal-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-br from-primary to-teal-700 px-8 py-10 text-white">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mb-5">
            <FiHeart className="w-7 h-7" />
          </div>
          <h2 id="welcome-modal-title" className="text-2xl font-bold leading-snug">{content.title}</h2>
        </div>

        <div className="px-8 py-8">
          <p className="text-gray-500 leading-relaxed mb-8">{content.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={content.cta_link || '/services'}
              onClick={dismiss}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-colors"
            >
              {content.cta_text}
              <FiArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={dismiss}
              className="px-6 py-3 text-gray-600 font-medium rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
