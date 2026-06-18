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
  paymentMethod?: string
  items: CreateOrderItemPayload[]
}

export interface CustomerProfile {
  id: number
  fullName: string
  email: string | null
  phone: string | null
  loyaltyPoints: number
}

export interface AuthResponse {
  token: string
  expiresAt: string
  customer: CustomerProfile
}

export interface RegisterPayload {
  fullName: string
  email?: string
  phone?: string
  password: string
}

export interface LoginPayload {
  identifier: string
  password: string
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

export interface CreateOrderResponse {
  order: OrderResult
  paymentUrl: string | null
  emailNotificationSent?: boolean
}

export interface OrderPublicResult {
  id: number
  totalPrice: number
  status: string
  paymentMethod: string
  paymentStatus: string
  pointsEarned: number
  createdAt: string
}

export interface OrderResult {
  id: number
  customerName: string
  customerPhone: string
  customerAddress: string
  note: string
  couponCode?: string
  discountAmount?: number
  totalPrice: number
  status: string
  paymentMethod: string
  paymentStatus: string
  pointsEarned: number
  createdAt: string
  items: OrderItemResult[]
}

const API_BASE = import.meta.env.VITE_API_URL ?? "/api"

const TOKEN_KEY = "customer_token"

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

function authHeaders(): Record<string, string> {
  const token = tokenStore.get()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json() as Promise<T>
}

async function postJson<T>(path: string, body: unknown, auth = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(auth ? authHeaders() : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let message = `Lỗi ${res.status}`
    try {
      const data = await res.json()
      message = data?.detail ?? data?.message ?? data?.title ?? message
    } catch {
      const text = await res.text().catch(() => "")
      if (text) message = text
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
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
    postJson<CreateOrderResponse>("/orders", payload, true),

  getOrderPublic: (id: number) => fetchJson<OrderPublicResult>(`/orders/${id}/public`),

  // Tài khoản khách hàng
  register: (payload: RegisterPayload) =>
    postJson<AuthResponse>("/customer/register", payload),

  login: (payload: LoginPayload) =>
    postJson<AuthResponse>("/customer/login", payload),

  googleLogin: (idToken: string) =>
    postJson<AuthResponse>("/customer/google", { idToken }),

  getMe: () =>
    fetch(`${API_BASE}/customer/me`, { headers: authHeaders() }).then(async (res) => {
      if (!res.ok) throw new Error(`Lỗi ${res.status}`)
      return res.json() as Promise<CustomerProfile>
    }),

  getMyOrders: () =>
    fetch(`${API_BASE}/orders/my`, { headers: authHeaders() }).then(async (res) => {
      if (!res.ok) throw new Error(`Lỗi ${res.status}`)
      return res.json() as Promise<OrderResult[]>
    }),
}
