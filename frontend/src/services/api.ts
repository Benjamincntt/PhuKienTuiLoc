import type { Category, Coupon, NewsArticle, PagedResult, Product } from "@/types"

export interface CreateOrderItemPayload {
  productId: number
  quantity: number
}

export interface CreateOrderPayload {
  customerName: string
  customerPhone: string
  customerAddress: string
  note?: string
  couponCode?: string
  items: CreateOrderItemPayload[]
}

export interface ValidateCouponResult {
  isValid: boolean
  errorMessage?: string
  discountAmount: number
  finalAmount: number
  coupon?: {
    id: number
    title: string
    code: string
    discountType: string
    discountValue: number
  }
}

export interface OrderItemResult {
  id: number
  productId: number
  productName: string
  price: number
  quantity: number
  subTotal: number
}

export interface OrderResult {
  id: number
  customerName: string
  customerPhone: string
  customerAddress: string
  note: string
  totalPrice: number
  status: string
  createdAt: string
  items: OrderItemResult[]
}

const API_BASE = import.meta.env.VITE_API_URL ?? "/api"

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json() as Promise<T>
}

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ""
}

export const api = {
  getCategories: (slug?: string) =>
    fetchJson<PagedResult<Category>>(`/categories${buildQuery({ slug, pageSize: 100 })}`).then(
      (r) => r.items
    ),

  getCategoryProducts: (categoryId: number) =>
    fetchJson<PagedResult<Product>>(`/categories/${categoryId}/products${buildQuery({ pageSize: 100 })}`).then(
      (r) => r.items
    ),

  getProducts: (params?: { categoryId?: number; isHot?: boolean; isSale?: boolean; search?: string }) =>
    fetchJson<PagedResult<Product>>(`/products${buildQuery({ pageSize: 100, ...params })}`).then(
      (r) => r.items
    ),

  getProduct: (id: number) => fetchJson<Product>(`/products/${id}`),

  getProductBySlug: (slug: string) => fetchJson<Product>(`/products/by-slug/${slug}`),

  getCoupons: () =>
    fetchJson<PagedResult<Coupon>>(`/coupons${buildQuery({ pageSize: 100 })}`).then((r) => r.items),

  getNews: () =>
    fetchJson<PagedResult<NewsArticle>>(`/news-articles${buildQuery({ pageSize: 100 })}`).then(
      (r) => r.items
    ),

  getNewsById: (id: number) => fetchJson<NewsArticle>(`/news-articles/${id}`),

  validateCoupon: (code: string, orderAmount: number) =>
    fetch(`${API_BASE}/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim().toUpperCase(), orderAmount }),
    }).then(async (res) => {
      if (!res.ok) throw new Error(`Lỗi ${res.status}`)
      return res.json() as Promise<ValidateCouponResult>
    }),

  createOrder: (payload: CreateOrderPayload) =>
    fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Lỗi ${res.status}`)
      }
      return res.json() as Promise<OrderResult>
    }),
}
