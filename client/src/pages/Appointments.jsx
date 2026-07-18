import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiCalendar, FiClock, FiUser, FiCheck } from 'react-icons/fi'

export default function Appointments() {
  const [services, setServices] = useState([])
  const [doctors, setDoctors] = useState([])
  const [formData, setFormData] = useState({
    service_id: '',
    doctor_id: '',
    date: '',
    time: '',
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    patient_age: '',
    notes: '',
  })
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, doctorsRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/doctors'),
        ])
        if (servicesRes.ok) setServices(await servicesRes.json())
        if (doctorsRes.ok) setDoctors(await doctorsRes.json())
      } catch {}
    }
    fetchData()
  }, [])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.patient_name || !formData.patient_email || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSubmitted(true)
        toast.success('Appointment booked successfully!')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to book appointment')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const steps = [
    { num: 1, label: 'Service' },
    { num: 2, label: 'Doctor' },
    { num: 3, label: 'Date & Time' },
    { num: 4, label: 'Your Info' },
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Appointment Booked!</h1>
          <p className="text-gray-500 mb-8">
            We've received your appointment request. Our team will contact you shortly to confirm.
          </p>
          <button onClick={() => { setSubmitted(false); setFormData({ service_id: '', doctor_id: '', date: '', time: '', patient_name: '', patient_email: '', patient_phone: '', patient_age: '', notes: '' }); setStep(1) }}
            className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
            Book Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-teal-700 to-emerald-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">Book Appointment</span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Schedule Your Visit</h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto">
            Book an appointment with our healthcare professionals. Quick, easy, and convenient.
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  step >= s.num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s.num ? <FiCheck className="w-5 h-5" /> : s.num}
                </div>
                <span className={`ml-2 text-sm font-medium ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                {i < steps.length - 1 && <div className={`w-12 h-0.5 mx-4 ${step > s.num ? 'bg-primary' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Service */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Select Service</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {services.map(service => (
                      <button key={service.id} type="button" onClick={() => { setFormData(prev => ({ ...prev, service_id: service.id })); setStep(2) }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.service_id == service.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <p className="font-semibold text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{service.category}</p>
                        {service.price > 0 && <p className="text-sm text-primary font-medium mt-2">₦{service.price.toLocaleString()}</p>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Doctor */}
              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Select Doctor</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {doctors.map(doctor => (
                      <button key={doctor.id} type="button" onClick={() => { setFormData(prev => ({ ...prev, doctor_id: doctor.id })); setStep(3) }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.doctor_id == doctor.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <p className="font-semibold text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-500">{doctor.specialization}</p>
                        <p className="text-xs text-gray-400 mt-1">{doctor.experience_years} years experience</p>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="text-primary font-medium text-sm">← Back</button>
                </div>
              )}

              {/* Step 3: Date & Time */}
              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Select Date & Time</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                    <select name="time" value={formData.time} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary">
                      <option value="">Select time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="09:30">9:30 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="10:30">10:30 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="11:30">11:30 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="13:30">1:30 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="14:30">2:30 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="15:30">3:30 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="16:30">4:30 PM</option>
                      <option value="17:00">5:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Any specific concerns or requests?" />
                  </div>
                  <button type="button" onClick={() => setStep(2)} className="text-primary font-medium text-sm">← Back</button>
                </div>
              )}

              {/* Step 4: Patient Info */}
              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Your Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input type="text" name="patient_name" value={formData.patient_name} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input type="email" name="patient_email" value={formData.patient_email} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary" placeholder="your@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input type="tel" name="patient_phone" value={formData.patient_phone} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary" placeholder="0801 234 5678" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input type="number" name="patient_age" value={formData.patient_age} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Age" />
                    </div>
                  </div>
                  <button type="button" onClick={() => setStep(3)} className="text-primary font-medium text-sm">← Back</button>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                {step < 4 ? (
                  <button type="button" onClick={() => setStep(step + 1)}
                    className="w-full py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors">
                    Next
                  </button>
                ) : (
                  <button type="submit" disabled={submitting}
                    className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? 'Booking...' : 'Confirm Appointment'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

