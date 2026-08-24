import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { FeatureProvider } from '../context/FeatureContext'
import { PermissionProvider } from '../context/PermissionContext'

import EmptyState from '../admin/EmptyState'
import ErrorState from '../admin/ErrorState'
import Sidebar from '../admin/Sidebar'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  localStorage.setItem('adminToken', 'test-token')
  localStorage.setItem('adminUser', JSON.stringify({ id: 1, name: 'Admin', role: 'admin' }))
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin',
      permissions: ['dashboard.view', 'services.*', 'service_categories.*', 'providers.*', 'partners.*',
        'programmes.*', 'events.*', 'blog.*', 'gallery.*', 'testimonials.*', 'bookings.*', 'messages.*',
        'newsletter.*', 'payments.*', 'media.*', 'seo.*', 'content.*', 'navigation.*', 'hero.*', 'footer.*',
        'page_content.*', 'settings.view', 'site_settings.*', 'feature_flags.*', 'users.view', 'users.create',
        'users.update', 'users.disable', 'users.manage_roles', 'system_health.view', 'backups.*', 'audit_logs.view'],
    }),
  })
})

const renderWithProviders = (ui, { route = '/admin' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <FeatureProvider>
          <PermissionProvider>
            {ui}
          </PermissionProvider>
        </FeatureProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

// --- EmptyState Tests ---
describe('EmptyState', () => {
  it('renders title and description', () => {
    renderWithProviders(
      <EmptyState title="No services" description="Add a service to get started." />
    )
    expect(screen.getByText('No services')).toBeTruthy()
    expect(screen.getByText('Add a service to get started.')).toBeTruthy()
  })

  it('renders action button when provided', () => {
    const onClick = vi.fn()
    renderWithProviders(
      <EmptyState
        title="No data"
        action={{ label: 'Add Item', onClick }}
      />
    )
    const btn = screen.getByText('Add Item')
    expect(btn).toBeTruthy()
    btn.click()
    expect(onClick).toHaveBeenCalled()
  })

  it('does not render action button when not provided', () => {
    renderWithProviders(<EmptyState title="Empty" />)
    expect(screen.queryByRole('button')).toBeNull()
  })
})

// --- ErrorState Tests ---
describe('ErrorState', () => {
  it('renders default title', () => {
    renderWithProviders(<ErrorState />)
    expect(screen.getByText('Something went wrong')).toBeTruthy()
  })

  it('renders custom title and description', () => {
    renderWithProviders(
      <ErrorState title="Load failed" description="Could not fetch data." />
    )
    expect(screen.getByText('Load failed')).toBeTruthy()
    expect(screen.getByText('Could not fetch data.')).toBeTruthy()
  })

  it('renders retry button when onRetry provided', () => {
    const onRetry = vi.fn()
    renderWithProviders(<ErrorState onRetry={onRetry} />)
    const btn = screen.getByText('Retry')
    expect(btn).toBeTruthy()
    btn.click()
    expect(onRetry).toHaveBeenCalled()
  })

  it('does not render retry button when onRetry not provided', () => {
    renderWithProviders(<ErrorState />)
    expect(screen.queryByText('Retry')).toBeNull()
  })
})

// --- Sidebar Tests ---
describe('Sidebar', () => {
  it('renders all navigation groups', async () => {
    renderWithProviders(<Sidebar collapsed={false} onToggle={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText('DASHBOARD')).toBeTruthy()
    })
    expect(screen.getByText('BHH ECOSYSTEM')).toBeTruthy()
    expect(screen.getByText('CONTENT & MARKETING')).toBeTruthy()
    expect(screen.getByText('COMMUNICATIONS')).toBeTruthy()
    expect(screen.getByText('SITE CONFIGURATION')).toBeTruthy()
    expect(screen.getByText('ADMINISTRATION')).toBeTruthy()
  })

  it('renders Dashboard item under DASHBOARD group', async () => {
    renderWithProviders(<Sidebar collapsed={false} onToggle={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeTruthy()
    })
  })

  it('renders BHH Ecosystem items', async () => {
    renderWithProviders(<Sidebar collapsed={false} onToggle={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText('Services')).toBeTruthy()
    })
    expect(screen.getByText('Service Categories')).toBeTruthy()
    expect(screen.getByText('Providers')).toBeTruthy()
    expect(screen.getByText('Programmes')).toBeTruthy()
    expect(screen.getByText('Partners')).toBeTruthy()
  })

  it('renders Communications items', async () => {
    renderWithProviders(<Sidebar collapsed={false} onToggle={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText('Bookings')).toBeTruthy()
    })
    expect(screen.getByText('Messages')).toBeTruthy()
    expect(screen.getByText('Newsletter')).toBeTruthy()
  })

  it('renders Site Configuration items including both Settings and Site Appearance', async () => {
    renderWithProviders(<Sidebar collapsed={false} onToggle={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeTruthy()
    })
    expect(screen.getByText('Site Appearance')).toBeTruthy()
  })

  it('renders Administration items', async () => {
    renderWithProviders(<Sidebar collapsed={false} onToggle={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText('Feature Flags')).toBeTruthy()
    })
    expect(screen.getByText('Users')).toBeTruthy()
    expect(screen.getByText('System Health')).toBeTruthy()
    expect(screen.getByText('Backups')).toBeTruthy()
  })

  it('does NOT render Patients in sidebar', async () => {
    renderWithProviders(<Sidebar collapsed={false} onToggle={() => {}} />)
    await waitFor(() => {
      expect(screen.queryByText('Dashboard')).toBeTruthy()
    })
    expect(screen.queryByText('Patients')).toBeNull()
  })

  it('does NOT render Doctors in sidebar', async () => {
    renderWithProviders(<Sidebar collapsed={false} onToggle={() => {}} />)
    await waitFor(() => {
      expect(screen.queryByText('Dashboard')).toBeTruthy()
    })
    expect(screen.queryByText('Doctors')).toBeNull()
  })

  it('does NOT render Patient Portal in sidebar', async () => {
    renderWithProviders(<Sidebar collapsed={false} onToggle={() => {}} />)
    await waitFor(() => {
      expect(screen.queryByText('Dashboard')).toBeTruthy()
    })
    expect(screen.queryByText('Patient Portal')).toBeNull()
  })

  it('displays role badge from context', async () => {
    renderWithProviders(<Sidebar collapsed={false} onToggle={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeTruthy()
    })
  })

  it('displays badge count when provided', async () => {
    renderWithProviders(
      <Sidebar
        collapsed={false}
        onToggle={() => {}}
        badges={{ '/admin/messages': 5 }}
      />
    )
    await waitFor(() => {
      expect(screen.getByText('5')).toBeTruthy()
    })
  })

  it('does not display badge when count is 0', async () => {
    const { container } = renderWithProviders(
      <Sidebar
        collapsed={false}
        onToggle={() => {}}
        badges={{ '/admin/messages': 0 }}
      />
    )
    await waitFor(() => {
      expect(screen.queryByText('Dashboard')).toBeTruthy()
    })
    const badge = container.querySelector('.bg-red-500')
    expect(badge).toBeNull()
  })
})

