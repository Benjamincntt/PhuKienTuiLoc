export type Role = "Admin" | "Accountant" | "Employee"

export const ROLE_LABELS: Record<Role, string> = {
  Admin: "Quản trị viên",
  Accountant: "Kế toán",
  Employee: "Nhân viên",
}

export function canManageProducts(role: Role) {
  return role === "Admin" || role === "Employee"
}

export function canManageCategories(role: Role) {
  return role === "Admin"
}

export function canManageCoupons(role: Role) {
  return role === "Admin" || role === "Accountant"
}

export function canManageNews(role: Role) {
  return role === "Admin" || role === "Employee"
}

export function canUploadImages(role: Role) {
  return role === "Admin" || role === "Employee"
}

export function canViewProducts(_role: Role) {
  return true
}

export function canViewCoupons(role: Role) {
  return canManageCoupons(role)
}

export function canViewNews(role: Role) {
  return canManageNews(role)
}

export function canAccessRoute(role: Role, path: string) {
  if (path === "/" || path === "") return true
  if (path.startsWith("/products")) return canViewProducts(role)
  if (path.startsWith("/categories")) return canManageCategories(role)
  if (path.startsWith("/coupons")) return canViewCoupons(role)
  if (path.startsWith("/news")) return canViewNews(role)
  return false
}
