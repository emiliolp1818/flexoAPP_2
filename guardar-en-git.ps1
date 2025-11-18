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
Write-Host "💾 Creando commit..." -ForegroundColor Cyan
git commit -m "feat: Integración con tabla de diseño en carga de Excel. Implementada consulta a tabla designs en ProcessExcelLine. Si artículo existe en designs usa cliente, sustrato, referencia, TD y colores de la tabla. Si artículo NO existe usa información del Excel con colores genéricos. Agregado endpoint de prueba. Frontend ahora recarga datos desde BD después de subir Excel. Eliminado endpoint duplicado. Agregados logs detallados para debugging. Documentación completa de cambios y pruebas."

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
