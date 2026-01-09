#!/bin/bash

# Script de despliegue para Render y Railway
echo "🚀 Iniciando despliegue de FlexoAPP en Render y Railway..."

# Verificar que estamos en la rama render
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "render" ]; then
    echo "❌ Error: Debes estar en la rama 'render' para ejecutar este script"
    echo "Ejecuta: git checkout render"
    exit 1
fi

echo "✅ Rama actual: $CURRENT_BRANCH"

# Verificar archivos de configuración
echo "🔍 Verificando archivos de configuración..."

if [ ! -f "render.yaml" ]; then
    echo "❌ Error: No se encontró render.yaml"
    exit 1
fi

if [ ! -f "backend/Dockerfile" ]; then
    echo "❌ Error: No se encontró backend/Dockerfile"
    exit 1
fi

if [ ! -f "Frontend/Dockerfile" ]; then
    echo "❌ Error: No se encontró Frontend/Dockerfile"
    exit 1
fi

echo "✅ Todos los archivos de configuración están presentes"

# Verificar configuración del backend
echo "🔍 Verificando configuración del backend..."
if grep -q "hopper.proxy.rlwy.net" backend/appsettings.Production.json; then
    echo "✅ Configuración de Railway encontrada en appsettings.Production.json"
else
    echo "❌ Error: Configuración de Railway no encontrada en appsettings.Production.json"
    exit 1
fi

# Verificar configuración del frontend
echo "🔍 Verificando configuración del frontend..."
if grep -q "flexoapp-backend.onrender.com" Frontend/src/environments/environment.prod.ts; then
    echo "✅ Configuración de Render encontrada en environment.prod.ts"
else
    echo "❌ Error: Configuración de Render no encontrada en environment.prod.ts"
    exit 1
fi

# Hacer commit de los cambios
echo "📝 Haciendo commit de los cambios..."
git add .
git commit -m "feat: Configuración para despliegue en Render y Railway

- Configurado backend para Railway MySQL
- Configurado frontend para Render
- Agregados Dockerfiles para ambos servicios
- Configurado CORS para dominios de producción
- Variables de entorno para producción"

echo "✅ Commit realizado exitosamente"

# Mostrar información de despliegue
echo ""
echo "🌐 INFORMACIÓN DE DESPLIEGUE"
echo "=================================="
echo "Backend URL: https://flexoapp-backend.onrender.com"
echo "Frontend URL: https://frontend-f54v.onrender.com"
echo "Database: Railway MySQL (hopper.proxy.rlwy.net:43791)"
echo ""
echo "📋 VARIABLES DE ENTORNO PARA RENDER (Backend):"
echo "ASPNETCORE_ENVIRONMENT=Production"
echo "ConnectionStrings__DefaultConnection=Server=hopper.proxy.rlwy.net;Port=43791;Database=railway;User=root;Password=CqkLOlVTDfHuOmYSPfJlXUCfiNXlibtm;AllowUserVariables=True;UseAffectedRows=False;SslMode=Required;"
echo "DATABASE_URL=mysql://root:CqkLOlVTDfHuOmYSPfJlXUCfiNXlibtm@hopper.proxy.rlwy.net:43791/railway"
echo "FRONTEND_URL=https://frontend-f54v.onrender.com"
echo "JWT_SECRET_KEY=FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Stable"
echo "PORT=8080"
echo ""
echo "📋 VARIABLES DE ENTORNO PARA RENDER (Frontend):"
echo "NODE_ENV=production"
echo "API_URL=https://flexoapp-backend.onrender.com/api"
echo ""
echo "🚀 Para desplegar:"
echo "1. Haz push de la rama render: git push origin render"
echo "2. En Render, conecta tu repositorio y selecciona la rama 'render'"
echo "3. Configura las variables de entorno mostradas arriba"
echo "4. Despliega ambos servicios"
echo ""
echo "✅ Configuración completada exitosamente!"