import { CheckCircle, Loader2, Minus, Plus, ShoppingCart, Tag, Trash2, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { onlinePaymentEnabled } from "@/config/features"
import { api, type ValidateCouponResult } from "@/services/api"
import { cn, formatPrice } from "@/lib/utils"

type PaymentMethod = "VNPAY" | "MOMO"

export function CartDrawer() {
  const { items, totalCount, totalPrice, isOpen, closeCart, removeFromCart, updateQuantity, clearCart } = useCart()
  const { customer } = useAuth()

  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart")
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("VNPAY")

  const [couponInput, setCouponInput] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponResult, setCouponResult] = useState<ValidateCouponResult | null>(null)
  const [couponError, setCouponError] = useState("")
  const [emailSent, setEmailSent] = useState<boolean | null>(null)

  const discountAmount = couponResult?.isValid ? couponResult.discountAmount : 0
  const finalPrice = totalPrice - discountAmount

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError("")
    setCouponResult(null)
    try {
      const result = await api.validateCoupon(couponInput, totalPrice)
      setCouponResult(result)
      if (!result.isValid) setCouponError(result.errorMessage ?? "Mã không hợp lệ.")
    } catch {
      setCouponError("Không thể kiểm tra mã. Vui lòng thử lại.")
    } finally {
      setCouponLoading(false)
    }
  }

  function handleRemoveCoupon() {
    setCouponInput("")
    setCouponResult(null)
    setCouponError("")
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên"
    if (!form.phone.trim()) e.phone = "Vui lòng nhập số điện thoại"
    else if (!/^0\d{9}$/.test(form.phone.trim())) e.phone = "Số điện thoại không hợp lệ (VD: 0912345678)"
    if (!form.address.trim()) e.address = "Vui lòng nhập địa chỉ giao hàng"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleOrder() {
    if (!validate()) return
    setApiError("")
    setLoading(true)
    try {
      const result = await api.createOrder({
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        customerAddress: form.address.trim(),
        note: form.note.trim(),
        couponCode: couponResult?.isValid ? couponInput.trim().toUpperCase() : undefined,
        paymentMethod: onlinePaymentEnabled ? paymentMethod : undefined,
        items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
      })
      clearCart()
      if (onlinePaymentEnabled && result.paymentUrl) {
        window.location.href = result.paymentUrl
        return
      }
      setEmailSent(result.emailNotificationSent ?? false)
      setStep("success")
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Đặt hàng thất bại. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    closeCart()
    setStep("cart")
    setForm({ name: "", phone: "", address: "", note: "" })
    setErrors({})
    setApiError("")
    setCouponInput("")
    setCouponResult(null)
    setCouponError("")
    setPaymentMethod("VNPAY")
    setEmailSent(null)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-background shadow-2xl">

        <div className="flex items-center justify-between border-b px-4 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">
              {step === "cart" ? "Giỏ hàng" : step === "checkout" ? "Thông tin đặt hàng" : "Đặt hàng thành công"}
            </h2>
            {step === "cart" && totalCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {totalCount}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">

          {step === "success" ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <CheckCircle className="h-20 w-20 text-green-500" />
              <h3 className="text-xl font-bold">Đặt hàng thành công!</h3>
              <p className="text-sm text-muted-foreground">
                Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ qua số{" "}
                <span className="font-semibold text-foreground">{form.phone}</span>{" "}
                {onlinePaymentEnabled
                  ? "để xác nhận trong thời gian sớm nhất."
                  : "để xác nhận và giao hàng. Thanh toán khi nhận hàng."}
              </p>
              {!onlinePaymentEnabled && emailSent === false && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Đơn đã lưu nhưng chưa gửi được email thông báo (cần cấu hình Gmail App Password trên server).
                </p>
              )}
              <Button className="rounded-full" onClick={handleClose}>Tiếp tục mua sắm</Button>
            </div>

          ) : step === "checkout" ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Họ và tên *</label>
                <Input placeholder="Nguyễn Văn A" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={loading} />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Số điện thoại *</label>
                <Input placeholder="0912345678" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={loading} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Địa chỉ giao hàng *</label>
                <Input placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))} disabled={loading} />
                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Ghi chú <span className="text-muted-foreground font-normal">(không bắt buộc)</span>
                </label>
                <Input placeholder="Giao giờ hành chính, gọi trước khi giao..."
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))} disabled={loading} />
              </div>

              {onlinePaymentEnabled && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phương thức thanh toán *</label>
                  <p className="text-xs text-muted-foreground">Bắt buộc thanh toán online để nhận hàng.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { id: "VNPAY" as const, label: "VNPay", desc: "Thẻ / ví / QR" },
                      { id: "MOMO" as const, label: "Momo", desc: "Ví MoMo" },
                    ]).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={loading}
                        onClick={() => setPaymentMethod(opt.id)}
                        className={cn(
                          "rounded-xl border p-3 text-left transition-colors",
                          paymentMethod === opt.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        <p className="text-sm font-semibold">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-muted p-3 space-y-1.5">
                <p className="text-sm font-semibold">Tóm tắt đơn hàng</p>
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-sm text-muted-foreground">
                    <span className="line-clamp-1 flex-1">{product.name} x{quantity}</span>
                    <span className="shrink-0 ml-2">{formatPrice(product.price * quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-1 text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      Giảm giá ({couponInput.toUpperCase()})
                    </span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1 text-sm font-bold">
                  <span>{onlinePaymentEnabled ? "Tổng thanh toán" : "Tổng cộng"}</span>
                  <span className="text-primary text-base">{formatPrice(finalPrice)}</span>
                </div>
                {!onlinePaymentEnabled && (
                  <p className="text-xs text-muted-foreground pt-1">Thanh toán khi nhận hàng (COD)</p>
                )}
              </div>

              {apiError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {apiError}
                </div>
              )}
            </div>

          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
              <p className="text-muted-foreground">Giỏ hàng trống</p>
              <Button variant="outline" onClick={handleClose}>Tiếp tục mua sắm</Button>
            </div>

          ) : (
            <div className="space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3 rounded-xl border p-3">
                  <img src={product.imageUrl} alt={product.name} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</p>
                    <p className="text-sm font-bold text-primary">{formatPrice(product.price)}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full"
                          onClick={() => updateQuantity(product.id, quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="min-w-[1.5rem] text-center text-sm font-medium">{quantity}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full"
                          onClick={() => updateQuantity(product.id, quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(product.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {step === "cart" && items.length > 0 && (
          <div className="border-t px-4 py-4 space-y-3">
            {couponResult?.isValid ? (
              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Tag className="h-4 w-4" />
                  <span className="font-mono font-semibold">{couponResult.coupon?.code}</span>
                  <span className="text-green-600">-{formatPrice(discountAmount)}</span>
                </div>
                <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập mã giảm giá..."
                  value={couponInput}
                  onChange={e => { setCouponInput(e.target.value); setCouponError("") }}
                  onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                  className="h-9 font-mono uppercase text-sm"
                />
                <Button variant="outline" size="sm" className="shrink-0 h-9" onClick={handleApplyCoupon} disabled={couponLoading || !couponInput.trim()}>
                  {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Áp dụng"}
                </Button>
              </div>
            )}
            {couponError && <p className="text-xs text-destructive">{couponError}</p>}

            <div className="space-y-1">
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Giảm giá</span>
                  <span className="font-medium">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tổng thanh toán ({totalCount} SP)</span>
                <span className="text-lg font-bold text-primary">{formatPrice(finalPrice)}</span>
              </div>
            </div>

            <Button
              className="w-full rounded-full"
              size="lg"
              onClick={() => {
                if (customer) {
                  setForm((f) => ({
                    ...f,
                    name: f.name || customer.fullName,
                    phone: f.phone || customer.phone || "",
                  }))
                }
                setStep("checkout")
              }}
            >
              Đặt hàng ngay
            </Button>
            <Button variant="outline" className="w-full rounded-full" onClick={handleClose}>
              Tiếp tục mua sắm
            </Button>
          </div>
        )}

        {step === "checkout" && (
          <div className="border-t px-4 py-4 space-y-3">
            <Button className="w-full rounded-full" size="lg" onClick={handleOrder} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {onlinePaymentEnabled ? "Đang chuyển cổng thanh toán..." : "Đang gửi đơn hàng..."}
                </>
              ) : onlinePaymentEnabled ? (
                `Thanh toán ${paymentMethod === "VNPAY" ? "VNPay" : "Momo"}`
              ) : (
                "Xác nhận đặt hàng"
              )}
            </Button>
            <Button variant="outline" className="w-full rounded-full" onClick={() => setStep("cart")} disabled={loading}>
              Quay lại giỏ hàng
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
