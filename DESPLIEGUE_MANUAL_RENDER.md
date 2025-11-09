# 🚀 Despliegue Manual en Render (Sin Blueprint)

Si el Blueprint automático falla, sigue estos pasos para desplegar manualmente.

## 📋 Paso 1: Desplegar Backend

### 1.1 Crear Web Service

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio: `emiliolp1818/flexoAPP_2`
4. Click en **"Connect"**

### 1.2 Configurar Backend

**Configuración básica:**
- **Name**: `flexoapp-backend`
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Root Directory**: (dejar vacío)
- **Runtime**: **Docker**
- **Dockerfile Path**: `./Dockerfile.backend`

**Plan:**
- Selecciona **Free**

### 1.3 Variables de Entorno

Click en **"Advanced"** y añade estas variables:

```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:7003
DATABASE_URL=TU_CADENA_DE_CONEXION_MYSQL_AQUI
JWT_SECRET_KEY=FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Secure
CORS_ORIGINS=https://flexoapp-frontend.onrender.com
```

**Importante:** Reemplaza `TU_CADENA_DE_CONEXION_MYSQL_AQUI` con tu cadena de Railway.

### 1.4 Health Check

En **"Advanced"**:
- **Health Check Path**: `/health`

### 1.5 Crear Servicio

Click en **"Create Web Service"**

⏱️ **Tiempo de build**: 5-8 minutos

---

## 📋 Paso 2: Desplegar Frontend

### 2.1 Crear Static Site

1. En Render Dashboard, click **"New +"** → **"Static Site"**
2. Conecta el mismo repositorio: `emiliolp1818/flexoAPP_2`
3. Click en **"Connect"**

### 2.2 Configurar Frontend

**Configuración básica:**
- **Name**: `flexoapp-frontend`
- **Branch**: `main`
- **Root Directory**: (dejar vacío)

**Build Settings:**
- **Build Command**: 
  ```bash
  cd Frontend && npm install && npm run build:prod
  ```
- **Publish Directory**: 
  ```
  Frontend/dist/flexoapp/browser
  ```

**Plan:**
- Automáticamente será **Free** (Static Sites son gratis)

### 2.3 Redirects/Rewrites

En **"Redirects/Rewrites"**, añade:

- **Source**: `/*`
- **Destination**: `/index.html`
- **Action**: **Rewrite**

### 2.4 Crear Sitio

Click en **"Create Static Site"**

⏱️ **Tiempo de build**: 3-5 minutos

---

## 📋 Paso 3: Actualizar URLs

### 3.1 Obtener URL del Backend

1. Una vez que el backend esté desplegado, copia su URL
2. Ejemplo: `https://flexoapp-backend-abc123.onrender.com`

### 3.2 Actualizar CORS en Backend

1. Ve al servicio backend en Render
2. Click en **"Environment"**
3. Edita `CORS_ORIGINS` con la URL real del frontend
4. Ejemplo: `https://flexoapp-frontend-xyz789.onrender.com`
5. Click **"Save Changes"**

### 3.3 Actualizar Frontend

1. En tu máquina local, edita:
   ```
   Frontend/src/environments/environment.prod.ts
   ```

2. Actualiza las URLs:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://TU-BACKEND.onrender.com/api',
     socketUrl: 'https://TU-BACKEND.onrender.com',
     // ... resto del archivo
   };
   ```

3. Guarda y sube los cambios:
   ```bash
   git add Frontend/src/environments/environment.prod.ts
   git commit -m "Actualizar URL del backend en producción"
   git push origin main
   ```

4. Render redesplegará automáticamente el frontend

---

## ✅ Paso 4: Verificar Despliegue

### 4.1 Verificar Backend

Visita: `https://tu-backend.onrender.com/health`

Deberías ver algo como:
```json
{
  "status": "ok",
  "database": "MySQL Connected",
  "timestamp": "2024-11-08T...",
  "version": "2.0.0"
}
```

### 4.2 Verificar Frontend

1. Visita: `https://tu-frontend.onrender.com`
2. Deberías ver la pantalla de login
3. Intenta hacer login:
   - Usuario: `admin`
   - Contraseña: `admin123`

### 4.3 Verificar Conexión

1. Si el login funciona, ¡todo está bien! ✅
2. Si hay errores CORS, verifica que `CORS_ORIGINS` está correcto
3. Si no carga datos, verifica la URL en `environment.prod.ts`

---

## 🔧 Solución de Problemas

### Backend no inicia

**Error: "Build failed"**

1. Revisa los logs en Render Dashboard
2. Verifica que el Dockerfile está en la raíz del proyecto
3. Asegúrate de que `Dockerfile Path` es `./Dockerfile.backend`

**Error: "Application failed to respond"**

1. Verifica que `DATABASE_URL` es correcta
2. Prueba la conexión a la BD desde tu máquina local
3. Verifica que Railway está activo

### Frontend no compila

**Error: "Build failed"**

1. Verifica que el build command es correcto:
   ```bash
   cd Frontend && npm install && npm run build:prod
   ```
2. Verifica que el publish directory es:
   ```
   Frontend/dist/flexoapp/browser
   ```
3. Revisa los logs para errores específicos

**Error: "404 Not Found"**

1. Verifica que el redirect está configurado: `/*` → `/index.html`
2. Asegúrate de que es tipo "Rewrite" no "Redirect"

### Error CORS

**Error en consola: "blocked by CORS policy"**

1. Verifica `CORS_ORIGINS` en el backend
2. Usa la URL exacta del frontend (sin "/" al final)
3. Guarda y espera a que Render redespliegue (~2 min)

---

## 📊 Tiempos Estimados

- Backend build: 5-8 minutos
- Frontend build: 3-5 minutos
- Actualizar URLs: 2 minutos
- Redespliegue: 2-3 minutos
- **Total: 15-20 minutos**

---

## 💡 Consejos

1. **Espera pacientemente** - Los builds pueden tardar
2. **Revisa los logs** - Siempre hay información útil
3. **Verifica las URLs** - Deben ser exactas
4. **No uses "/" al final** - En las URLs de configuración
5. **Guarda las URLs** - Anótalas para referencia

---

## 📝 Checklist

- [ ] Backend desplegado y respondiendo en `/health`
- [ ] Frontend desplegado y cargando
- [ ] `CORS_ORIGINS` actualizado con URL del frontend
- [ ] `environment.prod.ts` actualizado con URL del backend
- [ ] Login funciona correctamente
- [ ] Datos se cargan desde el backend
- [ ] WebSocket conecta (si aplica)

---

## 🎉 ¡Listo!

Si todos los pasos están completos y el checklist está marcado, tu aplicación está en producción.

**URLs de tu aplicación:**
```
Frontend: https://flexoapp-frontend-________.onrender.com
Backend:  https://flexoapp-backend-________.onrender.com
```

---

**Siguiente:** Revisa [TROUBLESHOOTING.md](TROUBLESHOOTING.md) si tienes problemas.
