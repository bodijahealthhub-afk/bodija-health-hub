import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { usePatientAuth } from './PatientAuthContext'

export default function Login() {
  const { login } = usePatientAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/portal', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Patient Portal</h1>
        <p className="text-gray-500 mb-6">Log in to view your appointments and payments.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Your password" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50">
            {submitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p className="text-sm text-gray-500 text-center mt-6">
          New here?{' '}
          <Link to="/portal/register" className="text-primary font-medium hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
