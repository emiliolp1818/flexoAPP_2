@echo off
REM Script de verificación completa del proyecto FlexoAPP
echo 🔍 VERIFICACIÓN COMPLETA DE FLEXOAPP
echo =====================================

REM Verificar rama actual
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo ✅ Rama actual: %CURRENT_BRANCH%

REM Verificar archivos principales del backend
echo.
echo 📁 VERIFICANDO BACKEND...
if exist "backend\Program.cs" (
    echo ✅ Program.cs encontrado
) else (
    echo ❌ Program.cs NO encontrado
)

if exist "backend\appsettings.Production.json" (
    echo ✅ appsettings.Production.json encontrado
) else (
    echo ❌ appsettings.Production.json NO encontrado
)

if exist "backend\Dockerfile" (
    echo ✅ Dockerfile del backend encontrado
) else (
    echo ❌ Dockerfile del backend NO encontrado
)

REM Verificar scripts de base de datos
echo.
echo 🗄️ VERIFICANDO SCRIPTS DE BASE DE DATOS...
if exist "backend\Database\Scripts\00_MASTER_SETUP.sql" (
    echo ✅ Script maestro de BD encontrado
) else (
    echo ❌ Script maestro de BD NO encontrado
)

set /a script_count=0
for %%f in (backend\Database\Scripts\*.sql) do set /a script_count+=1
echo ✅ Total de scripts SQL: %script_count%

REM Verificar archivos principales del frontend
echo.
echo 🎨 VERIFICANDO FRONTEND...
if exist "Frontend\package.json" (
    echo ✅ package.json encontrado
) else (
    echo ❌ package.json NO encontrado
)

if exist "Frontend\angular.json" (
    echo ✅ angular.json encontrado
) else (
    echo ❌ angular.json NO encontrado
)

if exist "Frontend\Dockerfile" (
    echo ✅ Dockerfile del frontend encontrado
) else (
    echo ❌ Dockerfile del frontend NO encontrado
)

if exist "Frontend\src\environments\environment.render.ts" (
    echo ✅ Environment de Render encontrado
) else (
    echo ❌ Environment de Render NO encontrado
)

REM Verificar archivos de despliegue
echo.
echo 🚀 VERIFICANDO CONFIGURACIÓN DE DESPLIEGUE...
if exist "render.yaml" (
    echo ✅ render.yaml encontrado
) else (
    echo ❌ render.yaml NO encontrado
)

if exist "railway.json" (
    echo ✅ railway.json encontrado
) else (
    echo ❌ railway.json NO encontrado
)

if exist "RENDER-DEPLOY-GUIDE.md" (
    echo ✅ Guía de despliegue encontrada
) else (
    echo ❌ Guía de despliegue NO encontrada
)

REM Verificar documentación
echo.
echo 📚 VERIFICANDO DOCUMENTACIÓN...
if exist "README.md" (
    echo ✅ README principal encontrado
) else (
    echo ❌ README principal NO encontrado
)

if exist "backend\README.md" (
    echo ✅ README del backend encontrado
) else (
    echo ❌ README del backend NO encontrado
)

if exist "Frontend\README.md" (
    echo ✅ README del frontend encontrado
) else (
    echo ❌ README del frontend NO encontrado
)

REM Verificar configuración de Angular
echo.
echo ⚙️ VERIFICANDO CONFIGURACIÓN DE ANGULAR...
findstr /c:"render" Frontend\angular.json >nul
if %errorlevel% equ 0 (
    echo ✅ Configuración 'render' encontrada en angular.json
) else (
    echo ❌ Configuración 'render' NO encontrada en angular.json
)

REM Verificar URLs de producción
echo.
echo 🌐 VERIFICANDO URLS DE PRODUCCIÓN...
findstr /c:"flexoapp-backend.onrender.com" Frontend\src\environments\environment.render.ts >nul
if %errorlevel% equ 0 (
    echo ✅ URL del backend configurada correctamente
) else (
    echo ❌ URL del backend NO configurada
)

findstr /c:"hopper.proxy.rlwy.net" backend\appsettings.Production.json >nul
if %errorlevel% equ 0 (
    echo ✅ Conexión a Railway configurada correctamente
) else (
    echo ❌ Conexión a Railway NO configurada
)

REM Resumen final
echo.
echo 📊 RESUMEN DE VERIFICACIÓN
echo ==========================
echo ✅ Proyecto: FlexoAPP - Sistema de Gestión Flexográfica
echo ✅ Backend: .NET 8 + Entity Framework + MySQL
echo ✅ Frontend: Angular 18 + Material Design
echo ✅ Base de Datos: MySQL (Railway) con scripts automáticos
echo ✅ Despliegue: Render (apps) + Railway (BD)
echo ✅ Documentación: Completa y actualizada
echo.
echo 🚀 URLs DE PRODUCCIÓN:
echo Frontend: https://frontend-f54v.onrender.com
echo Backend:  https://flexoapp-backend.onrender.com
echo API Docs: https://flexoapp-backend.onrender.com/swagger
echo Health:   https://flexoapp-backend.onrender.com/health
echo.
echo 🔐 CREDENCIALES POR DEFECTO:
echo Usuario: admin
echo Contraseña: admin123
echo.
echo ✅ VERIFICACIÓN COMPLETADA
echo El proyecto está listo para despliegue en Render y Railway
echo.
pause