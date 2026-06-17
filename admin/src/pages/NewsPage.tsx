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

const empty = { title: "", excerpt: "", content: "", imageUrl: "", publishedAt: "" }

export function NewsPage() {
  const { canManageNews, canUploadImages } = usePermissions()
  const [items, setItems] = useState<NewsArticle[]>([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const load = () => api.getNews().then(setItems)
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.title.trim()) { setError("Vui lòng nhập tiêu đề."); return }
    setError("")
    setSaving(true)
    try {
      const data = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi lưu dữ liệu.")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm("Xóa tin tức?")) return
    await api.deleteNews(id)
    load()
  }

  const startEdit = (n: NewsArticle) => {
    setEditId(n.id)
    setForm({
      title: n.title,
      excerpt: n.excerpt,
      content: n.content ?? "",
      imageUrl: n.imageUrl,
      publishedAt: n.publishedAt,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Tin tức</h1>

      {canManageNews && (
        <Card>
          <CardHeader><CardTitle>{editId ? "Sửa" : "Thêm"} tin tức</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label>Tiêu đề *</Label>
                <Input
                  placeholder="Tiêu đề bài viết"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Tóm tắt <span className="text-muted-foreground font-normal">(hiển thị ở trang chủ)</span></Label>
                <Input
                  placeholder="1-2 câu tóm tắt nội dung bài viết"
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Nội dung đầy đủ <span className="text-muted-foreground font-normal">(hiển thị trang chi tiết, hỗ trợ HTML)</span></Label>
                <textarea
                  placeholder="Nội dung đầy đủ của bài viết. Hỗ trợ HTML cơ bản: <b>, <p>, <ul>, <li>, <h2>..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                />
              </div>
              <div className="space-y-1">
                <Label>Ngày đăng <span className="text-muted-foreground font-normal">(để trống = ngay bây giờ)</span></Label>
                <Input
                  type="datetime-local"
                  value={form.publishedAt ? form.publishedAt.slice(0, 16) : ""}
                  onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                />
              </div>
            </div>

            <ImageUploadField
              label="Ảnh tin tức"
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              disabled={!canUploadImages}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button onClick={save} disabled={saving}>
                {saving ? "Đang lưu..." : editId ? "Cập nhật" : "Thêm bài viết"}
              </Button>
              {editId && (
                <Button variant="outline" onClick={() => { setEditId(null); setForm(empty); setError("") }}>
                  Hủy
                </Button>
              )}
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
                <th className="p-3 text-left hidden md:table-cell">Tóm tắt</th>
                <th className="p-3 text-left">Ngày đăng</th>
                {canManageNews && <th className="p-3" />}
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id} className="border-b hover:bg-muted/30">
                  <td className="p-3">
                    {n.imageUrl && <img src={n.imageUrl} alt="" className="h-10 w-16 rounded object-cover" />}
                  </td>
                  <td className="p-3 font-medium max-w-[200px] truncate">{n.title}</td>
                  <td className="p-3 text-muted-foreground max-w-xs truncate hidden md:table-cell">{n.excerpt}</td>
                  <td className="p-3 text-muted-foreground whitespace-nowrap">
                    {new Date(n.publishedAt).toLocaleDateString("vi-VN")}
                  </td>
                  {canManageNews && (
                    <td className="p-3 text-right">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(n)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(n.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Chưa có bài viết.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
