import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { FeatureProvider } from '../context/FeatureContext'
import { AuthProvider } from '../context/AuthContext'
import { useFeatures } from '../context/FeatureContext'
import FeatureUnavailable from '../components/FeatureUnavailable'

// Minimal FeatureGate component matching App.jsx logic
function FeatureGate({ featureKey, featureName, children }) {
  const { isEnabled } = useFeatures()
  if (!isEnabled(featureKey)) {
    return <FeatureUnavailable featureName={featureName} />
  }
  return children
}

function renderWithRouting({ features = [], initialRoute = '/' } = {}) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => features,
  }))

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <FeatureProvider>
          <Routes>
            <Route path="/" element={<div data-testid="home">Home Page</div>} />
            <Route path="/about" element={<div data-testid="about">About Page</div>} />
            <Route path="/ecosystem" element={<div data-testid="ecosystem">Ecosystem Page</div>} />
            <Route path="/bacr" element={<div data-testid="bacr">BACR Page</div>} />
            <Route path="/services" element={
              <FeatureGate featureKey="services" featureName="Services">
                <div data-testid="services">Services Page</div>
              </FeatureGate>
            } />
            <Route path="/partners" element={
              <FeatureGate featureKey="partners_section" featureName="Partner Network">
                <div data-testid="partners">Partners Page</div>
              </FeatureGate>
            } />
            <Route path="/newsroom" element={
              <FeatureGate featureKey="blog" featureName="Newsroom">
                <div data-testid="newsroom">Newsroom Page</div>
              </FeatureGate>
            } />
            <Route path="/contact" element={
              <FeatureGate featureKey="contact_form" featureName="Contact">
                <div data-testid="contact">Contact Page</div>
              </FeatureGate>
            } />
            <Route path="/portal" element={
              <FeatureGate featureKey="patient_portal" featureName="Patient Portal">
                <div data-testid="portal">Patient Portal</div>
              </FeatureGate>
            } />
          </Routes>
        </FeatureProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('Public Routes', () => {
  it('/ renders Home (no FeatureGate)', async () => {
    renderWithRouting({ initialRoute: '/' })
    expect(screen.getByTestId('home')).toBeInTheDocument()
    expect(screen.getByText('Home Page')).toBeInTheDocument()
  })

  it('/about renders About (no FeatureGate)', async () => {
    renderWithRouting({ initialRoute: '/about' })
    expect(screen.getByTestId('about')).toBeInTheDocument()
  })

  it('/ecosystem renders Ecosystem (no FeatureGate)', async () => {
    renderWithRouting({ initialRoute: '/ecosystem' })
    expect(screen.getByTestId('ecosystem')).toBeInTheDocument()
  })

  it('/bacr renders BACR (no FeatureGate)', async () => {
    renderWithRouting({ initialRoute: '/bacr' })
    expect(screen.getByTestId('bacr')).toBeInTheDocument()
  })

  it('/services renders Services when services enabled', async () => {
    renderWithRouting({
      initialRoute: '/services',
      features: [{ key: 'services', enabled: true, public_visible: true, navigation_visible: true, admin_visible: true }],
    })
    await waitFor(() => {
      expect(screen.getByTestId('services')).toBeInTheDocument()
    })
  })

  it('/services renders ComingSoon when services disabled', async () => {
    renderWithRouting({
      initialRoute: '/services',
      features: [{ key: 'services', enabled: false, public_visible: false, navigation_visible: false, admin_visible: false }],
    })
    await waitFor(() => {
      expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
    })
    expect(screen.queryByTestId('services')).not.toBeInTheDocument()
  })

  it('/portal renders ComingSoon (patient_portal archived)', async () => {
    renderWithRouting({
      initialRoute: '/portal',
      features: [{ key: 'patient_portal', enabled: false, public_visible: false, navigation_visible: false, admin_visible: false }],
    })
    await waitFor(() => {
      expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
    })
    expect(screen.queryByTestId('portal')).not.toBeInTheDocument()
  })

  it('/partners renders when partners_section enabled', async () => {
    renderWithRouting({
      initialRoute: '/partners',
      features: [{ key: 'partners_section', enabled: true, public_visible: true, navigation_visible: true, admin_visible: true }],
    })
    await waitFor(() => {
      expect(screen.getByTestId('partners')).toBeInTheDocument()
    })
  })

  it('/newsroom renders when blog enabled', async () => {
    renderWithRouting({
      initialRoute: '/newsroom',
      features: [{ key: 'blog', enabled: true, public_visible: true, navigation_visible: true, admin_visible: true }],
    })
    await waitFor(() => {
      expect(screen.getByTestId('newsroom')).toBeInTheDocument()
    })
  })

  it('/contact renders when contact_form enabled', async () => {
    renderWithRouting({
      initialRoute: '/contact',
      features: [{ key: 'contact_form', enabled: true, public_visible: true, navigation_visible: true, admin_visible: true }],
    })
    await waitFor(() => {
      expect(screen.getByTestId('contact')).toBeInTheDocument()
    })
  })
})
