# FlexoAPP - Despliegue en Render y Railway

Este documento contiene las instrucciones para desplegar FlexoAPP en Render (frontend y backend) y Railway (base de datos MySQL).

## 🏗️ Arquitectura de Despliegue

- **Frontend**: Render (Angular + Nginx) - `https://frontend-f54v.onrender.com`
- **Backend**: Render (.NET 8 API) - `https://flexoapp-backend.onrender.com`
- **Base de Datos**: Railway (MySQL) - `hopper.proxy.rlwy.net:43791`

## 📋 Prerrequisitos

1. Cuenta en [Render](https://render.com)
2. Cuenta en [Railway](https://railway.app)
3. Repositorio Git con la rama `render`
4. Base de datos MySQL configurada en Railway

## 🚀 Pasos de Despliegue

### 1. Preparar la Rama Render

```bash
# Cambiar a la rama render
git checkout render

# Verificar configuraciones
./deploy-render.bat  # Windows
# o
./deploy-render.sh   # Linux/Mac
```

### 2. Configurar Base de Datos en Railway

1. Crear nuevo proyecto en Railway
2. Agregar servicio MySQL
3. Obtener credenciales de conexión
4. Configurar variables de entorno (ya incluidas en el código)

### 3. Desplegar Backend en Render

1. **Crear Web Service en Render**
   - Conectar repositorio GitHub
   - Seleccionar rama: `render`
   - Root Directory: `backend`
   - Environment: `Docker`
   - Dockerfile Path: `backend/Dockerfile`

2. **Variables de Entorno del Backend**
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ConnectionStrings__DefaultConnection=Server=hopper.proxy.rlwy.net;Port=43791;Database=railway;User=root;Password=CqkLOlVTDfHuOmYSPfJlXUCfiNXlibtm;AllowUserVariables=True;UseAffectedRows=False;SslMode=Required;
   DATABASE_URL=mysql://root:CqkLOlVTDfHuOmYSPfJlXUCfiNXlibtm@hopper.proxy.rlwy.net:43791/railway
   FRONTEND_URL=https://frontend-f54v.onrender.com
   JWT_SECRET_KEY=FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Stable
   PORT=8080
   ```

3. **Configuración del Servicio**
   - Health Check Path: `/health`
   - Auto-Deploy: `Yes`

### 4. Desplegar Frontend en Render

1. **Crear Static Site en Render**
   - Conectar repositorio GitHub
   - Seleccionar rama: `render`
   - Root Directory: `Frontend`
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `dist/flexo-app`

2. **Variables de Entorno del Frontend**
   ```
   NODE_ENV=production
   API_URL=https://flexoapp-backend.onrender.com/api
   ```

## 🔧 Configuraciones Importantes

### Backend (.NET 8)

- **Puerto**: 8080 (configurado en Render)
- **Health Check**: `/health` endpoint disponible
- **CORS**: Configurado para dominios de Render
- **Base de Datos**: MySQL en Railway con SSL requerido
- **Logging**: Serilog con archivos de log en `/app/logs`

### Frontend (Angular)

- **Build**: Producción optimizada
- **Servidor**: Nginx con configuración personalizada
- **Routing**: SPA con fallback a `index.html`
- **Compresión**: Gzip habilitado
- **Caché**: Archivos estáticos con caché de 1 año

### Base de Datos (MySQL Railway)

- **Host**: `hopper.proxy.rlwy.net`
- **Puerto**: `43791`
- **Base de Datos**: `railway`
- **Usuario**: `root`
- **SSL**: Requerido

## 🔍 Verificación del Despliegue

### 1. Backend Health Check
```bash
curl https://flexoapp-backend.onrender.com/health
```

### 2. Frontend Accesibilidad
```bash
curl https://frontend-f54v.onrender.com
```

### 3. API Endpoints
```bash
# Login de prueba
curl -X POST https://flexoapp-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de Conexión a Base de Datos**
   - Verificar credenciales de Railway
   - Confirmar que SSL está habilitado
   - Revisar logs del backend

2. **CORS Errors**
   - Verificar configuración de dominios en `Program.cs`
   - Confirmar URLs en variables de entorno

3. **Build Failures**
   - Verificar que todas las dependencias están en `package.json`
   - Confirmar que el Dockerfile es correcto

### Logs y Monitoreo

- **Backend Logs**: Disponibles en Render Dashboard
- **Frontend Logs**: Nginx access/error logs en Render
- **Database Logs**: Disponibles en Railway Dashboard

## 📊 Monitoreo y Mantenimiento

### Health Checks Disponibles

- `/health` - Estado general del sistema
- `/health/ready` - Listo para recibir tráfico
- `/health/live` - Aplicación está viva

### Métricas Importantes

- Tiempo de respuesta de API
- Uso de memoria del backend
- Conexiones activas a la base de datos
- Errores de CORS

## 🔐 Seguridad

### Configuraciones de Seguridad Implementadas

1. **JWT Authentication** con clave secreta segura
2. **HTTPS** forzado en producción
3. **CORS** configurado específicamente para dominios de producción
4. **Headers de Seguridad** en Nginx
5. **SSL/TLS** requerido para conexión a base de datos

### Credenciales por Defecto

- **Usuario**: `admin`
- **Contraseña**: `admin123`

> ⚠️ **Importante**: Cambiar las credenciales por defecto después del primer despliegue.

## 📞 Soporte

Para problemas con el despliegue:

1. Revisar logs en Render Dashboard
2. Verificar configuración de variables de entorno
3. Confirmar que la base de datos Railway está accesible
4. Revisar este documento para configuraciones faltantes

---

**Última actualización**: Enero 2026
**Versión**: 2.0.0 - Render/Railway Edition