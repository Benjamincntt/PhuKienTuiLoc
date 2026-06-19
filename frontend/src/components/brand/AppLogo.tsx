import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

/** Cropped transparent PNG — 628×261 */
const LOGO_SRC = "/logo-antea.png"

const logoSizes = {
  md: "h-11 w-auto sm:h-12",
  lg: "h-12 w-auto sm:h-14",
} as const

interface AppLogoProps {
  size?: keyof typeof logoSizes
  /** Show tagline beside logo (desktop by default). */
  showText?: boolean
  /** When false, tagline shows on all breakpoints (e.g. footer). */
  compactText?: boolean
  subtitle?: string
  className?: string
  asLink?: boolean
}

export function AppLogo({
  size = "md",
  showText = true,
  compactText = true,
  subtitle = "Tổng Kho Túi Lọc - Bao Bì Trà",
  className,
  asLink = true,
}: AppLogoProps) {
  const content = (
    <div className={cn("flex min-w-0 items-center gap-2.5 sm:gap-3", className)}>
      <img
        src={LOGO_SRC}
        alt="AnTea"
        width={628}
        height={261}
        className={cn("block shrink-0 object-contain", logoSizes[size])}
      />
      {showText && subtitle && (
        <p
          className={cn(
            "max-w-[8.5rem] text-[11px] font-medium leading-snug text-muted-foreground sm:max-w-[10rem] lg:max-w-none lg:text-xs",
            compactText ? "hidden sm:block" : "block",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )

  if (!asLink) return content

  return (
    <Link to="/" className="shrink-0 transition-opacity hover:opacity-90">
      {content}
    </Link>
  )
}
