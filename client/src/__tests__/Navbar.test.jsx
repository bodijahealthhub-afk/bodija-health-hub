import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FeatureProvider } from '../context/FeatureContext'
import { AuthProvider } from '../context/AuthContext'
import Navbar from '../components/Navbar'

function renderNavbar({ features = [], route = '/' } = {}) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => features,
  }))

  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <FeatureProvider>
          <Navbar />
        </FeatureProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('Navbar', () => {
  it('renders all default links when all features enabled', async () => {
    const features = [
      { key: 'services', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
      { key: 'partners_section', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
      { key: 'blog', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
      { key: 'contact_form', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
      { key: 'appointment_booking', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
    ]
    renderNavbar({ features })

    await waitFor(() => {
      expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1)
    })

    expect(screen.getAllByText('Services').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Partners').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Contact').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Get Started').length).toBeGreaterThanOrEqual(1)
  })

  it('shows Book a Service button when appointment_booking enabled', async () => {
    const features = [
      { key: 'appointment_booking', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
      { key: 'services', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
      { key: 'partners_section', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
      { key: 'blog', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
      { key: 'contact_form', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
    ]
    renderNavbar({ features })

    await waitFor(() => {
      expect(screen.getAllByText('Book a Service').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('hides Book a Service button when appointment_booking disabled', async () => {
    const features = [
      { key: 'appointment_booking', enabled: false, navigation_visible: false, public_visible: false, admin_visible: false },
      { key: 'services', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
      { key: 'partners_section', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
      { key: 'blog', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
      { key: 'contact_form', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
    ]
    renderNavbar({ features })

    await waitFor(() => {
      expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1)
    })

    expect(screen.queryByText('Book a Service')).not.toBeInTheDocument()
  })

  it('hides Services link when services feature is disabled', async () => {
    const features = [
      { key: 'services', enabled: false, navigation_visible: false, public_visible: false, admin_visible: false },
      { key: 'partners_section', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
      { key: 'blog', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
      { key: 'contact_form', enabled: true, navigation_visible: true, public_visible: true, admin_visible: true },
    ]
    renderNavbar({ features })

    await waitFor(() => {
      expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1)
    })

    // "Services" link should be hidden but "Partners" and others remain
    expect(screen.queryAllByText('Services')).toHaveLength(0)
    expect(screen.getAllByText('Partners').length).toBeGreaterThanOrEqual(1)
  })
})
