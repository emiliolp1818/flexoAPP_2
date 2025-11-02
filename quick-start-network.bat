@echo off
title FlexoAPP - Inicio Rápido NETWORK

echo ========================================
echo    FLEXOAPP - MODO NETWORK DIRECTO
echo    Accesible desde toda la red local
echo ========================================
echo.

:: Verificar directorios
if not exist "backend" (
    echo ❌ Error: Ejecuta desde el directorio raíz del proyecto
    pause
    exit /b 1
)

if not exist "Frontend" (
    echo ❌ Error: Ejecuta desde el directorio raíz del proyecto
    pause
    exit /b 1
)

:: Obtener IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do set LOCAL_IP=%%a
set LOCAL_IP=%LOCAL_IP: =%

echo 🌐 MODO NETWORK ACTIVADO
echo 🔌 Backend: http://%LOCAL_IP%:7003
echo 🎨 Frontend: http://%LOCAL_IP%:4200
echo 📱 Accesible desde cualquier dispositivo en la red
echo.

:: Verificar dependencias
echo 🔍 Verificando dependencias...
where dotnet >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: .NET no está instalado
    pause
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js no está instalado
    pause
    exit /b 1
)

where ng >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Angular CLI no está instalado
    pause
    exit /b 1
)

echo ✅ Todas las dependencias están disponibles
echo.

:: Detener procesos existentes
echo 🔄 Limpiando procesos existentes...
taskkill /f /fi "windowtitle eq FlexoAPP*" >nul 2>&1

:: Iniciar Backend en modo network
echo 🔧 Iniciando Backend en modo NETWORK...
start "FlexoAPP Backend - NETWORK" cmd /k "echo 🚀 FlexoAPP Backend - NETWORK MODE && echo 🌐 Acceso Local: http://localhost:7003 && echo 🌐 Acceso Red: http://%LOCAL_IP%:7003 && echo 📚 Swagger: http://%LOCAL_IP%:7003/swagger && echo 🔑 Login: admin / admin123 && echo. && cd backend && dotnet run --urls http://0.0.0.0:7003"

:: Esperar que el backend inicie
echo ⏳ Esperando que el backend inicie...
timeout /t 8 /nobreak >nul

:: Iniciar Frontend en modo network
echo 🎨 Iniciando Frontend en modo NETWORK...
start "FlexoAPP Frontend - NETWORK" cmd /k "echo 🌐 FlexoAPP Frontend - NETWORK MODE && echo 🌐 Acceso Local: http://localhost:4200 && echo 🌐 Acceso Red: http://%LOCAL_IP%:4200 && echo 📱 Desde móviles: http://%LOCAL_IP%:4200 && echo. && cd Frontend && ng serve --host 0.0.0.0 --port 4200 --disable-host-check"

:: Esperar que Angular compile
echo ⏳ Esperando que Angular compile...
timeout /t 15 /nobreak >nul

:: Verificar servicios
echo 🔍 Verificando servicios...
powershell -Command "try { Invoke-RestMethod -Uri 'http://localhost:7003/health' -TimeoutSec 5 | Out-Null; Write-Host '✅ Backend: OK' } catch { Write-Host '⚠️  Backend: Iniciando...' }"

:: Abrir navegador
echo 🌐 Abriendo navegador...
start http://localhost:4200

echo.
echo ========================================
echo    FLEXOAPP NETWORK - LISTO
echo ========================================
echo.
echo 🌐 ACCESO DESDE ESTA MÁQUINA:
echo    Frontend: http://localhost:4200
echo    Backend:  http://localhost:7003
echo    Swagger:  http://localhost:7003/swagger
echo.
echo 📱 ACCESO DESDE LA RED LOCAL:
echo    Frontend: http://%LOCAL_IP%:4200
echo    Backend:  http://%LOCAL_IP%:7003
echo    Swagger:  http://%LOCAL_IP%:7003/swagger
echo.
echo 🔑 CREDENCIALES:
echo    Usuario: admin
echo    Contraseña: admin123
echo.
echo 📋 DISPOSITIVOS COMPATIBLES:
echo    • Móviles (Android/iOS)
echo    • Tablets
echo    • Otras computadoras en la red
echo    • Smart TVs con navegador
echo.
echo ⚠️  FIREWALL:
echo    Si no puedes acceder desde otros dispositivos:
echo    1. Ve a Windows Defender Firewall
echo    2. Permitir una aplicación
echo    3. Busca "Node.js" y "dotnet" y márcalos
echo.
echo 🛑 Para detener: Ejecuta stop-flexoapp.bat
echo.
pause