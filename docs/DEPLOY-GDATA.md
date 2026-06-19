# Deploy AnTea lên máy chủ Gdata

## Thông tin server (ví dụ)

| Mục | Giá trị |
|-----|---------|
| Host | `YOUR_SERVER_IP` (LAN hoặc IP public) |
| User | `root` |
| Domain | `baobiantea.com` (trỏ DNS về IP public) |

> **Bảo mật:** Không gửi mật khẩu root qua chat/email. Sau khi cài xong, đổi mật khẩu root ngay.

---

## Bước 1 — SSH vào server

Từ máy trong cùng mạng LAN (hoặc VPN tới Gdata):

```bash
ssh root@YOUR_SERVER_IP
```

---

## Bước 2 — Cài đặt lần đầu (tự động)

```bash
apt-get update && apt-get install -y git
git clone https://github.com/Benjamincntt/PhuKienTuiLoc.git /var/www/PhuKienTuiLoc
cd /var/www/PhuKienTuiLoc

# Tùy chọn: truyền domain + SQL password
DOMAIN=baobiantea.com \
SQL_USER=hieunl \
SQL_PASSWORD='MAT_KHAU_SQL_CUA_BAN' \
bash scripts/gdata-server-setup.sh
```

Nếu test bằng IP LAN trước khi có domain:

```bash
DOMAIN=YOUR_SERVER_IP bash scripts/gdata-server-setup.sh
```

---

## Bước 3 — Sửa cấu hình Production

```bash
nano /var/www/PhuKienTuiLoc/backend/appsettings.Production.json
```

Bắt buộc sửa:

- `ConnectionStrings:DefaultConnection` — SQL Server
- `Jwt:Key` — chuỗi bí mật ≥ 32 ký tự (khác dev)
- `Admin:Users` — đổi mật khẩu admin
- `Smtp:Password` — Gmail App Password
- `Site:FrontendUrl` / `Site:BackendUrl` — URL thật (https://baobiantea.com)

Sau đó:

```bash
cd /var/www/PhuKienTuiLoc
bash deploy.sh be
```

---

## Bước 4 — SQL Server

Nếu chưa có SQL Server trên máy:

```bash
# Ubuntu — xem hướng dẫn chính thức Microsoft
# https://learn.microsoft.com/sql/linux/sql-server-linux-setup-ubuntu
```

Tạo database (sqlcmd):

```sql
CREATE DATABASE PhuKienTuiLocDb;
CREATE LOGIN hieunl WITH PASSWORD = 'MAT_KHAU_MANH';
USE PhuKienTuiLocDb;
CREATE USER hieunl FOR LOGIN hieunl;
ALTER ROLE db_owner ADD MEMBER hieunl;
```

Migration:

```bash
cd /var/www/PhuKienTuiLoc/backend
dotnet ef database update
```

---

## Bước 5 — DNS + HTTPS

1. Trỏ A record `baobiantea.com` → IP public của server Gdata
2. Cài SSL:

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d baobiantea.com -d www.baobiantea.com
```

3. Cập nhật `Site:FrontendUrl` / `BackendUrl` thành `https://...`
4. Tạo `frontend/.env.production`:

```
VITE_SITE_URL=https://baobiantea.com
```

5. Deploy lại:

```bash
cd /var/www/PhuKienTuiLoc && git pull && bash deploy.sh all
```

---

## Deploy cập nhật hàng ngày

```bash
cd /var/www/PhuKienTuiLoc
git pull
bash deploy.sh all          # fe + admin + backend
# hoặc riêng lẻ:
# bash deploy.sh fe
# bash deploy.sh admin
# bash deploy.sh be
```

---

## Kiểm tra logo / favicon (Google)

Sau deploy, các URL phải trả **ảnh**, không phải HTML:

- `http://YOUR_DOMAIN/favicon.png`
- `http://YOUR_DOMAIN/logo-antea.png`
- `http://YOUR_DOMAIN/og-image.jpg`

```bash
curl -I https://baobiantea.com/favicon.png
# Content-Type: image/png
```

---

## URL sau khi chạy

| App | URL |
|-----|-----|
| Cửa hàng | `http://DOMAIN/` |
| Admin | `http://DOMAIN/admin-panel/` |
| API | `http://DOMAIN/api/` |

Admin mặc định (seed): `admin` / mật khẩu trong `appsettings.Production.json`

---

## Xử lý lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách sửa |
|-------------|-------------|----------|
| Logo Google mất | `/favicon.png` trả HTML | Deploy fe + nginx block static files (đã có trong script) |
| API 502 | Backend chưa chạy | `systemctl status phukientuilor` → `journalctl -u phukientuilor -n 50` |
| DB lỗi | Sai connection string | Sửa `appsettings.Production.json` |
| Admin trắng | Sai base path | Build admin với `VITE_BASE_URL=/admin-panel/` (deploy.sh đã set) |
