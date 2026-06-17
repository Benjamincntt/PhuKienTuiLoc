import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Gift,
  Heart,
  MapPin,
  Menu,
  Percent,
  Search,
  ShoppingCart,
  Sparkles,
  Truck,
  User,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/CartContext"
import { cn } from "@/lib/utils"

const quickLinks = [
  { icon: Truck, label: "Giao nhanh", to: "/products" },
  { icon: Percent, label: "Mã giảm giá", to: "/#coupons" },
  { icon: Sparkles, label: "Tích điểm", to: "/products" },
  { icon: Gift, label: "Quà tặng", to: "/products" },
  { icon: Heart, label: "Sức khỏe", to: "/products" },
  { icon: MapPin, label: "Địa chỉ", to: "/#footer" },
]

const navLinks = [
  { to: "/", label: "Trang chủ" },
  { to: "/products", label: "Sản phẩm" },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { totalCount, openCart } = useCart()
  const navigate = useNavigate()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) navigate(`/products?search=${encodeURIComponent(q)}`)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs md:text-sm">
          <p className="truncate font-medium">Thương hiệu túi lọc số 1 Việt Nam</p>
          <div className="hidden items-center gap-4 lg:flex">
            {quickLinks.map(({ icon: Icon, label, to }) => (
              <Link key={label} to={to} className="flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-2 py-3 sm:gap-4 sm:py-4">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow sm:h-11 sm:w-11 sm:text-lg">
              PL
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-bold leading-tight">Phụ Kiện Túi Lọc</p>
              <p className="hidden text-xs text-muted-foreground sm:block">Chất lượng - Uy tín</p>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="relative hidden min-w-0 flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm túi lọc trà, cà phê, thảo dược..."
              className="h-11 rounded-full border-primary/30 bg-white pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex" title="Tài khoản (sắp ra mắt)" disabled>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="sm" className="relative gap-2 rounded-full sm:h-10 sm:px-4" onClick={openCart}>
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Giỏ hàng</span>
              {totalCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalCount > 99 ? "99+" : totalCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative pb-3 md:hidden">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm sản phẩm..."
            className="h-10 rounded-full border-primary/30 bg-white pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <nav
          className={cn(
            "overflow-hidden border-t transition-all duration-200 md:hidden",
            menuOpen ? "max-h-48 pb-3 pt-2" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <nav className="hidden items-center gap-6 border-t py-2 text-sm font-medium md:flex">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="hover:text-primary">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
