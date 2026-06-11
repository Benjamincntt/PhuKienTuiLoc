import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { CategorySidebar } from "@/components/home/CategorySidebar"
import { ProductCard } from "@/components/products/ProductCard"
import { api } from "@/services/api"
import type { Category, Product } from "@/types"

export function ProductsPage() {
  const [searchParams] = useSearchParams()
  const categorySlug = searchParams.get("category") ?? undefined
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    api
      .getCategories()
      .then(async (cats) => {
        setCategories(cats)

        if (categorySlug) {
          const category = cats.find((c) => c.slug === categorySlug)
          if (category) {
            return api.getCategoryProducts(category.id)
          }
        }

        return api.getProducts()
      })
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [categorySlug])

  const activeCategory = categories.find((c) => c.slug === categorySlug)

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-4 sm:space-y-6 sm:py-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">
          {activeCategory ? activeCategory.name : "Tất cả sản phẩm"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {products.length} sản phẩm
        </p>
      </div>

      {categories.length > 0 && (
        <CategorySidebar categories={categories} activeSlug={categorySlug} desktopSidebar={false} />
      )}

      {loading ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
