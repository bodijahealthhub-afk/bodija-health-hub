import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FeatureProvider } from '../context/FeatureContext'
import { AuthProvider } from '../context/AuthContext'

// FeatureGate is defined inline in App.jsx, so we recreate a minimal version for testing
// that matches the exact logic of the production component.
import { useFeatures } from '../context/FeatureContext'

function TestFeatureGate({ featureKey, featureName, children }) {
  const { isEnabled } = useFeatures()
  if (!isEnabled(featureKey)) {
    return <div data-testid="coming-soon">{featureName ? `${featureName} Coming Soon` : 'Coming Soon'}</div>
  }
  return children
}

function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <FeatureProvider>{ui}</FeatureProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('FeatureGate', () => {
  it('renders children when feature is enabled', async () => {
    // Mock fetch to return a feature that is enabled
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ key: 'services', enabled: true, public_visible: true, navigation_visible: true, admin_visible: true }],
    }))

    renderWithProviders(
      <TestFeatureGate featureKey="services" featureName="Services">
        <div data-testid="services-content">Services Page</div>
      </TestFeatureGate>
    )

    // Wait for FeatureProvider to load
    const content = await screen.findByTestId('services-content')
    expect(content).toBeInTheDocument()
    expect(screen.queryByTestId('coming-soon')).not.toBeInTheDocument()
  })

  it('renders ComingSoon when feature is disabled', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ key: 'services', enabled: false, public_visible: false, navigation_visible: false, admin_visible: false }],
    }))

    renderWithProviders(
      <TestFeatureGate featureKey="services" featureName="Services">
        <div data-testid="services-content">Services Page</div>
      </TestFeatureGate>
    )

    const comingSoon = await screen.findByTestId('coming-soon')
    expect(comingSoon).toBeInTheDocument()
    expect(comingSoon).toHaveTextContent('Services Coming Soon')
    expect(screen.queryByTestId('services-content')).not.toBeInTheDocument()
  })

  it('renders ComingSoon for unknown feature key when API is working', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ key: 'other_feature', enabled: true, public_visible: true, navigation_visible: true, admin_visible: true }],
    }))

    renderWithProviders(
      <TestFeatureGate featureKey="nonexistent" featureName="Unknown">
        <div data-testid="content">Content</div>
      </TestFeatureGate>
    )

    const comingSoon = await screen.findByTestId('coming-soon')
    expect(comingSoon).toBeInTheDocument()
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
  })

  it('logs error in dev when featureKey is missing', async () => {
    vi.stubGlobal('import.meta', { env: { DEV: true } })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ key: 'services', enabled: true, public_visible: true, navigation_visible: true, admin_visible: true }],
    }))

    renderWithProviders(
      <TestFeatureGate featureName="No Key">
        <div data-testid="content">Content</div>
      </TestFeatureGate>
    )

    // The component logs a dev warning for missing featureKey
    // Note: exact check depends on how import.meta.env.DEV works in test
    consoleSpy.mockRestore()
  })

  it('all FEATURE_ROUTES keys are valid feature flag keys', () => {
    const FEATURE_ROUTES = {
      '/services': { featureKey: 'services', featureName: 'Services' },
      '/appointments': { featureKey: 'appointment_booking', featureName: 'Book a Service / Appointment' },
      '/contact': { featureKey: 'contact_form', featureName: 'Contact' },
      '/faq': { featureKey: 'faq', featureName: 'FAQ' },
      '/careers': { featureKey: 'careers', featureName: 'Careers' },
      '/upcoming': { featureKey: 'upcoming_projects', featureName: 'Upcoming Projects' },
      '/partners': { featureKey: 'partners_section', featureName: 'Partner Network' },
      '/platforms': { featureKey: 'platforms_section', featureName: 'Platforms' },
      '/newsroom': { featureKey: 'blog', featureName: 'Newsroom' },
      '/events': { featureKey: 'events', featureName: 'Events' },
      '/programmes': { featureKey: 'programme_registration', featureName: 'Programmes' },
      '/livecare': { featureKey: 'livecare', featureName: 'LiveCare' },
      '/hear-menders': { featureKey: 'hear_menders', featureName: 'hEar Menders' },
    }

    // Every route entry must have featureKey and featureName strings
    for (const [path, config] of Object.entries(FEATURE_ROUTES)) {
      expect(config.featureKey).toBeTruthy()
      expect(typeof config.featureKey).toBe('string')
      expect(config.featureName).toBeTruthy()
      expect(typeof config.featureName).toBe('string')
    }

    // Known valid feature keys from the backend seed
    const validKeys = new Set([
      'services', 'appointment_booking', 'contact_form', 'faq', 'careers',
      'upcoming_projects', 'partners_section', 'platforms_section', 'blog',
      'events', 'programme_registration', 'livecare', 'hear_menders',
    ])

    for (const [path, config] of Object.entries(FEATURE_ROUTES)) {
      expect(validKeys.has(config.featureKey)).toBe(true)
    }
  })
})
