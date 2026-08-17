// Maps site paths to the feature flag that controls them.
// Used by Navbar, Footer, and SearchModal to hide links to disabled features.
const PATH_FEATURES = {
  '/services': 'services',
  '/appointments': 'appointment_booking',
  '/contact': 'contact_form',
  '/faq': 'faq',
  '/careers': 'careers',
  '/upcoming': 'upcoming_projects',
  '/partners': 'partners_section',
  '/platforms': 'platforms_section',
  '/newsroom': 'blog',
  '/blog': 'blog',
  '/events': 'events',
  '/programmes': 'programme_registration',
  '/livecare': 'livecare',
  '/hear-menders': 'hear_menders',
  '/hear-menders/': 'hear_menders',
  '/portal': 'patient_portal',
  '/portal/': 'patient_portal',
}

// Dynamic paths whose children belong to the same feature.
const PREFIX_FEATURES = [
  ['/services/', 'services'],
  ['/blog/', 'blog'],
  ['/newsroom/', 'blog'],
  ['/events/', 'events'],
  ['/partner/', 'partners_section'],
  ['/portal/', 'patient_portal'],
]

export function featureKeyForPath(path) {
  if (!path) return null
  if (PATH_FEATURES[path]) return PATH_FEATURES[path]
  for (const [prefix, key] of PREFIX_FEATURES) {
    if (path.startsWith(prefix)) return key
  }
  return null
}

// Returns true when the path maps to a feature that is currently disabled.
export const isPathHidden = (path, isEnabled) => {
  const key = featureKeyForPath(path)
  return Boolean(key && !isEnabled(key))
}
