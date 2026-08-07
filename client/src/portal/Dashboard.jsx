import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePatientAuth } from './PatientAuthContext'

export default function PortalDashboard() {
  const { token, patient } = usePatientAuth()
  const [appointments, setAppointments] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [aptRes, payRes] = await Promise.all([
          fetch('/api/patient/appointments', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/patient/payments', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (aptRes.ok) setAppointments((await aptRes.json()).appointments || [])
        if (payRes.ok) setPayments((await payRes.json()).payments || [])
      } catch {}
      finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [token])

  const upcoming = appointments
    .filter((a) => ['pending', 'confirmed'].includes(a.status))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))

  const next = upcoming[0]
  const paidCount = payments.filter((p) => p.status === 'paid').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {patient?.name}</h1>
        <p className="text-gray-500 mt-1">Here's an overview of your care at Bodija Health Hub.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-medium text-gray-500">Total Appointments</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '—' : appointments.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-medium text-gray-500">Upcoming</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{upcoming.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-medium text-gray-500">Payments Made</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{paidCount}</p>
        </div>
      </div>

      {next && (
        <div className="bg-gradient-to-br from-primary to-teal-700 text-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-teal-100 font-medium mb-1">Next appointment</p>
          <p className="text-xl font-bold">{next.doctor || 'Appointment'}</p>
          <p className="text-teal-100 mt-1">
            {new Date(next.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {next.time} · {next.service || 'Consultation'}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Appointments</h2>
          <Link to="/portal/appointments" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {appointments.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">You have no appointments yet. <Link to="/appointments" className="text-primary font-medium hover:underline">Book one now</Link>.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.slice(0, 4).map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.service || 'Consultation'}</p>
                  <p className="text-xs text-gray-500">{a.date} at {a.time}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                  a.status === 'confirmed' ? 'bg-teal-100 text-teal-700' :
                  a.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  a.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                  'bg-amber-100 text-amber-700'
                }`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
