import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Seo } from "@/components/seo/Seo"
import { api, type OrderPublicResult } from "@/services/api"
import { formatPrice } from "@/lib/utils"

export function PaymentResultPage() {
  const [params] = useSearchParams()
  const orderId = Number(params.get("orderId") ?? "0")
  const success = params.get("success") === "1"
  const message = params.get("message") ?? (success ? "Thanh toán thành công." : "Thanh toán thất bại.")

  const [order, setOrder] = useState<OrderPublicResult | null>(null)
  const [loading, setLoading] = useState(!!orderId)

  useEffect(() => {
    if (!orderId) return
    api
      .getOrderPublic(orderId)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [orderId])

  const paid = order?.paymentStatus === "Paid" || success

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-12">
      <Seo title="Kết quả thanh toán" canonicalPath="/dat-hang/ket-qua" />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          {loading ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          ) : paid ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-destructive" />
          )}

          <h1 className="text-xl font-bold">
            {paid ? "Thanh toán thành công!" : "Thanh toán chưa hoàn tất"}
          </h1>

          <p className="text-sm text-muted-foreground">{decodeURIComponent(message)}</p>

          {order && (
            <div className="w-full rounded-lg bg-muted p-4 text-sm">
              <div className="flex justify-between">
                <span>Mã đơn</span>
                <span className="font-semibold">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng tiền</span>
                <span className="font-semibold text-primary">{formatPrice(order.totalPrice)}</span>
              </div>
              {order.pointsEarned > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Điểm thưởng</span>
                  <span className="font-semibold">+{order.pointsEarned}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button asChild className="rounded-full">
              <Link to="/products">Tiếp tục mua sắm</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/tai-khoan/don-hang">Đơn hàng của tôi</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
