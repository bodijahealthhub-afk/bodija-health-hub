import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { FeatureProvider } from '../context/FeatureContext'
import { PermissionProvider, usePermissions } from '../context/PermissionContext'
import AccessDenied from '../admin/AccessDenied'
import PermissionRoute from '../admin/PermissionRoute'

vi.mock('../utils/api', () => ({
  apiFetch: vi.fn(),
  getAdminToken: vi.fn(() => 'test-token'),
  clearAdminSession: vi.fn(),
}))

const { apiFetch } = await import('../utils/api')

function TestComponent({ permission }) {
  const { hasPermission, role, permissions } = usePermissions()
  return (
    <div>
      <span data-testid="role">{role || 'none'}</span>
      <span data-testid="perm-count">{permissions.length}</span>
      <span data-testid="has-perm">{permission ? String(hasPermission(permission)) : 'no-perm-specified'}</span>
    </div>
  )
}

function renderWithPermission(ui, { permissions = [], role = 'admin', route = '/admin' } = {}) {
  apiFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ id: 1, name: 'Test', email: 'test@test.com', role, permissions }),
  })

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

describe('PermissionContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('adminToken', 'test-token')
    localStorage.setItem('adminUser', JSON.stringify({ id: 1, name: 'Test', role: 'admin' }))
  })

  it('provides role from /api/auth/me', async () => {
    await act(async () => {
      renderWithPermission(<TestComponent />, { role: 'admin', permissions: ['dashboard.view'] })
    })
    await waitFor(() => {
      expect(screen.getByTestId('role').textContent).toBe('admin')
    })
  })

  it('provides permissions array', async () => {
    await act(async () => {
      renderWithPermission(<TestComponent />, { role: 'admin', permissions: ['dashboard.view', 'blog.view'] })
    })
    await waitFor(() => {
      expect(screen.getByTestId('perm-count').textContent).toBe('2')
    })
  })

  it('hasPermission returns true for exact match', async () => {
    await act(async () => {
      renderWithPermission(<TestComponent permission="dashboard.view" />, { permissions: ['dashboard.view'] })
    })
    await waitFor(() => {
      expect(screen.getByTestId('has-perm').textContent).toBe('true')
    })
  })

  it('hasPermission returns false for missing permission', async () => {
    await act(async () => {
      renderWithPermission(<TestComponent permission="payments.view" />, { permissions: ['dashboard.view'] })
    })
    await waitFor(() => {
      expect(screen.getByTestId('has-perm').textContent).toBe('false')
    })
  })

  it('hasPermission returns true for wildcard permission', async () => {
    await act(async () => {
      renderWithPermission(<TestComponent permission="anything" />, { role: 'super_admin', permissions: ['*'] })
    })
    await waitFor(() => {
      expect(screen.getByTestId('has-perm').textContent).toBe('true')
    })
  })

  it('hasPermission returns true for module wildcard', async () => {
    await act(async () => {
      renderWithPermission(<TestComponent permission="blog.create" />, { permissions: ['blog.*'] })
    })
    await waitFor(() => {
      expect(screen.getByTestId('has-perm').textContent).toBe('true')
    })
  })

  it('super_admin gets all permissions automatically', async () => {
    await act(async () => {
      renderWithPermission(<TestComponent permission="payments.delete" />, { role: 'super_admin', permissions: ['*'] })
    })
    await waitFor(() => {
      expect(screen.getByTestId('has-perm').textContent).toBe('true')
    })
  })
})

describe('AccessDenied', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders access denied message', async () => {
    await act(async () => {
      renderWithPermission(
        <AccessDenied />,
        { role: 'receptionist', permissions: [] }
      )
    })
    expect(screen.getByText('Access Denied')).toBeTruthy()
  })

  it('shows user role', async () => {
    await act(async () => {
      renderWithPermission(
        <AccessDenied />,
        { role: 'receptionist', permissions: [] }
      )
    })
    await waitFor(() => {
      expect(screen.getByText(/receptionist/i)).toBeTruthy()
    })
  })

  it('has dashboard link', async () => {
    await act(async () => {
      renderWithPermission(
        <AccessDenied />,
        { role: 'receptionist', permissions: [] }
      )
    })
    expect(screen.getByText('Go to Dashboard')).toBeTruthy()
  })
})

describe('PermissionRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('adminToken', 'test-token')
    localStorage.setItem('adminUser', JSON.stringify({ id: 1, name: 'Test', role: 'admin' }))
  })

  it('renders children when permission is granted', async () => {
    await act(async () => {
      renderWithPermission(
        <PermissionRoute permission="dashboard.view">
          <div>Protected Content</div>
        </PermissionRoute>,
        { permissions: ['dashboard.view'] }
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeTruthy()
    })
  })

  it('shows access denied when permission is missing', async () => {
    await act(async () => {
      renderWithPermission(
        <PermissionRoute permission="payments.view">
          <div>Protected Content</div>
        </PermissionRoute>,
        { permissions: ['dashboard.view'] }
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeTruthy()
    })
  })
})
