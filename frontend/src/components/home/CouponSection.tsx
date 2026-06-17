import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Coupon } from "@/types"

interface CouponSectionProps {
  coupons: Coupon[]
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Card className="border-dashed border-primary/40 bg-white">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="secondary" className="mb-2">{coupon.title}</Badge>
          <p className="text-sm text-muted-foreground">{coupon.description}</p>
          <p className="mt-1 font-mono text-sm font-bold text-primary">{coupon.code}</p>
        </div>
        <Button
          variant={copied ? "default" : "outline"}
          size="sm"
          className="shrink-0 gap-1"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Đã sao chép!" : "Sao chép"}
        </Button>
      </CardContent>
    </Card>
  )
}

export function CouponSection({ coupons }: CouponSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Mã giảm giá hôm nay</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>
    </section>
  )
}
