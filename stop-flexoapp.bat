@echo off
title FlexoAPP - Detener Servicios

echo ========================================
echo    FLEXOAPP - DETENER SERVICIOS
echo    (Local y Network)
echo ========================================
echo.

echo 🛑 Deteniendo todos los servicios FlexoAPP...

:: Detener procesos por título de ventana (todos los modos)
echo 🔧 Deteniendo Backend (Local y Network)...
taskkill /f /fi "windowtitle eq FlexoAPP Backend*" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend detenido
) else (
    echo ⚠️  No se encontraron procesos de Backend activos
)

echo 🎨 Deteniendo Frontend (Local y Network)...
taskkill /f /fi "windowtitle eq FlexoAPP Frontend*" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend detenido
) else (
    echo ⚠️  No se encontraron procesos de Frontend activos
)

:: Detener procesos por puerto (backup)
echo 🔍 Verificando puertos...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :7003') do (
    echo 🔧 Deteniendo proceso en puerto 7003...
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4200') do (
    echo 🎨 Deteniendo proceso en puerto 4200...
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo ✅ Todos los servicios FlexoAPP han sido detenidos
echo.
pause