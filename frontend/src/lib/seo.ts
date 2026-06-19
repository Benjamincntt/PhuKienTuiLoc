export const SITE_URL = (
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://baobiantea.com"
).replace(/\/$/, "")

export const SITE_NAME = "AnTea Tổng Kho Túi Lọc - Bao Bì Trà"

export const DEFAULT_DESCRIPTION =
  "AnTea - Tổng kho túi lọc trà, cà phê, thảo dược và bao bì trà giá sỉ: túi lọc vải không dệt, giấy, sợi ngô, cotton, bóng lọc inox. Combo 100 chiếc giá tốt nhất, giao nhanh toàn quốc."

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`

/** Logo thương hiệu dùng cho JSON-LD / Google Knowledge Panel. */
export const SITE_LOGO = `${SITE_URL}/logo-antea.png`

/** Trả về URL tuyệt đối từ path tương đối hoặc giữ nguyên nếu đã là URL đầy đủ. */
export function absoluteUrl(pathOrUrl = ""): string {
  if (!pathOrUrl) return SITE_URL
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return SITE_URL + (pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`)
}
