#!/usr/bin/env bash
# Script deploy cho AnTea Tổng Kho Túi Lọc - Bao Bì Trà
# Cách dùng trên server:
#   cd /var/www/PhuKienTuiLoc && git pull && bash deploy.sh
# Tham số tùy chọn:
#   bash deploy.sh fe        -> chỉ build frontend (cửa hàng)
#   bash deploy.sh admin     -> chỉ build admin
#   bash deploy.sh be        -> chỉ publish + restart backend
#   bash deploy.sh           -> làm tất cả (frontend + admin)

set -e

PROJECT_DIR="/var/www/PhuKienTuiLoc"
STORE_OUT="/var/www/publish/store"
ADMIN_OUT="/var/www/publish/admin"
BACKEND_OUT="/var/www/publish/backend"
SERVICE="phukientuilor"

TARGET="${1:-all}"

build_frontend() {
  echo "==> Build frontend (store)"
  cd "$PROJECT_DIR/frontend"
  npm install
  npm run build
  mkdir -p "$STORE_OUT"
  cp -r dist/. "$STORE_OUT/"
  echo "==> Frontend xong"
}

build_admin() {
  echo "==> Build admin"
  cd "$PROJECT_DIR/admin"
  npm install
  VITE_BASE_URL=/admin-panel/ npm run build
  mkdir -p "$ADMIN_OUT"
  cp -r dist/. "$ADMIN_OUT/"
  echo "==> Admin xong"
}

build_backend() {
  echo "==> Publish backend + restart service"
  cd "$PROJECT_DIR/backend"
  ASPNETCORE_ENVIRONMENT=Production dotnet publish PhuKienTuiLoc.Api.csproj -c Release -o "$BACKEND_OUT"
  systemctl restart "$SERVICE"
  echo "==> Backend xong"
}

case "$TARGET" in
  fe|frontend) build_frontend ;;
  admin)       build_admin ;;
  be|backend)  build_backend ;;
  all)         build_frontend; build_admin ;;
  *) echo "Tham so khong hop le: $TARGET (dung: fe | admin | be | all)"; exit 1 ;;
esac

echo "==> DEPLOY HOAN TAT ($TARGET)"
