@echo off
cls
title FlexoAPP - Verificación de Despliegue

echo ========================================
echo FlexoAPP - Verificación de Despliegue
echo ========================================
echo.

echo [1/6] Verificando estructura de archivos...
if not exist "backend\flexoAPP.csproj" (
    echo ERROR: No se encuentra backend\flexoAPP.csproj
    goto error
)
if not exist "Frontend\package.json" (
    echo ERROR: No se encuentra Frontend\package.json
    goto error
)
if not exist "Dockerfile.backend" (
    echo ERROR: No se encuentra Dockerfile.backend
    goto error
)
if not exist "render.yaml" (
    echo ERROR: No se encuentra render.yaml
    goto error
)
echo OK - Todos los archivos necesarios existen
echo.

echo [2/6] Verificando configuración de producción...
if not exist "Frontend\src\environments\environment.prod.ts" (
    echo ERROR: No se encuentra environment.prod.ts
    goto error
)
if not exist "backend\appsettings.Production.json" (
    echo ERROR: No se encuentra appsettings.Production.json
    goto error
)
echo OK - Archivos de configuración de producción existen
echo.

echo [3/6] Verificando Git...
git status >nul 2>&1
if errorlevel 1 (
    echo ERROR: No es un repositorio Git
    goto error
)
echo OK - Repositorio Git detectado
echo.

echo [4/6] Verificando cambios pendientes...
git diff --quiet
if errorlevel 1 (
    echo ADVERTENCIA: Hay cambios sin commit
    echo Ejecuta: git add . ^&^& git commit -m "Preparar para despliegue"
) else (
    echo OK - No hay cambios pendientes
)
echo.

echo [5/6] Verificando rama actual...
for /f "tokens=*" %%i in ('git branch --show-current') do set BRANCH=%%i
echo Rama actual: %BRANCH%
if not "%BRANCH%"=="main" (
    echo ADVERTENCIA: No estás en la rama main
    echo Render desplegará desde la rama main
)
echo.

echo [6/6] Verificando conexión a GitHub...
git remote -v | find "github.com" >nul
if errorlevel 1 (
    echo ERROR: No hay remote de GitHub configurado
    goto error
)
echo OK - Remote de GitHub configurado
echo.

echo ========================================
echo VERIFICACIÓN COMPLETADA
echo ========================================
echo.
echo TODO LISTO PARA DESPLEGAR!
echo.
echo Próximos pasos:
echo 1. Asegúrate de hacer commit de todos los cambios
echo 2. Haz push a GitHub: git push origin main
echo 3. Ve a Render.com y sigue las instrucciones en DEPLOY_RENDER.md
echo.
echo Presiona cualquier tecla para salir...
pause >nul
exit

:error
echo.
echo ========================================
echo ERROR EN LA VERIFICACIÓN
echo ========================================
echo.
echo Por favor, corrige los errores antes de desplegar
echo.
pause
exit
