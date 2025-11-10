# FlexoAPP - Script para Detener Servicios Locales

Write-Host "🛑 Deteniendo FlexoAPP..." -ForegroundColor Yellow

# Matar procesos del backend
Write-Host "   Deteniendo Backend..." -ForegroundColor Gray
Get-Process | Where-Object {$_.ProcessName -like "*FlexoAPP*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process | Where-Object {$_.ProcessName -like "*dotnet*" -and $_.Path -like "*flexoAPP*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Matar procesos del frontend
Write-Host "   Deteniendo Frontend..." -ForegroundColor Gray
Get-Process | Where-Object {$_.ProcessName -like "*node*" -and $_.Path -like "*flexoAPP*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Limpiar puertos
Write-Host "   Liberando puertos..." -ForegroundColor Gray
$port7003 = Get-NetTCPConnection -LocalPort 7003 -ErrorAction SilentlyContinue
if ($port7003) {
    Stop-Process -Id $port7003.OwningProcess -Force -ErrorAction SilentlyContinue
}

$port4200 = Get-NetTCPConnection -LocalPort 4200 -ErrorAction SilentlyContinue
if ($port4200) {
    Stop-Process -Id $port4200.OwningProcess -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2

Write-Host "✅ Servicios detenidos correctamente" -ForegroundColor Green
