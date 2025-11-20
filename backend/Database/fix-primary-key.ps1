# =====================================================
# SCRIPT: Ejecutar corrección de Primary Key en tabla maquinas
# Descripción: Script PowerShell para ejecutar la migración de forma automática
# Versión: 1.0.0
# Fecha: 2024-11-16
# =====================================================

Write-Host "🔧 CORRECCIÓN DE PRIMARY KEY EN TABLA MAQUINAS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ===== CONFIGURACIÓN =====
$dbHost = "localhost"
$dbName = "flexoapp_bd"
$dbUser = "root"
$sqlFile = "02_fix_primary_key_maquinas.sql"

# ===== VERIFICAR QUE EXISTE EL ARCHIVO SQL =====
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Error: No se encuentra el archivo $sqlFile" -ForegroundColor Red
    Write-Host "   Asegúrate de estar en la carpeta backend/Database" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Archivo SQL encontrado: $sqlFile" -ForegroundColor Green
Write-Host ""

# ===== SOLICITAR CONTRASEÑA =====
Write-Host "📝 Ingresa la contraseña de MySQL para el usuario '$dbUser':" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "🔄 Ejecutando migración..." -ForegroundColor Cyan
Write-Host ""

# ===== EJECUTAR SCRIPT SQL =====
try {
    # Construir comando MySQL
    $mysqlCmd = "mysql -h $dbHost -u $dbUser -p$passwordPlain $dbName"
    
    # Ejecutar el script SQL
    Get-Content $sqlFile | & mysql -h $dbHost -u $dbUser "-p$passwordPlain" $dbName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ MIGRACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Cambios realizados:" -ForegroundColor Cyan
        Write-Host "   • Primary key cambiada de 'articulo' a 'articulo + numero_maquina'" -ForegroundColor White
        Write-Host "   • Ahora se puede tener el mismo artículo en diferentes máquinas" -ForegroundColor White
        Write-Host "   • Datos existentes preservados en tabla maquinas_backup" -ForegroundColor White
        Write-Host ""
        Write-Host "🎯 Próximos pasos:" -ForegroundColor Cyan
        Write-Host "   1. Reiniciar el backend de la aplicación" -ForegroundColor White
        Write-Host "   2. Probar carga de Excel con mismo artículo en diferentes máquinas" -ForegroundColor White
        Write-Host "   3. Verificar que todos los programas se carguen correctamente" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ ERROR: La migración falló" -ForegroundColor Red
        Write-Host "   Código de error: $LASTEXITCODE" -ForegroundColor Yellow
        Write-Host "   Revisa los mensajes de error arriba" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ ERROR EJECUTANDO MIGRACIÓN" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Posibles causas:" -ForegroundColor Cyan
    Write-Host "   • MySQL no está instalado o no está en el PATH" -ForegroundColor White
    Write-Host "   • Contraseña incorrecta" -ForegroundColor White
    Write-Host "   • Base de datos no existe" -ForegroundColor White
    Write-Host "   • Usuario no tiene permisos suficientes" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
