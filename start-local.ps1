# FlexoAPP - Script de Inicio Local
# Este script inicia el backend y frontend automáticamente

Write-Host "🚀 Iniciando FlexoAPP en modo local..." -ForegroundColor Green
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "backend") -or -not (Test-Path "Frontend")) {
    Write-Host "❌ Error: Ejecuta este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Función para matar procesos anteriores
function Stop-FlexoAPP {
    Write-Host "🧹 Limpiando procesos anteriores..." -ForegroundColor Yellow
    Get-Process | Where-Object {$_.ProcessName -like "*FlexoAPP*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process | Where-Object {$_.ProcessName -like "*node*" -and $_.Path -like "*flexoAPP*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Limpiar procesos anteriores
Stop-FlexoAPP

# Iniciar Backend en segundo plano
Write-Host "🔧 Iniciando Backend (.NET)..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    cd backend
    dotnet run
}

Write-Host "   Backend iniciando en http://localhost:7003" -ForegroundColor Gray
Write-Host "   Esperando 10 segundos para que el backend compile..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Iniciar Frontend en segundo plano
Write-Host "🎨 Iniciando Frontend (Angular)..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    cd Frontend
    npm start
}

Write-Host "   Frontend iniciando en http://localhost:4200" -ForegroundColor Gray
Write-Host ""

# Mostrar información
Write-Host "✅ FlexoAPP iniciado correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 URLs disponibles:" -ForegroundColor Yellow
Write-Host "   Frontend:  http://localhost:4200" -ForegroundColor White
Write-Host "   Frontend:  http://192.168.1.6:4200 (red local)" -ForegroundColor White
Write-Host "   Backend:   http://localhost:7003" -ForegroundColor White
Write-Host "   Backend:   http://192.168.1.6:7003 (red local)" -ForegroundColor White
Write-Host "   Health:    http://localhost:7003/health" -ForegroundColor White
Write-Host "   Swagger:   http://localhost:7003/swagger" -ForegroundColor White
Write-Host ""
Write-Host "👤 Credenciales:" -ForegroundColor Yellow
Write-Host "   Usuario:   admin" -ForegroundColor White
Write-Host "   Contraseña: admin123" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Esperando a que los servicios estén listos..." -ForegroundColor Yellow
Write-Host "   (Esto puede tomar 30-60 segundos)" -ForegroundColor Gray
Write-Host ""

# Esperar a que el backend esté listo
$backendReady = $false
$attempts = 0
$maxAttempts = 30

while (-not $backendReady -and $attempts -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:7003/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "✅ Backend listo!" -ForegroundColor Green
        }
    } catch {
        $attempts++
        Write-Host "   Esperando backend... ($attempts/$maxAttempts)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $backendReady) {
    Write-Host "⚠️  Backend tardó más de lo esperado, pero puede estar iniciando..." -ForegroundColor Yellow
}

# Esperar a que el frontend esté listo
Start-Sleep -Seconds 5
Write-Host "✅ Frontend debería estar listo en unos segundos" -ForegroundColor Green
Write-Host ""

# Abrir navegador
Write-Host "🌐 Abriendo navegador..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
Start-Process "http://localhost:4200"

Write-Host ""
Write-Host "🎉 ¡Todo listo! Presiona Ctrl+C para detener los servicios" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Logs:" -ForegroundColor Yellow
Write-Host "   Para ver logs del backend:  Receive-Job $($backendJob.Id)" -ForegroundColor Gray
Write-Host "   Para ver logs del frontend: Receive-Job $($frontendJob.Id)" -ForegroundColor Gray
Write-Host ""

# Mantener el script corriendo y mostrar logs
try {
    while ($true) {
        # Mostrar logs del backend si hay
        $backendOutput = Receive-Job $backendJob -Keep
        if ($backendOutput) {
            Write-Host "[BACKEND] " -ForegroundColor Cyan -NoNewline
            Write-Host $backendOutput[-1]
        }
        
        # Mostrar logs del frontend si hay
        $frontendOutput = Receive-Job $frontendJob -Keep
        if ($frontendOutput) {
            Write-Host "[FRONTEND] " -ForegroundColor Magenta -NoNewline
            Write-Host $frontendOutput[-1]
        }
        
        Start-Sleep -Seconds 2
    }
} finally {
    # Limpiar al salir
    Write-Host ""
    Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Stop-FlexoAPP
    Write-Host "✅ Servicios detenidos" -ForegroundColor Green
}
