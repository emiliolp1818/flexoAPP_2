# 🚂 Instrucciones Finales para Railway

## 📝 Resumen

Has creado todos los archivos necesarios para desplegar FlexoAPP en Railway. Ahora sigue estos pasos:

---

## 🎯 Paso a Paso

### 1. Preparar el Código (5 minutos)

#### A. Actualizar environment de producción

Tienes dos opciones:

**Opción 1: Usar environment.railway.ts (Recomendado)**
```bash
# Copia el archivo railway al de producción
copy Frontend\src\environments\environment.railway.ts Frontend\src\environments\environment.prod.ts
```

**Opción 2: Editar manualmente**
Edita `Frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend.up.railway.app/api',
  socketUrl: 'https://tu-backend.up.railway.app',
  // ... resto de configuración
};
```

#### B. Subir cambios a Git
```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

---

### 2. Crear Proyecto en Railway (10 minutos)

#### A. Acceder a Railway
1. Ve a: https://railway.app/dashboard
2. Inicia sesión con GitHub (recomendado)

#### B. Crear nuevo proyecto
1. Click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Autoriza Railway a acceder a tu repositorio
4. Selecciona tu repositorio `flexoAPP_2`

---

### 3. Configurar MySQL (10 minutos)

#### A. Agregar MySQL
1. En tu proyecto, click "+ New"
2. Selecciona "Database"
3. Elige "MySQL"
4. Railway creará la base de datos automáticamente

#### B. Copiar credenciales
1. Click en el servicio MySQL
2. Ve a la pestaña "Variables"
3. Copia estas variables (las necesitarás):
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

#### C. Ejecutar script SQL
1. Instala Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Conecta a MySQL:
   ```bash
   railway login
   railway link
   railway connect mysql
   ```

3. Ejecuta el script:
   ```sql
   -- Copia y pega el contenido de database-setup.sql
   ```

**Alternativa:** Usa MySQL Workbench con las credenciales copiadas

---

### 4. Configurar Backend (15 minutos)

#### A. Crear servicio backend
1. En tu proyecto Railway, click "+ New"
2. Selecciona "GitHub Repo"
3. Selecciona tu repositorio (mismo que antes)
4. Railway detectará el proyecto

#### B. Configurar Dockerfile
1. Click en el servicio recién creado
2. Ve a "Settings"
3. En "Build", configura:
   - **Dockerfile Path**: `Dockerfile.backend`
   - **Root Directory**: `/`

#### C. Configurar variables de entorno
1. Ve a la pestaña "Variables"
2. Click en "New Variable"
3. Agrega estas variables:

```bash
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
```

4. Para la conexión a base de datos, usa referencias:
```bash
ConnectionStrings__DefaultConnection=Server=${MYSQL_HOST};Port=${MYSQL_PORT};Database=${MYSQL_DATABASE};Uid=${MYSQL_USER};Pwd=${MYSQL_PASSWORD};
```

5. Genera una clave JWT segura:
```bash
# En PowerShell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

6. Agrega las variables JWT:
```bash
JWT_SECRET_KEY=[tu-clave-generada-aqui]
JWT_ISSUER=FlexoAPP
JWT_AUDIENCE=FlexoAPP-Users
JWT_EXPIRATION_MINUTES=60
```

7. Agrega CORS (actualizarás esto después):
```bash
CORS_ORIGINS=*
```

#### D. Esperar despliegue
- Railway comenzará a construir y desplegar
- Esto toma 3-5 minutos
- Verás los logs en tiempo real

#### E. Obtener URL del backend
1. Ve a "Settings" → "Domains"
2. Railway generará una URL automáticamente
3. Cópiala (ejemplo: `https://backend-production-xxxx.up.railway.app`)

---

### 5. Configurar Frontend (15 minutos)

#### A. Actualizar environment.prod.ts
1. Edita `Frontend/src/environments/environment.prod.ts`
2. Reemplaza las URLs con la URL de tu backend:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend-real.up.railway.app/api',
  socketUrl: 'https://tu-backend-real.up.railway.app',
  // ...
};
```

3. Guarda y sube los cambios:
```bash
git add Frontend/src/environments/environment.prod.ts
git commit -m "Update production API URL"
git push origin main
```

#### B. Crear servicio frontend
1. En Railway, click "+ New"
2. Selecciona "GitHub Repo"
3. Selecciona tu repositorio (mismo que antes)
4. Railway creará otro servicio

#### C. Configurar Dockerfile
1. Click en el nuevo servicio
2. Ve a "Settings"
3. En "Build", configura:
   - **Dockerfile Path**: `Dockerfile.frontend`
   - **Root Directory**: `/`

#### D. Esperar despliegue
- Esto toma 5-7 minutos
- Angular se compilará en modo producción

#### E. Obtener URL del frontend
1. Ve a "Settings" → "Domains"
2. Copia la URL (ejemplo: `https://frontend-production-xxxx.up.railway.app`)

