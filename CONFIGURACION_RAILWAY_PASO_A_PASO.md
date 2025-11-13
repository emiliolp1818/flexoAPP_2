# 🚂 Configuración Railway - Paso a Paso

## ⚠️ IMPORTANTE: Configuración de Servicios

Railway necesita que configures **3 servicios separados**:
1. MySQL (Base de datos)
2. Backend (.NET)
3. Frontend (Angular)

---

## 📋 Paso 1: Crear Proyecto y MySQL (10 minutos)

### 1.1 Crear Proyecto
1. Ve a https://railway.app/dashboard
2. Click en **"New Project"**
3. Selecciona **"Empty Project"**
4. Nombra tu proyecto: `flexoapp-production`

### 1.2 Agregar MySQL
1. Dentro del proyecto, click **"+ New"**
2. Selecciona **"Database"**
3. Elige **"MySQL"**
4. Railway creará la base de datos automáticamente

### 1.3 Copiar Credenciales MySQL
1. Click en el servicio **MySQL**
2. Ve a la pestaña **"Variables"**
3. Copia estas variables (las necesitarás después):
   ```
   MYSQL_HOST
   MYSQL_PORT
   MYSQL_USER
   MYSQL_PASSWORD
   MYSQL_DATABASE
   MYSQL_URL
   ```

### 1.4 Ejecutar Script SQL
**Opción A: Railway CLI**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Vincular proyecto
railway link

# Conectar a MySQL
railway connect mysql

# Ejecutar script (copia y pega el contenido de database-setup.sql)
```

**Opción B: MySQL Workbench**
1. Abre MySQL Workbench
2. Nueva conexión con las credenciales de Railway
3. Abre `database-setup.sql`
4. Ejecuta el script completo

---

## 🔧 Paso 2: Configurar Backend (.NET) (20 minutos)

### 2.1 Crear Servicio Backend
1. En tu proyecto Railway, click **"+ New"**
2. Selecciona **"GitHub Repo"**
3. Autoriza Railway a acceder a GitHub
4. Selecciona tu repositorio: **`emiliolp1818/flexoAPP_2`**
5. Railway creará un servicio

### 2.2 Configurar Root Directory
1. Click en el servicio recién creado
2. Ve a **"Settings"**
3. En **"Build"**, busca **"Root Directory"**
4. Déjalo en: `/` (raíz del proyecto)

### 2.3 Configurar Dockerfile
1. En **"Settings"** → **"Build"**
2. Busca **"Builder"**
3. Selecciona **"Dockerfile"**
4. En **"Dockerfile Path"**, pon: `Dockerfile.backend`

### 2.4 Configurar Variables de Entorno
1. Ve a la pestaña **"Variables"**
2. Click en **"+ New Variable"**
3. Agrega estas variables **UNA POR UNA**:

```bash
# Entorno
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080

# Base de Datos - USA REFERENCIAS A MYSQL
ConnectionStrings__DefaultConnection=Server=${{MySQL.MYSQL_HOST}};Port=${{MySQL.MYSQL_PORT}};Database=${{MySQL.MYSQL_DATABASE}};Uid=${{MySQL.MYSQL_USER}};Pwd=${{MySQL.MYSQL_PASSWORD}};

# JWT - GENERA UNA CLAVE SEGURA
JWT_SECRET_KEY=CAMBIA-ESTO-POR-UNA-CLAVE-SEGURA-DE-32-CARACTERES
JWT_ISSUER=FlexoAPP
JWT_AUDIENCE=FlexoAPP-Users
JWT_EXPIRATION_MINUTES=60

# CORS - Actualiza después con la URL del frontend
CORS_ORIGINS=*

# Logging
Logging__LogLevel__Default=Information
Logging__LogLevel__Microsoft.AspNetCore=Warning
```

**💡 Generar JWT_SECRET_KEY:**
```powershell
# En PowerShell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### 2.5 Configurar Puerto
1. En **"Settings"** → **"Networking"**
2. Railway detectará automáticamente el puerto 8080
3. Si no, agrégalo manualmente

### 2.6 Desplegar
1. Railway comenzará a construir automáticamente
2. Ve a la pestaña **"Deployments"** para ver el progreso
3. Espera 5-10 minutos (primera vez tarda más)
4. Verás logs en tiempo real

