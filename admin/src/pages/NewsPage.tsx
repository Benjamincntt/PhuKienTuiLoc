import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { ImageUploadField } from "@/components/ImageUploadField"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePermissions } from "@/hooks/usePermissions"
import { api } from "@/services/api"
import type { NewsArticle } from "@/types"

const empty = { title: "", excerpt: "", imageUrl: "", publishedAt: "" }

export function NewsPage() {
  const { canManageNews, canUploadImages } = usePermissions()
  const [items, setItems] = useState<NewsArticle[]>([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState<number | null>(null)

  const load = () => api.getNews().then(setItems)
  useEffect(() => { load() }, [])

  const save = async () => {
    const data = {
      title: form.title,
      excerpt: form.excerpt,
      imageUrl: form.imageUrl,
      ...(editId
        ? { publishedAt: form.publishedAt || new Date().toISOString() }
        : { publishedAt: form.publishedAt || undefined }),
    }
    if (editId) await api.updateNews(editId, data)
    else await api.createNews(data)
    setForm(empty)
    setEditId(null)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm("Xóa tin tức?")) return
    await api.deleteNews(id)
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Tin tức</h1>
      {canManageNews && (
        <Card>
          <CardHeader><CardTitle>{editId ? "Sửa" : "Thêm"} tin</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div><Label>Tiêu đề</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Tóm tắt</Label><Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
            <ImageUploadField
              label="Ảnh tin tức"
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              disabled={!canUploadImages}
            />
            <div className="flex gap-2">
              <Button onClick={save}>{editId ? "Cập nhật" : "Thêm"}</Button>
              {editId && <Button variant="outline" onClick={() => { setEditId(null); setForm(empty) }}>Hủy</Button>}
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-[480px] w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-3 text-left">Ảnh</th>
                <th className="p-3 text-left">Tiêu đề</th>
                <th className="p-3 text-left">Ngày</th>
                {canManageNews && <th className="p-3" />}
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id} className="border-b">
                  <td className="p-3">
                    {n.imageUrl && <img src={n.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />}
                  </td>
                  <td className="p-3 max-w-md truncate">{n.title}</td>
                  <td className="p-3">{new Date(n.publishedAt).toLocaleDateString("vi-VN")}</td>
                  {canManageNews && (
                    <td className="p-3 text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setEditId(n.id); setForm({ title: n.title, excerpt: n.excerpt, imageUrl: n.imageUrl, publishedAt: n.publishedAt }) }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
