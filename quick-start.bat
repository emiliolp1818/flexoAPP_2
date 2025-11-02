@echo off
title FlexoAPP - Inicio Rápido Mejorado

echo ========================================
echo    FLEXOAPP - INICIO RÁPIDO MEJORADO
echo    Módulos: Máquinas y Diseño Activados
echo ========================================
echo.

:: Selección de modo de inicio
echo 🚀 SELECCIONA EL MODO DE INICIO:
echo.
echo    1. 🏠 MODO LOCAL    - Solo accesible desde esta máquina
echo    2. 🌐 MODO NETWORK  - Accesible desde toda la red local
echo.
set /p MODE="Selecciona una opción (1 o 2): "

if "%MODE%"=="1" (
    set BACKEND_URL=http://localhost:7003
    set FRONTEND_URL=http://localhost:4200
    set FRONTEND_HOST=localhost
    set NETWORK_MODE=LOCAL
    echo ✅ Modo LOCAL seleccionado
) else if "%MODE%"=="2" (
    set BACKEND_URL=http://0.0.0.0:7003
    set FRONTEND_URL=http://0.0.0.0:4200
    set FRONTEND_HOST=0.0.0.0
    set NETWORK_MODE=NETWORK
    echo ✅ Modo NETWORK seleccionado
) else (
    echo ❌ Opción inválida. Usando modo LOCAL por defecto.
    set BACKEND_URL=http://localhost:7003
    set FRONTEND_URL=http://localhost:4200
    set FRONTEND_HOST=localhost
    set NETWORK_MODE=LOCAL
)

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

echo ✅ Iniciando FlexoAPP con módulos mejorados...
echo.

:: Verificar dependencias
echo 🔍 Verificando dependencias...
where dotnet >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: .NET no está instalado o no está en el PATH
    echo    Instala .NET 8.0 desde: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js no está instalado o no está en el PATH
    echo    Instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

where ng >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Angular CLI no está instalado
    echo    Instala con: npm install -g @angular/cli
    pause
    exit /b 1
)

echo ✅ Todas las dependencias están disponibles
echo.

:: Mostrar información de módulos activados
echo 🏭 MÓDULOS ACTIVADOS:
echo    • Máquinas (Color #2563eb aplicado)
echo    • Diseño (Interfaz mejorada)
echo    • Reportes (Con sistema de backups)
echo.

:: Obtener IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do set LOCAL_IP=%%a
set LOCAL_IP=%LOCAL_IP: =%

:: Mostrar información según el modo
if "%NETWORK_MODE%"=="LOCAL" (
    echo 🏠 MODO LOCAL ACTIVADO
    echo 🔌 Backend: %BACKEND_URL%
    echo 🎨 Frontend: %FRONTEND_URL%
) else (
    echo 🌐 MODO NETWORK ACTIVADO
    echo 🔌 Backend: http://%LOCAL_IP%:7003
    echo 🎨 Frontend: http://%LOCAL_IP%:4200
    echo 📱 Accesible desde cualquier dispositivo en la red
)
echo.

:: Iniciar Backend con módulos mejorados
echo 🔧 Iniciando Backend en modo %NETWORK_MODE% (Puerto 7003)...
start "FlexoAPP Backend - %NETWORK_MODE%" cmd /k "echo 🚀 FlexoAPP Backend - Modo %NETWORK_MODE% && echo 📊 Máquinas: /api/machine-programs && echo 🎨 Diseños: /api/designs && echo 💾 Backups: /api/machine-backup && echo 📈 Reportes: /api/reports && echo � Loogin: admin / admin123 && echo 🌐 URL: %BACKEND_URL% && echo. && cd backend && dotnet run --urls %BACKEND_URL%"

:: Detener procesos existentes si los hay
echo 🔄 Verificando procesos existentes...
tasklist /fi "imagename eq dotnet.exe" /fi "windowtitle eq FlexoAPP Backend*" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Deteniendo procesos backend existentes...
    taskkill /f /fi "windowtitle eq FlexoAPP Backend*" >nul 2>&1
)

tasklist /fi "imagename eq node.exe" /fi "windowtitle eq FlexoAPP Frontend*" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Deteniendo procesos frontend existentes...
    taskkill /f /fi "windowtitle eq FlexoAPP Frontend*" >nul 2>&1
)

:: Esperar 3 segundos para que el backend inicie
echo ⏳ Esperando que el backend inicie...
timeout /t 8 /nobreak >nul

