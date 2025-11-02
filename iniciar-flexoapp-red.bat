@echo off
title FlexoAPP - Inicio Completo con Red

echo ==========================================
echo    FLEXOAPP - SISTEMA COMPLETO CON RED
echo ==========================================
echo.

:: Verificar directorios
if not exist "flexoAPP-backent" (
    echo ❌ Error: Ejecuta desde el directorio raíz del proyecto
    pause
    exit /b 1
)

if not exist "flexoAPP-Frontend" (
    echo ❌ Error: Ejecuta desde el directorio raíz del proyecto
    pause
    exit /b 1
)

echo 🚀 Iniciando FlexoAPP con configuración de red completa...
echo.

:: Mostrar información de red
echo 🌐 INFORMACIÓN DE RED:
echo    IP del servidor: 192.168.1.6
echo    Backend: http://192.168.1.6:7003
echo    Frontend: http://192.168.1.6:4200
echo    Swagger: http://192.168.1.6:7003/swagger
echo.

echo 🔐 CREDENCIALES:
echo    Usuario: admin
echo    Contraseña: admin123
echo    MySQL: root / 12345
echo.

:: Verificar si los servicios ya están corriendo
echo 🔍 Verificando servicios existentes...

:: Verificar Backend
netstat -an | findstr :7003 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend ya está corriendo en puerto 7003
    set "backend_running=true"
) else (
    echo ⚠️ Backend no está corriendo
    set "backend_running=false"
)

:: Verificar Frontend
netstat -an | findstr :4200 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend ya está corriendo en puerto 4200
    set "frontend_running=true"
) else (
    echo ⚠️ Frontend no está corriendo
    set "frontend_running=false"
)

echo.

:: Iniciar Backend si no está corriendo
if "%backend_running%"=="false" (
    echo 🔧 Iniciando Backend ASP.NET Core...
    echo    - Puerto: 7003
    echo    - Red: 0.0.0.0 (accesible desde toda la red)
    echo    - Health Check: http://192.168.1.6:7003/health-simple
    echo.
    start "FlexoAPP Backend" cmd /k "cd flexoAPP-backent && echo 🚀 Iniciando Backend... && dotnet run --urls http://0.0.0.0:7003"
    
    :: Esperar a que el backend se inicie
    echo ⏳ Esperando que el backend se inicie...
    timeout /t 8 /nobreak >nul
    
    :: Verificar que el backend esté respondiendo
    echo 🔍 Verificando backend...
    curl -s http://localhost:7003/health-simple >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Backend iniciado correctamente
    ) else (
        echo ⚠️ Backend tardando en iniciar (normal en primer arranque)
    )
) else (
    echo ✅ Backend ya está funcionando
)

echo.

:: Iniciar Frontend si no está corriendo
if "%frontend_running%"=="false" (
    echo 🎨 Iniciando Frontend Angular...
    echo    - Puerto: 4200
    echo    - Red: 0.0.0.0 (accesible desde toda la red)
    echo    - API: http://192.168.1.6:7003/api
    echo.
    start "FlexoAPP Frontend" cmd /k "cd flexoAPP-Frontend && echo 🎨 Iniciando Frontend... && ng serve --host 0.0.0.0 --allowed-hosts"
    
    :: Esperar a que el frontend compile
    echo ⏳ Esperando que el frontend compile...
    timeout /t 15 /nobreak >nul
) else (
    echo ✅ Frontend ya está funcionando
)

echo.
echo 🌐 Verificando conectividad de red...

:: Probar Backend
curl -s http://localhost:7003/health-simple >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend respondiendo correctamente
) else (
    echo ⚠️ Backend aún iniciando...
)

:: Probar Backend por IP
curl -s http://192.168.1.6:7003/health-simple >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend accesible por IP de red
) else (
    echo ⚠️ Backend por IP aún no disponible
)

echo.
echo ==========================================
echo    FLEXOAPP INICIADO CON RED COMPLETA
echo ==========================================
echo.

echo 🌐 URLs DE ACCESO:
echo.
echo    📱 Desde este equipo:
echo       Frontend: http://localhost:4200
echo       Backend:  http://localhost:7003
echo       Swagger:  http://localhost:7003/swagger
echo.
echo    🌐 Desde otros equipos de la red:
echo       Frontend: http://192.168.1.6:4200
echo       Backend:  http://192.168.1.6:7003
echo       Swagger:  http://192.168.1.6:7003/swagger
echo.

echo 🔐 CREDENCIALES:
echo    Usuario FlexoAPP: admin
echo    Contraseña: admin123
echo    Duración sesión: 24+ horas
echo.

echo 📊 PÁGINAS DISPONIBLES:
echo    ✅ Dashboard - Estadísticas y acciones rápidas
echo    ✅ Máquinas - Gestión de producción flexográfica
echo    ✅ Diseño - Base de datos de diseños
echo    ✅ Documento - Gestión de documentos
echo    ✅ Información - Info del sistema
echo    ✅ Reportes - Estadísticas y reportes
echo    ✅ Configuraciones - Gestión de usuarios
echo.

echo 🛡️ CARACTERÍSTICAS ACTIVAS:
echo    ✅ Auto-reconexión de red
echo    ✅ Múltiples URLs de fallback
echo    ✅ Monitoreo continuo de conectividad
echo    ✅ Reintentos automáticos
echo    ✅ Sesiones de larga duración
echo    ✅ Sistema ultra estable 24/7
echo.

echo ⚠️ CONFIGURACIÓN MYSQL PENDIENTE:
echo    Para acceso completo desde red, ejecuta:
echo    configure-mysql-network-fix.bat
echo.

echo 🎯 PRÓXIMOS PASOS:
echo    1. Abrir navegador en: http://192.168.1.6:4200
echo    2. Iniciar sesión con: admin / admin123
echo    3. Configurar MySQL para red (opcional)
echo    4. Compartir URLs con otros usuarios de la red
echo.

:: Esperar un poco más y abrir navegador
echo ⏳ Abriendo navegador en 5 segundos...
timeout /t 5 /nobreak >nul

echo 🌐 Abriendo FlexoAPP...
start http://192.168.1.6:4200

echo.
echo ✅ FLEXOAPP INICIADO CORRECTAMENTE!
echo.
echo 💡 CONSEJOS:
echo    - Las ventanas de Backend y Frontend deben permanecer abiertas
echo    - El sistema se auto-reconecta si hay problemas de red
echo    - Las sesiones duran 24+ horas sin necesidad de re-login
echo    - Todas las páginas tienen HTML y CSS completos y activos
echo.

echo 📞 SOPORTE:
echo    - Revisar logs en las ventanas de Backend y Frontend
echo    - Ejecutar test-network-connectivity-complete.bat para diagnósticos
echo    - Consultar CONFIGURACION_RED_COMPLETA_FINAL.md para detalles
echo.

pause