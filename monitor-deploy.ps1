# Script de monitoreo del deploy en Render
Write-Host "Monitoreando deploy de FlexoAPP Backend en Render..." -ForegroundColor Cyan
Write-Host "URL: https://flexoapp-backend.onrender.com/health" -ForegroundColor Yellow
Write-Host "Verificando cada 30 segundos... (Presiona Ctrl+C para detener)" -ForegroundColor Gray
Write-Host ""

$attempt = 1
$maxAttempts = 20

while ($attempt -le $maxAttempts) {
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] Intento $attempt/$maxAttempts" -ForegroundColor White
    
    try {
        $response = Invoke-WebRequest -Uri "https://flexoapp-backend.onrender.com/health" -UseBasicParsing -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Write-Host "DEPLOY EXITOSO!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Respuesta del servidor:" -ForegroundColor Cyan
            $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
            Write-Host ""
            Write-Host "El backend esta funcionando correctamente" -ForegroundColor Green
            Write-Host "Puedes acceder a:" -ForegroundColor Yellow
            Write-Host "   - Health Check: https://flexoapp-backend.onrender.com/health" -ForegroundColor White
            Write-Host "   - API Root: https://flexoapp-backend.onrender.com/" -ForegroundColor White
            Write-Host "   - Swagger: https://flexoapp-backend.onrender.com/swagger" -ForegroundColor White
            break
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -like "*500*") {
            Write-Host "Error 500 - El servidor esta arriba pero hay un error interno" -ForegroundColor Red
            Write-Host "   Probablemente aun esta inicializando la base de datos..." -ForegroundColor Yellow
        }
        elseif ($errorMsg -like "*503*" -or $errorMsg -like "*502*") {
            Write-Host "Servidor no disponible - Deploy en progreso..." -ForegroundColor Yellow
        }
        else {
            Write-Host "Esperando respuesta del servidor..." -ForegroundColor Yellow
        }
    }
    
    if ($attempt -lt $maxAttempts) {
        Write-Host "   Esperando 30 segundos..." -ForegroundColor Gray
        Start-Sleep -Seconds 30
    }
    
    $attempt++
    Write-Host ""
}

if ($attempt -gt $maxAttempts) {
    Write-Host "Tiempo de espera agotado" -ForegroundColor Red
    Write-Host "Por favor verifica manualmente en:" -ForegroundColor Yellow
    Write-Host "https://dashboard.render.com/" -ForegroundColor White
}
