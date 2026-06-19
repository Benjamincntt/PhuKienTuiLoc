import { useState, type CSSProperties } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { DEFAULT_ADMIN_BG } from "@/lib/theme"

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(username, password)
      navigate("/")
    } catch {
      setError("Sai tên đăng nhập hoặc mật khẩu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="admin-login-bg flex min-h-screen items-center justify-center p-4"
      style={{ "--admin-bg-image": `url("${DEFAULT_ADMIN_BG}")` } as CSSProperties}
    >
      <Card className="w-full max-w-md border-white/20 bg-white/95 shadow-2xl backdrop-blur-md">
        <CardHeader className="text-center">
          <img
            src={`${import.meta.env.BASE_URL}logo-antea.png`}
            alt="AnTea"
            className="mx-auto mb-3 h-10 w-auto object-contain"
          />
          <CardTitle className="text-2xl">Đăng nhập quản trị</CardTitle>
          <p className="text-sm text-muted-foreground">Tổng Kho Túi Lọc - Bao Bì Trà — Admin Panel</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