:: Iniciar Frontend con interfaz mejorada
echo 🎨 Iniciando Frontend en modo %NETWORK_MODE% (Puerto 4200)...
if "%NETWORK_MODE%"=="LOCAL" (
    start "FlexoAPP Frontend - LOCAL" cmd /k "echo 🌐 FlexoAPP Frontend - Modo LOCAL && echo 🏭 Módulo Máquinas: Color #2563eb aplicado && echo 🎯 Módulo Diseño: Funcionalidad completa && echo 📊 Reportes: Backups integrados && echo 🌐 Acceso: http://localhost:4200 && echo. && cd Frontend && npm start"
) else (
    start "FlexoAPP Frontend - NETWORK" cmd /k "echo 🌐 FlexoAPP Frontend - Modo NETWORK && echo 🏭 Módulo Máquinas: Color #2563eb aplicado && echo 🎯 Módulo Diseño: Funcionalidad completa && echo 📊 Reportes: Backups integrados && echo 🌐 Acceso Local: http://localhost:4200 && echo 🌐 Acceso Red: http://%LOCAL_IP%:4200 && echo. && cd Frontend && ng serve --host 0.0.0.0 --port 4200 --disable-host-check"
)

:: Esperar 15 segundos para que Angular compile
echo ⏳ Esperando que Angular compile (esto puede tomar un momento)...
timeout /t 15 /nobreak >nul

:: Verificar que los servicios estén corriendo
echo 🔍 Verificando que los servicios estén activos...
powershell -Command "try { Invoke-RestMethod -Uri 'http://localhost:7003/health' -TimeoutSec 5 | Out-Null; Write-Host '✅ Backend: OK' } catch { Write-Host '⚠️  Backend: Iniciando...' }"
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:4200' -TimeoutSec 5 | Out-Null; Write-Host '✅ Frontend: OK' } catch { Write-Host '⚠️  Frontend: Compilando...' }"

:: Abrir navegador según el modo
echo 🌐 Abriendo navegador...
if "%NETWORK_MODE%"=="LOCAL" (
    start http://localhost:4200
) else (
    start http://localhost:4200
    echo 📱 También puedes acceder desde otros dispositivos en: http://%LOCAL_IP%:4200
)

echo.
echo ========================================
echo    FLEXOAPP INICIADO - VERSIÓN MEJORADA
echo ========================================
echo.
if "%NETWORK_MODE%"=="LOCAL" (
    echo 🌐 URLs de acceso LOCAL:
    echo    Frontend: http://localhost:4200
    echo    Backend:  http://localhost:7003
    echo    Swagger:  http://localhost:7003/swagger
) else (
    echo 🌐 URLs de acceso NETWORK:
    echo    Local Frontend:  http://localhost:4200
    echo    Red Frontend:    http://%LOCAL_IP%:4200
    echo    Local Backend:   http://localhost:7003
    echo    Red Backend:     http://%LOCAL_IP%:7003
    echo    Swagger:         http://%LOCAL_IP%:7003/swagger
    echo.
    echo 📱 ACCESO DESDE OTROS DISPOSITIVOS:
    echo    • Móviles: http://%LOCAL_IP%:4200
    echo    • Tablets: http://%LOCAL_IP%:4200
    echo    • Otras PCs: http://%LOCAL_IP%:4200
)
echo 👤 Usuario: admin
echo 🔑 Contraseña: admin123
echo.
echo 🏭 MÓDULOS MEJORADOS:
echo    • Máquinas: Color #2563eb aplicado
echo    • Diseño: Interfaz completamente funcional
echo    • Reportes: Sistema de backups integrado
echo.
echo 🔗 ENDPOINTS PRINCIPALES:
echo    • /api/machine-programs (Máquinas)
echo    • /api/designs (Diseños)
echo    • /api/machine-backup (Backups)
echo    • /api/reports (Reportes)
echo.
echo 💾 NUEVAS FUNCIONALIDADES:
echo    • Sistema de backup automático
echo    • Reportes desde backups históricos
echo    • Verificación de conexiones DB
echo    • Interfaz con color corporativo #2563eb
echo.
echo ✅ Sistema listo con módulos activados!
echo.
echo 📋 INSTRUCCIONES:
echo    1. El navegador se abrirá automáticamente
if "%NETWORK_MODE%"=="LOCAL" (
    echo    2. Si no se abre, ve a: http://localhost:4200
) else (
    echo    2. Si no se abre, ve a: http://localhost:4200
    echo    3. Para acceso desde red: http://%LOCAL_IP%:4200
)
echo    4. Usa las credenciales: admin / admin123
echo    5. Si hay errores, espera un momento más para que compile
echo.
echo 🔧 SOLUCIÓN DE PROBLEMAS:
echo    • Si el backend no responde: Espera 30 segundos más
echo    • Si el frontend no carga: Espera que Angular termine de compilar
if "%NETWORK_MODE%"=="NETWORK" (
    echo    • Si no puedes acceder desde red: Verifica firewall de Windows
    echo    • Para permitir acceso: Windows Defender ^> Permitir app
)
echo    • Si hay errores de conexión: Verifica que no haya firewall bloqueando
echo.
echo 🛑 Para detener los servicios: Cierra las ventanas de cmd que se abrieron
echo.
pause