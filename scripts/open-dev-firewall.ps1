# Mo firewall cho dev tren LAN (mobile test). CHAY POWERSHELL AS ADMINISTRATOR.
# powershell -ExecutionPolicy Bypass -File D:\Source\PhuKienTuiLoc\scripts\open-dev-firewall.ps1

$rules = @(
    @{ Name = "AnTea Dev Frontend 5173"; Port = 5173 },
    @{ Name = "AnTea Dev Backend 5280"; Port = 5280 },
    @{ Name = "AnTea Dev Admin 5174"; Port = 5174 }
)

foreach ($rule in $rules) {
    $existing = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "Da co rule: $($rule.Name)" -ForegroundColor Yellow
        continue
    }

    New-NetFirewallRule `
        -DisplayName $rule.Name `
        -Direction Inbound `
        -Action Allow `
        -Protocol TCP `
        -LocalPort $rule.Port `
        -Profile Private `
        | Out-Null

    Write-Host "Da mo port $($rule.Port): $($rule.Name)" -ForegroundColor Green
}

$ip = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -like "192.168.*" -and $_.PrefixOrigin -ne "WellKnown" } |
    Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "Tren dien thoai (cung WiFi), mo:" -ForegroundColor Cyan
if ($ip) {
    Write-Host "  http://${ip}:5173" -ForegroundColor Green
} else {
    Write-Host "  http://<IP-may-tinh>:5173  (xem ipconfig)" -ForegroundColor Yellow
}
