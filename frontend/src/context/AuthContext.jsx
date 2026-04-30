import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../data/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('orix_token')
    if (token) {
      authAPI.getMe()
        .then(res => setUser(res.data.data))
        .catch(() => localStorage.removeItem('orix_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (phone, password) => {
    const res = await authAPI.login({ phone, password })
    localStorage.setItem('orix_token', res.data.token)
    setUser(res.data.data)
    return res.data.data
  }

  const register = async (name, phone, password) => {
    const res = await authAPI.register({ name, phone, password })
    localStorage.setItem('orix_token', res.data.token)
    setUser(res.data.data)
    return res.data.data
  }

  const logout = () => {
    localStorage.removeItem('orix_token')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
