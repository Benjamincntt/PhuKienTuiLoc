import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/services/api"
import type { Category } from "@/types"

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

const empty: Omit<Category, "id"> = { name: "", slug: "", icon: "" }

export function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState<number | null>(null)
  const [slugManual, setSlugManual] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = () => api.getCategories().then(setItems)
  useEffect(() => { load() }, [])

  function handleNameChange(name: string) {
    setForm(f => ({
      ...f,
      name,
      slug: slugManual ? f.slug : toSlug(name),
    }))
  }

  function handleSlugChange(slug: string) {
    setSlugManual(true)
    setForm(f => ({ ...f, slug }))
  }

  const save = async () => {
    if (!form.name.trim() || !form.slug.trim()) return
    setSaving(true)
    try {
      if (editId) await api.updateCategory(editId, form)
      else await api.createCategory(form)
      setForm(empty)
      setEditId(null)
      setSlugManual(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm("Xóa danh mục này?")) return
    await api.deleteCategory(id)
    load()
  }

  const startEdit = (c: Category) => {
    setEditId(c.id)
    setForm({ name: c.name, slug: c.slug, icon: c.icon })
    setSlugManual(true)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Danh mục</h1>
      <Card>
        <CardHeader><CardTitle>{editId ? "Sửa" : "Thêm"} danh mục</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>Tên danh mục *</Label>
            <Input
              placeholder="VD: Túi lọc trà"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>
              Slug{" "}
              <span className="text-xs text-muted-foreground font-normal">(tự sinh từ tên)</span>
            </Label>
            <Input
              placeholder="tui-loc-tra"
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label>Icon <span className="text-xs text-muted-foreground font-normal">(emoji)</span></Label>
            <Input
              placeholder="🍵"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
          </div>
          <div className="flex gap-2 sm:col-span-3">
            <Button onClick={save} disabled={saving || !form.name.trim() || !form.slug.trim()}>
              {saving ? "Đang lưu..." : editId ? "Cập nhật" : "Thêm"}
            </Button>
            {editId && (
              <Button variant="outline" onClick={() => { setEditId(null); setForm(empty); setSlugManual(false) }}>
                Hủy
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-[400px] w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-3 text-left">Icon</th>
                <th className="p-3 text-left">Tên</th>
                <th className="hidden p-3 text-left sm:table-cell">Slug</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b hover:bg-muted/30">
                  <td className="p-3 text-lg">{c.icon}</td>
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="hidden p-3 font-mono text-muted-foreground sm:table-cell">{c.slug}</td>
                  <td className="p-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Chưa có danh mục.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
