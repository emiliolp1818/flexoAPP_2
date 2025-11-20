# ===================================================================
# SCRIPT DE MIGRACIÓN: Cambiar llave primaria de ID a ArticleF
# ===================================================================
# Descripción: Script PowerShell para ejecutar la migración de forma segura
# Base de Datos: MySQL 8.0+
# Fecha: 2024
# ===================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MIGRACIÓN DE LLAVE PRIMARIA - DISEÑOS" -ForegroundColor Cyan
Write-Host "De: ID (autoincremental)" -ForegroundColor Yellow
Write-Host "A:  ArticleF (código único)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración de la base de datos
$dbServer = "localhost"
$dbName = "flexoapp_bd"
$dbUser = "root"
$dbPassword = ""  # Cambiar si tienes contraseña

Write-Host "📋 Configuración:" -ForegroundColor Cyan
Write-Host "   Servidor: $dbServer" -ForegroundColor White
Write-Host "   Base de datos: $dbName" -ForegroundColor White
Write-Host "   Usuario: $dbUser" -ForegroundColor White
Write-Host ""

# Verificar que MySQL esté instalado
$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
if (-not (Test-Path $mysqlPath)) {
    Write-Host "❌ ERROR: MySQL no encontrado en $mysqlPath" -ForegroundColor Red
    Write-Host "   Por favor, ajusta la ruta en el script" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ MySQL encontrado" -ForegroundColor Green
Write-Host ""

# ===================================================================
# PASO 1: CREAR BACKUP DE LA TABLA
# ===================================================================
Write-Host "📦 PASO 1: Creando backup de la tabla..." -ForegroundColor Cyan

$backupFile = "backup_flexographic_designs_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
$backupPath = Join-Path $PSScriptRoot $backupFile

$mysqldumpPath = "C:\xampp\mysql\bin\mysqldump.exe"

if (Test-Path $mysqldumpPath) {
    $dumpCommand = "& `"$mysqldumpPath`" -u $dbUser"
    if ($dbPassword) {
        $dumpCommand += " -p$dbPassword"
    }
    $dumpCommand += " $dbName flexographic_designs > `"$backupPath`""
    
    try {
        Invoke-Expression $dumpCommand
        Write-Host "✅ Backup creado: $backupFile" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Advertencia: No se pudo crear backup automático" -ForegroundColor Yellow
        Write-Host "   Continuar de todas formas? (S/N): " -NoNewline -ForegroundColor Yellow
        $response = Read-Host
        if ($response -ne "S" -and $response -ne "s") {
            Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "⚠️  mysqldump no encontrado - Backup manual recomendado" -ForegroundColor Yellow
}

Write-Host ""

# ===================================================================
# PASO 2: VERIFICAR DUPLICADOS Y VALORES NULL
# ===================================================================
Write-Host "🔍 PASO 2: Verificando integridad de datos..." -ForegroundColor Cyan

$verifyScript = @"
USE $dbName;

-- Verificar duplicados
SELECT 'DUPLICADOS' AS Tipo, ArticleF, COUNT(*) AS Cantidad
FROM flexographic_designs
GROUP BY ArticleF
HAVING COUNT(*) > 1;

-- Verificar NULL
SELECT 'NULL_VALUES' AS Tipo, COUNT(*) AS Cantidad
FROM flexographic_designs
WHERE ArticleF IS NULL;
"@

$verifyFile = Join-Path $PSScriptRoot "temp_verify.sql"
$verifyScript | Out-File -FilePath $verifyFile -Encoding UTF8

$mysqlCommand = "& `"$mysqlPath`" -u $dbUser"
if ($dbPassword) {
    $mysqlCommand += " -p$dbPassword"
}
$mysqlCommand += " < `"$verifyFile`""

try {
    $verifyResult = Invoke-Expression $mysqlCommand 2>&1
    
    if ($verifyResult -match "DUPLICADOS" -or $verifyResult -match "NULL_VALUES") {
        Write-Host "❌ ERROR: Se encontraron problemas de integridad" -ForegroundColor Red
        Write-Host $verifyResult -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Por favor, corrija los siguientes problemas antes de continuar:" -ForegroundColor Yellow
        Write-Host "1. Elimine o corrija registros duplicados en ArticleF" -ForegroundColor Yellow
        Write-Host "2. Asigne valores válidos a registros con ArticleF NULL" -ForegroundColor Yellow
        Remove-Item $verifyFile -ErrorAction SilentlyContinue
        exit 1
    }
    
    Write-Host "✅ No se encontraron duplicados ni valores NULL" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Advertencia: No se pudo verificar integridad" -ForegroundColor Yellow
}

Remove-Item $verifyFile -ErrorAction SilentlyContinue
Write-Host ""

# ===================================================================
# PASO 3: CONFIRMAR EJECUCIÓN
# ===================================================================
Write-Host "⚠️  ADVERTENCIA: Esta operación es IRREVERSIBLE" -ForegroundColor Yellow
Write-Host "   Se eliminará la columna ID y ArticleF será la nueva llave primaria" -ForegroundColor Yellow
Write-Host ""
Write-Host "¿Desea continuar con la migración? (S/N): " -NoNewline -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Red
    exit 0
}

Write-Host ""

# ===================================================================
# PASO 4: EJECUTAR MIGRACIÓN
# ===================================================================
Write-Host "🚀 PASO 3: Ejecutando migración..." -ForegroundColor Cyan

$sqlFile = Join-Path $PSScriptRoot "02_fix_primary_key_designs.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ ERROR: Archivo SQL no encontrado: $sqlFile" -ForegroundColor Red
    exit 1
}

$mysqlCommand = "& `"$mysqlPath`" -u $dbUser"
if ($dbPassword) {
    $mysqlCommand += " -p$dbPassword"
}
$mysqlCommand += " < `"$sqlFile`""

try {
    Write-Host "   Ejecutando script SQL..." -ForegroundColor White
    $result = Invoke-Expression $mysqlCommand 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migración ejecutada exitosamente" -ForegroundColor Green
        Write-Host ""
        Write-Host $result -ForegroundColor White
    } else {
        Write-Host "❌ ERROR durante la migración" -ForegroundColor Red
        Write-Host $result -ForegroundColor Yellow
        Write-Host ""
        Write-Host "💡 Puede restaurar desde el backup: $backupFile" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Puede restaurar desde el backup: $backupFile" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# ===================================================================
# PASO 5: VERIFICACIÓN FINAL
# ===================================================================
Write-Host "✅ MIGRACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resumen de cambios:" -ForegroundColor Cyan
Write-Host "   ✅ Llave primaria ID eliminada" -ForegroundColor Green
Write-Host "   ✅ Columna ID eliminada" -ForegroundColor Green
Write-Host "   ✅ ArticleF establecido como llave primaria" -ForegroundColor Green
Write-Host "   ✅ Índices actualizados" -ForegroundColor Green
Write-Host ""
Write-Host "💾 Backup guardado en: $backupFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Actualice el código del backend para usar ArticleF" -ForegroundColor Yellow
Write-Host "   como llave primaria en lugar de ID" -ForegroundColor Yellow
Write-Host ""

# ===================================================================
# FIN DEL SCRIPT
# ===================================================================
