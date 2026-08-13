import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('skis_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('skis_token', res.data.access_token)
      localStorage.setItem('skis_user', JSON.stringify(res.data.user))
      setUser(res.data.user)
      return res.data.user
    } catch (e) {
      setError(e.response?.data?.detail || 'Login failed. Please check your credentials.')
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('skis_token')
    localStorage.removeItem('skis_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
