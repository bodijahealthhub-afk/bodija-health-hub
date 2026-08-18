import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const FeatureContext = createContext(null)

// While the feature list loads we default to "enabled" so pages and links never
// flash away unexpectedly. After loading, if the API returned no flags (backend
// unreachable), we fail-open so the homepage isn't blank.  Only when the API
// returned flags do we respect the stored enabled value.
const defaultEnabled = true

export function FeatureProvider({ children }) {
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

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
      setLoaded(true)
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
      if (f) return Boolean(f.enabled)
      // While loading, show everything.  After loading, if the API returned
      // flags we don't recognise, disable them (fail-closed for unknown flags
      // from a working API).  But if the API returned nothing at all (empty
      // array = backend down), fail-open so the site stays usable.
      if (loading) return defaultEnabled
      if (loaded && features.length === 0) return true
      return false
    },
    [byKey, loading, loaded, features]
  )

  const isVisible = useCallback(
    (key, mode = 'public') => {
      const f = byKey(key)
      if (f) {
        if (mode === 'nav') return Boolean(f.navigation_visible)
        if (mode === 'admin') return Boolean(f.admin_visible)
        return Boolean(f.public_visible)
      }
      if (loading) return defaultEnabled
      if (loaded && features.length === 0) return true
      return false
    },
    [byKey, loading, loaded, features]
  )

  return (
    <FeatureContext.Provider value={{ features, loading, isEnabled, isVisible, byKey, refresh }}>
      {children}
    </FeatureContext.Provider>
  )
}

export const useFeatures = () => useContext(FeatureContext)
