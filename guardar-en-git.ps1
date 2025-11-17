# Script para guardar todos los cambios en Git
# Ejecutar con: .\guardar-en-git.ps1

Write-Host "📦 Guardando cambios en Git..." -ForegroundColor Green
Write-Host ""

# Verificar que estamos en un repositorio Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: No se encuentra el repositorio Git" -ForegroundColor Red
    Write-Host "   Inicializa un repositorio con: git init" -ForegroundColor Yellow
    exit 1
}

# Mostrar estado actual
Write-Host "📋 Estado actual del repositorio:" -ForegroundColor Cyan
git status --short
Write-Host ""

# Agregar todos los archivos modificados
Write-Host "➕ Agregando archivos al staging area..." -ForegroundColor Cyan
git add .

# Mostrar archivos que se van a commitear
Write-Host ""
Write-Host "📝 Archivos que se van a guardar:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Crear commit con mensaje descriptivo
$commitMessage = @"
feat: Integración con tabla de diseño en carga de Excel

- Implementada consulta a tabla designs en ProcessExcelLine
- Si artículo existe en designs: usa cliente, sustrato, referencia, TD y colores de la tabla
- Si artículo NO existe: usa información del Excel con colores genéricos
- Agregado endpoint de prueba: GET /api/maquinas/test-design/{articulo}
- Frontend ahora recarga datos desde BD después de subir Excel
- Eliminado endpoint duplicado en MaquinasController
- Agregados logs detallados para debugging
- Documentación completa de cambios y pruebas

Archivos modificados:
- backend/Services/MaquinaService.cs
- backend/Controllers/MaquinasController.cs
- Frontend/src/app/shared/components/machines/machines.ts

Archivos de documentación:
- CAMBIOS_TABLA_DISENO.md
- INSTRUCCIONES_PRUEBA_DESIGNS.md
- SOLUCION_FINAL_CARGA_EXCEL.md
- RESUMEN_COMPLETO_CAMBIOS.md
- INICIAR_BACKEND.md
- backend/Database/test_designs_table.sql

Scripts:
- iniciar-backend.ps1
- guardar-en-git.ps1
"@

Write-Host "💾 Creando commit..." -ForegroundColor Cyan
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Commit creado exitosamente" -ForegroundColor Green
    Write-Host ""
    
    # Preguntar si quiere hacer push
    $push = Read-Host "¿Deseas hacer push al repositorio remoto? (s/n)"
    
    if ($push -eq "s" -or $push -eq "S") {
        Write-Host ""
        Write-Host "🚀 Haciendo push..." -ForegroundColor Cyan
        git push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Push completado exitosamente" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "❌ Error haciendo push" -ForegroundColor Red
            Write-Host "   Verifica tu conexión y permisos del repositorio" -ForegroundColor Yellow
        }
    } else {
        Write-Host ""
        Write-Host "ℹ️  Cambios guardados localmente" -ForegroundColor Cyan
        Write-Host "   Puedes hacer push más tarde con: git push" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "❌ Error creando commit" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 Estado final del repositorio:" -ForegroundColor Cyan
git status
Write-Host ""
Write-Host "✅ Proceso completado" -ForegroundColor Green
