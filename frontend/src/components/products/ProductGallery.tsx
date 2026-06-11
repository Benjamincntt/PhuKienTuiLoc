import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: string[]
  alt: string
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const gallery = images.length > 0 ? images : []
  const [active, setActive] = useState(0)

  if (gallery.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground">
        Chưa có ảnh
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
        <img
          src={gallery[active]}
          alt={alt}
          className="h-full w-full object-cover"
        />
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {gallery.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                active === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
