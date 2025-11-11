# Script para verificar conexión a MySQL flexoBD

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Verificación MySQL - flexoBD" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$server = "localhost"
$port = "3306"
$database = "flexoBD"
$user = "root"
$password = "12345"

Write-Host "Configuracion:" -ForegroundColor Yellow
Write-Host "  Servidor: $server" -ForegroundColor White
Write-Host "  Puerto: $port" -ForegroundColor White
Write-Host "  Base de datos: $database" -ForegroundColor White
Write-Host "  Usuario: $user" -ForegroundColor White
Write-Host ""

# Verificar MySQL
Write-Host "1. Verificando servicio MySQL..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name MySQL* -ErrorAction SilentlyContinue
if ($mysqlService -and $mysqlService.Status -eq 'Running') {
    Write-Host "   MySQL esta corriendo" -ForegroundColor Green
} else {
    Write-Host "   ERROR: MySQL no esta corriendo" -ForegroundColor Red
    Write-Host "   Ejecuta: net start MySQL80" -ForegroundColor Yellow
    exit 1
}

# Verificar conexión
Write-Host ""
Write-Host "2. Verificando conexion a base de datos..." -ForegroundColor Yellow
$testQuery = "SELECT 1"
$mysqlCmd = "mysql -h $server -P $port -u $user -p$password -e `"$testQuery`" 2>&1"

try {
    $result = Invoke-Expression $mysqlCmd
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Conexion exitosa" -ForegroundColor Green
    } else {
        Write-Host "   ERROR: No se pudo conectar" -ForegroundColor Red
        Write-Host "   Verifica usuario y contraseña" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ERROR: mysql no esta en el PATH" -ForegroundColor Red
    Write-Host "   Usa MySQL Workbench para verificar" -ForegroundColor Yellow
}

# Verificar base de datos
Write-Host ""
Write-Host "3. Verificando base de datos flexoBD..." -ForegroundColor Yellow
$dbQuery = "SHOW DATABASES LIKE 'flexoBD'"
$mysqlCmd = "mysql -h $server -P $port -u $user -p$password -e `"$dbQuery`" 2>&1"

try {
    $result = Invoke-Expression $mysqlCmd
    if ($result -match "flexoBD") {
        Write-Host "   Base de datos flexoBD existe" -ForegroundColor Green
    } else {
        Write-Host "   ADVERTENCIA: Base de datos flexoBD no existe" -ForegroundColor Yellow
        Write-Host "   Creala con: CREATE DATABASE flexoBD;" -ForegroundColor White
    }
} catch {
    Write-Host "   No se pudo verificar (usa MySQL Workbench)" -ForegroundColor Yellow
}

# Verificar tabla condicionunica
Write-Host ""
Write-Host "4. Verificando tabla condicionunica..." -ForegroundColor Yellow
$tableQuery = "USE flexoBD; SHOW TABLES LIKE 'condicionunica'"
$mysqlCmd = "mysql -h $server -P $port -u $user -p$password -e `"$tableQuery`" 2>&1"

try {
    $result = Invoke-Expression $mysqlCmd
    if ($result -match "condicionunica") {
        Write-Host "   Tabla condicionunica existe" -ForegroundColor Green
        
        # Contar registros
        $countQuery = "USE flexoBD; SELECT COUNT(*) FROM condicionunica"
        $mysqlCmd = "mysql -h $server -P $port -u $user -p$password -e `"$countQuery`" 2>&1"
        $result = Invoke-Expression $mysqlCmd
        Write-Host "   Registros en tabla: $result" -ForegroundColor Cyan
    } else {
        Write-Host "   ADVERTENCIA: Tabla condicionunica no existe" -ForegroundColor Yellow
        Write-Host "   Ejecuta: mysql -u root -p12345 flexoBD < backend/Database/Scripts/create_condicionunica_flexoBD.sql" -ForegroundColor White
    }
} catch {
    Write-Host "   No se pudo verificar (usa MySQL Workbench)" -ForegroundColor Yellow
}

# Verificar backend
Write-Host ""
Write-Host "5. Verificando configuracion del backend..." -ForegroundColor Yellow
$appsettings = Get-Content "backend/appsettings.json" -Raw | ConvertFrom-Json
$connString = $appsettings.ConnectionStrings.DefaultConnection

if ($connString -match "flexoBD") {
    Write-Host "   Backend configurado para flexoBD" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Backend no esta configurado para flexoBD" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Verificacion Completada" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Siguiente paso:" -ForegroundColor Yellow
Write-Host "  .\iniciar-app.ps1" -ForegroundColor White
Write-Host ""
