#!/usr/bin/env bash
# Cai dat lan dau tren may chu Gdata (Ubuntu/Debian).
# Chay voi quyen root:
#   bash scripts/gdata-server-setup.sh
#
# Bien moi truong (tuy chon):
#   DOMAIN=baobiantea.com
#   REPO=https://github.com/Benjamincntt/PhuKienTuiLoc.git
#   SQL_USER=hieunl
#   SQL_PASSWORD=your_sql_password

set -euo pipefail

DOMAIN="${DOMAIN:-baobiantea.com}"
REPO="${REPO:-https://github.com/Benjamincntt/PhuKienTuiLoc.git}"
PROJECT_DIR="${PROJECT_DIR:-/var/www/PhuKienTuiLoc}"
SQL_USER="${SQL_USER:-hieunl}"
SQL_PASSWORD="${SQL_PASSWORD:-}"

echo "==> 1. Cap nhat he thong + cai goi co ban"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git nginx ca-certificates gnupg lsb-release

echo "==> 2. Cai Node.js 20"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

echo "==> 3. Cai .NET 10 SDK + Runtime"
if ! command -v dotnet >/dev/null 2>&1; then
  curl -fsSL https://packages.microsoft.com/config/ubuntu/$(. /etc/os-release && echo "$VERSION_ID")/packages-microsoft-prod.deb -o /tmp/packages-microsoft-prod.deb
  dpkg -i /tmp/packages-microsoft-prod.deb
  apt-get update -y
  apt-get install -y dotnet-sdk-10.0 aspnetcore-runtime-10.0
fi
dotnet --list-runtimes | head -5

echo "==> 4. SQL Server (Linux) — bo qua neu da co SQL"
if ! command -v sqlcmd >/dev/null 2>&1; then
  echo "    Chua co sqlcmd. Neu can cai SQL Server Linux, xem:"
  echo "    https://learn.microsoft.com/sql/linux/sql-server-linux-setup-ubuntu"
  echo "    Sau do tao DB + user:"
  echo "      CREATE DATABASE PhuKienTuiLocDb;"
  echo "      CREATE LOGIN ${SQL_USER} WITH PASSWORD = '...';"
  echo "      USE PhuKienTuiLocDb; CREATE USER ${SQL_USER} FOR LOGIN ${SQL_USER};"
  echo "      ALTER ROLE db_owner ADD MEMBER ${SQL_USER};"
else
  echo "    sqlcmd da co san"
fi

echo "==> 5. Clone / cap nhat source"
mkdir -p /var/www
if [ ! -d "$PROJECT_DIR/.git" ]; then
  git clone "$REPO" "$PROJECT_DIR"
else
  git -C "$PROJECT_DIR" pull
fi

echo "==> 6. Tao thu muc publish"
mkdir -p /var/www/publish/store /var/www/publish/admin /var/www/publish/backend
mkdir -p /var/www/publish/backend/uploads/images
chown -R www-data:www-data /var/www/publish

echo "==> 7. appsettings.Production.json"
PROD_FILE="$PROJECT_DIR/backend/appsettings.Production.json"
if [ ! -f "$PROD_FILE" ]; then
  cp "$PROJECT_DIR/backend/appsettings.Production.json.example" "$PROD_FILE"
  echo "    Da tao $PROD_FILE — HAY SUA connection string, JWT key, SMTP truoc khi chay backend!"
  if [ -n "$SQL_PASSWORD" ]; then
    sed -i "s/YOUR_SQL_USER/${SQL_USER}/g" "$PROD_FILE"
    sed -i "s/YOUR_SQL_PASSWORD/${SQL_PASSWORD}/g" "$PROD_FILE"
  fi
  sed -i "s|https://baobiantea.com|http://${DOMAIN}|g" "$PROD_FILE" || true
else
  echo "    Giu nguyen file Production hien co"
fi

echo "==> 8. Frontend .env production"
FE_ENV="$PROJECT_DIR/frontend/.env.production"
if [ ! -f "$FE_ENV" ]; then
  cat > "$FE_ENV" <<EOF
VITE_API_URL=/api
VITE_ONLINE_PAYMENT_ENABLED=false
VITE_SITE_URL=http://${DOMAIN}
EOF
fi

echo "==> 9. EF migration"
cd "$PROJECT_DIR/backend"
dotnet tool install --global dotnet-ef 2>/dev/null || true
export PATH="$PATH:$HOME/.dotnet/tools"
dotnet ef database update --project PhuKienTuiLoc.Infrastructure/PhuKienTuiLoc.Infrastructure.csproj --startup-project PhuKienTuiLoc.Api.csproj

echo "==> 10. systemd service"
cp "$PROJECT_DIR/scripts/phukientuilor.service" /etc/systemd/system/phukientuilor.service
systemctl daemon-reload
systemctl enable phukientuilor

echo "==> 11. nginx"
NGINX_CONF="/etc/nginx/sites-available/phukientuiloc"
cp "$PROJECT_DIR/scripts/nginx-phukientuiloc.conf" "$NGINX_CONF"
sed -i "s/YOUR_DOMAIN/${DOMAIN}/g" "$NGINX_CONF"
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/phukientuiloc
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "==> 12. Build + deploy"
bash "$PROJECT_DIR/deploy.sh" fe
bash "$PROJECT_DIR/deploy.sh" admin
bash "$PROJECT_DIR/deploy.sh" be

echo ""
echo "=========================================="
echo " CAI DAT XONG"
echo " Store:  http://${DOMAIN}/"
echo " Admin:  http://${DOMAIN}/admin-panel/"
echo " API:    http://${DOMAIN}/api/"
echo ""
echo " Buoc tiep theo:"
echo " 1. Sua backend/appsettings.Production.json (JWT, SMTP, SQL)"
echo " 2. Trỏ domain ${DOMAIN} ve IP may chu (DNS A record)"
echo " 3. (Tuy chon) certbot --nginx -d ${DOMAIN}"
echo " 4. Doi mat khau root + admin sau khi vao duoc"
echo "=========================================="
