export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface LoginResponse {
  token: string
  username: string
  role: string
  expiresAt: string
}

export interface Category {
  id: number
  name: string
  slug: string
  icon: string
}

export interface Product {
  id: number
  name: string
  slug: string
  price: number
  originalPrice?: number
  imageUrl: string
  imageUrls: string[]
  categoryId: number
  categoryName: string
  soldCount: number
  isHot: boolean
  isSale: boolean
}

export interface Coupon {
  id: number
  title: string
  code: string
  description: string
  discountType: string
  discountValue: number
  minOrderAmount: number
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
}

export interface NewsArticle {
  id: number
  title: string
  excerpt: string
  content: string
  imageUrl: string
  publishedAt: string
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  price: number
  quantity: number
  subTotal: number
}

export interface Order {
  id: number
  customerName: string
  customerPhone: string
  customerAddress: string
  note: string
  couponCode: string
  discountAmount: number
  totalPrice: number
  status: string
  createdAt: string
  items: OrderItem[]
}
