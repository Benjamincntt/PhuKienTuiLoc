# PhuKienTuiLoc - Khoi dong dev (Backend + Frontend + Admin)
# Chay: powershell -ExecutionPolicy Bypass -File D:\Source\PhuKienTuiLoc\scripts\start-dev.ps1

$root = Split-Path $PSScriptRoot -Parent
Write-Host "=== Kiem tra SQL Server ===" -ForegroundColor Cyan
$sql = Get-Service -Name "MSSQLSERVER" -ErrorAction SilentlyContinue
if (-not $sql) {
    Write-Host "KHONG tim thay SQL Server (MSSQLSERVER). Hay bat SQL Server." -ForegroundColor Red
    exit 1
}
if ($sql.Status -ne "Running") {
    Write-Host "SQL Server dang tat. Dang bat..." -ForegroundColor Yellow
    Start-Service MSSQLSERVER
}
Write-Host "SQL Server: OK" -ForegroundColor Green

Write-Host "`n=== Dung backend cu (neu con) ===" -ForegroundColor Cyan
Stop-Process -Name "PhuKienTuiLoc.Api" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

Write-Host "`n=== Mo 3 terminal dev ===" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; Write-Host 'BACKEND - http://localhost:5280' -ForegroundColor Green; dotnet run --launch-profile http"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; Write-Host 'CUA HANG - http://localhost:5173' -ForegroundColor Green; npm.cmd run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\admin'; Write-Host 'ADMIN - http://localhost:5174' -ForegroundColor Green; npm.cmd run dev"

$lanIp = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -like "192.168.*" -and $_.PrefixOrigin -ne "WellKnown" } |
    Select-Object -First 1).IPAddress

Write-Host "`nDa mo 3 cua so PowerShell." -ForegroundColor Green
Write-Host "  Backend:  http://localhost:5280/swagger"
Write-Host "  Cua hang: http://localhost:5173"
Write-Host "  Admin:    http://localhost:5174  (admin / Admin@123)"
if ($lanIp) {
    Write-Host "`n  Mobile (cung WiFi): http://${lanIp}:5173" -ForegroundColor Cyan
}
Write-Host "`nNeu mobile khong mo duoc trang, chay script firewall (Admin):" -ForegroundColor Yellow
Write-Host "  powershell -ExecutionPolicy Bypass -File '$root\scripts\open-dev-firewall.ps1'"
Write-Host "`nDoi backend hien 'Now listening on: http://0.0.0.0:5280' roi mo trinh duyet." -ForegroundColor Yellow
