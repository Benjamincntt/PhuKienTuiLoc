import { useEffect, useState } from "react"
import { ChevronDown, RefreshCw, Search, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"
import { api } from "@/services/api"
import type { Order, PagedResult } from "@/types"

const STATUS_LABELS: Record<string, string> = {
  Pending: "Chờ xác nhận",
  Confirmed: "Đã xác nhận",
  Shipping: "Đang giao",
  Delivered: "Đã giao",
  Cancelled: "Đã hủy",
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Shipping: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
}

const NEXT_STATUSES: Record<string, string[]> = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipping", "Cancelled"],
  Shipping: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

function OrderDetail({ order, onStatusChange }: { order: Order; onStatusChange: (newStatus: string) => void }) {
  const [updating, setUpdating] = useState(false)
  const nextStatuses = NEXT_STATUSES[order.status] ?? []

  async function handleUpdateStatus(status: string) {
    if (!confirm(`Cập nhật trạng thái sang "${STATUS_LABELS[status]}"?`)) return
    setUpdating(true)
    try {
      await api.updateOrderStatus(order.id, status)
      onStatusChange(status)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi cập nhật trạng thái")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Khách hàng</p>
          <p className="font-semibold">{order.customerName}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Số điện thoại</p>
          <p className="font-semibold">
            <a href={`tel:${order.customerPhone}`} className="text-primary hover:underline">
              {order.customerPhone}
            </a>
          </p>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <p className="text-xs text-muted-foreground">Địa chỉ giao hàng</p>
          <p className="font-medium">{order.customerAddress}</p>
        </div>
        {order.note && (
          <div className="space-y-1 sm:col-span-2">
            <p className="text-xs text-muted-foreground">Ghi chú</p>
            <p className="text-sm italic text-muted-foreground">{order.note}</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium">Sản phẩm</th>
              <th className="px-3 py-2 text-right font-medium">Đơn giá</th>
              <th className="px-3 py-2 text-right font-medium">SL</th>
              <th className="px-3 py-2 text-right font-medium">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="px-3 py-2">{item.productName}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{formatPrice(item.price)}</td>
                <td className="px-3 py-2 text-right">{item.quantity}</td>
                <td className="px-3 py-2 text-right font-medium">{formatPrice(item.subTotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {order.discountAmount > 0 && (
              <tr className="bg-green-50 text-green-700">
                <td colSpan={3} className="px-3 py-2 text-right font-medium flex items-center justify-end gap-1">
                  <Tag className="h-3.5 w-3.5 inline" /> Giảm giá ({order.couponCode})
                </td>
                <td className="px-3 py-2 text-right font-medium">-{formatPrice(order.discountAmount)}</td>
              </tr>
            )}
            <tr className="bg-muted/30">
              <td colSpan={3} className="px-3 py-2 text-right font-semibold">Tổng thanh toán</td>
              <td className="px-3 py-2 text-right font-bold text-primary">{formatPrice(order.totalPrice)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {nextStatuses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground self-center">Chuyển sang:</span>
          {nextStatuses.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={status === "Cancelled" ? "destructive" : "default"}
              onClick={() => handleUpdateStatus(status)}
              disabled={updating}
              className="rounded-full"
            >
              {STATUS_LABELS[status]}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export function OrdersPage() {
  const [result, setResult] = useState<PagedResult<Order> | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("")
  const [filterPhone, setFilterPhone] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)

  async function load(status = filterStatus, phone = filterPhone) {
    setLoading(true)
    try {
      const data = await api.getOrders({ status, phone })
      setResult(data)
      setOrders(data.items)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    load(filterStatus, filterPhone)
  }

  function handleStatusFilter(status: string) {
    setFilterStatus(status)
    load(status, filterPhone)
  }

  function handleStatusChange(orderId: number, newStatus: string) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
  }

  const statusCounts = Object.keys(STATUS_LABELS).reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
          <p className="text-sm text-muted-foreground">
            {result ? `${result.totalCount} đơn hàng` : "Đang tải..."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load()} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Bộ lọc nhanh theo trạng thái */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleStatusFilter("")}
          className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${filterStatus === "" ? "bg-primary text-primary-foreground border-primary" : "bg-white hover:bg-muted"}`}
        >
          Tất cả {orders.length > 0 && `(${orders.length})`}
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleStatusFilter(key)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${filterStatus === key ? "bg-primary text-primary-foreground border-primary" : "bg-white hover:bg-muted"}`}
          >
            {label} {statusCounts[key] > 0 && `(${statusCounts[key]})`}
          </button>
        ))}
      </div>

      {/* Tìm kiếm theo SĐT */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo số điện thoại..."
            value={filterPhone}
            onChange={e => setFilterPhone(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">Tìm</Button>
      </form>

      {/* Danh sách đơn hàng */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Không có đơn hàng nào.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                      #{order.id}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden text-right sm:block">
                      <p className="font-bold text-primary">{formatPrice(order.totalPrice)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === order.id ? "rotate-180" : ""}`} />
                  </div>
                </button>
              </CardHeader>

              {expandedId === order.id && (
                <CardContent className="border-t bg-muted/20 p-4">
                  <OrderDetail
                    order={order}
                    onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                  />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
