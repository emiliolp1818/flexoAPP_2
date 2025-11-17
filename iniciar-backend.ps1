# Script para iniciar el backend de FlexoAPP
# Ejecutar con: .\iniciar-backend.ps1

Write-Host "🚀 Iniciando Backend de FlexoAPP..." -ForegroundColor Green
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: No se encuentra la carpeta 'backend'" -ForegroundColor Red
    Write-Host "   Asegúrate de ejecutar este script desde la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Cambiar al directorio backend
Set-Location backend

Write-Host "📦 Restaurando paquetes NuGet..." -ForegroundColor Cyan
dotnet restore

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error restaurando paquetes" -ForegroundColor Red
    exit 1
}

Write-Host "🔨 Compilando proyecto..." -ForegroundColor Cyan
dotnet build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error compilando proyecto" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Backend compilado exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Iniciando servidor en http://localhost:7003..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Logs del servidor:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Iniciar el servidor
dotnet run

# Si el servidor se detiene
Write-Host ""
Write-Host "🛑 Servidor detenido" -ForegroundColor Yellow
