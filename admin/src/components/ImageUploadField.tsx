import { useRef, useState } from "react"
import { ImagePlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/services/api"

interface ImageUploadFieldProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
  label?: string
}

export function ImageUploadField({ value, onChange, disabled, label = "Ảnh" }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const upload = async (file: File) => {
    setUploading(true)
    setError("")
    try {
      const res = await api.uploadImage(file)
      onChange(res.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload thất bại")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap items-start gap-4">
        {value && (
          <img
            src={value}
            alt="Preview"
            className="h-24 w-24 rounded-md border object-cover"
          />
        )}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex gap-2">
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="URL ảnh hoặc upload file"
              disabled={disabled}
            />
            {!disabled && (
              <>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) upload(file)
                    e.target.value = ""
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => inputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                  Upload
                </Button>
              </>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  )
}
