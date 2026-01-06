# Script PowerShell para crear datos de prueba usando la API del backend
Write-Host "🗄️ Creando datos de prueba usando la API del backend..." -ForegroundColor Green
Write-Host ""

$apiUrl = "http://localhost:7003/api/maquinas"

# Datos de prueba
$testPrograms = @(
    @{
        articulo = "F204567"
        numeroMaquina = 11
        otSap = "OT123456"
        cliente = "ABSORBENTES DE COLOMBIA S.A"
        referencia = "REF-001"
        td = "TD1"
        numeroColores = 4
        colores = @("CYAN", "MAGENTA", "AMARILLO", "NEGRO")
        kilos = 1500.00
        fechaTintaEnMaquina = "2026-01-06T14:30:00"
        sustrato = "BOPP"
        estado = "LISTO"
        observaciones = "Programa preparado para producción"
    },
    @{
        articulo = "F204568"
        numeroMaquina = 11
        otSap = "OT123457"
        cliente = "PRODUCTOS FAMILIA S.A"
        referencia = "REF-002"
        td = "TD2"
        numeroColores = 3
        colores = @("CYAN", "MAGENTA", "AMARILLO")
        kilos = 2000.00
        fechaTintaEnMaquina = "2026-01-06T15:00:00"
        sustrato = "PE"
        estado = "PREPARANDO"
        observaciones = "En proceso de preparación"
    },
    @{
        articulo = "F204569"
        numeroMaquina = 12
        otSap = "OT123458"
        cliente = "EMPAQUES DEL VALLE LTDA"
        referencia = "REF-003"
        td = "TD3"
        numeroColores = 5
        colores = @("CYAN", "MAGENTA", "AMARILLO", "NEGRO", "PANTONE 186C")
        kilos = 1200.00
        fechaTintaEnMaquina = "2026-01-06T16:00:00"
        sustrato = "PET"
        estado = "CORRIENDO"
        observaciones = "Producción en curso"
    },
    @{
        articulo = "F204570"
        numeroMaquina = 12
        otSap = "OT123459"
        cliente = "INDUSTRIAS ALIMENTARIAS S.A"
        referencia = "REF-004"
        td = "TD4"
        numeroColores = 2
        colores = @("CYAN", "NEGRO")
        kilos = 800.00
        fechaTintaEnMaquina = "2026-01-06T17:00:00"
        sustrato = "BOPP"
        estado = "SUSPENDIDO"
        observaciones = "Falta material"
    },
    @{
        articulo = "F204571"
        numeroMaquina = 13
        otSap = "OT123460"
        cliente = "FLEXIBLES MODERNOS S.A"
        referencia = "REF-005"
        td = "TD5"
        numeroColores = 6
        colores = @("CYAN", "MAGENTA", "AMARILLO", "NEGRO", "PANTONE 186C", "PANTONE 287C")
        kilos = 2500.00
        fechaTintaEnMaquina = "2026-01-06T18:00:00"
        sustrato = "CPP"
        estado = "TERMINADO"
        observaciones = "Producción completada"
    }
)

Write-Host "📊 Creando $($testPrograms.Count) programas de prueba..." -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$errorCount = 0

foreach ($program in $testPrograms) {
    try {
        Write-Host "🔄 Creando programa: $($program.articulo) - Máquina $($program.numeroMaquina)" -ForegroundColor Cyan
        
        # Convertir a JSON
        $jsonBody = $program | ConvertTo-Json -Depth 10
        
        # Hacer petición POST (simulando el endpoint de creación)
        $response = Invoke-RestMethod -Uri "$apiUrl/test" -Method POST -ContentType "application/json" -Body $jsonBody -ErrorAction Stop
        
        Write-Host "✅ Programa $($program.articulo) creado exitosamente" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "❌ Error creando programa $($program.articulo): $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
    
    Start-Sleep -Milliseconds 500  # Pausa pequeña entre peticiones
}

Write-Host ""
Write-Host "📋 Resumen:" -ForegroundColor Yellow
Write-Host "✅ Programas creados exitosamente: $successCount" -ForegroundColor Green
Write-Host "❌ Errores: $errorCount" -ForegroundColor Red

if ($successCount -gt 0) {
    Write-Host ""
    Write-Host "🎯 Verificando datos creados..." -ForegroundColor Yellow
    
    try {
        $verifyResponse = Invoke-RestMethod -Uri $apiUrl -Method GET
        Write-Host "📊 Total de programas en la base de datos: $($verifyResponse.data.Count)" -ForegroundColor Green
        
        if ($verifyResponse.data.Count -gt 0) {
            Write-Host ""
            Write-Host "🎉 ¡Datos de prueba creados exitosamente!" -ForegroundColor Green
            Write-Host "🚀 Ahora puedes probar las acciones en el módulo de máquinas" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️ No se pudo verificar los datos creados: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")