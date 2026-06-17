import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { ImageGalleryField } from "@/components/ImageGalleryField"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePermissions } from "@/hooks/usePermissions"
import { formatPrice } from "@/lib/utils"
import { api } from "@/services/api"
import type { Category, Product } from "@/types"

const empty = {
  name: "", slug: "", price: 0, originalPrice: "" as string | number,
  imageUrls: [] as string[], categoryId: 1, soldCount: 0, isHot: false, isSale: false,
}

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

export function ProductsPage() {
  const { canManageProducts, canUploadImages } = usePermissions()
  const [items, setItems] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState<number | null>(null)
  const [slugManual, setSlugManual] = useState(false)

  const load = () => { api.getProducts().then(setItems); api.getCategories().then(setCategories) }
  useEffect(() => { load() }, [])

  const payload = () => ({
    name: form.name,
    slug: form.slug,
    price: Number(form.price),
    originalPrice: form.originalPrice === "" ? null : Number(form.originalPrice),
    imageUrls: form.imageUrls,
    categoryId: Number(form.categoryId),
    soldCount: Number(form.soldCount),
    isHot: form.isHot,
    isSale: form.isSale,
  })

  const save = async () => {
    if (form.imageUrls.length === 0) {
      alert("Vui lòng thêm ít nhất 1 ảnh sản phẩm.")
      return
    }
    const data = payload()
    if (editId) await api.updateProduct(editId, data)
    else await api.createProduct(data)
    setForm(empty)
    setEditId(null)
    setSlugManual(false)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm("Xóa sản phẩm?")) return
    await api.deleteProduct(id)
    load()
  }

  const startEdit = (p: Product) => {
    setEditId(p.id)
    setSlugManual(true)
    setForm({
      name: p.name, slug: p.slug, price: p.price,
      originalPrice: p.originalPrice ?? "",
      imageUrls: p.imageUrls?.length ? p.imageUrls : (p.imageUrl ? [p.imageUrl] : []),
      categoryId: p.categoryId, soldCount: p.soldCount,
      isHot: p.isHot, isSale: p.isSale,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Sản phẩm</h1>
      {canManageProducts && (
        <Card>
          <CardHeader><CardTitle>{editId ? "Sửa" : "Thêm"} sản phẩm</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Tên sản phẩm *</Label>
              <Input
                placeholder="VD: Túi lọc trà vải không dệt"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value
                  setForm(f => ({ ...f, name, slug: slugManual ? f.slug : toSlug(name) }))
                }}
              />
            </div>
            <div>
              <Label>Slug <span className="text-xs text-muted-foreground font-normal">(tự sinh từ tên)</span></Label>
              <Input
                placeholder="tui-loc-tra-vai-khong-det"
                value={form.slug}
                onChange={(e) => { setSlugManual(true); setForm(f => ({ ...f, slug: e.target.value })) }}
                className="font-mono text-sm"
              />
            </div>
            <div><Label>Giá</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
            <div><Label>Giá gốc</Label><Input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} /></div>
            <ImageGalleryField
              value={form.imageUrls}
              onChange={(urls) => setForm({ ...form, imageUrls: urls })}
              disabled={!canUploadImages}
            />
            <div>
              <Label>Danh mục</Label>
              <select className="h-10 w-full rounded-md border px-3" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><Label>Đã bán</Label><Input type="number" value={form.soldCount} onChange={(e) => setForm({ ...form, soldCount: Number(e.target.value) })} /></div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isHot} onChange={(e) => setForm({ ...form, isHot: e.target.checked })} /> Hot</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isSale} onChange={(e) => setForm({ ...form, isSale: e.target.checked })} /> Sale</label>
            <div className="flex gap-2 sm:col-span-2">
              <Button onClick={save}>{editId ? "Cập nhật" : "Thêm"}</Button>
              {editId && <Button variant="outline" onClick={() => { setEditId(null); setForm(empty); setSlugManual(false) }}>Hủy</Button>}
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-[560px] w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-2 text-left sm:p-3">Ảnh</th>
                <th className="p-2 text-left sm:p-3">Tên</th>
                <th className="hidden p-2 text-left md:table-cell sm:p-3">Gallery</th>
                <th className="p-2 text-left sm:p-3">Giá</th>
                <th className="hidden p-2 text-left sm:table-cell sm:p-3">Danh mục</th>
                {canManageProducts && <th className="p-2 sm:p-3" />}
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-3">
                    {p.imageUrl && <img src={p.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />}
                  </td>
                  <td className="p-3 max-w-xs truncate">{p.name}</td>
                  <td className="hidden p-2 text-muted-foreground md:table-cell sm:p-3">{(p.imageUrls?.length ?? (p.imageUrl ? 1 : 0))} ảnh</td>
                  <td className="p-2 whitespace-nowrap sm:p-3">{formatPrice(p.price)}</td>
                  <td className="hidden p-2 sm:table-cell sm:p-3">{p.categoryName}</td>
                  {canManageProducts && (
                    <td className="p-3 text-right whitespace-nowrap">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
