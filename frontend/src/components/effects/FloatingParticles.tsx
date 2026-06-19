import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  opacity: number
}

function createParticles(width: number, height: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 1 + Math.random() * 2.5,
    speedY: 0.15 + Math.random() * 0.35,
    speedX: (Math.random() - 0.5) * 0.25,
    opacity: 0.25 + Math.random() * 0.45,
  }))
}

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isMobile = window.matchMedia("(max-width: 767px)").matches
    if (reducedMotion || isMobile) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId = 0
    let particles: Particle[] = []

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const { width, height } = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = createParticles(width, height, width > 640 ? 36 : 20)
    }

    const draw = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.y -= p.speedY
        p.x += p.speedX

        if (p.y < -p.size) {
          p.y = height + p.size
          p.x = Math.random() * width
        }
        if (p.x < -p.size) p.x = width + p.size
        if (p.x > width + p.size) p.x = -p.size

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
        ctx.fill()
      }

      animationId = window.requestAnimationFrame(draw)
    }

    resize()
    draw()

    const observer = new ResizeObserver(resize)
    observer.observe(canvas.parentElement!)

    return () => {
      window.cancelAnimationFrame(animationId)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  )
}
