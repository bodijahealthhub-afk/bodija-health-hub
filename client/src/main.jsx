import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { FeatureProvider } from './context/FeatureContext'
import { getAdminToken, clearAdminSession, redirectToAdminLogin } from './utils/api'

// Global fetch wrapper for the admin area:
//  - attaches the admin bearer token for admin/portal API calls only,
//    so public page fetches (testimonials, gallery, etc.) are unaffected,
//  - on an invalid/expired token it clears the session and bounces to login,
//    instead of letting every save fail with 403 "Invalid or expired token".
const originalFetch = window.fetch
window.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input && input.url
  const token = getAdminToken()
  const headers = new Headers(init.headers || (input && input.headers) || {})
  let usedAdminToken = false

  const isAdminOrPortalPath = typeof url === 'string' && (
    url.startsWith('/api/admin') ||
    url.startsWith('/api/patient') ||
    url.startsWith('/api/appointments')
  )

  if (token && isAdminOrPortalPath && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
    usedAdminToken = true
  } else {
    const auth = headers.get('Authorization') || ''
    usedAdminToken = !!token && auth === `Bearer ${token}`
  }

  const res = await originalFetch(url || input, {
    ...init,
    headers,
  })

  if ((res.status === 401 || res.status === 403) && usedAdminToken) {
    const body = await res.clone().json().catch(() => null)
    const authError =
      body && (body.error === 'Invalid or expired token' || body.error === 'Access token required')
    if (authError) {
      clearAdminSession()
      redirectToAdminLogin()
    }
  }

  return res
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FeatureProvider>
          <App />
          <ToastContainer position="top-right" autoClose={3000} />
        </FeatureProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
