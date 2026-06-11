import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api, clearToken, getToken, setToken } from "@/services/api"
import type { Role } from "@/lib/permissions"

interface AuthContextValue {
  username: string | null
  role: Role | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api.me()
      .then((profile) => {
        setUsername(profile.username)
        setRole(profile.role as Role)
      })
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const login = async (user: string, password: string) => {
    const res = await api.login(user, password)
    setToken(res.token)
    setUsername(res.username)
    setRole(res.role as Role)
  }

  const logout = () => {
    clearToken()
    setUsername(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ username, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
