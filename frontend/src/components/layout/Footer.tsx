import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:py-12 lg:grid-cols-4">
        <div>
          <h3 className="mb-3 font-bold text-primary">Phụ Kiện Túi Lọc</h3>
          <p className="text-sm text-muted-foreground">
            Chuyên cung cấp túi lọc vải không dệt, giấy, sợi ngô, cotton và phụ kiện pha trà, cà phê.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Danh mục</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Túi lọc trà phổ thông</li>
            <li>Túi lọc trà cao cấp</li>
            <li>Bóng lọc trà inox</li>
            <li>Túi OFF đựng bánh, kẹo</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Hỗ trợ</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Chính sách đổi trả</li>
            <li>Vận chuyển & thanh toán</li>
            <li>Hướng dẫn mua hàng</li>
            <li>Liên hệ</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Liên hệ</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Hotline: 1900 xxxx</li>
            <li>Email: support@phukientuiloc.com</li>
            <li>Giờ làm việc: 8:00 - 21:00</li>
          </ul>
        </div>
      </div>
      <Separator />
      <p className="px-4 py-4 text-center text-xs text-muted-foreground">
        © 2026 Phụ Kiện Túi Lọc. Thiết kế theme vàng.
      </p>
    </footer>
  )
}
