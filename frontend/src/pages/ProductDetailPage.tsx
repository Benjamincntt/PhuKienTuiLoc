import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import { ProductGallery } from "@/components/products/ProductGallery"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/CartContext"
import { formatPrice } from "@/lib/utils"
import { api } from "@/services/api"
import type { Product } from "@/types"

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { addToCart } = useCart()

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    api.getProductBySlug(slug)
      .then(setProduct)
      .catch(() => setError("Không tìm thấy sản phẩm"))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return <p className="px-4 py-16 text-center text-muted-foreground">Đang tải...</p>
  }

  if (error || !product) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-muted-foreground">{error || "Không tìm thấy sản phẩm"}</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link to="/products">Quay lại danh sách</Link>
        </Button>
      </div>
    )
  }

  const images = product.imageUrls?.length
    ? product.imageUrls
    : product.imageUrl
      ? [product.imageUrl]
      : []

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-4 sm:space-y-6 sm:py-6">
      <Button asChild variant="ghost" size="sm" className="gap-2">
        <Link to="/products">
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={images} alt={product.name} />

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {product.isSale && <Badge variant="sale">Giảm giá</Badge>}
              {product.isHot && <Badge>Hot</Badge>}
              <Badge variant="outline">{product.categoryName}</Badge>
            </div>
            <h1 className="text-2xl font-bold leading-snug lg:text-3xl">{product.name}</h1>
            <p className="text-sm text-muted-foreground">{product.soldCount.toLocaleString()} sản phẩm đã bán</p>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <Button size="lg" className="w-full gap-2 rounded-full sm:w-auto" onClick={() => addToCart(product)}>
            <ShoppingCart className="h-5 w-5" />
            Thêm vào giỏ
          </Button>
        </div>
      </div>
    </div>
  )
}