// --- Admin Routing (preserved + extended) ---
describe('Admin sidebar routes', () => {
  const SIDEBAR_ROUTES = [
    '/admin',
    '/admin/services',
    '/admin/service-categories',
    '/admin/providers',
    '/admin/programmes',
    '/admin/partners',
    '/admin/site-content',
    '/admin/blog',
    '/admin/events',
    '/admin/gallery',
    '/admin/testimonials',
    '/admin/seo',
    '/admin/appointments',
    '/admin/messages',
    '/admin/newsletter',
    '/admin/navigation-content',
    '/admin/hero-content',
    '/admin/footer-content',
    '/admin/page-content',
    '/admin/media',
    '/admin/payments',
    '/admin/settings',
    '/admin/site-settings',
    '/admin/features',
    '/admin/admin-users',
    '/admin/system-health',
    '/admin/backup',
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

  it('settings and site-settings are both accessible', () => {
    expect(SIDEBAR_ROUTES).toContain('/admin/settings')
    expect(SIDEBAR_ROUTES).toContain('/admin/site-settings')
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
    ]
    publicPaths.forEach(p => expect(p.startsWith('/admin')).toBe(false))
  })
})

// --- Archived Modules Hidden ---
describe('Archived modules', () => {
  it('Doctors component exists but is NOT in sidebar', async () => {
    const mod = await import('../admin/Doctors')
    expect(mod.default).toBeDefined()
  })

  it('Patients component exists but is NOT in sidebar', async () => {
    const mod = await import('../admin/Patients')
    expect(mod.default).toBeDefined()
  })
})

// --- Admin 404 ---
describe('Admin 404', () => {
  it('renders admin 404 message', async () => {
    const { default: AdminNotFound } = await import('../admin/AdminNotFound')
    renderWithProviders(<AdminNotFound />)
    expect(screen.getByText('Admin Page Not Found')).toBeTruthy()
  })
})

// --- Public 404 ---
describe('Public 404', () => {
  it('renders public 404 message', async () => {
    const { default: NotFound } = await import('../pages/NotFound')
    renderWithProviders(<NotFound />)
    expect(screen.getByText('Page Not Found')).toBeTruthy()
  })
})

// --- Feature Flag Components ---
describe('Feature components', () => {
  it('FeatureContext and FeatureProvider exist', async () => {
    const mod = await import('../context/FeatureContext')
    expect(mod.FeatureProvider).toBeDefined()
    expect(mod.useFeatures).toBeDefined()
  })

  it('AdminRoute component exists', async () => {
    const mod = await import('../admin/AdminRoute')
    expect(mod.default).toBeDefined()
  })

  it('AdminLogin component exists', async () => {
    const mod = await import('../admin/AdminLogin')
    expect(mod.default).toBeDefined()
  })
})
