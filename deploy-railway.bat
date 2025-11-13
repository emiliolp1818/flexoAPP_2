@echo off
REM ============================================
REM Script de ayuda para despliegue en Railway
REM ============================================

echo ========================================
echo FlexoAPP - Despliegue en Railway
echo ========================================
echo.

echo Este script te ayudara a preparar el despliegue
echo.

:menu
echo Selecciona una opcion:
echo.
echo 1. Ver checklist de preparacion
echo 2. Generar password admin (BCrypt)
echo 3. Ver variables de entorno necesarias
echo 4. Verificar archivos de configuracion
echo 5. Abrir Railway Dashboard
echo 6. Abrir guia completa
echo 7. Salir
echo.

set /p opcion="Opcion: "

if "%opcion%"=="1" goto checklist
if "%opcion%"=="2" goto password
if "%opcion%"=="3" goto variables
if "%opcion%"=="4" goto verificar
if "%opcion%"=="5" goto dashboard
if "%opcion%"=="6" goto guia
if "%opcion%"=="7" goto fin

echo Opcion invalida
goto menu

:checklist
cls
echo ========================================
echo CHECKLIST DE PREPARACION
echo ========================================
echo.
echo [ ] Cuenta en Railway creada
echo [ ] Codigo subido a GitHub/GitLab
echo [ ] MySQL creado en Railway
echo [ ] Credenciales de MySQL copiadas
echo [ ] Script SQL ejecutado
echo [ ] Backend desplegado
echo [ ] Frontend desplegado
echo [ ] Variables configuradas
echo [ ] CORS configurado
echo [ ] Login funciona
echo.
pause
goto menu

:password
cls
echo ========================================
echo GENERAR PASSWORD ADMIN
echo ========================================
echo.
echo Ejecutando script de PowerShell...
echo.
powershell -ExecutionPolicy Bypass -File generar-password-admin.ps1
pause
goto menu

:variables
cls
echo ========================================
echo VARIABLES DE ENTORNO NECESARIAS
echo ========================================
echo.
echo BACKEND:
echo --------
echo ASPNETCORE_ENVIRONMENT=Production
echo ASPNETCORE_URLS=http://+:8080
echo ConnectionStrings__DefaultConnection=Server=${MYSQL_HOST};Port=${MYSQL_PORT};Database=${MYSQL_DATABASE};Uid=${MYSQL_USER};Pwd=${MYSQL_PASSWORD};
echo JWT_SECRET_KEY=tu-clave-segura-32-caracteres
echo JWT_ISSUER=FlexoAPP
echo JWT_AUDIENCE=FlexoAPP-Users
echo JWT_EXPIRATION_MINUTES=60
echo CORS_ORIGINS=https://tu-frontend.up.railway.app
echo.
echo FRONTEND:
echo ---------
echo API_URL=https://tu-backend.up.railway.app/api
echo HUB_URL=https://tu-backend.up.railway.app/hubs
echo.
echo Ver .env.railway.example para mas detalles
echo.
pause
goto menu

:verificar
cls
echo ========================================
echo VERIFICAR ARCHIVOS DE CONFIGURACION
echo ========================================
echo.

if exist "Dockerfile.backend" (
    echo [OK] Dockerfile.backend
) else (
    echo [X] Dockerfile.backend NO ENCONTRADO
)

if exist "Dockerfile.frontend" (
    echo [OK] Dockerfile.frontend
) else (
    echo [X] Dockerfile.frontend NO ENCONTRADO
)

if exist "nginx.conf" (
    echo [OK] nginx.conf
) else (
    echo [X] nginx.conf NO ENCONTRADO
)

if exist "railway.json" (
    echo [OK] railway.json
) else (
    echo [X] railway.json NO ENCONTRADO
)

if exist "database-setup.sql" (
    echo [OK] database-setup.sql
) else (
    echo [X] database-setup.sql NO ENCONTRADO
)

if exist ".dockerignore" (
    echo [OK] .dockerignore
) else (
    echo [X] .dockerignore NO ENCONTRADO
)

echo.
echo Todos los archivos necesarios estan listos!
echo.
pause
goto menu

:dashboard
cls
echo ========================================
echo ABRIR RAILWAY DASHBOARD
echo ========================================
echo.
echo Abriendo Railway en el navegador...
start https://railway.app/dashboard
echo.
pause
goto menu

:guia
cls
echo ========================================
echo ABRIR GUIA COMPLETA
echo ========================================
echo.
echo Abriendo guia en el navegador...
start GUIA_RAILWAY.md
echo.
pause
goto menu

:fin
echo.
echo Gracias por usar FlexoAPP!
echo.
exit
