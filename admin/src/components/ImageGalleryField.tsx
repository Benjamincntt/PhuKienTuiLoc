import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { api } from "@/services/api"

interface ImageGalleryFieldProps {
  value: string[]
  onChange: (urls: string[]) => void
  disabled?: boolean
  label?: string
}

export function ImageGalleryField({
  value,
  onChange,
  disabled,
  label = "Gallery ảnh sản phẩm",
}: ImageGalleryFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const uploadFiles = async (files: FileList) => {
    setUploading(true)
    setError("")
    const uploaded: string[] = []
    try {
      for (const file of Array.from(files)) {
        const res = await api.uploadImage(file)
        uploaded.push(res.url)
      }
      onChange([...value, ...uploaded])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload thất bại")
      if (uploaded.length > 0) onChange([...value, ...uploaded])
    } finally {
      setUploading(false)
    }
  }

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index))

  const move = (index: number, direction: -1 | 1) => {
    const next = index + direction
    if (next < 0 || next >= value.length) return
    const items = [...value]
    ;[items[index], items[next]] = [items[next], items[index]]
    onChange(items)
  }

  const setCover = (index: number) => {
    if (index === 0) return
    const items = [...value]
    const [cover] = items.splice(index, 1)
    onChange([cover, ...items])
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        {!disabled && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files
                if (files?.length) uploadFiles(files)
                e.target.value = ""
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              Thêm ảnh
            </Button>
          </>
        )}
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có ảnh. Upload ít nhất 1 ảnh cho sản phẩm.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-md border">
              <img src={url} alt="" className="aspect-square w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-1 top-1 flex items-center gap-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  <Star className="h-3 w-3" />
                  Ảnh bìa
                </span>
              )}
              {!disabled && (
                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {index > 0 && (
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => setCover(index)}>
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => move(index, -1)}>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => move(index, 1)}>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => remove(index)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">Ảnh đầu tiên là ảnh bìa hiển thị trên cửa hàng.</p>
    </div>
  )
}
