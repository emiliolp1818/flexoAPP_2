# Script para iniciar FlexoAPP Backend en modo red
# Configura el servidor para escuchar en todas las interfaces de red

Write-Host "🚀 Iniciando FlexoAPP Backend en modo red..." -ForegroundColor Green
Write-Host "🌐 El servidor estará disponible en:" -ForegroundColor Yellow
Write-Host "   - http://localhost:7003" -ForegroundColor Cyan
Write-Host "   - http://192.168.1.6:7003" -ForegroundColor Cyan
Write-Host "   - http://[IP_DE_TU_MAQUINA]:7003" -ForegroundColor Cyan
Write-Host ""

# Configurar variables de entorno
$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:ASPNETCORE_URLS = "http://0.0.0.0:7003"

# Verificar que no haya otro proceso usando el puerto
$existingProcess = Get-Process -Name "FlexoAPP.API" -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "⚠️  Deteniendo proceso existente..." -ForegroundColor Yellow
    $existingProcess | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Iniciar el servidor
Write-Host "🔄 Iniciando servidor..." -ForegroundColor Green
dotnet run --no-build