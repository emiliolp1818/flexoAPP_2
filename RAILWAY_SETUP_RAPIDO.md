# 🚂 Railway - Setup Rápido

## ⚡ Configuración en 5 Pasos

### 1️⃣ Crear Proyecto MySQL (3 min)

```
Railway Dashboard → New Project → Provision MySQL
```

**Copiar credenciales:**
- MYSQL_HOST
- MYSQL_PORT
- MYSQL_USER
- MYSQL_PASSWORD
- MYSQL_DATABASE

**Ejecutar script:**
```bash
railway connect mysql
# Pegar contenido de database-setup.sql
```

---

### 2️⃣ Configurar Backend (5 min)

```
+ New → GitHub Repo → emiliolp1818/flexoAPP_2 → rama: railway
```

**Variables de entorno:**
```bash
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080

# Conexión a MySQL (usa referencias)
ConnectionStrings__DefaultConnection=Server=${{MySQL.MYSQL_HOST}};Port=${{MySQL.MYSQL_PORT}};Database=${{MySQL.MYSQL_DATABASE}};Uid=${{MySQL.MYSQL_USER}};Pwd=${{MySQL.MYSQL_PASSWORD}};

# JWT (genera una clave segura)
JWT_SECRET_KEY=tu-clave-segura-de-32-caracteres-minimo
JWT_ISSUER=FlexoAPP
JWT_AUDIENCE=FlexoAPP-Users
JWT_EXPIRATION_MINUTES=60

# CORS (actualiza después)
CORS_ORIGINS=*
```

**Generar JWT_SECRET_KEY:**
```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Railway detectará automáticamente:**
- ✅ Dockerfile (en la raíz)
- ✅ Puerto 8080
- ✅ .NET 8.0

**Esperar despliegue:** 5-10 minutos

**Obtener URL:**
```
Settings → Networking → Generate Domain
Copiar: https://backend-production-xxxx.up.railway.app
```

---

### 3️⃣ Actualizar Frontend Local (2 min)

**Editar:** `Frontend/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://TU-BACKEND-REAL.up.railway.app/api',
  socketUrl: 'https://TU-BACKEND-REAL.up.railway.app',
  // ... resto igual
};
```

**Subir cambios:**
```bash
git add Frontend/src/environments/environment.prod.ts
git commit -m "Update production API URL"
git push origin railway
```

---

### 4️⃣ Configurar Frontend (5 min)

```
+ New → GitHub Repo → emiliolp1818/flexoAPP_2 → rama: railway
```

**Configurar:**
```
Settings → Build → Builder: Dockerfile
Settings → Build → Dockerfile Path: Dockerfile.frontend
Settings → Build → Root Directory: /
```

**Esperar despliegue:** 10-15 minutos

**Obtener URL:**
```
Settings → Networking → Generate Domain
Copiar: https://frontend-production-xxxx.up.railway.app
```

---

### 5️⃣ Conectar Todo (2 min)

**Actualizar CORS en Backend:**
```
Backend → Variables → CORS_ORIGINS
Cambiar de: *
A: https://frontend-production-xxxx.up.railway.app
```

**Verificar:**
1. Abrir frontend en navegador
2. Login: admin / admin123
3. ✅ Debe funcionar

---

## 🐛 Problemas Comunes

### "Docker build failed"
**Solución:** Railway debe usar el `Dockerfile` en la raíz (sin sufijo)

### "Cannot connect to database"
**Solución:** Verifica que uses `${{MySQL.VARIABLE}}` en ConnectionString

### "CORS blocked"
**Solución:** CORS_ORIGINS debe ser la URL exacta del frontend (con https://)

---

## 📊 Arquitectura

```
Railway Project
├── MySQL (Database)
├── Backend (Dockerfile → puerto 8080)
└── Frontend (Dockerfile.frontend → puerto 80)
```

---

## ✅ Checklist

- [ ] MySQL creado
- [ ] Script SQL ejecutado
- [ ] Backend desplegado
- [ ] Variables backend configuradas
- [ ] URL backend copiada
- [ ] environment.prod.ts actualizado
- [ ] Frontend desplegado
- [ ] CORS actualizado
- [ ] Login funciona

---

## 🔗 URLs Finales

```
Frontend:  https://frontend-production-xxxx.up.railway.app
Backend:   https://backend-production-xxxx.up.railway.app
API:       https://backend-production-xxxx.up.railway.app/api
Swagger:   https://backend-production-xxxx.up.railway.app/swagger
```

---

**Tiempo total:** ~20-30 minutos
**Costo:** $15-25/mes

¡Listo! 🎉
