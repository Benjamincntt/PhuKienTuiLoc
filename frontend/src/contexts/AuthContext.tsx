import { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  api,
  tokenStore,
  type AuthResponse,
  type CustomerProfile,
  type LoginPayload,
  type RegisterPayload,
} from "@/services/api"

interface AuthContextValue {
  customer: CustomerProfile | null
  isAuthenticated: boolean
  loading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = tokenStore.get()
    if (!token) {
      setLoading(false)
      return
    }
    api
      .getMe()
      .then((profile) => setCustomer(profile))
      .catch(() => {
        tokenStore.clear()
        setCustomer(null)
      })
      .finally(() => setLoading(false))
  }, [])

  function applyAuth(res: AuthResponse) {
    tokenStore.set(res.token)
    setCustomer(res.customer)
  }

  async function login(payload: LoginPayload) {
    applyAuth(await api.login(payload))
  }

  async function register(payload: RegisterPayload) {
    applyAuth(await api.register(payload))
  }

  async function loginWithGoogle(idToken: string) {
    applyAuth(await api.googleLogin(idToken))
  }

  function logout() {
    tokenStore.clear()
    setCustomer(null)
  }

  async function refresh() {
    try {
      setCustomer(await api.getMe())
    } catch {
      logout()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
