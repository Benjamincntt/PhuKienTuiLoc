import type { Category, Coupon, NewsArticle, PagedResult, Product } from "@/types"

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

  getProducts: (params?: { categoryId?: number; isHot?: boolean; isSale?: boolean }) =>
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
}
