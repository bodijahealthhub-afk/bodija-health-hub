import { useState, useEffect } from 'react'
import { usePatientAuth } from './PatientAuthContext'

const formatNaira = (n) => `₦${Number(n || 0).toLocaleString('en-US')}`

const statusStyles = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function PortalPayments() {
  const { token } = usePatientAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [mockMode, setMockMode] = useState(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/payments/config')
        if (res.ok) setMockMode((await res.json()).mock)
      } catch {}
    }
    fetchConfig()
  }, [])

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch('/api/patient/payments', { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) setPayments((await res.json()).payments || [])
      } catch {}
      finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [token])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments & Receipts</h1>
        <p className="text-gray-500 mt-1">Your payment history with Bodija Health Hub.</p>
      </div>

      {mockMode && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
          Payments are currently running in <strong>test mode</strong>. No real charges are processed until a payment gateway is configured.
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-400">Loading...</div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <p className="text-gray-500">You have no payment records yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointment</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 text-sm font-mono text-gray-700">{p.reference}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {p.appointment_date ? `${p.appointment_date}${p.appointment_time ? ` at ${p.appointment_time}` : ''}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{formatNaira(p.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyles[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
