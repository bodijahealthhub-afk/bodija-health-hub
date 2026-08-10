import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const FeatureContext = createContext(null)

// While the feature list loads (or for keys with no flag entry) we default to
// "enabled" so pages and links never flash away or disappear unexpectedly.
const defaultEnabled = true

export function FeatureProvider({ children }) {
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/features')
      if (res.ok) {
        const data = await res.json()
        setFeatures(Array.isArray(data) ? data : [])
      }
    } catch {
      // Keep whatever we have; features default to enabled.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const byKey = useCallback(
    (key) => features.find((f) => f.key === key),
    [features]
  )

  const isEnabled = useCallback(
    (key) => {
      const f = byKey(key)
      if (!f) return defaultEnabled
      return Boolean(f.enabled)
    },
    [byKey]
  )

  const isVisible = useCallback(
    (key, mode = 'public') => {
      const f = byKey(key)
      if (!f) return defaultEnabled
      if (mode === 'nav') return Boolean(f.navigation_visible)
      if (mode === 'admin') return Boolean(f.admin_visible)
      return Boolean(f.public_visible)
    },
    [byKey]
  )

  return (
    <FeatureContext.Provider value={{ features, loading, isEnabled, isVisible, byKey, refresh }}>
      {children}
    </FeatureContext.Provider>
  )
}

export const useFeatures = () => useContext(FeatureContext)