---

### 6. Conectar Todo (5 minutos)

#### A. Actualizar CORS en backend
1. Ve al servicio backend en Railway
2. Variables → Edita `CORS_ORIGINS`
3. Reemplaza `*` con la URL exacta del frontend:
```bash
CORS_ORIGINS=https://tu-frontend-real.up.railway.app
```
4. Guarda (el servicio se reiniciará automáticamente)

#### B. Verificar conexión
1. Abre la URL del frontend en tu navegador
2. Abre la consola del navegador (F12)
3. No debe haber errores de CORS

---

### 7. Verificación Final (10 minutos)

#### A. Verificar Backend
```bash
# Health check (si lo tienes configurado)
curl https://tu-backend.up.railway.app/health

# Test API
curl https://tu-backend.up.railway.app/api/designs

# Test login
curl -X POST https://tu-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"userCode\":\"admin\",\"password\":\"admin123\"}"
```

#### B. Verificar Frontend
1. Abre: `https://tu-frontend.up.railway.app`
2. Verifica que carga correctamente
3. Intenta hacer login con:
   - Usuario: `admin`
   - Contraseña: `admin123`
4. Verifica que puedes navegar por la aplicación

#### C. Verificar Base de Datos
```bash
# Conecta a MySQL
railway connect mysql

# Verifica tablas
SHOW TABLES;

# Verifica usuario admin
SELECT * FROM Users WHERE UserCode = 'admin';
```

---

## ✅ Checklist Final

- [ ] Código subido a GitHub
- [ ] Proyecto Railway creado
- [ ] MySQL configurado
- [ ] Script SQL ejecutado
- [ ] Backend desplegado
- [ ] Variables backend configuradas
- [ ] Frontend desplegado
- [ ] environment.prod.ts actualizado
- [ ] CORS configurado
- [ ] Login funciona
- [ ] API responde correctamente

---

## 🎉 ¡Felicidades!

Tu aplicación FlexoAPP está desplegada en Railway.

### URLs de tu aplicación:
- **Frontend**: `https://tu-frontend.up.railway.app`
- **Backend**: `https://tu-backend.up.railway.app`
- **API**: `https://tu-backend.up.railway.app/api`
- **Swagger**: `https://tu-backend.up.railway.app/swagger`

---

## 🔄 Actualizaciones Futuras

Railway se actualiza automáticamente cuando haces push:

```bash
# Hacer cambios en el código
git add .
git commit -m "Update feature"
git push origin main

# Railway detectará el cambio y redesplegar automáticamente
```

---

## 🐛 Si algo sale mal

### Ver logs
```bash
# Backend
railway logs --service backend

# Frontend
railway logs --service frontend
```

### Reiniciar servicio
1. Ve al servicio en Railway
2. Click en "..." (menú)
3. Selecciona "Restart"

### Rollback
1. Ve a "Deployments"
2. Selecciona un despliegue anterior
3. Click en "Redeploy"

---

## 📚 Documentación

- **Guía completa**: `GUIA_RAILWAY.md`
- **Checklist rápido**: `PASOS_RAILWAY.md`
- **Resumen**: `RESUMEN_DESPLIEGUE_RAILWAY.md`
- **Variables**: `.env.railway.example`

---

## 💡 Tips

1. **Dominios personalizados**: Railway permite agregar tu propio dominio
2. **Monitoreo**: Revisa las métricas en el dashboard regularmente
3. **Backups**: Configura backups automáticos de MySQL
4. **Seguridad**: Cambia la contraseña de admin después del primer login
5. **Logs**: Usa `railway logs --follow` para ver logs en tiempo real

---

## 🆘 Soporte

Si necesitas ayuda:
1. Revisa los logs: `railway logs`
2. Consulta la documentación: `GUIA_RAILWAY.md`
3. Verifica las variables de entorno
4. Revisa la consola del navegador (F12)

---

**¡Éxito con tu despliegue!** 🚀
