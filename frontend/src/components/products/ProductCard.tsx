import { Link } from "react-router-dom"
import { ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link to={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.isSale && (
          <Badge variant="sale" className="absolute left-2 top-2">
            Giảm giá
          </Badge>
        )}
        {product.isHot && (
          <Badge className="absolute right-2 top-2">Hot</Badge>
        )}
      </Link>
      <CardContent className="space-y-2 p-3 sm:space-y-3 sm:p-4">
        <Link to={`/products/${product.slug}`} className="line-clamp-2 block min-h-[2.25rem] text-xs font-medium leading-snug hover:text-primary sm:min-h-[2.5rem] sm:text-sm">
          {product.name}
        </Link>
        <div className="flex flex-wrap items-end gap-1 sm:gap-2">
          <span className="text-base font-bold text-primary sm:text-lg">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground sm:text-xs">{product.soldCount.toLocaleString()} đã bán</p>
        <Button className="w-full gap-1.5 rounded-full text-xs sm:gap-2 sm:text-sm" size="sm">
          <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Thêm vào giỏ
        </Button>
      </CardContent>
    </Card>
  )
}
