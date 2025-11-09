@echo off
cls
echo ========================================
echo Convertir URL de Railway a formato .NET
echo ========================================
echo.
echo Pega tu MYSQL_PUBLIC_URL de Railway:
echo Ejemplo: mysql://root:PASSWORD@host.proxy.rlwy.net:12345/railway
echo.
set /p MYSQL_URL="URL: "

echo.
echo Procesando...
echo.

REM La URL de Railway tiene formato: mysql://user:password@host:port/database
REM Necesitamos extraer cada parte

echo Tu cadena de conexión para Render es:
echo.
echo IMPORTANTE: Copia EXACTAMENTE esta línea y pégala en Render como DATABASE_URL:
echo.
echo ========================================

REM Nota: Este script es para referencia, la conversión manual es más segura
echo.
echo Basado en tu URL de Railway, la cadena debería ser:
echo.
echo Server=HOST;Port=PUERTO;Database=railway;Uid=root;Pwd=TU_PASSWORD;AllowUserVariables=true;UseAffectedRows=false;CharSet=utf8mb4;SslMode=Required;
echo.
echo ========================================
echo.
echo Reemplaza:
echo - HOST: El dominio después de @ (ej: monozomi.proxy.rlwy.net)
echo - PUERTO: El número después de : (ej: 51876)
echo - TU_PASSWORD: La contraseña entre : y @ (ej: 1TYF-JPKxaxspUZRYgXqLUXDnVpSEt0BHQ)
echo.
pause
