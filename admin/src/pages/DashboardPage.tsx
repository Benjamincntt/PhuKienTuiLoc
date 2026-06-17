import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Flame, Package, Percent, ShoppingBag, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { usePermissions } from "@/hooks/usePermissions"
import { CHART_THEME, STAT_ACCENT, chartColor, statusColor } from "@/lib/theme"
import { formatPrice } from "@/lib/utils"
import { api } from "@/services/api"
import type { Order, Product } from "@/types"

const tooltipStyle = {
  backgroundColor: CHART_THEME.tooltipBg,
  border: `1px solid ${CHART_THEME.tooltipBorder}`,
  borderRadius: 10,
  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
  fontSize: 13,
  color: CHART_THEME.tooltipText,
}

export function DashboardPage() {
  const { username } = useAuth()
  const { roleLabel } = usePermissions()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({ products: 0, categories: 0, coupons: 0, news: 0 })

  useEffect(() => {
    Promise.all([
      api.getProducts(),
      api.getCategories(),
      api.getCoupons(),
      api.getNews(),
      api.getOrders({ page: 1 }),
    ]).then(([p, categories, coupons, news, ordersResult]) => {
      setProducts(p)
      setOrders(ordersResult.items)
      setStats({
        products: p.length,
        categories: categories.length,
        coupons: coupons.length,
        news: news.length,
      })
    })
  }, [])

  const categoryChart = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of products) {
      map.set(p.categoryName, (map.get(p.categoryName) ?? 0) + 1)
    }
    return [...map.entries()]
      .map(([name, count]) => ({ name: name.length > 14 ? `${name.slice(0, 14)}…` : name, count, fullName: name }))
      .sort((a, b) => b.count - a.count)
  }, [products])

  const statusChart = useMemo(() => {
    const hot = products.filter((p) => p.isHot).length
    const sale = products.filter((p) => p.isSale).length
    const regular = products.length - hot - sale
    return [
      { name: "Hot", value: hot },
      { name: "Giảm giá", value: sale },
      { name: "Thường", value: Math.max(regular, 0) },
    ].filter((d) => d.value > 0)
  }, [products])

  const topSold = useMemo(() =>
    [...products]
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 6)
      .map((p) => ({
        name: p.name.length > 18 ? `${p.name.slice(0, 18)}…` : p.name,
        sold: p.soldCount,
        fullName: p.name,
      })),
  [products])

  const totalSold = useMemo(() => products.reduce((s, p) => s + p.soldCount, 0), [products])

  const orderStats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    revenue: orders
      .filter(o => o.status !== "Cancelled")
      .reduce((s, o) => s + o.totalPrice, 0),
  }), [orders])

  const statCards = [
    { label: "Đơn hàng", value: orderStats.total, icon: ShoppingBag, sub: `${orderStats.pending} chờ xử lý` },
    { label: "Doanh thu", value: formatPrice(orderStats.revenue), icon: TrendingUp, sub: "Đơn chưa hủy" },
    { label: "Sản phẩm", value: stats.products, icon: Package, sub: `${stats.categories} danh mục` },
    { label: "Mã giảm giá", value: stats.coupons, icon: Percent, sub: `${stats.news} tin tức` },
  ]

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
        <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">Tổng quan · {roleLabel}</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl lg:text-3xl">
          Chào mừng trở lại, {username}
        </h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <TrendingUp className="h-4 w-4 text-[#B8A07A]" />
          Tổng lượt bán: <span className="font-medium text-slate-700">{totalSold.toLocaleString("vi-VN")}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, sub }, i) => {
          const accent = STAT_ACCENT[i % STAT_ACCENT.length]
          return (
            <Card key={label} className="border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: accent.bg }}
                >
                  <Icon className="h-4 w-4" style={{ color: accent.icon }} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight text-slate-800">{value}</p>
                {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium text-slate-700">
              <Package className="h-4 w-4 text-[#B8A07A]" />
              Sản phẩm theo danh mục
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56 sm:h-72">
            {categoryChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke={CHART_THEME.grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART_THEME.axis }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: CHART_THEME.axis }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`${value} sp`, "Số lượng"]}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {categoryChart.map((_, i) => (
                      <Cell key={i} fill={chartColor(i)} fillOpacity={0.92} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-16 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium text-slate-700">
              <Flame className="h-4 w-4 text-[#C17B6E]" />
              Phân loại sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56 sm:h-72">
            {statusChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    stroke="#fff"
                    strokeWidth={3}
                  >
                    {statusChart.map((entry) => (
                      <Cell key={entry.name} fill={statusColor(entry.name)} fillOpacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} sp`, "Số lượng"]} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-sm text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-16 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium text-slate-700">
            <TrendingUp className="h-4 w-4 text-[#7D9B8A]" />
            Top sản phẩm bán chạy
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 sm:h-80">
          {topSold.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSold} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={CHART_THEME.grid} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: CHART_THEME.axis }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: CHART_THEME.axis }} axisLine={false} tickLine={false} className="sm:[&_text]:text-[11px]" />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${Number(value).toLocaleString("vi-VN")} đã bán`, "Lượt bán"]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                />
                <Bar dataKey="sold" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {topSold.map((_, i) => (
                    <Cell key={i} fill={chartColor(i)} fillOpacity={0.92} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
          )}
        </CardContent>
      </Card>

      {products.length > 0 && (
        <p className="text-center text-xs text-slate-400">
          Giá trung bình: {formatPrice(products.reduce((s, p) => s + p.price, 0) / products.length)}
        </p>
      )}
    </div>
  )
}
