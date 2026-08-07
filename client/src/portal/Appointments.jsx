import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { usePatientAuth } from './PatientAuthContext'

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-teal-100 text-teal-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

const formatNaira = (n) => `₦${Number(n || 0).toLocaleString('en-US')}`

export default function PortalAppointments() {
  const { token } = usePatientAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/patient/appointments', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setAppointments((await res.json()).appointments || [])
    } catch {}
    finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAppointments() }, [token])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    setCancelling(id)
    try {
      const res = await fetch(`/api/patient/appointments/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Appointment cancelled')
        fetchAppointments()
      } else {
        toast.error(data.error || 'Failed to cancel')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500 mt-1">Your booking history at Bodija Health Hub.</p>
        </div>
        <a href="/appointments" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-colors">Book new</a>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-400">Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <p className="text-gray-500 mb-3">You have no appointments yet.</p>
          <a href="/appointments" className="text-primary font-medium hover:underline">Book your first appointment</a>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((a) => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{a.service || 'Consultation'}</h3>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyles[a.status] || 'bg-gray-100 text-gray-600'}`}>{a.status}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {new Date(a.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {a.time}
                </p>
                <p className="text-sm text-gray-600">{a.doctor ? `${a.doctor}${a.doctorSpecialization ? ` · ${a.doctorSpecialization}` : ''}` : 'Doctor to be assigned'}</p>
                {a.amount > 0 && (
                  <p className={`text-sm font-medium mt-1 ${a.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-gray-600'}`}>
                    {formatNaira(a.amount)} · {a.paymentStatus === 'paid' ? 'Paid' : 'Pay at clinic or online'}
                  </p>
                )}
                {a.notes && <p className="text-sm text-gray-500 mt-1 italic">"{a.notes}"</p>}
              </div>
              {['pending', 'confirmed'].includes(a.status) && (
                <button
                  onClick={() => handleCancel(a.id)}
                  disabled={cancelling === a.id}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {cancelling === a.id ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
