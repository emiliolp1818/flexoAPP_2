@echo off
cls
title FlexoAPP - Test Build Local

echo ========================================
echo FlexoAPP - Prueba de Build Local
echo ========================================
echo.
echo Este script simula el proceso de build que hará Render
echo.

echo [1/4] Limpiando builds anteriores...
if exist "backend\bin" rmdir /s /q "backend\bin"
if exist "backend\obj" rmdir /s /q "backend\obj"
if exist "Frontend\dist" rmdir /s /q "Frontend\dist"
echo OK - Limpieza completada
echo.

echo [2/4] Compilando Backend (.NET)...
cd backend
dotnet restore
if errorlevel 1 (
    echo ERROR: Fallo en dotnet restore
    goto error
)
dotnet publish -c Release -o out
if errorlevel 1 (
    echo ERROR: Fallo en dotnet publish
    goto error
)
cd ..
echo OK - Backend compilado exitosamente
echo.

echo [3/4] Compilando Frontend (Angular)...
cd Frontend
call npm install
if errorlevel 1 (
    echo ERROR: Fallo en npm install
    goto error
)
call npm run build:prod
if errorlevel 1 (
    echo ERROR: Fallo en npm run build
    goto error
)
cd ..
echo OK - Frontend compilado exitosamente
echo.

echo [4/4] Verificando archivos generados...
if not exist "backend\out\flexoAPP.dll" (
    echo ERROR: No se generó flexoAPP.dll
    goto error
)
if not exist "Frontend\dist" (
    echo ERROR: No se generó carpeta dist del frontend
    goto error
)
echo OK - Todos los archivos generados correctamente
echo.

echo ========================================
echo BUILD EXITOSO!
echo ========================================
echo.
echo Backend compilado en: backend\out\
echo Frontend compilado en: Frontend\dist\
echo.
echo Tu aplicación está lista para desplegarse en Render
echo.
pause
exit

:error
echo.
echo ========================================
echo ERROR EN EL BUILD
echo ========================================
echo.
echo Revisa los errores anteriores antes de desplegar
echo.
pause
exit
