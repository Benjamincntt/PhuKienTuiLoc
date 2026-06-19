import type {
  Category,
  Coupon,
  LoginResponse,
  NewsArticle,
  Order,
  PagedResult,
  Product,
} from "@/types"

const API_BASE = import.meta.env.VITE_API_URL ?? "/api"
const TOKEN_KEY = "admin_token"
const ADMIN_LOGIN_PATH = `${(import.meta.env.BASE_URL ?? "/").replace(/\/?$/, "/")}login`

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function redirectToLoginIfNeeded(hadToken: boolean) {
  if (hadToken) window.location.href = ADMIN_LOGIN_PATH
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")
  const token = getToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (response.status === 401) {
    const hadToken = Boolean(token)
    clearToken()
    redirectToLoginIfNeeded(hadToken)
    throw new Error("Unauthorized")
  }
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `API error: ${response.status}`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

function paged<T>(path: string) {
  return request<PagedResult<T>>(`${path}?pageSize=100`).then((r) => r.items)
}

export const api = {
  login: (username: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  me: () => request<{ id: number; username: string; role: string }>("/auth/me"),

  getCategories: () => paged<Category>("/categories"),
  createCategory: (data: Omit<Category, "id">) =>
    request<Category>("/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: number, data: Omit<Category, "id">) =>
    request<Category>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCategory: (id: number) => request<void>(`/categories/${id}`, { method: "DELETE" }),

  getProducts: () => paged<Product>("/products"),
  createProduct: (data: Record<string, unknown>) =>
    request<Product>("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Record<string, unknown>) =>
    request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: number) => request<void>(`/products/${id}`, { method: "DELETE" }),

  getCoupons: () => paged<Coupon>("/coupons"),
  createCoupon: (data: Record<string, unknown>) =>
    request<Coupon>("/coupons", { method: "POST", body: JSON.stringify(data) }),
  updateCoupon: (id: number, data: Record<string, unknown>) =>
    request<Coupon>(`/coupons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCoupon: (id: number) => request<void>(`/coupons/${id}`, { method: "DELETE" }),

  getNews: () => paged<NewsArticle>("/news-articles"),
  createNews: (data: Record<string, unknown>) =>
    request<NewsArticle>("/news-articles", { method: "POST", body: JSON.stringify(data) }),
  updateNews: (id: number, data: Record<string, unknown>) =>
    request<NewsArticle>(`/news-articles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteNews: (id: number) => request<void>(`/news-articles/${id}`, { method: "DELETE" }),

  getOrders: (params?: { status?: string; phone?: string; page?: number }) => {
    const qs = new URLSearchParams({ pageSize: "50", ...(params as Record<string, string> | undefined) })
    if (params?.status === "") qs.delete("status")
    if (params?.phone === "") qs.delete("phone")
    return request<PagedResult<Order>>(`/orders?${qs}`)
  },
  getOrder: (id: number) => request<Order>(`/orders/${id}`),
  updateOrderStatus: (id: number, status: string) =>
    request<Order>(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    const headers = new Headers()
    const token = getToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)

    const response = await fetch(`${API_BASE}/uploads/images`, {
      method: "POST",
      headers,
      body: formData,
    })
    if (response.status === 401) {
      const hadToken = Boolean(token)
      clearToken()
      redirectToLoginIfNeeded(hadToken)
      throw new Error("Unauthorized")
    }
    if (!response.ok) {
      const text = await response.text()
      try {
        const json = JSON.parse(text) as { title?: string }
        if (json.title) throw new Error(json.title)
      } catch (e) {
        if (e instanceof Error && !(e instanceof SyntaxError)) throw e
      }
      throw new Error(text || `Upload error: ${response.status}`)
    }
    return response.json() as Promise<{ url: string; path: string }>
  },
}
