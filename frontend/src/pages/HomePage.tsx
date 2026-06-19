import { useEffect, useState } from "react"
import { CategorySidebar } from "@/components/home/CategorySidebar"
import { CouponSection } from "@/components/home/CouponSection"
import { HeroBanner } from "@/components/home/HeroBanner"
import { NewsSection } from "@/components/home/NewsSection"
import { SaleCountdown } from "@/components/home/SaleCountdown"
import { ProductCard } from "@/components/products/ProductCard"
import { Seo } from "@/components/seo/Seo"
import { SITE_LOGO, SITE_NAME, SITE_URL } from "@/lib/seo"
import { api } from "@/services/api"
import type { Category, Coupon, NewsArticle, Product } from "@/types"

const homeJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
]

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getProducts(),
      api.getCoupons(),
      api.getNews(),
    ])
      .then(([cats, prods, cps, articles]) => {
        setCategories(cats)
        setProducts(prods)
        setCoupons(cps)
        setNews(articles)
      })
      .finally(() => setLoading(false))
  }, [])

  const hotProducts = products.filter((p) => p.isHot)
  const saleProducts = products.filter((p) => p.isSale)

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">
        Đang tải...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-4 sm:space-y-10 sm:py-6">
      <Seo
        title="AnTea - Tổng Kho Túi Lọc Trà, Cà Phê & Bao Bì Trà Giá Sỉ"
        canonicalPath="/"
        isHome
        jsonLd={homeJsonLd}
      />
      <div className="grid min-w-0 gap-6 lg:grid-cols-[260px_1fr]">
        <CategorySidebar categories={categories} />
        <div className="min-w-0 space-y-6">
          <HeroBanner />
          <SaleCountdown />
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Siêu Sale Bùng Nổ</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {hotProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Túi lọc trà phổ thông</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <CouponSection coupons={coupons} />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Túi lọc trà cao cấp</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {saleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <NewsSection articles={news} />
    </div>
  )
}
