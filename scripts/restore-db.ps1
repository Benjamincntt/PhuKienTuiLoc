# Restore SQL Server database from scripts/db/PhuKienTuiLocDb.bak
# Chay: powershell -ExecutionPolicy Bypass -File scripts\restore-db.ps1
# Tren may nha: copy file .bak vao scripts/db/ truoc khi chay.

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\db-config.ps1"

Write-Host "=== Restore database ===" -ForegroundColor Cyan

$db = Get-DbSettings
$backupPath = Get-DbBackupPath

if (-not (Test-Path $backupPath)) {
    Write-Host "Khong tim thay file backup: $backupPath" -ForegroundColor Red
    Write-Host "Hay chay export-db.ps1 tren may van phong, hoac dat file .bak vao scripts/db/." -ForegroundColor Yellow
    exit 1
}

$backupSqlPath = $backupPath.Replace("'", "''")

Write-Host "Server:   $($db.Server)"
Write-Host "Database: $($db.Database)"
Write-Host "Backup:   $backupPath"

# Lay logical names tu backup file
$logicalNamesQuery = "RESTORE FILELISTONLY FROM DISK = N'$backupSqlPath';"
$args = @("-S", $db.Server, "-s", "|", "-W", "-h", "-1")
if ($db.UsesSqlAuth) {
    $args += @("-U", $db.User, "-P", $db.Password)
}
else {
    $args += "-E"
}
$args += @("-Q", $logicalNamesQuery)

$fileList = & sqlcmd @args
if ($LASTEXITCODE -ne 0) {
    throw "Khong doc duoc backup file."
}

$dataLogical = ($fileList | Select-Object -First 1).Trim()
$logLogical = ($fileList | Select-Object -Skip 1 -First 1).Trim()

if ([string]::IsNullOrWhiteSpace($dataLogical) -or [string]::IsNullOrWhiteSpace($logLogical)) {
    throw "Khong xac dinh duoc logical file names trong backup."
}

$dataPath = "C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\$($db.Database).mdf"
$logPath = "C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\$($db.Database)_log.ldf"

# Fallback path neu khong dung MSSQL16
if (-not (Test-Path (Split-Path $dataPath -Parent))) {
    $dataPath = "C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\DATA\$($db.Database).mdf"
    $logPath = "C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\DATA\$($db.Database)_log.ldf"
}

$restoreQuery = @"
IF DB_ID(N'$($db.Database)') IS NOT NULL
BEGIN
    ALTER DATABASE [$($db.Database)] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [$($db.Database)];
END;

RESTORE DATABASE [$($db.Database)]
FROM DISK = N'$backupSqlPath'
WITH
    MOVE N'$dataLogical' TO N'$dataPath',
    MOVE N'$logLogical' TO N'$logPath',
    REPLACE,
    STATS = 10;
"@

Invoke-DbSql -Query $restoreQuery -DbSettings $db

Write-Host "`nRestore thanh cong." -ForegroundColor Green
Write-Host "Kiem tra backend/appsettings.Development.json da cau hinh dung connection string." -ForegroundColor Yellow
