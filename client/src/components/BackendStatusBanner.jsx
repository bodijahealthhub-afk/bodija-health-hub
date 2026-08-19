import { useState, useEffect } from 'react'
import { FiWifiOff, FiX } from 'react-icons/fi'

export default function BackendStatusBanner() {
  const [offline, setOffline] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false
    let timer

    const check = () => {
      fetch('/api/health', { method: 'GET' })
        .then(r => {
          if (!cancelled) setOffline(!r.ok)
        })
        .catch(() => {
          if (!cancelled) setOffline(true)
        })
    }

    check()
    timer = setInterval(check, 60000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [])

  if (!offline || dismissed) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 px-4 sm:px-6 lg:px-8 pt-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm shadow-sm">
          <div className="flex items-center gap-2.5">
            <FiWifiOff className="w-4 h-4 shrink-0" />
            <span>Content temporarily unavailable. Retrying automatically.</span>
          </div>
          <button onClick={() => setDismissed(true)} className="shrink-0 p-1 rounded-md hover:bg-amber-100 transition-colors" aria-label="Dismiss">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
