import { useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { usePatientAuth } from './PatientAuthContext'

export default function PortalLayout() {
  const { patient, token, loading, logout } = usePatientAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !token) {
      navigate('/portal/login', { replace: true, state: { from: location.pathname } })
    }
  }, [loading, token, navigate, location.pathname])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!patient) return null

  const navLink = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-bold text-lg text-gray-900">Bodija Health Hub</Link>
            <nav className="hidden sm:flex items-center gap-1">
              <Link to="/portal" end className={navLink}>Overview</Link>
              <Link to="/portal/appointments" className={navLink}>My Appointments</Link>
              <Link to="/portal/payments" className={navLink}>Payments</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600">{patient.name}</span>
            <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-700">Log out</button>
          </div>
        </div>
        <nav className="sm:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
          <Link to="/portal" end className={navLink}>Overview</Link>
          <Link to="/portal/appointments" className={navLink}>My Appointments</Link>
          <Link to="/portal/payments" className={navLink}>Payments</Link>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
