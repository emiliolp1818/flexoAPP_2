# Script para iniciar FlexoAPP con configuración de red
Write-Host "🚀 Iniciando FlexoAPP con configuración de red..." -ForegroundColor Green

# Obtener la IP actual
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"} | Select-Object -First 1).IPAddress
Write-Host "📍 IP detectada: $localIP" -ForegroundColor Cyan

# Configurar variables de entorno
$env:ASPNETCORE_URLS = "http://0.0.0.0:7003;http://localhost:7003;http://$localIP:7003"
$env:ASPNETCORE_ENVIRONMENT = "Production"

Write-Host "🌐 URLs configuradas:" -ForegroundColor Yellow
Write-Host "  - http://localhost:7003"
Write-Host "  - http://$localIP:7003"
Write-Host "  - http://0.0.0.0:7003"

# Cambiar al directorio del backend
Set-Location "backend"

Write-Host "🔧 Iniciando servidor backend..." -ForegroundColor Green
dotnet run --urls "http://0.0.0.0:7003"