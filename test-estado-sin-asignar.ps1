# Script para probar que los programas se carguen sin estado

Write-Host "🧪 Probando carga de programas sin estado" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:7003"

# Test 1: Ver programas actuales
Write-Host "📊 Test 1: Verificando programas actuales..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/maquinas" -Method Get
    
    if ($response.success) {
        $programs = $response.data
        Write-Host "✅ Total de programas: $($programs.Count)" -ForegroundColor Green
        
        # Contar por estado
        $estados = $programs | Group-Object -Property estado
        Write-Host ""
        Write-Host "📊 Programas por estado:" -ForegroundColor Cyan
        foreach ($estado in $estados) {
            $estadoNombre = if ([string]::IsNullOrWhiteSpace($estado.Name)) { "SIN_ASIGNAR (NULL)" } else { $estado.Name }
            Write-Host "   $estadoNombre : $($estado.Count)" -ForegroundColor Gray
        }
        
        # Mostrar algunos ejemplos
        Write-Host ""
        Write-Host "📋 Primeros 3 programas:" -ForegroundColor Cyan
        $programs | Select-Object -First 3 | ForEach-Object {
            $estadoDisplay = if ([string]::IsNullOrWhiteSpace($_.estado)) { "SIN_ASIGNAR" } else { $_.estado }
            Write-Host "   $($_.articulo) | Máquina $($_.numeroMaquina) | Estado: $estadoDisplay | Kilos: $($_.kilos)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🏁 Test completado" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Notas:" -ForegroundColor Yellow
Write-Host "   - Si ves 'PREPARANDO', los programas existentes tienen ese estado" -ForegroundColor Gray
Write-Host "   - Si ves 'SIN_ASIGNAR (NULL)', los programas nuevos no tienen estado" -ForegroundColor Gray
Write-Host "   - Para que los programas nuevos se carguen sin estado:" -ForegroundColor Gray
Write-Host "     1. Ejecuta el script SQL: backend/Database/05_verificar_y_limpiar_estados.sql" -ForegroundColor Gray
Write-Host "     2. Reinicia el backend" -ForegroundColor Gray
Write-Host "     3. Carga un archivo Excel nuevo" -ForegroundColor Gray
