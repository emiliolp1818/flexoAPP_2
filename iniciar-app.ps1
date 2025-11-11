# Script para iniciar FlexoAPP en modo local

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  FlexoAPP - Inicio Local" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar MySQL
Write-Host "Verificando MySQL..." -ForegroundColor Yellow
$mysqlStatus = Get-Service -Name MySQL* -ErrorAction SilentlyContinue
if ($mysqlStatus -and $mysqlStatus.Status -eq 'Running') {
    Write-Host "MySQL esta corriendo" -ForegroundColor Green
} else {
    Write-Host "ADVERTENCIA: MySQL no esta corriendo" -ForegroundColor Red
    Write-Host "Inicia MySQL antes de continuar" -ForegroundColor Yellow
    $continue = Read-Host "Continuar de todos modos? (s/n)"
    if ($continue -ne "s") {
        exit
    }
}

Write-Host ""
Write-Host "Opciones:" -ForegroundColor Cyan
Write-Host "1. Iniciar Backend" -ForegroundColor White
Write-Host "2. Iniciar Frontend" -ForegroundColor White
Write-Host "3. Iniciar Ambos" -ForegroundColor White
Write-Host "4. Crear tabla CondicionUnica" -ForegroundColor White
Write-Host ""

$opcion = Read-Host "Selecciona una opcion (1-4)"

switch ($opcion) {
    "1" {
        Write-Host ""
        Write-Host "Iniciando Backend..." -ForegroundColor Green
        Set-Location backend
        dotnet run
    }
    "2" {
        Write-Host ""
        Write-Host "Iniciando Frontend..." -ForegroundColor Green
        Set-Location Frontend
        ng serve
    }
    "3" {
        Write-Host ""
        Write-Host "Iniciando Backend y Frontend..." -ForegroundColor Green
        Write-Host "Backend: http://localhost:7003" -ForegroundColor Cyan
        Write-Host "Frontend: http://localhost:4200" -ForegroundColor Cyan
        Write-Host ""
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; dotnet run"
        Start-Sleep -Seconds 2
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Frontend; ng serve"
        
        Write-Host "Aplicacion iniciada en ventanas separadas" -ForegroundColor Green
    }
    "4" {
        Write-Host ""
        Write-Host "Creando base de datos y tabla CondicionUnica..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Ejecuta este comando en mysql:" -ForegroundColor Yellow
        Write-Host "mysql -u root -p < backend/Database/Scripts/create_database_mysql.sql" -ForegroundColor White
        Write-Host ""
        Write-Host "O abre el archivo en MySQL Workbench y ejecutalo:" -ForegroundColor Yellow
        Write-Host "backend/Database/Scripts/create_database_mysql.sql" -ForegroundColor White
    }
    default {
        Write-Host "Opcion invalida" -ForegroundColor Red
    }
}

Write-Host ""
