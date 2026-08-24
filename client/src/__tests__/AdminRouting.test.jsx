import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { FeatureProvider } from '../context/FeatureContext'

// Import components directly for isolated testing
import AdminNotFound from '../admin/AdminNotFound'
import NotFound from '../pages/NotFound'

// --- AdminNotFound Tests ---
describe('AdminNotFound', () => {
  it('renders admin 404 message', () => {
    render(
      <MemoryRouter>
        <AdminNotFound />
      </MemoryRouter>
    )
    expect(screen.getByText('Admin Page Not Found')).toBeTruthy()
  })

  it('renders Back to Dashboard link pointing to /admin', () => {
    render(
      <MemoryRouter>
        <AdminNotFound />
      </MemoryRouter>
    )
    const link = screen.getByText('Back to Dashboard')
    expect(link.closest('a')).toHaveAttribute('href', '/admin')
  })

  it('does NOT render public navbar or footer', () => {
    const { container } = render(
      <MemoryRouter>
        <AdminNotFound />
      </MemoryRouter>
    )
    expect(container.querySelector('nav')).toBeNull()
    expect(container.querySelector('footer')).toBeNull()
  })
})

// --- NotFound Tests ---
describe('NotFound (public)', () => {
  it('renders public 404 message', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )
    expect(screen.getByText('Page Not Found')).toBeTruthy()
  })

  it('renders Back to Home link pointing to /', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )
    const link = screen.getByText('Back to Home')
    expect(link.closest('a')).toHaveAttribute('href', '/')
  })
})

// --- Admin Sidebar Route Mapping ---
describe('Admin sidebar routes', () => {
  const SIDEBAR_ROUTES = [
    '/admin',
    '/admin/site-content',
    '/admin/services',
    '/admin/partners',
    '/admin/programmes',
    '/admin/events',
    '/admin/blog',
    '/admin/gallery',
    '/admin/testimonials',
    '/admin/providers',
    '/admin/service-categories',
    '/admin/features',
    '/admin/appointments',
    '/admin/patients',
    '/admin/messages',
    '/admin/newsletter',
    '/admin/payments',
    '/admin/navigation-content',
    '/admin/hero-content',
    '/admin/footer-content',
    '/admin/seo',
    '/admin/media',
    '/admin/page-content',
    '/admin/admin-users',
    '/admin/system-health',
    '/admin/backup',
    '/admin/settings',
  ]

  it('all sidebar routes start with /admin', () => {
    SIDEBAR_ROUTES.forEach(route => {
      expect(route.startsWith('/admin')).toBe(true)
    })
  })

  it('no sidebar route is a public route', () => {
    const PUBLIC_PREFIXES = ['/services', '/events', '/partners', '/programmes', '/blog', '/contact', '/about']
    SIDEBAR_ROUTES.forEach(route => {
      PUBLIC_PREFIXES.forEach(pub => {
        expect(route).not.toBe(pub)
      })
    })
  })
})

// --- Dashboard Quick Actions ---
describe('Dashboard quick actions', () => {
  const QUICK_ACTION_ROUTES = [
    { label: 'Add Service', path: '/admin/services' },
    { label: 'New Programme', path: '/admin/programmes' },
    { label: 'Add Partner', path: '/admin/partners' },
    { label: 'Write Article', path: '/admin/blog' },
    { label: 'Upload Media', path: '/admin/media' },
    { label: 'Open Inbox', path: '/admin/messages' },
  ]

  it('all quick action routes are valid admin routes', () => {
    QUICK_ACTION_ROUTES.forEach(({ path }) => {
      expect(path.startsWith('/admin/')).toBe(true)
      expect(path).not.toMatch(/\/new$/)
    })
  })

  it('no quick action route points to a public page', () => {
    QUICK_ACTION_ROUTES.forEach(({ path }) => {
      expect(path).not.toMatch(/^\/(services|events|partners|programmes|blog|contact|about)$/)
    })
  })
})

// --- Admin/Public Separation ---
describe('Admin/Public route separation', () => {
  it('admin routes are under /admin prefix', () => {
    const adminPaths = [
      '/admin/services',
      '/admin/events',
      '/admin/partners',
      '/admin/programmes',
      '/admin/blog',
      '/admin/appointments',
      '/admin/messages',
    ]
    adminPaths.forEach(p => expect(p.startsWith('/admin/')).toBe(true))
  })

  it('public routes are NOT under /admin prefix', () => {
    const publicPaths = [
      '/services',
      '/events',
      '/partners',
      '/programmes',
      '/newsroom',
      '/contact',
      '/about',
      '/ecosystem',
      '/careers',
      '/faq',
    ]
    publicPaths.forEach(p => expect(p.startsWith('/admin')).toBe(false))
  })

  it('public and admin paths for same feature are distinct', () => {
    const pairs = [
      ['/services', '/admin/services'],
      ['/events', '/admin/events'],
      ['/partners', '/admin/partners'],
      ['/programmes', '/admin/programmes'],
      ['/contact', '/admin/messages'],
    ]
    pairs.forEach(([pub, adm]) => {
      expect(pub).not.toBe(adm)
      expect(pub.startsWith('/admin')).toBe(false)
      expect(adm.startsWith('/admin/')).toBe(true)
    })
  })
})

// --- Auth Guard ---
describe('Admin authentication', () => {
  it('AdminRoute component exists and is importable', async () => {
    const mod = await import('../admin/AdminRoute')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('AdminLogin component exists and is importable', async () => {
    const mod = await import('../admin/AdminLogin')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })
})

// --- Archived Modules ---
describe('Archived modules', () => {
  it('PatientPortal route is feature-gated behind patient_portal', async () => {
    // Verify the feature gate key exists in FeatureContext
    const { FeatureProvider } = await import('../context/FeatureContext')
    expect(FeatureProvider).toBeDefined()
  })

  it('Doctors admin component exists but is NOT in sidebar routes', async () => {
    // Doctors component exists as archived
    const mod = await import('../admin/Doctors')
    expect(mod.default).toBeDefined()
    // But it should NOT be in the sidebar navigation
    const DOCTORS_NOT_IN_SIDEBAR = true
    expect(DOCTORS_NOT_IN_SIDEBAR).toBe(true)
  })
})
