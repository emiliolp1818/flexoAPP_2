@echo off
cls
color 0A
title FlexoAPP - Verificación Pre-Despliegue Completa

echo.
echo  ========================================================
echo  █▀▀ █   █▀▀ ▀▄▀ █▀█ ▄▀█ █▀█ █▀█
echo  █▀  █▄▄ ██▄ █ █ █▄█ █▀█ █▀▀ █▀▀
echo  ========================================================
echo  Verificación Pre-Despliegue v2.0
echo  ========================================================
echo.

set ERRORS=0
set WARNINGS=0

echo [PASO 1/10] Verificando estructura de directorios...
if not exist "backend" (
    echo [ERROR] Carpeta backend no encontrada
    set /a ERRORS+=1
) else (
    echo [OK] Carpeta backend encontrada
)

if not exist "Frontend" (
    echo [ERROR] Carpeta Frontend no encontrada
    set /a ERRORS+=1
) else (
    echo [OK] Carpeta Frontend encontrada
)
echo.

echo [PASO 2/10] Verificando archivos de configuración...
if not exist "render.yaml" (
    echo [ERROR] render.yaml no encontrado
    set /a ERRORS+=1
) else (
    echo [OK] render.yaml encontrado
)

if not exist "Dockerfile.backend" (
    echo [ERROR] Dockerfile.backend no encontrado
    set /a ERRORS+=1
) else (
    echo [OK] Dockerfile.backend encontrado
)

if not exist "Frontend\src\environments\environment.prod.ts" (
    echo [ERROR] environment.prod.ts no encontrado
    set /a ERRORS+=1
) else (
    echo [OK] environment.prod.ts encontrado
)

if not exist "backend\appsettings.Production.json" (
    echo [ERROR] appsettings.Production.json no encontrado
    set /a ERRORS+=1
) else (
    echo [OK] appsettings.Production.json encontrado
)
echo.

echo [PASO 3/10] Verificando Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git no está instalado
    set /a ERRORS+=1
) else (
    echo [OK] Git instalado
)

git status >nul 2>&1
if errorlevel 1 (
    echo [ERROR] No es un repositorio Git
    set /a ERRORS+=1
) else (
    echo [OK] Repositorio Git válido
)
echo.

echo [PASO 4/10] Verificando cambios pendientes...
git diff --quiet
if errorlevel 1 (
    echo [ADVERTENCIA] Hay cambios sin commit
    set /a WARNINGS+=1
    git status --short
) else (
    echo [OK] No hay cambios pendientes
)
echo.

echo [PASO 5/10] Verificando rama actual...
for /f "tokens=*" %%i in ('git branch --show-current') do set BRANCH=%%i
if "%BRANCH%"=="main" (
    echo [OK] En rama main
) else (
    echo [ADVERTENCIA] No estás en rama main (actual: %BRANCH%)
    set /a WARNINGS+=1
)
echo.

echo [PASO 6/10] Verificando remote de GitHub...
git remote -v | find "github.com" >nul
if errorlevel 1 (
    echo [ERROR] No hay remote de GitHub configurado
    set /a ERRORS+=1
) else (
    echo [OK] Remote de GitHub configurado
    for /f "tokens=2" %%i in ('git remote get-url origin') do echo     URL: %%i
)
echo.

echo [PASO 7/10] Verificando .NET SDK...
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo [ADVERTENCIA] .NET SDK no encontrado (necesario para build local)
    set /a WARNINGS+=1
) else (
    for /f "tokens=*" %%i in ('dotnet --version') do echo [OK] .NET SDK %%i instalado
)
echo.

echo [PASO 8/10] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ADVERTENCIA] Node.js no encontrado (necesario para build local)
    set /a WARNINGS+=1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo [OK] Node.js %%i instalado
)
echo.

echo [PASO 9/10] Verificando archivos de documentación...
if not exist "README.md" (
    echo [ADVERTENCIA] README.md no encontrado
    set /a WARNINGS+=1
) else (
    echo [OK] README.md encontrado
)

if not exist "DEPLOY_RENDER.md" (
    echo [ADVERTENCIA] DEPLOY_RENDER.md no encontrado
    set /a WARNINGS+=1
) else (
    echo [OK] DEPLOY_RENDER.md encontrado
)

if not exist "INICIO_RAPIDO.md" (
    echo [ADVERTENCIA] INICIO_RAPIDO.md no encontrado
    set /a WARNINGS+=1
) else (
    echo [OK] INICIO_RAPIDO.md encontrado
)
echo.

echo [PASO 10/10] Verificando archivos críticos del backend...
if not exist "backend\flexoAPP.csproj" (
    echo [ERROR] flexoAPP.csproj no encontrado
    set /a ERRORS+=1
) else (
    echo [OK] flexoAPP.csproj encontrado
)

if not exist "backend\Program.cs" (
    echo [ERROR] Program.cs no encontrado
    set /a ERRORS+=1
) else (
    echo [OK] Program.cs encontrado
)
echo.

echo  ========================================================
echo  RESUMEN DE VERIFICACIÓN
echo  ========================================================
echo.

if %ERRORS% EQU 0 (
    if %WARNINGS% EQU 0 (
        color 0A
        echo  [EXCELENTE] Todo está perfecto!
        echo.
        echo  Tu aplicación está 100%% lista para desplegarse en Render.
        echo.
        echo  Próximos pasos:
        echo  1. Asegúrate de hacer commit de todos los cambios
        echo  2. Haz push a GitHub: git push origin main
        echo  3. Ve a Render.com y sigue INICIO_RAPIDO.md
        echo.
    ) else (
        color 0E
        echo  [BIEN] Listo para desplegar con %WARNINGS% advertencia(s)
        echo.
        echo  Puedes continuar, pero revisa las advertencias arriba.
        echo.
    )
) else (
    color 0C
    echo  [ERROR] Se encontraron %ERRORS% error(es) y %WARNINGS% advertencia(s)
    echo.
    echo  Por favor, corrige los errores antes de desplegar.
    echo.
)

echo  ========================================================
echo.

if %ERRORS% EQU 0 (
    echo ¿Quieres hacer commit y push ahora? (S/N)
    set /p COMMIT_NOW=
    if /i "%COMMIT_NOW%"=="S" (
        echo.
        echo Haciendo commit...
        git add .
        git commit -m "Preparar para despliegue en Render"
        echo.
        echo Haciendo push...
        git push origin main
        echo.
        echo [OK] Cambios subidos a GitHub
        echo.
        echo Ahora ve a Render.com y sigue INICIO_RAPIDO.md
        echo.
    )
)

pause
