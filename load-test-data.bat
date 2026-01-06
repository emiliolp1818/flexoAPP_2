@echo off
echo 🗄️ Cargando datos de prueba en la base de datos MySQL...
echo.

REM Configuración de la base de datos
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=flexoapp_bd
set DB_USER=root
set DB_PASSWORD=admin123

echo 📊 Conectando a MySQL: %DB_HOST%:%DB_PORT%/%DB_NAME%
echo 👤 Usuario: %DB_USER%
echo.

REM Ejecutar el script SQL
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < insert-test-data.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Datos de prueba cargados exitosamente
    echo.
    echo 📋 Datos insertados:
    echo    - 10 programas de máquinas
    echo    - Máquinas: 11, 12, 13, 14, 15, 16
    echo    - Estados: LISTO, PREPARANDO, CORRIENDO, SUSPENDIDO, TERMINADO, SIN_ASIGNAR
    echo.
    echo 🎯 Ahora puedes probar las acciones en el módulo de máquinas
) else (
    echo.
    echo ❌ Error cargando datos de prueba
    echo 💡 Verifica que MySQL esté ejecutándose y las credenciales sean correctas
)

echo.
pause