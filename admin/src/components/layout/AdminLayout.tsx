import { useEffect, useState, type CSSProperties } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { LayoutDashboard, LogOut, Menu, Newspaper, Package, Percent, ShoppingBag, Tags, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { usePermissions } from "@/hooks/usePermissions"
import { DEFAULT_ADMIN_BG } from "@/lib/theme"
import { cn } from "@/lib/utils"

const nav = [
  { to: "/", label: "Tổng quan", icon: LayoutDashboard, show: () => true },
  { to: "/orders", label: "Đơn hàng", icon: ShoppingBag, show: (p: ReturnType<typeof usePermissions>) => p.canViewOrders },
  { to: "/products", label: "Sản phẩm", icon: Package, show: (p: ReturnType<typeof usePermissions>) => p.canManageProducts || p.role === "Accountant" },
  { to: "/categories", label: "Danh mục", icon: Tags, show: (p: ReturnType<typeof usePermissions>) => p.canManageCategories },
  { to: "/coupons", label: "Mã giảm giá", icon: Percent, show: (p: ReturnType<typeof usePermissions>) => p.canManageCoupons },
  { to: "/news", label: "Tin tức", icon: Newspaper, show: (p: ReturnType<typeof usePermissions>) => p.canManageNews },
]

function SidebarContent({
  pathname,
  perms,
  username,
  onNavigate,
  onLogout,
}: {
  pathname: string
  perms: ReturnType<typeof usePermissions>
  username: string | null
  onNavigate?: () => void
  onLogout: () => void
}) {
  const items = nav.filter((item) => item.show(perms))

  return (
    <>
      <div className="border-b border-white/10 p-5">
        <p className="font-bold text-primary">Phu Kien Tui Loc</p>
        <p className="text-xs text-muted-foreground">Quản trị web</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              pathname === to ? "bg-primary/20 font-medium text-primary" : "hover:bg-muted/80"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-medium leading-normal">{username}</p>
        <p className="mb-3 truncate text-xs leading-relaxed text-muted-foreground">{perms.roleLabel}</p>
        <Button variant="outline" size="sm" className="w-full gap-2 bg-white/50" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    </>
  )
}

export function AdminLayout() {
  const { pathname } = useLocation()
  const { username, logout } = useAuth()
  const perms = usePermissions()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  const currentPage = nav.find((n) => n.to === pathname)?.label ?? "Admin"

  return (
    <div className="flex min-h-screen">
      {menuOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-white/20 bg-card/98 shadow-xl backdrop-blur-md transition-transform duration-300 md:relative md:z-10 md:w-64 md:shrink-0 md:translate-x-0 md:shadow-lg",
          menuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-3 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
        <SidebarContent
          pathname={pathname}
          perms={perms}
          username={username}
          onNavigate={() => setMenuOpen(false)}
          onLogout={logout}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur-md md:hidden">
          <Button variant="outline" size="icon" onClick={() => setMenuOpen(true)} aria-label="Mở menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-normal text-slate-800">{currentPage}</p>
            <p className="truncate text-xs leading-relaxed text-slate-500">{username}</p>
          </div>
        </header>

        <main
          className="admin-page-bg relative flex-1 p-4 sm:p-6 lg:p-8"
          style={{ "--admin-bg-image": `url("${DEFAULT_ADMIN_BG}")` } as CSSProperties}
        >
          <div className="relative z-10 mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
