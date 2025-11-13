# 🚀 Pasos Rápidos para Desplegar en Railway

## ✅ Checklist Rápido

### 1️⃣ Preparación (5 minutos)
- [ ] Cuenta en Railway creada (https://railway.app)
- [ ] Código subido a GitHub/GitLab
- [ ] Archivos de configuración creados ✅

### 2️⃣ Base de Datos MySQL (10 minutos)

1. **Crear proyecto en Railway**
   ```
   https://railway.app/dashboard → New Project
   ```

2. **Agregar MySQL**
   ```
   + New → Database → MySQL
   ```

3. **Copiar credenciales**
   - Ve a Variables del servicio MySQL
   - Copia: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`

4. **Conectar y ejecutar script**
   ```bash
   # Opción 1: Railway CLI
   npm i -g @railway/cli
   railway login
   railway connect mysql
   
   # Luego ejecuta el contenido de database-setup.sql
   ```
   
   ```bash
   # Opción 2: MySQL Workbench
   # Usa las credenciales copiadas y ejecuta database-setup.sql
   ```

### 3️⃣ Backend .NET (10 minutos)

1. **Crear servicio**
   ```
   + New → GitHub Repo → Selecciona tu repo
   ```

2. **Configurar variables de entorno**
   ```bash
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://+:8080
   
   # Usa las variables de MySQL
   ConnectionStrings__DefaultConnection=Server=${MYSQL_HOST};Port=${MYSQL_PORT};Database=${MYSQL_DATABASE};Uid=${MYSQL_USER};Pwd=${MYSQL_PASSWORD};
   
   # Genera una clave segura (mínimo 32 caracteres)
   JWT_SECRET_KEY=tu-clave-super-secreta-de-minimo-32-caracteres
   JWT_ISSUER=FlexoAPP
   JWT_AUDIENCE=FlexoAPP-Users
   JWT_EXPIRATION_MINUTES=60
   
   # Actualiza después con la URL del frontend
   CORS_ORIGINS=https://tu-frontend.up.railway.app
   ```

3. **Configurar build**
   - Settings → Build → Dockerfile Path: `Dockerfile.backend`
   - Root Directory: `/`

4. **Esperar despliegue** (3-5 minutos)

5. **Copiar URL del backend**
   - Settings → Domains → Copy URL
   - Ejemplo: `https://backend-production-xxxx.up.railway.app`

### 4️⃣ Frontend Angular (10 minutos)

1. **Actualizar environment.prod.ts**
   ```typescript
   // Frontend/src/environments/environment.prod.ts
   export const environment = {
     production: true,
     apiUrl: 'https://tu-backend.up.railway.app/api',
     hubUrl: 'https://tu-backend.up.railway.app/hubs'
   };
   ```

2. **Commit y push**
   ```bash
   git add .
   git commit -m "Update production API URL"
   git push
   ```

3. **Crear servicio frontend**
   ```
   + New → GitHub Repo → Mismo repo
   ```

4. **Configurar variables**
   ```bash
   API_URL=https://tu-backend.up.railway.app/api
   HUB_URL=https://tu-backend.up.railway.app/hubs
   ```

5. **Configurar build**
   - Settings → Build → Dockerfile Path: `Dockerfile.frontend`
   - Root Directory: `/`

6. **Esperar despliegue** (5-7 minutos)

7. **Copiar URL del frontend**
   - Settings → Domains → Copy URL
   - Ejemplo: `https://frontend-production-xxxx.up.railway.app`

### 5️⃣ Conectar Todo (5 minutos)

1. **Actualizar CORS en backend**
   - Ve al servicio backend
   - Variables → Edita `CORS_ORIGINS`
   - Pon la URL del frontend: `https://tu-frontend.up.railway.app`
   - Guarda (se reiniciará automáticamente)

2. **Verificar conexión**
   - Abre el frontend en el navegador
   - Intenta hacer login con: `admin` / `admin123`

### 6️⃣ Verificación Final (5 minutos)

**Backend:**
```bash
# Health check
curl https://tu-backend.up.railway.app/health

# Test login
curl -X POST https://tu-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userCode":"admin","password":"admin123"}'
```

**Frontend:**
- Abre: `https://tu-frontend.up.railway.app`
- Login debe funcionar
- No debe haber errores de CORS en consola

**Base de Datos:**
```sql
-- Conecta a MySQL y verifica
SHOW TABLES;
SELECT COUNT(*) FROM Users;
```

---

## 🎯 URLs Finales

Después del despliegue tendrás:

```
Frontend:  https://tu-frontend.up.railway.app
Backend:   https://tu-backend.up.railway.app
API:       https://tu-backend.up.railway.app/api
Swagger:   https://tu-backend.up.railway.app/swagger
MySQL:     (interno de Railway)
```

---

## 🐛 Problemas Comunes

### Backend no inicia
```bash
# Ver logs
railway logs --service backend

# Verificar variables de entorno
railway variables --service backend
```

### Error de CORS
- Verifica que `CORS_ORIGINS` tenga la URL correcta del frontend
- Usa HTTPS, no HTTP
- Reinicia el backend después de cambiar variables

### Frontend en blanco
- Abre consola del navegador (F12)
- Verifica que `API_URL` sea correcta
- Verifica que el backend esté respondiendo

### Error de base de datos
- Verifica que las variables de MySQL estén correctas
- Asegúrate de que el script SQL se ejecutó completamente
- Verifica que el usuario admin exista

---

## 💡 Tips

1. **Dominios personalizados**: Railway permite agregar dominios custom
2. **Logs en tiempo real**: `railway logs --follow`
3. **Variables compartidas**: Usa `${VARIABLE}` para referenciar otras variables
4. **Auto-deploy**: Railway se actualiza automáticamente con cada push
5. **Rollback**: Puedes volver a despliegues anteriores desde el dashboard

---

## 📊 Tiempo Total Estimado

- Preparación: 5 min
- Base de datos: 10 min
- Backend: 10 min
- Frontend: 10 min
- Conexión: 5 min
- Verificación: 5 min

**Total: ~45 minutos** ⏱️

---

## 🎉 ¡Listo!

Tu aplicación FlexoAPP está en producción en Railway.

**Siguiente paso:** Configura un dominio personalizado (opcional)

```
Railway Dashboard → Settings → Domains → Add Custom Domain
```

---

## 📚 Documentación Completa

Para más detalles, consulta: `GUIA_RAILWAY.md`
