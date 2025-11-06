@echo off
cls
title FlexoAPP Dual Mode

echo FlexoAPP - Iniciando en modo dual (Local + Red)
echo ================================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist backend goto error_dir
if not exist Frontend goto error_dir

echo [1/6] Directorio correcto - OK
echo.

REM Limpiar procesos anteriores
echo [2/6] Limpiando procesos anteriores...
taskkill /f /im dotnet.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
timeout 3 >nul

REM Obtener IP local
echo [3/6] Obteniendo IP local...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| find "IPv4" ^| find /v "127.0.0.1"') do set IP=%%i
set IP=%IP: =%
echo IP detectada: %IP%
echo.

REM Iniciar Backend
echo [4/6] Iniciando Backend en puerto 7003...
start "Backend-FlexoAPP" cmd /c "cd backend && echo Backend iniciando... && dotnet run --urls http://0.0.0.0:7003"
timeout 5 >nul

REM Iniciar Frontend
echo [5/6] Iniciando Frontend en puerto 4200...
start "Frontend-FlexoAPP" cmd /c "cd Frontend && echo Frontend iniciando... && ng serve --host 0.0.0.0 --port 4200"
timeout 10 >nul

REM Abrir navegador
echo [6/6] Abriendo navegador...
start http://localhost:4200

echo.
echo ================================================
echo FlexoAPP iniciado correctamente!
echo ================================================
echo.
echo ACCESO LOCAL:
echo   http://localhost:4200
echo   http://localhost:7003
echo.
echo ACCESO DESDE RED:
echo   http://%IP%:4200
echo   http://%IP%:7003
echo.
echo Usuario: admin
echo Password: admin123
echo.
echo Presiona cualquier tecla para salir...
pause >nul
exit

:error_dir
echo ERROR: Ejecuta este archivo desde la carpeta raiz del proyecto
echo Debe contener las carpetas 'backend' y 'Frontend'
pause
exit