### 2.7 Obtener URL del Backend
1. Ve a **"Settings"** → **"Networking"**
2. Click en **"Generate Domain"**
3. Railway generará una URL como: `backend-production-xxxx.up.railway.app`
4. **COPIA ESTA URL** (la necesitarás para el frontend)

### 2.8 Verificar Backend
```bash
# Test health (si tienes endpoint)
curl https://tu-backend.up.railway.app/health

# Test API
curl https://tu-backend.up.railway.app/api/designs

# Test Swagger
# Abre en navegador: https://tu-backend.up.railway.app/swagger
```

---

## 🎨 Paso 3: Configurar Frontend (Angular) (20 minutos)

### 3.1 Actualizar Código Local
Antes de desplegar el frontend, actualiza la configuración:

**Edita: `Frontend/src/environments/environment.prod.ts`**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://TU-BACKEND-REAL.up.railway.app/api',
  socketUrl: 'https://TU-BACKEND-REAL.up.railway.app',
  fallbackUrls: [
    'https://TU-BACKEND-REAL.up.railway.app/api'
  ],
  enableLogging: false,
  enableDebugMode: false,
  cacheTimeout: 10 * 60 * 1000,
  retryAttempts: 3,
  networkMode: false,
  disableNetworkStability: false,
  allowCrossOrigin: true,
  networkInterface: 'railway',
  imageBaseUrl: 'https://TU-BACKEND-REAL.up.railway.app',
  alternativeUrls: []
};
```

**Reemplaza `TU-BACKEND-REAL` con la URL real de tu backend**

### 3.2 Subir Cambios a GitHub
```bash
git add Frontend/src/environments/environment.prod.ts
git commit -m "Update production API URL for Railway"
git push origin main
```

### 3.3 Crear Servicio Frontend
1. En Railway, click **"+ New"**
2. Selecciona **"GitHub Repo"**
3. Selecciona el **mismo repositorio**: `emiliolp1818/flexoAPP_2`
4. Railway creará otro servicio

### 3.4 Configurar Dockerfile Frontend
1. Click en el nuevo servicio
2. Ve a **"Settings"** → **"Build"**
3. En **"Builder"**, selecciona **"Dockerfile"**
4. En **"Dockerfile Path"**, pon: `Dockerfile.frontend`
5. En **"Root Directory"**, déjalo en: `/`

### 3.5 Configurar Variables (Opcional)
El frontend no necesita muchas variables, pero puedes agregar:
```bash
NODE_ENV=production
```

### 3.6 Desplegar
1. Railway comenzará a construir
2. Espera 10-15 minutos (Angular tarda en compilar)
3. Verás los logs en **"Deployments"**

### 3.7 Obtener URL del Frontend
1. Ve a **"Settings"** → **"Networking"**
2. Click en **"Generate Domain"**
3. Railway generará una URL como: `frontend-production-xxxx.up.railway.app`
4. **COPIA ESTA URL**

---

## 🔗 Paso 4: Conectar Todo (5 minutos)

### 4.1 Actualizar CORS en Backend
1. Ve al servicio **Backend** en Railway
2. Pestaña **"Variables"**
3. Edita la variable **`CORS_ORIGINS`**
4. Reemplaza `*` con la URL exacta del frontend:
   ```bash
   CORS_ORIGINS=https://frontend-production-xxxx.up.railway.app
   ```
5. Guarda (el servicio se reiniciará automáticamente)

### 4.2 Verificar Conexión
1. Abre la URL del frontend en tu navegador
2. Abre la consola del navegador (F12)
3. No debe haber errores de CORS
4. Intenta hacer login:
   - Usuario: `admin`
   - Contraseña: `admin123`

---

## ✅ Verificación Final

### Backend
```bash
# Health check
curl https://tu-backend.up.railway.app/health

# Test login
curl -X POST https://tu-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userCode":"admin","password":"admin123"}'
```

### Frontend
1. Abre: `https://tu-frontend.up.railway.app`
2. Verifica que carga sin errores
3. Login debe funcionar
4. Navega por la aplicación

