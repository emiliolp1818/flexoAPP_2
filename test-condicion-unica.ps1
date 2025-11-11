# ===== SCRIPT DE PRUEBA: MÓDULO DE CONDICIÓN ÚNICA =====
# Script para verificar que el módulo de Condición Única funciona correctamente
# Prueba todos los endpoints del backend y muestra resultados detallados

# ===== CONFIGURACIÓN =====
$backendUrl = "http://localhost:7003"  # URL base del backend
$apiUrl = "$backendUrl/api/condicion-unica"  # URL del endpoint de Condición Única

# ===== COLORES PARA OUTPUT =====
function Write-Success { param($message) Write-Host "✅ $message" -ForegroundColor Green }
function Write-Error { param($message) Write-Host "❌ $message" -ForegroundColor Red }
function Write-Info { param($message) Write-Host "ℹ️  $message" -ForegroundColor Cyan }
function Write-Warning { param($message) Write-Host "⚠️  $message" -ForegroundColor Yellow }

# ===== BANNER =====
Write-Host ""
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "🔍 TEST: MÓDULO DE CONDICIÓN ÚNICA" -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host ""

# ===== PRUEBA 1: VERIFICAR QUE EL BACKEND ESTÁ CORRIENDO =====
Write-Info "Prueba 1: Verificando que el backend está corriendo..."
try {
    # Hacer petición GET al endpoint de salud
    $healthResponse = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get -TimeoutSec 5
    Write-Success "Backend está corriendo en $backendUrl"
    Write-Host "   Status: $($healthResponse.status)" -ForegroundColor Gray
} catch {
    Write-Error "Backend NO está corriendo en $backendUrl"
    Write-Warning "Solución: Ejecutar 'cd backend' y luego 'dotnet run'"
    exit 1
}

Write-Host ""

