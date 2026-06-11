# Setup tren may nha sau khi git clone
# Chay: powershell -ExecutionPolicy Bypass -File scripts\setup-home.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

Write-Host "=== PhuKienTuiLoc - Setup may nha ===" -ForegroundColor Cyan

# 1. appsettings
$example = Join-Path $root "backend\appsettings.Development.json.example"
$settings = Join-Path $root "backend\appsettings.Development.json"
if (-not (Test-Path $settings)) {
    Copy-Item $example $settings
    Write-Host "Da tao appsettings.Development.json - hay sua connection string SQL." -ForegroundColor Yellow
}
else {
    Write-Host "appsettings.Development.json: OK" -ForegroundColor Green
}

# 2. SQL Server
$sql = Get-Service -Name "MSSQLSERVER" -ErrorAction SilentlyContinue
if ($sql -and $sql.Status -ne "Running") {
    Start-Service MSSQLSERVER
}
if ($sql) {
    Write-Host "SQL Server: OK" -ForegroundColor Green
}
else {
    Write-Host "Can cai SQL Server (MSSQLSERVER)." -ForegroundColor Yellow
}

# 3. Restore DB neu co file .bak
$bak = Join-Path $PSScriptRoot "db\PhuKienTuiLocDb.bak"
if (Test-Path $bak) {
    Write-Host "Tim thay backup - dang restore..." -ForegroundColor Cyan
    & "$PSScriptRoot\restore-db.ps1"
}
else {
    Write-Host "Khong co file .bak - tao DB tu migrations:" -ForegroundColor Yellow
    Write-Host "  cd backend"
    Write-Host "  dotnet ef database update --project PhuKienTuiLoc.Infrastructure --startup-project PhuKienTuiLoc.Api.csproj"
    Write-Host "  dotnet run --launch-profile http   # se tu seed du lieu mau"
}

# 4. Frontend deps
Write-Host "`n=== npm install ===" -ForegroundColor Cyan
Push-Location (Join-Path $root "frontend")
npm.cmd install
Pop-Location
Push-Location (Join-Path $root "admin")
npm.cmd install
Pop-Location

Write-Host "`n=== Xong ===" -ForegroundColor Green
Write-Host "Chay dev: powershell -ExecutionPolicy Bypass -File scripts\start-dev.ps1"
