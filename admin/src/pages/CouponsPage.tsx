import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePermissions } from "@/hooks/usePermissions"
import { formatPrice } from "@/lib/utils"
import { api } from "@/services/api"
import type { Coupon } from "@/types"

const DISCOUNT_TYPES = [
  { value: "Percent", label: "Phần trăm (%)" },
  { value: "Fixed", label: "Số tiền cố định (đ)" },
]

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
  expired: "bg-red-100 text-red-700",
  exhausted: "bg-yellow-100 text-yellow-800",
}

function getCouponStatus(c: Coupon): { label: string; color: string } {
  if (!c.isActive) return { label: "Tắt", color: STATUS_COLORS.inactive }
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return { label: "Hết hạn", color: STATUS_COLORS.expired }
  if (c.maxUses !== null && c.usedCount >= c.maxUses) return { label: "Hết lượt", color: STATUS_COLORS.exhausted }
  return { label: "Đang hoạt động", color: STATUS_COLORS.active }
}

const emptyForm = {
  title: "", code: "", description: "",
  discountType: "Percent", discountValue: 10,
  minOrderAmount: 0, maxUses: "" as string | number,
  expiresAt: "", isActive: true,
}

export function CouponsPage() {
  const { canManageCoupons } = usePermissions()
  const [items, setItems] = useState<Coupon[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const load = () => api.getCoupons().then(setItems)
  useEffect(() => { load() }, [])

  function set<K extends keyof typeof emptyForm>(key: K, value: typeof emptyForm[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  const toPayload = () => ({
    title: form.title.trim(),
    code: form.code.trim().toUpperCase(),
    description: form.description.trim(),
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    minOrderAmount: Number(form.minOrderAmount),
    maxUses: form.maxUses === "" || form.maxUses === 0 ? null : Number(form.maxUses),
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    isActive: form.isActive,
  })

  const save = async () => {
    setError("")
    if (!form.title.trim() || !form.code.trim()) { setError("Vui lòng điền tiêu đề và mã."); return }
    if (Number(form.discountValue) <= 0) { setError("Giá trị giảm phải > 0."); return }
    if (form.discountType === "Percent" && Number(form.discountValue) > 100) { setError("Phần trăm giảm không thể > 100%."); return }
    setSaving(true)
    try {
      if (editId) await api.updateCoupon(editId, toPayload())
      else await api.createCoupon(toPayload())
      setForm(emptyForm)
      setEditId(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi lưu dữ liệu.")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm("Xóa mã giảm giá?")) return
    await api.deleteCoupon(id)
    load()
  }

  const startEdit = (c: Coupon) => {
    setEditId(c.id)
    setForm({
      title: c.title, code: c.code, description: c.description,
      discountType: c.discountType, discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount,
      maxUses: c.maxUses ?? "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : "",
      isActive: c.isActive,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Mã giảm giá</h1>

      {canManageCoupons && (
        <Card>
          <CardHeader><CardTitle>{editId ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <Label>Tiêu đề *</Label>
                <Input placeholder="VD: Giảm 10% cho đơn đầu" value={form.title} onChange={e => set("title", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Mã code *</Label>
                <Input placeholder="VD: SALE10" value={form.code}
                  onChange={e => set("code", e.target.value.toUpperCase())} className="font-mono uppercase" />
              </div>
              <div className="space-y-1">
                <Label>Mô tả</Label>
                <Input placeholder="Mô tả ngắn hiển thị trên web" value={form.description} onChange={e => set("description", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Loại giảm giá</Label>
                <select
                  value={form.discountType}
                  onChange={e => set("discountType", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  {DISCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Giá trị giảm *{form.discountType === "Percent" ? " (%)" : " (đ)"}</Label>
                <Input type="number" min={0} max={form.discountType === "Percent" ? 100 : undefined}
                  placeholder={form.discountType === "Percent" ? "VD: 10" : "VD: 50000"}
                  value={form.discountValue}
                  onChange={e => set("discountValue", Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label>Đơn tối thiểu (đ)</Label>
                <Input type="number" min={0} placeholder="0 = không yêu cầu"
                  value={form.minOrderAmount}
                  onChange={e => set("minOrderAmount", Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label>Giới hạn lượt dùng</Label>
                <Input type="number" min={0} placeholder="Để trống = không giới hạn"
                  value={form.maxUses}
                  onChange={e => set("maxUses", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Ngày hết hạn</Label>
                <Input type="datetime-local" value={form.expiresAt}
                  onChange={e => set("expiresAt", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Trạng thái</Label>
                <div className="flex h-9 items-center gap-3">
                  <input type="checkbox" id="isActive" checked={form.isActive}
                    onChange={e => set("isActive", e.target.checked)} className="h-4 w-4" />
                  <label htmlFor="isActive" className="text-sm">Kích hoạt</label>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button onClick={save} disabled={saving}>
                {saving ? "Đang lưu..." : editId ? "Cập nhật" : "Thêm mã"}
              </Button>
              {editId && (
                <Button variant="outline" onClick={() => { setEditId(null); setForm(emptyForm); setError("") }}>
                  Hủy
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bảng danh sách */}
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-3 text-left">Mã / Tiêu đề</th>
                <th className="p-3 text-left">Giảm giá</th>
                <th className="p-3 text-left">Điều kiện</th>
                <th className="p-3 text-left">Lượt dùng</th>
                <th className="p-3 text-left">Hết hạn</th>
                <th className="p-3 text-left">Trạng thái</th>
                {canManageCoupons && <th className="p-3" />}
              </tr>
            </thead>
            <tbody>
              {items.map(c => {
                const status = getCouponStatus(c)
                return (
                  <tr key={c.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">
                      <p className="font-mono font-bold text-primary">{c.code}</p>
                      <p className="text-xs text-muted-foreground">{c.title}</p>
                    </td>
                    <td className="p-3 font-semibold">
                      {c.discountType === "Percent"
                        ? `${c.discountValue}%`
                        : formatPrice(c.discountValue)}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {c.minOrderAmount > 0 ? `Từ ${formatPrice(c.minOrderAmount)}` : "Không yêu cầu"}
                    </td>
                    <td className="p-3">
                      {c.usedCount}{c.maxUses !== null ? ` / ${c.maxUses}` : ""}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString("vi-VN")
                        : "Không hết hạn"}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    {canManageCoupons && (
                      <td className="p-3 text-right">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(c.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    )}
                  </tr>
                )
              })}
              {items.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Chưa có mã giảm giá.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
