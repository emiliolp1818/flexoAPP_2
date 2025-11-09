# Guía de Despliegue en Render - FlexoAPP

## 📋 Requisitos Previos

1. Cuenta en [Render.com](https://render.com)
2. Repositorio en GitHub con el código actualizado
3. Base de datos MySQL (puedes usar Render o un servicio externo)

## 🚀 Pasos para Desplegar

### Opción A: Despliegue Automático con render.yaml (RECOMENDADO)

1. **Conecta tu repositorio a Render:**
   - Ve a [Render Dashboard](https://dashboard.render.com)
   - Click en "New +" → "Blueprint"
   - Conecta tu repositorio de GitHub
   - Render detectará automáticamente el archivo `render.yaml`
   - Click en "Apply"

2. **Configura las variables de entorno:**
   
   En el servicio **flexoapp-backend**:
   - `DATABASE_URL`: Tu cadena de conexión MySQL
     ```
     Server=tu-servidor.com;Database=flexoapp_bd;Uid=usuario;Pwd=contraseña;
     ```
   - `JWT_SECRET_KEY`: Se genera automáticamente (o usa una personalizada)
   - `CORS_ORIGINS`: Actualiza con tu URL del frontend cuando esté disponible

3. **Espera a que se desplieguen ambos servicios** (5-10 minutos)

4. **Actualiza las URLs:**
   - Una vez desplegado el backend, copia su URL (ej: `https://flexoapp-backend.onrender.com`)
   - Actualiza `Frontend/src/environments/environment.prod.ts` con la URL real
   - Haz commit y push para redesplegar el frontend

### Opción B: Despliegue Manual

#### 1. Desplegar Backend

1. En Render Dashboard, click "New +" → "Web Service"
2. Conecta tu repositorio
3. Configura:
   - **Name**: `flexoapp-backend`
   - **Runtime**: Docker
   - **Branch**: main
   - **Dockerfile Path**: `./Dockerfile.backend`
   - **Plan**: Free

4. Variables de entorno:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://0.0.0.0:7003
   DATABASE_URL=Server=...;Database=flexoapp_bd;...
   JWT_SECRET_KEY=tu-clave-secreta-aqui
   CORS_ORIGINS=https://tu-frontend.onrender.com
   ```

5. Click "Create Web Service"

#### 2. Desplegar Frontend

1. En Render Dashboard, click "New +" → "Static Site"
2. Conecta tu repositorio
3. Configura:
   - **Name**: `flexoapp-frontend`
   - **Branch**: main
   - **Build Command**: 
     ```bash
     cd Frontend && npm install && npm run build:prod
     ```
   - **Publish Directory**: `Frontend/dist/flexoapp/browser`

4. En "Redirects/Rewrites", añade:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: Rewrite

5. Click "Create Static Site"

## 🔧 Configuración de Base de Datos

### Opción 1: Base de datos en Render (PostgreSQL)

Render no ofrece MySQL gratis, pero puedes usar PostgreSQL:

1. Crea una base de datos PostgreSQL en Render
2. Actualiza tu backend para usar PostgreSQL en lugar de MySQL
3. Usa la URL de conexión que Render te proporciona

### Opción 2: Base de datos externa (MySQL)

Puedes usar servicios como:
- **Railway** (tiene MySQL gratis)
- **PlanetScale** (MySQL serverless)
- **AWS RDS** (de pago)
- **Azure Database** (de pago)

## 📝 Después del Despliegue

1. **Verifica el backend:**
   - Visita `https://tu-backend.onrender.com/health`
   - Debería responder con estado OK

2. **Verifica el frontend:**
   - Visita `https://tu-frontend.onrender.com`
   - Intenta hacer login con: admin / admin123

3. **Actualiza CORS en el backend:**
   - En Render, ve a tu servicio backend
   - Actualiza la variable `CORS_ORIGINS` con la URL real del frontend
   - Guarda y espera a que se redespliegue

## ⚠️ Notas Importantes

1. **Plan Free de Render:**
   - Los servicios se duermen después de 15 minutos de inactividad
   - La primera petición después de dormir puede tardar 30-60 segundos
   - Considera actualizar a un plan de pago para producción

2. **Base de Datos:**
   - Asegúrate de hacer backups regulares
   - La base de datos debe ser accesible desde internet

3. **URLs:**
   - Después del primer despliegue, actualiza todas las URLs en:
     - `Frontend/src/environments/environment.prod.ts`
     - Variable `CORS_ORIGINS` en el backend

4. **Logs:**
   - Puedes ver los logs en tiempo real en el dashboard de Render
   - Útil para debugging

## 🔄 Actualizaciones

Para actualizar la aplicación:
1. Haz commit y push a la rama `main`
2. Render detectará los cambios y redesplegarán automáticamente

## 🆘 Solución de Problemas

### Backend no inicia:
- Verifica los logs en Render
- Asegúrate de que `DATABASE_URL` es correcta
- Verifica que el puerto 7003 está configurado correctamente

### Frontend no se conecta al backend:
- Verifica que `environment.prod.ts` tiene la URL correcta del backend
- Verifica CORS en el backend
- Revisa la consola del navegador para errores

### Base de datos no conecta:
- Verifica que la IP de Render está permitida en tu firewall de BD
- Verifica las credenciales en `DATABASE_URL`
- Asegúrate de que la base de datos acepta conexiones externas

## 📧 Soporte

Si tienes problemas, revisa:
- [Documentación de Render](https://render.com/docs)
- Logs en el dashboard de Render
- Consola del navegador (F12)
