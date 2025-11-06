# Script para configurar la red y firewall para FlexoAPP
# Ejecutar como Administrador

Write-Host "🔧 Configurando FlexoAPP para acceso de red..." -ForegroundColor Green

# Verificar si se ejecuta como administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host "Haga clic derecho en PowerShell y seleccione 'Ejecutar como administrador'" -ForegroundColor Yellow
    pause
    exit 1
}

# Obtener la IP actual
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"} | Select-Object -First 1).IPAddress
Write-Host "📍 IP local detectada: $localIP" -ForegroundColor Cyan

# Configurar reglas de firewall para el puerto 7003
Write-Host "🔥 Configurando reglas de firewall..." -ForegroundColor Yellow

# Eliminar reglas existentes si existen
Remove-NetFirewallRule -DisplayName "FlexoAPP Backend HTTP" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "FlexoAPP Backend HTTPS" -ErrorAction SilentlyContinue

# Crear nuevas reglas de firewall
New-NetFirewallRule -DisplayName "FlexoAPP Backend HTTP" -Direction Inbound -Protocol TCP -LocalPort 7003 -Action Allow -Profile Any
New-NetFirewallRule -DisplayName "FlexoAPP Backend HTTP" -Direction Outbound -Protocol TCP -LocalPort 7003 -Action Allow -Profile Any

Write-Host "✅ Reglas de firewall configuradas para puerto 7003" -ForegroundColor Green

# Verificar que el puerto esté disponible
$portTest = Test-NetConnection -ComputerName localhost -Port 7003 -InformationLevel Quiet
if ($portTest) {
    Write-Host "✅ Puerto 7003 está disponible" -ForegroundColor Green
} else {
    Write-Host "⚠️ Puerto 7003 no está disponible o el servicio no está corriendo" -ForegroundColor Yellow
}

# Mostrar información de red
Write-Host "`n📊 Información de red:" -ForegroundColor Cyan
Write-Host "IP Local: $localIP"
Write-Host "Puerto: 7003"
Write-Host "URL Backend: http://$localIP:7003"
Write-Host "URL API: http://$localIP:7003/api"
Write-Host "Health Check: http://$localIP:7003/health"

# Probar conectividad
Write-Host "`n🔍 Probando conectividad..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:7003/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Servidor local respondiendo correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ No se puede conectar al servidor local" -ForegroundColor Red
    Write-Host "Asegúrese de que el backend esté corriendo" -ForegroundColor Yellow
}

Write-Host "`n📋 Instrucciones para otros PCs:" -ForegroundColor Cyan
Write-Host "1. Asegúrese de que ambos PCs estén en la misma red"
Write-Host "2. Use la URL: http://$localIP:7003"
Write-Host "3. Configure el frontend para usar environment.prod.ts"
Write-Host "4. Verifique que no haya otros firewalls bloqueando la conexión"

Write-Host "`n✅ Configuración completada!" -ForegroundColor Green
pause