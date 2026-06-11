import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { usePermissions } from "@/hooks/usePermissions"

export function RoleRoute({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const { canAccessRoute } = usePermissions()

  if (!canAccessRoute(pathname))
    return <Navigate to="/" replace />

  return children
}
