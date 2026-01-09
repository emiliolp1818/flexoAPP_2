@echo off
REM Script de diagnóstico para problemas de Render
echo 🔍 DIAGNÓSTICO DE PROBLEMAS EN RENDER
echo =====================================

echo.
echo 📋 VERIFICANDO CONFIGURACIÓN LOCAL...

REM Verificar archivos críticos
if exist "backend\Program.cs" (
    echo ✅ Program.cs existe
) else (
    echo ❌ Program.cs NO existe
    goto :error
)

if exist "backend\appsettings.Production.json" (
    echo ✅ appsettings.Production.json existe
) else (
    echo ❌ appsettings.Production.json NO existe
    goto :error
)

if exist "backend\Dockerfile" (
    echo ✅ Dockerfile del backend existe
) else (
    echo ❌ Dockerfile del backend NO existe
    goto :error
)

echo.
echo 🔍 VERIFICANDO CONFIGURACIÓN DE RENDER...

REM Verificar configuración de CORS
findstr /c:"onrender.com" backend\Program.cs >nul
if %errorlevel% equ 0 (
    echo ✅ CORS configurado para Render
) else (
    echo ❌ CORS NO configurado para Render
)

REM Verificar configuración de Railway
findstr /c:"hopper.proxy.rlwy.net" backend\appsettings.Production.json >nul
if %errorlevel% equ 0 (
    echo ✅ Conexión a Railway configurada
) else (
    echo ❌ Conexión a Railway NO configurada
)

REM Verificar puerto 8080
findstr /c:"8080" backend\Program.cs >nul
if %errorlevel% equ 0 (
    echo ✅ Puerto 8080 configurado
) else (
    echo ❌ Puerto 8080 NO configurado
)

echo.
echo 🌐 PROBANDO CONECTIVIDAD...

REM Probar conectividad a Railway
echo Probando conexión a Railway MySQL...
ping -n 1 hopper.proxy.rlwy.net >nul
if %errorlevel% equ 0 (
    echo ✅ Railway MySQL es accesible
) else (
    echo ❌ Railway MySQL NO es accesible
)

REM Probar URLs de Render
echo.
echo Probando URLs de Render...
curl -s -o nul -w "Backend Health Check: %%{http_code}\n" https://flexoapp-backend.onrender.com/health
curl -s -o nul -w "Frontend: %%{http_code}\n" https://frontend-f54v.onrender.com

echo.
echo 📊 VARIABLES DE ENTORNO REQUERIDAS PARA RENDER:
echo ================================================
echo.
echo BACKEND (flexoapp-backend):
echo ---------------------------
echo ASPNETCORE_ENVIRONMENT=Production
echo ConnectionStrings__DefaultConnection=Server=hopper.proxy.rlwy.net;Port=43791;Database=railway;User=root;Password=CqkLOlVTDfHuOmYSPfJlXUCfiNXlibtm;AllowUserVariables=True;UseAffectedRows=False;SslMode=Required;ConnectionTimeout=30;CommandTimeout=60;
echo DATABASE_URL=mysql://root:CqkLOlVTDfHuOmYSPfJlXUCfiNXlibtm@hopper.proxy.rlwy.net:43791/railway
echo FRONTEND_URL=https://frontend-f54v.onrender.com
echo JWT_SECRET_KEY=FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Stable
echo PORT=8080
echo.
echo FRONTEND (frontend-f54v):
echo -------------------------
echo NODE_ENV=production
echo API_URL=https://flexoapp-backend.onrender.com/api
echo.
echo 🔧 PASOS DE TROUBLESHOOTING:
echo ============================
echo 1. Verificar que las variables de entorno estén configuradas en Render
echo 2. Revisar los logs del servicio en Render Dashboard
echo 3. Verificar que el build se completó exitosamente
echo 4. Probar el health check: https://flexoapp-backend.onrender.com/health
echo 5. Verificar conectividad a Railway MySQL
echo.
echo 📝 COMANDOS ÚTILES PARA DEBUGGING:
echo ==================================
echo - Ver logs en tiempo real en Render Dashboard
echo - Probar conexión local: dotnet run --project backend
echo - Verificar build: docker build -t flexoapp-backend backend/
echo - Probar health check local: curl http://localhost:8080/health
echo.
goto :end

:error
echo.
echo ❌ ERROR: Faltan archivos críticos
echo Por favor verifica que estés en el directorio correcto del proyecto
echo.

:end
pause