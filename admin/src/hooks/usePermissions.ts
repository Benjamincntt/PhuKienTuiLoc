import { useAuth } from "@/contexts/AuthContext"
import {
  canAccessRoute,
  canManageCategories,
  canManageCoupons,
  canManageNews,
  canManageOrders,
  canManageProducts,
  canUploadImages,
  canViewOrders,
  ROLE_LABELS,
  type Role,
} from "@/lib/permissions"

export function usePermissions() {
  const { role } = useAuth()
  const r = (role ?? "Employee") as Role

  return {
    role: r,
    roleLabel: ROLE_LABELS[r] ?? role ?? "",
    canManageProducts: canManageProducts(r),
    canManageCategories: canManageCategories(r),
    canManageCoupons: canManageCoupons(r),
    canManageNews: canManageNews(r),
    canUploadImages: canUploadImages(r),
    canViewOrders: canViewOrders(r),
    canManageOrders: canManageOrders(r),
    canAccessRoute: (path: string) => canAccessRoute(r, path),
  }
}
