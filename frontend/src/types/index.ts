export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
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
  isHot?: boolean
  isSale?: boolean
}

export interface Coupon {
  id: number
  title: string
  code: string
  description: string
}

export interface NewsArticle {
  id: number
  title: string
  excerpt: string
  content: string
  imageUrl: string
  publishedAt: string
}
