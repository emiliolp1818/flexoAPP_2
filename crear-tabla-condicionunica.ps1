# ===== SCRIPT POWERSHELL: CREAR TABLA CONDICIONUNICA =====
# Script para crear la tabla condicionunica en MySQL
# Ejecuta el archivo SQL crear-tabla-condicionunica.sql

# ===== CONFIGURACIÓN =====
$mysqlPath = "mysql"  # Ruta al ejecutable de MySQL (debe estar en PATH)
$database = "flexoapp_bd"  # Nombre de la base de datos
$sqlFile = "crear-tabla-condicionunica.sql"  # Archivo SQL a ejecutar

# ===== COLORES PARA OUTPUT =====
function Write-Success { param($message) Write-Host "✅ $message" -ForegroundColor Green }
function Write-Error { param($message) Write-Host "❌ $message" -ForegroundColor Red }
function Write-Info { param($message) Write-Host "ℹ️  $message" -ForegroundColor Cyan }
function Write-Warning { param($message) Write-Host "⚠️  $message" -ForegroundColor Yellow }

# ===== BANNER =====
Write-Host ""
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "🗄️  CREAR TABLA CONDICIONUNICA" -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host ""

# ===== VERIFICAR QUE EXISTE EL ARCHIVO SQL =====
Write-Info "Verificando archivo SQL..."
if (-not (Test-Path $sqlFile)) {
    Write-Error "No se encontró el archivo $sqlFile"
    Write-Warning "Asegúrate de que el archivo existe en el directorio actual"
    exit 1
}
Write-Success "Archivo SQL encontrado: $sqlFile"
Write-Host ""

# ===== VERIFICAR QUE MYSQL ESTÁ INSTALADO =====
Write-Info "Verificando instalación de MySQL..."
try {
    $mysqlVersion = & $mysqlPath --version 2>&1
    Write-Success "MySQL está instalado"
    Write-Host "   Versión: $mysqlVersion" -ForegroundColor Gray
} catch {
    Write-Error "MySQL no está instalado o no está en el PATH"
    Write-Warning "Instala MySQL o agrega la ruta al PATH del sistema"
    Write-Warning "Ejemplo: C:\Program Files\MySQL\MySQL Server 8.0\bin"
    exit 1
}
Write-Host ""

# ===== SOLICITAR CREDENCIALES =====
Write-Info "Ingresa las credenciales de MySQL"
$username = Read-Host "Usuario MySQL (default: root)"
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = "root"
}

$password = Read-Host "Contraseña MySQL" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

Write-Host ""

# ===== EJECUTAR SCRIPT SQL =====
Write-Info "Ejecutando script SQL en la base de datos $database..."
Write-Host ""

try {
    # Construir comando MySQL
    # -u: usuario
    # -p: contraseña (se pasa como argumento)
    # -e: ejecutar comando SQL
    # source: ejecutar archivo SQL
    
    $mysqlCommand = "source $sqlFile"
    
    # Ejecutar MySQL con el script
    $output = & $mysqlPath -u $username -p"$passwordPlain" $database -e $mysqlCommand 2>&1
    
    # Verificar si hubo errores
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Script SQL ejecutado exitosamente"
        Write-Host ""
        
        # Mostrar output si existe
        if ($output) {
            Write-Host "Resultado:" -ForegroundColor Gray
            Write-Host $output -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Success "Tabla condicionunica creada correctamente"
        Write-Info "Puedes verificar la tabla con: SELECT * FROM condicionunica;"
    } else {
        Write-Error "Error al ejecutar el script SQL"
        Write-Host $output -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Error "Error al conectar con MySQL"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Warning "Verifica que:"
    Write-Host "   1. MySQL está corriendo" -ForegroundColor Yellow
    Write-Host "   2. Las credenciales son correctas" -ForegroundColor Yellow
    Write-Host "   3. La base de datos $database existe" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "✅ PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host ""

# ===== INSTRUCCIONES FINALES =====
Write-Info "Próximos pasos:"
Write-Host "   1. Reinicia el backend: cd backend && dotnet run" -ForegroundColor Gray
Write-Host "   2. Abre el frontend: http://localhost:4200" -ForegroundColor Gray
Write-Host "   3. Navega a Condición Única" -ForegroundColor Gray
Write-Host "   4. Intenta crear un nuevo registro" -ForegroundColor Gray
Write-Host ""
