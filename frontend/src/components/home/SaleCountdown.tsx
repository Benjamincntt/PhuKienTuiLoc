import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

export function SaleCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 20, minutes: 15, seconds: 48 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev
        seconds -= 1
        if (seconds < 0) {
          seconds = 59
          minutes -= 1
        }
        if (minutes < 0) {
          minutes = 59
          hours -= 1
        }
        if (hours < 0) {
          hours = 23
          minutes = 59
          seconds = 59
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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
