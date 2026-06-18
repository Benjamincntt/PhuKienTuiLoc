import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, Lock, Mail, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton"
import { useAuth } from "@/contexts/AuthContext"
import { Seo } from "@/components/seo/Seo"
import { cn } from "@/lib/utils"

type Mode = "login" | "register"

export function AccountPage() {
  const { login, register, loginWithGoogle, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // login fields
  const [identifier, setIdentifier] = useState("")
  // register fields
  const [fullName, setFullName] = useState("")
  const [emailOrPhone, setEmailOrPhone] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (isAuthenticated) navigate("/tai-khoan/don-hang", { replace: true })
  }, [isAuthenticated, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === "login") {
        await login({ identifier: identifier.trim(), password })
      } else {
        const value = emailOrPhone.trim()
        const isEmail = value.includes("@")
        await register({
          fullName: fullName.trim(),
          email: isEmail ? value : undefined,
          phone: isEmail ? undefined : value,
          password,
        })
      }
      navigate("/tai-khoan/don-hang", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle(idToken: string) {
    setError(null)
    setLoading(true)
    try {
      await loginWithGoogle(idToken)
      navigate("/tai-khoan/don-hang", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập Google thất bại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-8">
      <Seo title={mode === "login" ? "Đăng nhập" : "Đăng ký"} canonicalPath="/tai-khoan" />
      <Card>
        <CardHeader>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null) }}
              className={cn(
                "rounded-md py-2 text-sm font-medium transition-colors",
                mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground"
              )}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(null) }}
              className={cn(
                "rounded-md py-2 text-sm font-medium transition-colors",
                mode === "register" ? "bg-background shadow-sm" : "text-muted-foreground"
              )}
            >
              Đăng ký
            </button>
          </div>
          <CardTitle className="pt-2 text-center text-lg">
            {mode === "login" ? "Đăng nhập tài khoản" : "Tạo tài khoản mới"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="relative">
              {mode === "login" ? (
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              ) : (
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              )}
              <Input
                className="pl-10"
                placeholder="Email hoặc số điện thoại"
                value={mode === "login" ? identifier : emailOrPhone}
                onChange={(e) =>
                  mode === "login" ? setIdentifier(e.target.value) : setEmailOrPhone(e.target.value)
                }
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "Đăng nhập" : "Đăng ký"}
            </Button>
          </form>

          <div className="mt-4">
            <GoogleLoginButton onCredential={handleGoogle} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
