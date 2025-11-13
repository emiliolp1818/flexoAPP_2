# 🚂 FlexoAPP - Despliegue en Railway

## 🎯 Inicio Rápido

### 1. Lee primero
📖 **`EMPEZAR_AQUI.md`** - Tu punto de partida

### 2. Sigue las instrucciones
📋 **`INSTRUCCIONES_RAILWAY.md`** - Paso a paso detallado

### 3. Usa el script de ayuda
```bash
deploy-railway.bat
```

---

## 📦 Archivos Importantes

### Configuración
- ✅ `Dockerfile.backend` - Contenedor del backend
- ✅ `Dockerfile.frontend` - Contenedor del frontend
- ✅ `nginx.conf` - Servidor web para Angular
- ✅ `railway.json` - Configuración de Railway
- ✅ `.dockerignore` - Archivos a ignorar

### Base de Datos
- ✅ `database-setup.sql` - Script completo de MySQL

### Documentación
- 📖 `EMPEZAR_AQUI.md` - **EMPIEZA AQUÍ**
- 📋 `INSTRUCCIONES_RAILWAY.md` - Paso a paso
- ⚡ `PASOS_RAILWAY.md` - Checklist rápido
- 📚 `GUIA_RAILWAY.md` - Guía completa
- 📊 `RESUMEN_DESPLIEGUE_RAILWAY.md` - Resumen técnico

### Configuración
- 🔧 `.env.railway.example` - Variables de entorno
- 🔐 `generar-password-admin.ps1` - Generador de password

---

## 🚀 Despliegue en 3 Pasos

### Paso 1: Preparar
```bash
# Subir código a GitHub
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### Paso 2: Configurar Railway
1. Crear proyecto en https://railway.app
2. Agregar MySQL
3. Ejecutar `database-setup.sql`

### Paso 3: Desplegar
1. Desplegar backend (Dockerfile.backend)
2. Desplegar frontend (Dockerfile.frontend)
3. Configurar variables de entorno

**Tiempo total:** ~45 minutos

---

## 📊 Arquitectura

```
Railway Project
├── MySQL Database
│   └── 7 tablas (Users, designs, maquinas, etc.)
├── Backend Service (.NET 8.0)
│   ├── API REST
│   ├── SignalR
│   └── Puerto 8080
└── Frontend Service (Angular 20)
    ├── Nginx
    └── Puerto 80
```

---

## 🔧 Variables de Entorno

### Backend
```bash
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
ConnectionStrings__DefaultConnection=Server=${MYSQL_HOST};Port=${MYSQL_PORT};Database=${MYSQL_DATABASE};Uid=${MYSQL_USER};Pwd=${MYSQL_PASSWORD};
JWT_SECRET_KEY=tu-clave-segura-32-caracteres
CORS_ORIGINS=https://tu-frontend.up.railway.app
```

### Frontend
```bash
API_URL=https://tu-backend.up.railway.app/api
HUB_URL=https://tu-backend.up.railway.app/hubs
```

Ver `.env.railway.example` para más detalles.

---

## ✅ Verificación

### Backend
```bash
curl https://tu-backend.up.railway.app/api/designs
```

### Frontend
```
https://tu-frontend.up.railway.app
```

### Login
- Usuario: `admin`
- Contraseña: `admin123`

---

## 🐛 Solución de Problemas

| Problema | Solución |
|----------|----------|
| Error de CORS | Actualiza `CORS_ORIGINS` con URL del frontend |
| Backend no inicia | Verifica variables de entorno |
| Frontend en blanco | Verifica `apiUrl` en environment.prod.ts |
| Error de BD | Verifica que script SQL se ejecutó |

Ver `GUIA_RAILWAY.md` para más detalles.

---

## 💰 Costos

- **Plan Hobby**: $5/mes + uso
- **Estimado**: $15-25/mes
- Incluye: MySQL + Backend + Frontend + HTTPS

---

## 📚 Documentación

| Archivo | Para qué |
|---------|----------|
| `EMPEZAR_AQUI.md` | Introducción y overview |
| `INSTRUCCIONES_RAILWAY.md` | Guía paso a paso |
| `PASOS_RAILWAY.md` | Checklist rápido |
| `GUIA_RAILWAY.md` | Documentación completa |

---

## 🎯 Siguiente Paso

**Abre:** `EMPEZAR_AQUI.md`

O ejecuta:
```bash
deploy-railway.bat
```

---

## 🆘 Ayuda

- **Logs**: `railway logs`
- **Documentación**: Lee las guías
- **Script**: `deploy-railway.bat`

---

**¡Éxito con tu despliegue!** 🚀
