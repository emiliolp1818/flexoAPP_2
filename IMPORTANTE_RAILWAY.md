# ⚠️ IMPORTANTE - Configuración Railway

## 🎯 Archivos Clave

Railway buscará estos archivos **en este orden**:

1. **`Dockerfile`** ← Railway usa este para el BACKEND
2. **`Dockerfile.frontend`** ← Debes especificar este para el FRONTEND
3. **`railway.toml`** ← Configuración opcional
4. **`.railwayignore`** ← Optimización de build

---

## 🚀 Configuración Correcta

### Para el BACKEND:

Railway detectará automáticamente el `Dockerfile` en la raíz.

**NO necesitas configurar nada más**, solo:
1. Conectar el repo
2. Agregar variables de entorno
3. Esperar el despliegue

### Para el FRONTEND:

Debes crear un **servicio separado** y especificar:

```
Settings → Build → Builder: Dockerfile
Settings → Build → Dockerfile Path: Dockerfile.frontend
```

---

## 📋 Estructura de Archivos

```
flexoAPP_2/
├── Dockerfile              ← Backend (Railway lo usa automáticamente)
├── Dockerfile.backend      ← Backup/referencia
├── Dockerfile.frontend     ← Frontend (especificar manualmente)
├── railway.toml            ← Configuración Railway
├── .railwayignore          ← Optimización
├── database-setup.sql      ← Script de BD
└── backend/
    └── flexoAPP.csproj
```

---

## ⚡ Setup Rápido

### 1. MySQL
```
+ New → Database → MySQL
```

### 2. Backend
```
+ New → GitHub Repo → railway branch
```
Railway detecta automáticamente el `Dockerfile`

### 3. Frontend
```
+ New → GitHub Repo → railway branch
Settings → Dockerfile Path: Dockerfile.frontend
```

---

## 🔧 Variables de Entorno Backend

```bash
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
ConnectionStrings__DefaultConnection=Server=${{MySQL.MYSQL_HOST}};Port=${{MySQL.MYSQL_PORT}};Database=${{MySQL.MYSQL_DATABASE}};Uid=${{MySQL.MYSQL_USER}};Pwd=${{MySQL.MYSQL_PASSWORD}};
JWT_SECRET_KEY=tu-clave-segura-32-caracteres
JWT_ISSUER=FlexoAPP
JWT_AUDIENCE=FlexoAPP-Users
JWT_EXPIRATION_MINUTES=60
CORS_ORIGINS=https://tu-frontend.up.railway.app
```

---

## 🐛 Error Común

Si ves:
```
MSBUILD : error MSB1003: Specify a project or solution file
```

**Causa:** Railway está usando un Dockerfile incorrecto

**Solución:** 
1. Verifica que el `Dockerfile` (sin sufijo) existe en la raíz
2. Verifica que tiene la línea: `RUN dotnet restore "backend/flexoAPP.csproj"`
3. Si persiste, ve a Settings → Build → Builder: Dockerfile

---

## 📚 Documentación

- **Setup Rápido:** `RAILWAY_SETUP_RAPIDO.md`
- **Guía Completa:** `CONFIGURACION_RAILWAY_PASO_A_PASO.md`
- **Troubleshooting:** `GUIA_RAILWAY.md`

---

## ✅ Checklist

- [x] Dockerfile creado en raíz
- [x] Dockerfile.frontend para frontend
- [x] railway.toml configurado
- [x] .railwayignore creado
- [x] Variables de entorno documentadas
- [x] Guías actualizadas

---

**¡Ahora Railway debería funcionar correctamente!** 🎉
