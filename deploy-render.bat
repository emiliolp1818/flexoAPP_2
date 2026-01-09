@echo off
REM Script de despliegue para Render y Railway (Windows)
echo 🚀 Iniciando despliegue de FlexoAPP en Render y Railway...

REM Verificar que estamos en la rama render
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
if not "%CURRENT_BRANCH%"=="render" (
    echo ❌ Error: Debes estar en la rama 'render' para ejecutar este script
    echo Ejecuta: git checkout render
    pause
    exit /b 1
)

echo ✅ Rama actual: %CURRENT_BRANCH%

REM Verificar archivos de configuración
echo 🔍 Verificando archivos de configuración...

if not exist "render.yaml" (
    echo ❌ Error: No se encontró render.yaml
    pause
    exit /b 1
)

if not exist "backend\Dockerfile" (
    echo ❌ Error: No se encontró backend\Dockerfile
    pause
    exit /b 1
)

if not exist "Frontend\Dockerfile" (
    echo ❌ Error: No se encontró Frontend\Dockerfile
    pause
    exit /b 1
)

echo ✅ Todos los archivos de configuración están presentes

REM Verificar configuración del backend
echo 🔍 Verificando configuración del backend...
findstr /c:"hopper.proxy.rlwy.net" backend\appsettings.Production.json >nul
if %errorlevel% equ 0 (
    echo ✅ Configuración de Railway encontrada en appsettings.Production.json
) else (
    echo ❌ Error: Configuración de Railway no encontrada en appsettings.Production.json
    pause
    exit /b 1
)

REM Verificar configuración del frontend
echo 🔍 Verificando configuración del frontend...
findstr /c:"flexoapp-backend.onrender.com" Frontend\src\environments\environment.prod.ts >nul
if %errorlevel% equ 0 (
    echo ✅ Configuración de Render encontrada en environment.prod.ts
) else (
    echo ❌ Error: Configuración de Render no encontrada en environment.prod.ts
    pause
    exit /b 1
)

REM Hacer commit de los cambios
echo 📝 Haciendo commit de los cambios...
git add .
git commit -m "feat: Configuración para despliegue en Render y Railway - Configurado backend para Railway MySQL - Configurado frontend para Render - Agregados Dockerfiles para ambos servicios - Configurado CORS para dominios de producción - Variables de entorno para producción"

echo ✅ Commit realizado exitosamente

REM Mostrar información de despliegue
echo.
echo 🌐 INFORMACIÓN DE DESPLIEGUE
echo ==================================
echo Backend URL: https://flexoapp-backend.onrender.com
echo Frontend URL: https://frontend-f54v.onrender.com
echo Database: Railway MySQL (hopper.proxy.rlwy.net:43791)
echo.
echo 📋 VARIABLES DE ENTORNO PARA RENDER (Backend):
echo ASPNETCORE_ENVIRONMENT=Production
echo ConnectionStrings__DefaultConnection=Server=hopper.proxy.rlwy.net;Port=43791;Database=railway;User=root;Password=CqkLOlVTDfHuOmYSPfJlXUCfiNXlibtm;AllowUserVariables=True;UseAffectedRows=False;SslMode=Required;
echo DATABASE_URL=mysql://root:CqkLOlVTDfHuOmYSPfJlXUCfiNXlibtm@hopper.proxy.rlwy.net:43791/railway
echo FRONTEND_URL=https://frontend-f54v.onrender.com
echo JWT_SECRET_KEY=FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Stable
echo PORT=8080
echo.
echo 📋 VARIABLES DE ENTORNO PARA RENDER (Frontend):
echo NODE_ENV=production
echo API_URL=https://flexoapp-backend.onrender.com/api
echo.
echo 🚀 Para desplegar:
echo 1. Haz push de la rama render: git push origin render
echo 2. En Render, conecta tu repositorio y selecciona la rama 'render'
echo 3. Configura las variables de entorno mostradas arriba
echo 4. Despliega ambos servicios
echo.
echo ✅ Configuración completada exitosamente!
pause