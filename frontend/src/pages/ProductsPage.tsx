import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { CategorySidebar } from "@/components/home/CategorySidebar"
import { ProductCard } from "@/components/products/ProductCard"
import { Seo } from "@/components/seo/Seo"
import { SITE_URL } from "@/lib/seo"
import { api } from "@/services/api"
import type { Category, Product } from "@/types"

export function ProductsPage() {
  const [searchParams] = useSearchParams()
  const categorySlug = searchParams.get("category") ?? undefined
  const searchQuery = searchParams.get("search") ?? undefined
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    api
      .getCategories()
      .then(async (cats) => {
        setCategories(cats)

        if (categorySlug && !searchQuery) {
          const category = cats.find((c) => c.slug === categorySlug)
          if (category) return api.getCategoryProducts(category.id)
        }

        return api.getProducts({ search: searchQuery })
      })
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [categorySlug, searchQuery])

  const activeCategory = categories.find((c) => c.slug === categorySlug)

  const seoTitle = searchQuery
    ? `Tìm kiếm: ${searchQuery}`
    : activeCategory
      ? `${activeCategory.name} - Giá Sỉ Tốt Nhất`
      : "Tất Cả Sản Phẩm Túi Lọc & Bao Bì Trà"
  const seoDescription = activeCategory
    ? `Mua ${activeCategory.name} giá sỉ tại AnTea - chất lượng cao, combo tiết kiệm, giao nhanh toàn quốc.`
    : "Danh sách túi lọc trà, cà phê, thảo dược và bao bì trà tại AnTea. Giá sỉ tốt nhất, combo 100 chiếc, giao nhanh toàn quốc."
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: activeCategory ? activeCategory.name : "Sản phẩm",
        item: activeCategory ? `${SITE_URL}/products?category=${activeCategory.slug}` : `${SITE_URL}/products`,
      },
    ],
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-4 sm:space-y-6 sm:py-6">
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath={activeCategory ? `/products?category=${activeCategory.slug}` : "/products"}
        jsonLd={breadcrumb}
      />
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">
          {searchQuery
            ? `Kết quả tìm kiếm: "${searchQuery}"`
            : activeCategory ? activeCategory.name : "Tất cả sản phẩm"}
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
