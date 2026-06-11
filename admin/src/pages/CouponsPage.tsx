import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePermissions } from "@/hooks/usePermissions"
import { api } from "@/services/api"
import type { Coupon } from "@/types"

const empty: Omit<Coupon, "id"> = { title: "", code: "", description: "" }

export function CouponsPage() {
  const { canManageCoupons } = usePermissions()
  const [items, setItems] = useState<Coupon[]>([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState<number | null>(null)

  const load = () => api.getCoupons().then(setItems)
  useEffect(() => { load() }, [])

  const save = async () => {
    if (editId) await api.updateCoupon(editId, form)
    else await api.createCoupon(form)
    setForm(empty)
    setEditId(null)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm("Xóa mã giảm giá?")) return
    await api.deleteCoupon(id)
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Mã giảm giá</h1>
      {canManageCoupons && (
        <Card>
          <CardHeader><CardTitle>{editId ? "Sửa" : "Thêm"} mã</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div><Label>Tiêu đề</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Mã</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
            <div><Label>Mô tả</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="flex gap-2 sm:col-span-3">
              <Button onClick={save}>{editId ? "Cập nhật" : "Thêm"}</Button>
              {editId && <Button variant="outline" onClick={() => { setEditId(null); setForm(empty) }}>Hủy</Button>}
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-[420px] w-full text-sm">
            <thead className="border-b bg-muted/50"><tr><th className="p-2 text-left sm:p-3">Tiêu đề</th><th className="p-2 text-left sm:p-3">Mã</th><th className="hidden p-2 text-left md:table-cell sm:p-3">Mô tả</th>{canManageCoupons && <th className="p-2 sm:p-3" />}</tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3">{c.title}</td>
                  <td className="p-3 font-mono">{c.code}</td>
                  <td className="hidden p-2 md:table-cell sm:p-3">{c.description}</td>
                  {canManageCoupons && (
                    <td className="p-3 text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setEditId(c.id); setForm({ title: c.title, code: c.code, description: c.description }) }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