### Base de Datos
```bash
# Conecta a MySQL
railway connect mysql

# Verifica tablas
SHOW TABLES;

# Verifica usuario admin
SELECT * FROM Users WHERE UserCode = 'admin';
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Docker build failed"
**Causa:** Dockerfile no encontrado o ruta incorrecta

**Solución:**
1. Ve a Settings → Build
2. Verifica que "Dockerfile Path" sea correcto:
   - Backend: `Dockerfile.backend`
   - Frontend: `Dockerfile.frontend`
3. Verifica que "Root Directory" sea `/`

### Error: "Cannot connect to database"
**Causa:** Variables de MySQL incorrectas

**Solución:**
1. Verifica que usas referencias: `${{MySQL.MYSQL_HOST}}`
2. Asegúrate de que el servicio MySQL esté corriendo
3. Verifica que el nombre del servicio MySQL sea correcto

### Error: "CORS policy blocked"
**Causa:** CORS_ORIGINS no coincide con la URL del frontend

**Solución:**
1. Copia la URL EXACTA del frontend (con https://)
2. Actualiza CORS_ORIGINS en el backend
3. NO incluyas `/` al final
4. Reinicia el backend

### Error: "502 Bad Gateway"
**Causa:** Backend está iniciando o falló

**Solución:**
1. Espera 1-2 minutos (puede estar iniciando)
2. Ve a Deployments → Ver logs
3. Busca errores en los logs
4. Verifica variables de entorno

### Frontend muestra página en blanco
**Causa:** API URL incorrecta o backend no responde

**Solución:**
1. Abre consola del navegador (F12)
2. Busca errores
3. Verifica que `apiUrl` en environment.prod.ts sea correcta
4. Verifica que el backend esté respondiendo

---

## 📊 Arquitectura Final

```
┌─────────────────────────────────────────────────────┐
│              RAILWAY PROJECT                        │
│                                                     │
│  ┌──────────────────┐                              │
│  │  MySQL Service   │                              │
│  │  Port: 3306      │                              │
│  └────────┬─────────┘                              │
│           │                                         │
│           ▼                                         │
│  ┌──────────────────┐                              │
│  │ Backend Service  │                              │
│  │ .NET 8.0         │                              │
│  │ Port: 8080       │                              │
│  │ URL: backend-... │                              │
│  └────────┬─────────┘                              │
│           │                                         │
│           ▼                                         │
│  ┌──────────────────┐                              │
│  │ Frontend Service │                              │
│  │ Angular + Nginx  │                              │
│  │ Port: 80         │                              │
│  │ URL: frontend-...│                              │
│  └──────────────────┘                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 💡 Tips Importantes

1. **Referencias de Variables en Railway:**
   ```bash
   # Correcto - referencia a otro servicio
   ${{MySQL.MYSQL_HOST}}
   
   # Incorrecto - no funcionará
   ${MYSQL_HOST}
   ```

2. **Nombres de Servicios:**
   - Railway asigna nombres automáticamente
   - Puedes renombrarlos en Settings → Service Name
   - Usa nombres descriptivos: `flexoapp-mysql`, `flexoapp-backend`, `flexoapp-frontend`

3. **Logs en Tiempo Real:**
   ```bash
   railway logs --service backend
   railway logs --service frontend
   ```

4. **Redeploy Manual:**
   - Ve a Deployments
   - Click en "..." del último deployment
   - Selecciona "Redeploy"

5. **Variables de Entorno:**
   - Los cambios en variables reinician el servicio automáticamente
   - Usa el botón "Raw Editor" para pegar múltiples variables

---

## 🎯 Checklist Final

- [ ] Proyecto Railway creado
- [ ] MySQL agregado y configurado
- [ ] Script SQL ejecutado
- [ ] Backend desplegado
- [ ] Variables backend configuradas
- [ ] URL backend obtenida
- [ ] environment.prod.ts actualizado
- [ ] Cambios subidos a GitHub
- [ ] Frontend desplegado
- [ ] URL frontend obtenida
- [ ] CORS actualizado en backend
- [ ] Login funciona
- [ ] API responde correctamente

---

## 🎉 ¡Listo!

Tu aplicación FlexoAPP está desplegada en Railway.

**URLs finales:**
- Frontend: `https://frontend-production-xxxx.up.railway.app`
- Backend: `https://backend-production-xxxx.up.railway.app`
- API: `https://backend-production-xxxx.up.railway.app/api`
- Swagger: `https://backend-production-xxxx.up.railway.app/swagger`

---

## 📞 Ayuda

Si tienes problemas:
1. Revisa los logs: `railway logs`
2. Verifica las variables de entorno
3. Consulta la sección "Solución de Problemas"
4. Revisa la consola del navegador (F12)

---

**Tiempo total:** ~45-60 minutos
**Costo estimado:** $15-25/mes
