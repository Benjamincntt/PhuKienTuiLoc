/** Ảnh nền mặc định admin — túi lọc trà / phụ kiện pha chế */
export const DEFAULT_ADMIN_BG =
  "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=1920&q=80&auto=format&fit=crop"

/**
 * Gam màu "Stone & Honey" — tông ấm, độ bão hòa thấp, đồng nhất.
 * Lấy cảm hứng dashboard SaaS hiện đại, không dùng màu gốc rực.
 */
export const CHART_COLORS = [
  "#6B7F8F", // slate mist
  "#8B9E8B", // sage
  "#B8A07A", // honey gold
  "#9A8F9E", // dusty mauve
  "#7A8E9A", // pewter
  "#A69076", // taupe
  "#5C6B7A", // deep slate
  "#C4B49A", // champagne
]

export const STATUS_CHART_COLORS: Record<string, string> = {
  Hot: "#C17B6E",
  "Giảm giá": "#7D9B8A",
  "Thường": "#6B7F8F",
}

export const CHART_THEME = {
  grid: "#E8ECF0",
  axis: "#94A3B8",
  tooltipBg: "#FFFFFF",
  tooltipBorder: "#E2E8F0",
  tooltipText: "#334155",
}

export const STAT_ACCENT = [
  { icon: "#6B7F8F", bg: "#F1F5F9" },
  { icon: "#7D9B8A", bg: "#F0F4F1" },
  { icon: "#9A8F9E", bg: "#F4F2F5" },
  { icon: "#B8A07A", bg: "#FAF6F0" },
]

export function chartColor(index: number) {
  return CHART_COLORS[index % CHART_COLORS.length]
}

export function statusColor(name: string) {
  return STATUS_CHART_COLORS[name] ?? chartColor(0)
}
