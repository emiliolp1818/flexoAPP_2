@echo off
REM ============================================================================
REM SCRIPT DE CONFIGURACIÓN DE ACTIVIDADES DE USUARIO - MySQL
REM ============================================================================
REM Este script ejecuta los archivos SQL necesarios para crear la tabla de
REM actividades de usuario e insertar datos de prueba

echo ============================================================================
echo CONFIGURACIÓN DE ACTIVIDADES DE USUARIO - FlexoAPP
echo ============================================================================
echo.

REM Configuración de la conexión
set MYSQL_HOST=localhost
set MYSQL_PORT=3306
set MYSQL_USER=flexoapp_user
set MYSQL_PASSWORD=FlexoApp2024!
set MYSQL_DATABASE=FlexoAPP

echo Configuración de conexión:
echo   Servidor: %MYSQL_HOST%:%MYSQL_PORT%
echo   Base de datos: %MYSQL_DATABASE%
echo   Usuario: %MYSQL_USER%
echo.

REM Verificar que mysql esté disponible
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: mysql no está disponible en el PATH
    echo Por favor instala MySQL Client o agrega mysql.exe al PATH
    echo.
    pause
    exit /b 1
)

echo Verificando herramientas...
echo   OK: mysql encontrado
echo.

REM Paso 1: Crear tabla de actividades
echo ============================================================================
echo PASO 1: Crear tabla Activities
echo ============================================================================
echo.

echo Ejecutando: CREATE_USER_ACTIVITIES_TABLE.sql
mysql -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASSWORD% %MYSQL_DATABASE% < CREATE_USER_ACTIVITIES_TABLE.sql

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Fallo al crear la tabla
    echo.
    pause
    exit /b 1
)

echo   OK: Tabla creada exitosamente
echo.

REM Paso 2: Insertar datos de prueba
echo ============================================================================
echo PASO 2: Insertar datos de prueba
echo ============================================================================
echo.

echo Ejecutando: INSERT_ACTIVITIES_TEST_DATA.sql
mysql -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASSWORD% %MYSQL_DATABASE% < INSERT_ACTIVITIES_TEST_DATA.sql

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Fallo al insertar datos
    echo.
    pause
    exit /b 1
)

echo   OK: Datos insertados exitosamente
echo.

REM Resumen final
echo ============================================================================
echo CONFIGURACIÓN COMPLETADA EXITOSAMENTE
echo ============================================================================
echo.
echo La tabla Activities ha sido creada y poblada con datos de prueba.
echo.
echo Datos insertados:
echo   - admin: 25 actividades
echo   - operator01: 19 actividades
echo   - designer01: 16 actividades
echo   - manager01: 12 actividades
echo   - Total: 72 actividades
echo.
echo Módulos incluidos:
echo   - AUTH (Autenticación)
echo   - PROFILE (Perfil)
echo   - MACHINES (Máquinas)
echo   - DESIGN (Diseño)
echo   - REPORTS (Reportes)
echo   - SETTINGS (Configuración)
echo.
echo Rango de fechas: Últimos 5 días
echo.
echo Ahora puedes probar el módulo de reportes en la aplicación.
echo ============================================================================
echo.

pause
