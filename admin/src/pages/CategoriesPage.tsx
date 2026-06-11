import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/services/api"
import type { Category } from "@/types"

const empty: Omit<Category, "id"> = { name: "", slug: "", icon: "" }

export function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState<number | null>(null)

  const load = () => api.getCategories().then(setItems)
  useEffect(() => { load() }, [])

  const save = async () => {
    if (editId) await api.updateCategory(editId, form)
    else await api.createCategory(form)
    setForm(empty)
    setEditId(null)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm("Xóa danh mục này?")) return
    await api.deleteCategory(id)
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Danh mục</h1>
      <Card>
        <CardHeader><CardTitle>{editId ? "Sửa" : "Thêm"} danh mục</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div><Label>Tên</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div><Label>Icon</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
          <div className="flex gap-2 sm:col-span-3">
            <Button onClick={save}>{editId ? "Cập nhật" : "Thêm"}</Button>
            {editId && <Button variant="outline" onClick={() => { setEditId(null); setForm(empty) }}>Hủy</Button>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-[400px] w-full text-sm">
            <thead className="border-b bg-muted/50"><tr><th className="p-2 text-left sm:p-3">Icon</th><th className="p-2 text-left sm:p-3">Tên</th><th className="hidden p-2 text-left sm:table-cell sm:p-3">Slug</th><th className="p-2 sm:p-3" /></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3">{c.icon}</td>
                  <td className="p-3">{c.name}</td>
                  <td className="hidden p-2 sm:table-cell sm:p-3">{c.slug}</td>
                  <td className="p-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => { setEditId(c.id); setForm({ name: c.name, slug: c.slug, icon: c.icon }) }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
