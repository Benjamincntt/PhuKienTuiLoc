import { Link } from "react-router-dom"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:py-12 lg:grid-cols-4">
        <div>
          <Link to="/" className="mb-3 block font-bold text-primary">Phụ Kiện Túi Lọc</Link>
          <p className="text-sm text-muted-foreground">
            Chuyên cung cấp túi lọc vải không dệt, giấy, sợi ngô, cotton và phụ kiện pha trà, cà phê.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Danh mục</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-primary">Túi lọc trà phổ thông</Link></li>
            <li><Link to="/products" className="hover:text-primary">Túi lọc trà cao cấp</Link></li>
            <li><Link to="/products" className="hover:text-primary">Bóng lọc trà inox</Link></li>
            <li><Link to="/products" className="hover:text-primary">Túi OFF đựng bánh, kẹo</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Hỗ trợ</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-primary">Chính sách đổi trả</Link></li>
            <li><Link to="/products" className="hover:text-primary">Vận chuyển & thanh toán</Link></li>
            <li><Link to="/products" className="hover:text-primary">Hướng dẫn mua hàng</Link></li>
            <li><Link to="/products" className="hover:text-primary">Liên hệ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Liên hệ</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="tel:1900xxxx" className="hover:text-primary">Hotline: 1900 xxxx</a></li>
            <li><a href="mailto:support@baobiantea.com" className="hover:text-primary">support@baobiantea.com</a></li>
            <li>Giờ làm việc: 8:00 - 21:00</li>
          </ul>
        </div>
      </div>
      <Separator />
      <p className="px-4 py-4 text-center text-xs text-muted-foreground">
        © 2026 Phụ Kiện Túi Lọc. All rights reserved.
      </p>
    </footer>
  )
}
