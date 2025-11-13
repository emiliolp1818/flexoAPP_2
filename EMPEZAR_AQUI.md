# 🚀 EMPEZAR AQUÍ - Despliegue en Railway

## 👋 ¡Hola!

Esta guía te llevará paso a paso para desplegar tu aplicación FlexoAPP en Railway.

---

## 📦 ¿Qué es Railway?

Railway es una plataforma de despliegue moderna que hace fácil poner tu aplicación en producción. Es como Heroku pero más moderno y con mejor precio.

**Ventajas:**
- ✅ Despliegue automático desde Git
- ✅ Base de datos MySQL incluida
- ✅ HTTPS automático
- ✅ Logs en tiempo real
- ✅ Fácil de usar

**Costo estimado:** $15-25/mes

---

## 🎯 Lo que vas a hacer

```
1. Crear cuenta en Railway (gratis)
   ↓
2. Crear base de datos MySQL
   ↓
3. Desplegar Backend (.NET)
   ↓
4. Desplegar Frontend (Angular)
   ↓
5. Conectar todo
   ↓
6. ¡Listo! 🎉
```

**Tiempo total:** ~45 minutos

---

## 📋 Antes de empezar

### ✅ Requisitos

- [ ] Cuenta en Railway (créala en https://railway.app)
- [ ] Código subido a GitHub/GitLab
- [ ] 45 minutos de tiempo disponible

### ✅ Archivos creados (ya están listos)

- [x] `Dockerfile.backend` - Para el backend .NET
- [x] `Dockerfile.frontend` - Para el frontend Angular
- [x] `nginx.conf` - Configuración de servidor web
- [x] `railway.json` - Configuración de Railway
- [x] `database-setup.sql` - Script de base de datos
- [x] `.dockerignore` - Archivos a ignorar

---

## 🚀 Inicio Rápido

### Opción 1: Guía Interactiva (Recomendado)

Ejecuta este script que te guiará paso a paso:

```bash
deploy-railway.bat
```

### Opción 2: Seguir Documentación

Lee las guías en este orden:

1. **`INSTRUCCIONES_RAILWAY.md`** ⭐ EMPIEZA AQUÍ
   - Instrucciones paso a paso
   - Fácil de seguir
   - Con ejemplos

2. **`PASOS_RAILWAY.md`**
   - Checklist rápido
   - Para referencia rápida

3. **`GUIA_RAILWAY.md`**
   - Guía completa y detallada
   - Para consultar detalles

---

## 📊 Arquitectura

Tu aplicación tendrá esta estructura en Railway:

```
┌─────────────────────────────────────────┐
│         Railway Project                 │
│                                         │
│  ┌──────────────┐                      │
│  │   MySQL      │                      │
│  │   Database   │                      │
│  └──────┬───────┘                      │
│         │                               │
│         ▼                               │
│  ┌──────────────┐                      │
│  │   Backend    │                      │
│  │   .NET 8.0   │                      │
│  │   Port 8080  │                      │
│  └──────┬───────┘                      │
│         │                               │
│         ▼                               │
│  ┌──────────────┐                      │
│  │   Frontend   │                      │
│  │   Angular 20 │                      │
│  │   Port 80    │                      │
│  └──────────────┘                      │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎬 Pasos Principales

### 1️⃣ Crear Proyecto en Railway (5 min)

1. Ve a https://railway.app/dashboard
2. Click "New Project"
3. Conecta tu repositorio de GitHub

### 2️⃣ Agregar MySQL (5 min)

1. Click "+ New"
2. Selecciona "Database" → "MySQL"
3. Copia las credenciales

### 3️⃣ Configurar Base de Datos (10 min)

1. Conecta a MySQL:
   ```bash
   railway connect mysql
   ```

2. Ejecuta el script:
   ```bash
   # Copia y pega el contenido de database-setup.sql
   ```

### 4️⃣ Desplegar Backend (15 min)

1. Click "+ New" → "GitHub Repo"
2. Configura Dockerfile: `Dockerfile.backend`
3. Agrega variables de entorno (ver `.env.railway.example`)
4. Espera el despliegue
5. Copia la URL del backend

### 5️⃣ Desplegar Frontend (15 min)

1. Actualiza `Frontend/src/environments/environment.prod.ts` con la URL del backend
2. Sube cambios a Git
3. Click "+ New" → "GitHub Repo"
4. Configura Dockerfile: `Dockerfile.frontend`
5. Espera el despliegue
6. Copia la URL del frontend

### 6️⃣ Conectar Todo (5 min)

1. Actualiza CORS en backend con URL del frontend
2. Verifica que todo funcione
3. ¡Listo! 🎉

---

## 🧪 Verificación

Después del despliegue, verifica:

### Backend
```bash
curl https://tu-backend.up.railway.app/api/designs
```

### Frontend
Abre en el navegador:
```
https://tu-frontend.up.railway.app
```

### Login
- Usuario: `admin`
- Contraseña: `admin123`

---

## 📚 Documentación Disponible

| Archivo | Descripción | Cuándo usar |
|---------|-------------|-------------|
| `EMPEZAR_AQUI.md` | Este archivo | Primero |
| `INSTRUCCIONES_RAILWAY.md` | Paso a paso detallado | Para desplegar |
| `PASOS_RAILWAY.md` | Checklist rápido | Referencia rápida |
| `GUIA_RAILWAY.md` | Guía completa | Consulta detallada |
| `RESUMEN_DESPLIEGUE_RAILWAY.md` | Resumen técnico | Después del despliegue |
| `.env.railway.example` | Variables de entorno | Durante configuración |
| `database-setup.sql` | Script de BD | Al configurar MySQL |

---

## 🛠️ Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `deploy-railway.bat` | Menú interactivo de ayuda |
| `generar-password-admin.ps1` | Genera hash BCrypt para admin |

---

## 🐛 ¿Problemas?

### Error de CORS
**Solución:** Actualiza `CORS_ORIGINS` en el backend con la URL exacta del frontend

### Backend no inicia
**Solución:** Verifica las variables de entorno, especialmente `ConnectionStrings__DefaultConnection`

### Frontend en blanco
**Solución:** Verifica que `apiUrl` en `environment.prod.ts` sea correcta

### Más ayuda
Consulta la sección "Solución de Problemas" en `GUIA_RAILWAY.md`

---

## 💰 Costos

Railway usa un modelo de pago por uso:

- **Plan Hobby**: $5/mes + uso
- **Estimado para FlexoAPP**: $15-25/mes

Incluye:
- MySQL
- Backend .NET
- Frontend Angular
- HTTPS
- Dominio .railway.app

---

## 🎯 Próximos Pasos

Después del despliegue:

1. **Cambiar contraseña de admin**
2. **Configurar dominio personalizado** (opcional)
3. **Configurar backups automáticos**
4. **Monitorear logs y métricas**

---

## ✅ Checklist Rápido

- [ ] Cuenta Railway creada
- [ ] Código en GitHub
- [ ] MySQL creado
- [ ] Script SQL ejecutado
- [ ] Backend desplegado
- [ ] Frontend desplegado
- [ ] CORS configurado
- [ ] Login funciona

---

## 🎉 ¡Listo para empezar!

**Siguiente paso:** Abre `INSTRUCCIONES_RAILWAY.md` y sigue los pasos.

O ejecuta:
```bash
deploy-railway.bat
```

---

## 🆘 Ayuda

Si necesitas ayuda en cualquier momento:

1. **Ver logs**: `railway logs`
2. **Consultar documentación**: Lee `GUIA_RAILWAY.md`
3. **Verificar configuración**: Ejecuta `deploy-railway.bat` → Opción 4

---

**¡Mucha suerte con tu despliegue!** 🚀

---

**Tiempo estimado:** 45 minutos
**Dificultad:** Media
**Costo:** $15-25/mes

