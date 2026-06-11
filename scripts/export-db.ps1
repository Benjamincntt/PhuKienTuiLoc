# Export SQL Server database to scripts/db/PhuKienTuiLocDb.bak
# Chay: powershell -ExecutionPolicy Bypass -File scripts\export-db.ps1
# Yeu cau: SQL Server dang chay, appsettings.Development.json da cau hinh dung.

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\db-config.ps1"

Write-Host "=== Export database ===" -ForegroundColor Cyan

$db = Get-DbSettings
$backupPath = Get-DbBackupPath
$backupSqlPath = $backupPath.Replace("'", "''")

Write-Host "Server:   $($db.Server)"
Write-Host "Database: $($db.Database)"
Write-Host "Backup:   $backupPath"

$query = @"
BACKUP DATABASE [$($db.Database)]
TO DISK = N'$backupSqlPath'
WITH FORMAT, INIT, COMPRESSION, STATS = 10;
"@

Invoke-DbSql -Query $query -DbSettings $db

Write-Host "`nExport thanh cong." -ForegroundColor Green
Write-Host "Copy file .bak sang may nha (USB / OneDrive / Google Drive)." -ForegroundColor Yellow
Write-Host "File: $backupPath"
