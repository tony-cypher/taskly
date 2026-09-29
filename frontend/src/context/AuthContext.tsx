import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, getToken, setToken, type User } from '../lib/api'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  continueAsGuest: () => Promise<void>
  logout: () => Promise<void>
  updateUser: (patch: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password })
        setToken(res.data.token)
        setUser(res.data.user)
      },
      register: async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password })
        setToken(res.data.token)
        setUser(res.data.user)
      },
      continueAsGuest: async () => {
        // Resume the previous guest session when possible, else create one.
        const res = await api.post('/auth/guest', { token: getToken() })
        setToken(res.data.token)
        setUser(res.data.user)
      },
      logout: async () => {
        try {
          await api.post('/auth/logout')
        } finally {
          setToken(null)
          setUser(null)
        }
      },
      updateUser: (patch) => setUser((u) => (u ? { ...u, ...patch } : u)),
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