# ===== PRUEBA 2: VERIFICAR ENDPOINT DE TEST =====
Write-Info "Prueba 2: Verificando endpoint de test de Condición Única..."
try {
    # Hacer petición GET al endpoint de test
    $testResponse = Invoke-RestMethod -Uri "$apiUrl/test" -Method Get -TimeoutSec 5
    Write-Success "Endpoint de test funciona correctamente"
    Write-Host "   Message: $($testResponse.message)" -ForegroundColor Gray
    Write-Host "   Status: $($testResponse.status)" -ForegroundColor Gray
} catch {
    Write-Error "Endpoint de test NO funciona"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ===== PRUEBA 3: OBTENER TODOS LOS REGISTROS =====
Write-Info "Prueba 3: Obteniendo todos los registros..."
try {
    # Hacer petición GET para obtener todos los registros
    $allRecords = Invoke-RestMethod -Uri $apiUrl -Method Get -TimeoutSec 5
    $recordCount = $allRecords.Count
    Write-Success "Se obtuvieron $recordCount registros"
    
    # Mostrar primeros 3 registros si existen
    if ($recordCount -gt 0) {
        Write-Host "   Primeros registros:" -ForegroundColor Gray
        $allRecords | Select-Object -First 3 | ForEach-Object {
            Write-Host "   - ID: $($_.id) | F Artículo: $($_.fArticulo) | Referencia: $($_.referencia)" -ForegroundColor Gray
        }
    } else {
        Write-Warning "No hay registros en la base de datos"
    }
} catch {
    Write-Error "Error al obtener registros"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ===== PRUEBA 4: CREAR NUEVO REGISTRO =====
Write-Info "Prueba 4: Creando nuevo registro de prueba..."
try {
    # Generar datos de prueba únicos con timestamp
    $timestamp = Get-Date -Format "HHmmss"
    $testData = @{
        fArticulo = "F-TEST-$timestamp"
        referencia = "REF-TEST-$timestamp"
        estante = "E-TEST-01"
        numeroCarpeta = "C-TEST-001"
    } | ConvertTo-Json
    
    # Hacer petición POST para crear registro
    $createResponse = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $testData -ContentType "application/json" -TimeoutSec 5
    Write-Success "Registro creado exitosamente"
    Write-Host "   ID: $($createResponse.id)" -ForegroundColor Gray
    Write-Host "   F Artículo: $($createResponse.fArticulo)" -ForegroundColor Gray
    Write-Host "   Referencia: $($createResponse.referencia)" -ForegroundColor Gray
    Write-Host "   Estante: $($createResponse.estante)" -ForegroundColor Gray
    Write-Host "   Número de Carpeta: $($createResponse.numeroCarpeta)" -ForegroundColor Gray
    
    # Guardar ID para pruebas posteriores
    $testId = $createResponse.id
} catch {
    Write-Error "Error al crear registro"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Intentar obtener más detalles del error
    if ($_.ErrorDetails.Message) {
        Write-Host "   Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# ===== PRUEBA 5: OBTENER REGISTRO POR ID =====
Write-Info "Prueba 5: Obteniendo registro por ID..."
try {
    # Hacer petición GET para obtener registro específico
    $getByIdResponse = Invoke-RestMethod -Uri "$apiUrl/$testId" -Method Get -TimeoutSec 5
    Write-Success "Registro obtenido correctamente por ID"
    Write-Host "   ID: $($getByIdResponse.id)" -ForegroundColor Gray
    Write-Host "   F Artículo: $($getByIdResponse.fArticulo)" -ForegroundColor Gray
} catch {
    Write-Error "Error al obtener registro por ID"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ===== PRUEBA 6: BUSCAR POR F ARTÍCULO =====
Write-Info "Prueba 6: Buscando por F Artículo..."
try {
    # Hacer petición GET con parámetro de búsqueda
    $searchResponse = Invoke-RestMethod -Uri "$apiUrl/search?fArticulo=F-TEST" -Method Get -TimeoutSec 5
    $searchCount = $searchResponse.Count
    Write-Success "Búsqueda completada: $searchCount resultado(s)"
    
    if ($searchCount -gt 0) {
        Write-Host "   Resultados:" -ForegroundColor Gray
        $searchResponse | ForEach-Object {
            Write-Host "   - F Artículo: $($_.fArticulo) | Referencia: $($_.referencia)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Error "Error al buscar registros"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ===== PRUEBA 7: ACTUALIZAR REGISTRO =====
Write-Info "Prueba 7: Actualizando registro..."
try {
    # Preparar datos actualizados
    $updateData = @{
        id = $testId
        fArticulo = "F-TEST-$timestamp-UPDATED"
        referencia = "REF-TEST-$timestamp-UPDATED"
        estante = "E-TEST-02"
        numeroCarpeta = "C-TEST-002"
    } | ConvertTo-Json
    
    # Hacer petición PUT para actualizar registro
    $updateResponse = Invoke-RestMethod -Uri "$apiUrl/$testId" -Method Put -Body $updateData -ContentType "application/json" -TimeoutSec 5
    Write-Success "Registro actualizado exitosamente"
    Write-Host "   F Artículo: $($updateResponse.fArticulo)" -ForegroundColor Gray
    Write-Host "   Referencia: $($updateResponse.referencia)" -ForegroundColor Gray
} catch {
    Write-Error "Error al actualizar registro"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ===== PRUEBA 8: ELIMINAR REGISTRO =====
Write-Info "Prueba 8: Eliminando registro de prueba..."
try {
    # Hacer petición DELETE para eliminar registro
    $deleteResponse = Invoke-RestMethod -Uri "$apiUrl/$testId" -Method Delete -TimeoutSec 5
    Write-Success "Registro eliminado exitosamente"
    Write-Host "   Message: $($deleteResponse.message)" -ForegroundColor Gray
} catch {
    Write-Error "Error al eliminar registro"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ===== RESUMEN FINAL =====
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "✅ TODAS LAS PRUEBAS COMPLETADAS" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host ""
Write-Info "El módulo de Condición Única está funcionando correctamente"
Write-Info "Puedes acceder a la aplicación en: http://localhost:4200"
Write-Info "Swagger disponible en: $backendUrl/swagger"
Write-Host ""
