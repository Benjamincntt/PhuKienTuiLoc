import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, LogOut, Package, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { api, type OrderResult } from "@/services/api"
import { Seo } from "@/components/seo/Seo"
import { formatPrice } from "@/lib/utils"

const STATUS_LABELS: Record<string, string> = {
  Pending: "Chờ xác nhận",
  Confirmed: "Đã xác nhận",
  Shipping: "Đang giao",
  Delivered: "Đã giao",
  Cancelled: "Đã hủy",
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  Unpaid: "Chưa thanh toán",
  Paid: "Đã thanh toán",
  Failed: "Thanh toán lỗi",
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  VNPAY: "VNPay",
  MOMO: "Momo",
}

export function MyOrdersPage() {
  const { customer, isAuthenticated, loading: authLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/tai-khoan", { replace: true })
    }
  }, [authLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (!isAuthenticated) return
    setLoading(true)
    api
      .getMyOrders()
      .then(setOrders)
      .catch(() => setError("Không tải được lịch sử đơn hàng."))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  function handleLogout() {
    logout()
    navigate("/", { replace: true })
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      <Seo title="Đơn hàng của tôi" canonicalPath="/tai-khoan/don-hang" />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="min-w-0">
            <CardTitle className="truncate">Xin chào, {customer?.fullName}</CardTitle>
            <p className="truncate text-sm text-muted-foreground">
              {customer?.email ?? customer?.phone}
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">{customer?.loyaltyPoints ?? 0} điểm thưởng</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Lịch sử đơn hàng</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Bạn chưa có đơn hàng nào.
            <div className="mt-4">
              <Button onClick={() => navigate("/products")}>Mua sắm ngay</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">Đơn #{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{STATUS_LABELS[order.status] ?? order.status}</Badge>
                    <Badge variant={order.paymentStatus === "Paid" ? "default" : "outline"}>
                      {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 border-t pt-3 text-sm">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-2">
                      <span className="min-w-0 truncate">
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="shrink-0">{formatPrice(item.subTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-muted-foreground">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                  </span>
                  <span className="font-bold text-primary">{formatPrice(order.totalPrice)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
