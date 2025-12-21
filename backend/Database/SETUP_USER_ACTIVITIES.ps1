# ============================================================================
# SCRIPT DE CONFIGURACIÓN DE ACTIVIDADES DE USUARIO
# ============================================================================
# Este script ejecuta los archivos SQL necesarios para crear la tabla de
# actividades de usuario e insertar datos de prueba

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "CONFIGURACIÓN DE ACTIVIDADES DE USUARIO - FlexoAPP" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuración de la conexión
$Server = "localhost"
$Database = "FlexoAPP"
$Username = "flexoapp_user"
$Password = "FlexoApp2024!"

Write-Host "Configuración de conexión:" -ForegroundColor Yellow
Write-Host "  Servidor: $Server" -ForegroundColor Gray
Write-Host "  Base de datos: $Database" -ForegroundColor Gray
Write-Host "  Usuario: $Username" -ForegroundColor Gray
Write-Host ""

# Función para ejecutar un archivo SQL
function Execute-SqlFile {
    param (
        [string]$FilePath,
        [string]$Description
    )
    
    Write-Host "Ejecutando: $Description" -ForegroundColor Yellow
    Write-Host "  Archivo: $FilePath" -ForegroundColor Gray
    
    try {
        # Ejecutar el archivo SQL usando sqlcmd
        $result = sqlcmd -S $Server -d $Database -U $Username -P $Password -i $FilePath -b
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Completado exitosamente" -ForegroundColor Green
            Write-Host ""
            return $true
        } else {
            Write-Host "  ✗ Error al ejecutar el script" -ForegroundColor Red
            Write-Host "  Código de salida: $LASTEXITCODE" -ForegroundColor Red
            Write-Host ""
            return $false
        }
    }
    catch {
        Write-Host "  ✗ Excepción: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Verificar que sqlcmd esté disponible
Write-Host "Verificando herramientas..." -ForegroundColor Yellow
$sqlcmdPath = Get-Command sqlcmd -ErrorAction SilentlyContinue

if (-not $sqlcmdPath) {
    Write-Host "✗ ERROR: sqlcmd no está disponible" -ForegroundColor Red
    Write-Host "  Por favor instala SQL Server Command Line Utilities" -ForegroundColor Red
    Write-Host "  Descarga: https://docs.microsoft.com/en-us/sql/tools/sqlcmd-utility" -ForegroundColor Gray
    exit 1
}

Write-Host "  ✓ sqlcmd encontrado" -ForegroundColor Green
Write-Host ""

# Obtener la ruta del directorio actual
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Paso 1: Crear tabla de actividades
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "PASO 1: Crear tabla UserActivities" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

$createTableFile = Join-Path $ScriptDir "CREATE_USER_ACTIVITIES_TABLE.sql"
$step1Success = Execute-SqlFile -FilePath $createTableFile -Description "Creación de tabla UserActivities"

if (-not $step1Success) {
    Write-Host "✗ Error en el Paso 1. Abortando..." -ForegroundColor Red
    exit 1
}

# Paso 2: Insertar datos de prueba
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "PASO 2: Insertar datos de prueba" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

$insertDataFile = Join-Path $ScriptDir "INSERT_USER_ACTIVITIES_TEST_DATA.sql"
$step2Success = Execute-SqlFile -FilePath $insertDataFile -Description "Inserción de datos de prueba"

if (-not $step2Success) {
    Write-Host "✗ Error en el Paso 2. Abortando..." -ForegroundColor Red
    exit 1
}

# Resumen final
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "CONFIGURACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "La tabla UserActivities ha sido creada y poblada con datos de prueba." -ForegroundColor Green
Write-Host ""
Write-Host "Datos insertados:" -ForegroundColor Yellow
Write-Host "  • admin: 25 actividades" -ForegroundColor Gray
Write-Host "  • operator01: 19 actividades" -ForegroundColor Gray
Write-Host "  • designer01: 16 actividades" -ForegroundColor Gray
Write-Host "  • manager01: 12 actividades" -ForegroundColor Gray
Write-Host "  • Total: 72 actividades" -ForegroundColor Gray
Write-Host ""
Write-Host "Módulos incluidos:" -ForegroundColor Yellow
Write-Host "  • AUTH (Autenticación)" -ForegroundColor Gray
Write-Host "  • PROFILE (Perfil)" -ForegroundColor Gray
Write-Host "  • MACHINES (Máquinas)" -ForegroundColor Gray
Write-Host "  • DESIGN (Diseño)" -ForegroundColor Gray
Write-Host "  • REPORTS (Reportes)" -ForegroundColor Gray
Write-Host "  • SETTINGS (Configuración)" -ForegroundColor Gray
Write-Host ""
Write-Host "Rango de fechas: Últimos 5 días" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ahora puedes probar el módulo de reportes en la aplicación." -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Pausa para que el usuario pueda leer el resultado
Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
