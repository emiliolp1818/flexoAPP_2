@echo off
cls
title Test de Conexión a Base de Datos

echo ========================================
echo Test de Conexión a Base de Datos
echo ========================================
echo.

set /p DB_HOST="Ingresa el host de MySQL (ej: localhost o railway.app): "
set /p DB_PORT="Ingresa el puerto (ej: 3306): "
set /p DB_USER="Ingresa el usuario (ej: root): "
set /p DB_PASS="Ingresa la contraseña: "
set /p DB_NAME="Ingresa el nombre de la base de datos (ej: flexoapp_bd): "

echo.
echo Probando conexión...
echo Host: %DB_HOST%
echo Puerto: %DB_PORT%
echo Usuario: %DB_USER%
echo Base de datos: %DB_NAME%
echo.

mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASS% -e "SELECT 'Conexión exitosa!' as Status; SHOW DATABASES;" %DB_NAME%

if errorlevel 1 (
    echo.
    echo ERROR: No se pudo conectar a la base de datos
    echo.
    echo Verifica:
    echo - Host y puerto correctos
    echo - Usuario y contraseña correctos
    echo - Base de datos existe
    echo - MySQL está corriendo
    echo.
) else (
    echo.
    echo ========================================
    echo CONEXIÓN EXITOSA!
    echo ========================================
    echo.
    echo Tu cadena de conexión para Render:
    echo.
    echo Server=%DB_HOST%;Port=%DB_PORT%;Database=%DB_NAME%;Uid=%DB_USER%;Pwd=%DB_PASS%;AllowUserVariables=true;UseAffectedRows=false;CharSet=utf8mb4;ConnectionTimeout=60;DefaultCommandTimeout=300;Pooling=true;MinimumPoolSize=5;MaximumPoolSize=100;ConnectionLifeTime=300;
    echo.
)

pause
