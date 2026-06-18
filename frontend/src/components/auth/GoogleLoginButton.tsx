import { useEffect, useRef } from "react"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const GSI_SRC = "https://accounts.google.com/gsi/client"

declare global {
  interface Window {
    google?: any
  }
}

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve()
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
    if (existing) {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () => reject(new Error("GSI load error")))
      return
    }
    const script = document.createElement("script")
    script.src = GSI_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("GSI load error"))
    document.head.appendChild(script)
  })
}

interface Props {
  onCredential: (idToken: string) => void
}

/** Nút "Đăng nhập với Google" — chỉ hiển thị khi đã cấu hình VITE_GOOGLE_CLIENT_ID. */
export function GoogleLoginButton({ onCredential }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let cancelled = false

    loadGsiScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.accounts?.id) return
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: { credential?: string }) => {
            if (response.credential) onCredential(response.credential)
          },
        })
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "signin_with",
          locale: "vi",
        })
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [onCredential])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        hoặc
        <span className="h-px flex-1 bg-border" />
      </div>
      <div ref={containerRef} className="flex justify-center" />
    </div>
  )
}
