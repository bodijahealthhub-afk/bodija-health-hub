import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FeatureProvider, useFeatures } from '../context/FeatureContext'
import { AuthProvider } from '../context/AuthContext'

function TestConsumer({ testKey }) {
  const { isEnabled, isVisible, loading } = useFeatures()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="enabled">{String(isEnabled(testKey))}</span>
      <span data-testid="visible">{String(isVisible(testKey))}</span>
    </div>
  )
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
  localStorage.clear()
})

describe('FeatureContext', () => {
  it('isEnabled returns true while loading (fail-open)', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {}))) // never resolves

    renderWithProviders(<TestConsumer testKey="services" />)

    // While loading, isEnabled should return true (fail-open default)
    expect(screen.getByTestId('loading').textContent).toBe('true')
    expect(screen.getByTestId('enabled').textContent).toBe('true')
  })

  it('isEnabled returns true when API returns empty array (fail-open for backend down)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }))

    renderWithProviders(<TestConsumer testKey="services" />)

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
    expect(screen.getByTestId('enabled').textContent).toBe('true')
  })

  it('isEnabled returns true for known enabled feature', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ key: 'services', enabled: true, public_visible: true, navigation_visible: true, admin_visible: true }],
    }))

    renderWithProviders(<TestConsumer testKey="services" />)

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
    expect(screen.getByTestId('enabled').textContent).toBe('true')
  })

  it('isEnabled returns false for known disabled feature', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ key: 'services', enabled: false, public_visible: false, navigation_visible: false, admin_visible: false }],
    }))

    renderWithProviders(<TestConsumer testKey="services" />)

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
    expect(screen.getByTestId('enabled').textContent).toBe('false')
  })

  it('isEnabled returns false for unknown feature when API is working', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ key: 'other_feature', enabled: true, public_visible: true, navigation_visible: true, admin_visible: true }],
    }))

    renderWithProviders(<TestConsumer testKey="nonexistent" />)

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
    expect(screen.getByTestId('enabled').textContent).toBe('false')
  })

  it('isVisible returns navigation_visible for nav mode', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{
        key: 'services', enabled: true,
        public_visible: true, navigation_visible: false, admin_visible: true,
      }],
    }))

    function NavTest() {
      const { isVisible } = useFeatures()
      return (
        <span data-testid="nav-visible">{String(isVisible('services', 'nav'))}</span>
      )
    }

    renderWithProviders(
      <NavTest />
    )

    await waitFor(() => {
      expect(screen.getByTestId('nav-visible').textContent).toBe('false')
    })
  })

  it('isEnabled returns true when fetch fails (fail-open)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    renderWithProviders(<TestConsumer testKey="services" />)

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
    expect(screen.getByTestId('enabled').textContent).toBe('true')
  })
})
