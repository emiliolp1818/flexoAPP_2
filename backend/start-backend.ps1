# =====================================================
# SCRIPT PARA INICIAR EL BACKEND DE FLEXOAPP
# =====================================================

# Mostrar banner
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 INICIANDO BACKEND DE FLEXOAPP" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta backend
if (-not (Test-Path "Program.cs")) {
    Write-Host "❌ Error: Este script debe ejecutarse desde la carpeta backend" -ForegroundColor Red
    Write-Host "   Usa: cd backend" -ForegroundColor Yellow
    Write-Host "   Luego: .\start-backend.ps1" -ForegroundColor Yellow
    exit 1
}

# Verificar que dotnet está instalado
Write-Host "🔍 Verificando instalación de .NET..." -ForegroundColor Yellow
try {
    $dotnetVersion = dotnet --version
    Write-Host "✅ .NET instalado: versión $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: .NET no está instalado" -ForegroundColor Red
    Write-Host "   Descarga desde: https://dotnet.microsoft.com/download" -ForegroundColor Yellow
    exit 1
}

# Verificar que MySQL está corriendo
Write-Host "🔍 Verificando MySQL..." -ForegroundColor Yellow
try {
    $mysqlProcess = Get-Process mysqld -ErrorAction SilentlyContinue
    if ($mysqlProcess) {
        Write-Host "✅ MySQL está corriendo" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Advertencia: MySQL no parece estar corriendo" -ForegroundColor Yellow
        Write-Host "   Asegúrate de iniciar MySQL antes de continuar" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  No se pudo verificar el estado de MySQL" -ForegroundColor Yellow
}

# Restaurar dependencias
Write-Host ""
Write-Host "📦 Restaurando dependencias..." -ForegroundColor Yellow
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al restaurar dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencias restauradas" -ForegroundColor Green

# Compilar proyecto
Write-Host ""
Write-Host "🔨 Compilando proyecto..." -ForegroundColor Yellow
dotnet build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar el proyecto" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Proyecto compilado exitosamente" -ForegroundColor Green

# Crear directorio de uploads si no existe
Write-Host ""
Write-Host "📁 Verificando directorio de uploads..." -ForegroundColor Yellow
$uploadsPath = "uploads\documentos"
if (-not (Test-Path $uploadsPath)) {
    New-Item -ItemType Directory -Path $uploadsPath -Force | Out-Null
    Write-Host "✅ Directorio de uploads creado: $uploadsPath" -ForegroundColor Green
} else {
    Write-Host "✅ Directorio de uploads existe: $uploadsPath" -ForegroundColor Green
}

# Mostrar información
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📋 INFORMACIÓN DEL SERVIDOR" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🌐 URL: http://localhost:7003" -ForegroundColor White
Write-Host "📚 Swagger: http://localhost:7003/swagger" -ForegroundColor White
Write-Host "🏥 Health: http://localhost:7003/health" -ForegroundColor White
Write-Host "📄 Documentos: http://localhost:7003/api/documentos/test" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar el backend
Write-Host "🚀 Iniciando backend..." -ForegroundColor Green
Write-Host "   Presiona Ctrl+C para detener" -ForegroundColor Yellow
Write-Host ""

# Ejecutar dotnet run
dotnet run
