import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"

interface CategorySidebarProps {
  categories: Category[]
  activeSlug?: string
  /** false = chỉ thanh cuộn ngang (trang danh sách SP) */
  desktopSidebar?: boolean
}

export function CategorySidebar({ categories, activeSlug, desktopSidebar = true }: CategorySidebarProps) {
  const showStrip = !desktopSidebar

  return (
    <>
      <div className={cn("min-w-0", showStrip ? "block" : "lg:hidden")}>
        <p className="mb-2 text-sm font-semibold text-foreground">Danh mục</p>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            to="/products"
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
              !activeSlug ? "border-primary bg-primary text-primary-foreground" : "bg-white hover:bg-muted"
            )}
          >
            Tất cả
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                activeSlug === category.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-white hover:bg-muted"
              )}
            >
              <span>{category.icon}</span>
              <span className="max-w-[8rem] truncate">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {desktopSidebar && (
      <Card className="hidden overflow-hidden border-primary/20 lg:block">
        <CardHeader className="bg-primary py-3 text-primary-foreground">
          <CardTitle className="text-base">Danh mục sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/products?category=${category.slug}`}
                  className={cn(
                    "flex items-center gap-3 border-b border-border px-4 py-3 text-sm transition-colors last:border-0 hover:bg-secondary",
                    activeSlug === category.slug && "bg-secondary font-medium"
                  )}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      )}
    </>
  )
}
