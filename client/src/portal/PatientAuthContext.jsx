import { createContext, useContext, useState, useEffect } from 'react'

const PatientAuthContext = createContext(null)

export function PatientAuthProvider({ children }) {
  const [patient, setPatient] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('patientToken'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchPatient()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const fetchPatient = async () => {
    try {
      const res = await fetch('/api/patient/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setPatient(data.patient || data)
      } else {
        logout()
      }
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const res = await fetch('/api/patient/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    localStorage.setItem('patientToken', data.token)
    setToken(data.token)
    setPatient(data.patient)
    return data
  }

  const register = async (payload) => {
    const res = await fetch('/api/patient/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')
    localStorage.setItem('patientToken', data.token)
    setToken(data.token)
    setPatient(data.patient)
    return data
  }

  const logout = () => {
    localStorage.removeItem('patientToken')
    setToken(null)
    setPatient(null)
  }

  return (
    <PatientAuthContext.Provider value={{ patient, token, loading, login, register, logout }}>
      {children}
    </PatientAuthContext.Provider>
  )
}

export const usePatientAuth = () => useContext(PatientAuthContext)
