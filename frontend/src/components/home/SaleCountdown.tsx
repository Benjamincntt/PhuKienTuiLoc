import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

function getDeadline() {
  // Deadline: 23:59:59 hôm nay
  const d = new Date()
  d.setHours(23, 59, 59, 0)
  return d
}

function calcTimeLeft(deadline: Date) {
  const diff = Math.max(0, deadline.getTime() - Date.now())
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1000)
  return { hours, minutes, seconds }
}

export function SaleCountdown() {
  const [deadline] = useState(getDeadline)
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(deadline))

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft(deadline)), 1000)
    return () => clearInterval(timer)
  }, [deadline])

  return (
    <Card className="border-primary/30 bg-secondary/60">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div>
          <p className="text-sm font-semibold text-secondary-foreground">Nhanh tay chỉ còn</p>
          <p className="text-xs text-muted-foreground">Ưu đãi kết thúc sau</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-2xl font-bold text-primary">
          <span className="rounded-lg bg-primary px-3 py-1 text-primary-foreground">
            {pad(timeLeft.hours)}
          </span>
          <span>:</span>
          <span className="rounded-lg bg-primary px-3 py-1 text-primary-foreground">
            {pad(timeLeft.minutes)}
          </span>
          <span>:</span>
          <span className="rounded-lg bg-primary px-3 py-1 text-primary-foreground">
            {pad(timeLeft.seconds)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
