@echo off
REM Script para probar el build de Docker localmente
echo 🐳 PROBANDO BUILD DE DOCKER PARA FLEXOAPP BACKEND
echo ================================================

echo.
echo 📋 Verificando archivos necesarios...

if exist "Dockerfile" (
    echo ✅ Dockerfile encontrado
) else (
    echo ❌ Dockerfile NO encontrado
    goto :error
)

if exist "backend\flexoAPP.csproj" (
    echo ✅ flexoAPP.csproj encontrado
) else (
    echo ❌ flexoAPP.csproj NO encontrado
    goto :error
)

echo.
echo 🔨 Construyendo imagen Docker...
echo Esto puede tomar varios minutos...

docker build -t flexoapp-backend:test .

if %errorlevel% equ 0 (
    echo ✅ Build exitoso!
    echo.
    echo 🚀 Probando la imagen...
    echo Iniciando contenedor en puerto 8080...
    
    REM Ejecutar contenedor con variables de entorno de prueba
    docker run -d --name flexoapp-test -p 8080:8080 ^
        -e ASPNETCORE_ENVIRONMENT=Production ^
        -e ConnectionStrings__DefaultConnection="Server=hopper.proxy.rlwy.net;Port=43791;Database=railway;User=root;Password=CqkLOlVTDfHuOmYSPfJlXUCfiNXlibtm;AllowUserVariables=True;UseAffectedRows=False;SslMode=Required;" ^
        -e JWT_SECRET_KEY="FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Stable" ^
        flexoapp-backend:test
    
    if %errorlevel% equ 0 (
        echo ✅ Contenedor iniciado exitosamente!
        echo.
        echo 🔍 Esperando que la aplicación inicie...
        timeout /t 10 /nobreak >nul
        
        echo Probando health check...
        curl -f http://localhost:8080/health
        
        if %errorlevel% equ 0 (
            echo ✅ Health check exitoso!
            echo.
            echo 🎉 LA IMAGEN DOCKER FUNCIONA CORRECTAMENTE
            echo Puedes probar la API en: http://localhost:8080
            echo Swagger UI en: http://localhost:8080/swagger
        ) else (
            echo ❌ Health check falló
            echo Revisando logs del contenedor...
            docker logs flexoapp-test
        )
        
        echo.
        echo 🧹 Limpiando contenedor de prueba...
        docker stop flexoapp-test
        docker rm flexoapp-test
        
    ) else (
        echo ❌ Error iniciando contenedor
        docker logs flexoapp-test 2>nul
    )
    
) else (
    echo ❌ Build falló
    echo Revisa los errores arriba
)

goto :end

:error
echo.
echo ❌ ERROR: Faltan archivos necesarios
echo Asegúrate de estar en el directorio raíz del proyecto
echo.

:end
echo.
echo 📝 Para limpiar imágenes de prueba:
echo docker rmi flexoapp-backend:test
echo.
pause