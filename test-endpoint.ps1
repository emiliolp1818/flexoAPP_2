# Script de PowerShell para probar el endpoint PATCH de actualización de estado

Write-Host "🧪 Probando endpoint de actualización de estado de máquinas" -ForegroundColor Cyan
Write-Host ""

# Configuración
$baseUrl = "http://localhost:7003"
$articulo = "F204576"

# Test 1: Verificar que el backend esté corriendo
Write-Host "📡 Test 1: Verificando que el backend esté corriendo..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/maquinas" -Method Get -ErrorAction Stop
    Write-Host "✅ Backend está corriendo" -ForegroundColor Green
    Write-Host "   Total de programas: $($response.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: El backend no está corriendo o no responde" -ForegroundColor Red
    Write-Host "   Asegúrate de que el backend esté ejecutándose en el puerto 7003" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Verificar que el artículo existe
Write-Host "📡 Test 2: Verificando que el artículo $articulo existe..." -ForegroundColor Yellow
try {
    $allPrograms = Invoke-RestMethod -Uri "$baseUrl/api/maquinas" -Method Get -ErrorAction Stop
    $program = $allPrograms.data | Where-Object { $_.articulo -eq $articulo }
    
    if ($program) {
        Write-Host "✅ Artículo encontrado" -ForegroundColor Green
        Write-Host "   Artículo: $($program.articulo)" -ForegroundColor Gray
        Write-Host "   Máquina: $($program.numeroMaquina)" -ForegroundColor Gray
        Write-Host "   Estado actual: $($program.estado)" -ForegroundColor Gray
        Write-Host "   Cliente: $($program.cliente)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Error: Artículo $articulo no encontrado" -ForegroundColor Red
        Write-Host "   Artículos disponibles:" -ForegroundColor Yellow
        $allPrograms.data | Select-Object -First 5 | ForEach-Object {
            Write-Host "   - $($_.articulo) (Máquina $($_.numeroMaquina), Estado: $($_.estado))" -ForegroundColor Gray
        }
        exit 1
    }
} catch {
    Write-Host "❌ Error obteniendo programas: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Probar el endpoint de test de actualización
Write-Host "📡 Test 3: Probando endpoint de test de actualización..." -ForegroundColor Yellow
try {
    $testUrl = "$baseUrl/api/maquinas/test-update/$articulo"
    Write-Host "   URL: $testUrl" -ForegroundColor Gray
    
    $testResponse = Invoke-RestMethod -Uri $testUrl -Method Get -ErrorAction Stop
    
    if ($testResponse.success) {
        Write-Host "✅ Endpoint de test funciona correctamente" -ForegroundColor Green
        Write-Host "   Filas afectadas: $($testResponse.rowsAffected)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Error en endpoint de test: $($testResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error en endpoint de test: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Respuesta: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Probar el endpoint PATCH principal
Write-Host "📡 Test 4: Probando endpoint PATCH de actualización de estado..." -ForegroundColor Yellow

$patchUrl = "$baseUrl/api/maquinas/$articulo/status"
$body = @{
    estado = "LISTO"
    observaciones = $null
} | ConvertTo-Json

Write-Host "   URL: $patchUrl" -ForegroundColor Gray
Write-Host "   Body: $body" -ForegroundColor Gray

try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $patchResponse = Invoke-RestMethod -Uri $patchUrl -Method Patch -Body $body -Headers $headers -ErrorAction Stop
    
    if ($patchResponse.success) {
        Write-Host "✅ Actualización exitosa" -ForegroundColor Green
        Write-Host "   Estado anterior: $($patchResponse.data.estadoAnterior)" -ForegroundColor Gray
        Write-Host "   Estado nuevo: $($patchResponse.data.estadoNuevo)" -ForegroundColor Gray
        Write-Host "   Última acción por: $($patchResponse.data.lastActionBy)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Error en actualización: $($patchResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error en PATCH: $($_.Exception.Message)" -ForegroundColor Red
    
    # Intentar obtener más detalles del error
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Respuesta del servidor:" -ForegroundColor Red
        Write-Host "   $responseBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🏁 Tests completados" -ForegroundColor Cyan
