import { ArrowRight, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-accent to-primary p-6 text-primary-foreground shadow-lg md:p-10">
      <div className="relative z-10 max-w-xl space-y-4">
        <p className="inline-flex items-center gap-2 rounded-full bg-black/10 px-3 py-1 text-xs font-medium">
          <Timer className="h-4 w-4" />
          Siêu Sale Bùng Nổ
        </p>
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          Phụ kiện túi lọc chất lượng cao
        </h1>
        <p className="text-sm opacity-90 md:text-base">
          Túi lọc vải không dệt, giấy, sợi ngô, cotton — combo 100 chiếc giá tốt nhất thị trường.
        </p>
        <Button variant="secondary" className="gap-2 rounded-full font-semibold">
          Mua ngay
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 right-20 h-32 w-32 rounded-full bg-white/10 blur-xl" />
    </section>
  )
}
