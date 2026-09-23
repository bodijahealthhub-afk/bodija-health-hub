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

const enabledFeature = (key) => ({
  key, enabled: true, navigation_visible: true, public_visible: true, admin_visible: true,
})
const disabledFeature = (key) => ({
  key, enabled: false, navigation_visible: false, public_visible: false, admin_visible: false,
})

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('Navbar', () => {
  it('renders all default links when all features enabled', async () => {
    const features = [
      enabledFeature('partners_section'),
      enabledFeature('platforms_section'),
      enabledFeature('upcoming_projects'),
      enabledFeature('contact_form'),
      enabledFeature('appointment_booking'),
    ]
    renderNavbar({ features })

    await waitFor(() => {
      expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1)
    })

    expect(screen.getAllByText('About Us').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('The Ecosystem').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Our Partners').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Our Platforms').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Upcoming Projects').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Contact Us').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Get Started').length).toBeGreaterThanOrEqual(1)
  })

  it('shows Book a Service button when appointment_booking enabled', async () => {
    const features = [
      enabledFeature('appointment_booking'),
      enabledFeature('partners_section'),
      enabledFeature('platforms_section'),
      enabledFeature('upcoming_projects'),
      enabledFeature('contact_form'),
    ]
    renderNavbar({ features })

    await waitFor(() => {
      expect(screen.getAllByText('Book a Service').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('hides Book a Service button when appointment_booking disabled', async () => {
    const features = [
      disabledFeature('appointment_booking'),
      enabledFeature('partners_section'),
      enabledFeature('platforms_section'),
      enabledFeature('upcoming_projects'),
      enabledFeature('contact_form'),
    ]
    renderNavbar({ features })

    await waitFor(() => {
      expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1)
    })

    expect(screen.queryByText('Book a Service')).not.toBeInTheDocument()
  })

  it('hides Our Partners link when partners_section feature is disabled', async () => {
    const features = [
      disabledFeature('partners_section'),
      enabledFeature('platforms_section'),
      enabledFeature('upcoming_projects'),
      enabledFeature('contact_form'),
    ]
    renderNavbar({ features })

    await waitFor(() => {
      expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1)
    })

    expect(screen.queryAllByText('Our Partners')).toHaveLength(0)
    expect(screen.getAllByText('About Us').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Contact Us').length).toBeGreaterThanOrEqual(1)
  })
})
