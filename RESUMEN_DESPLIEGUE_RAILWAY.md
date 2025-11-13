# 📦 Resumen de Despliegue en Railway

## ✅ Archivos Creados

### Configuración Docker
- ✅ `Dockerfile.backend` - Contenedor para .NET 8.0
- ✅ `Dockerfile.frontend` - Contenedor para Angular + Nginx
- ✅ `.dockerignore` - Archivos a ignorar en build
- ✅ `nginx.conf` - Configuración de Nginx para Angular

### Configuración Railway
- ✅ `railway.json` - Configuración de Railway
- ✅ `.env.railway.example` - Ejemplo de variables de entorno

### Base de Datos
- ✅ `database-setup.sql` - Script completo de creación de tablas

### Documentación
- ✅ `GUIA_RAILWAY.md` - Guía completa paso a paso
- ✅ `PASOS_RAILWAY.md` - Checklist rápido
- ✅ `RESUMEN_DESPLIEGUE_RAILWAY.md` - Este archivo

### Scripts
- ✅ `generar-password-admin.ps1` - Generador de hash BCrypt

---

## 🚀 Inicio Rápido

### 1. Preparar Repositorio
```bash
# Asegúrate de que todos los archivos estén en Git
git add .
git commit -m "Add Railway deployment config"
git push origin main
```

### 2. Crear Proyecto en Railway
1. Ve a https://railway.app/dashboard
2. Click "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio

### 3. Agregar MySQL
1. En tu proyecto, click "+ New"
2. Selecciona "Database" → "MySQL"
3. Copia las credenciales

### 4. Configurar Backend
1. Click "+ New" → "GitHub Repo"
2. Selecciona tu repositorio
3. Configura variables de entorno (ver `.env.railway.example`)
4. Settings → Dockerfile Path: `Dockerfile.backend`

### 5. Configurar Frontend
1. Click "+ New" → "GitHub Repo" (mismo repo)
2. Configura variables de entorno
3. Settings → Dockerfile Path: `Dockerfile.frontend`

### 6. Conectar Todo
1. Actualiza `CORS_ORIGINS` en backend con URL del frontend
2. Actualiza `API_URL` en frontend con URL del backend
3. Ejecuta `database-setup.sql` en MySQL

---

## 📊 Arquitectura en Railway

```
┌─────────────────────────────────────────┐
│         Railway Project                 │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   MySQL      │  │   Backend    │   │
│  │   Database   │◄─┤   (.NET 8)   │   │
│  │              │  │   Port 8080  │   │
│  └──────────────┘  └──────┬───────┘   │
│                            │           │
│                            ▼           │
│                    ┌──────────────┐   │
│                    │   Frontend   │   │
│                    │   (Angular)  │   │
│                    │   Port 80    │   │
│                    └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
    MySQL URL    Backend URL    Frontend URL
```

---

## 🔧 Variables de Entorno Requeridas

### Backend
```bash
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
ConnectionStrings__DefaultConnection=Server=${MYSQL_HOST};Port=${MYSQL_PORT};Database=${MYSQL_DATABASE};Uid=${MYSQL_USER};Pwd=${MYSQL_PASSWORD};
JWT_SECRET_KEY=tu-clave-segura-32-caracteres
JWT_ISSUER=FlexoAPP
JWT_AUDIENCE=FlexoAPP-Users
JWT_EXPIRATION_MINUTES=60
CORS_ORIGINS=https://tu-frontend.up.railway.app
```

### Frontend
```bash
API_URL=https://tu-backend.up.railway.app/api
HUB_URL=https://tu-backend.up.railway.app/hubs
```

---

## 📋 Checklist de Despliegue

### Antes de Desplegar
- [ ] Código subido a GitHub/GitLab
- [ ] Archivos Docker creados
- [ ] Variables de entorno preparadas
- [ ] Script SQL listo

### Durante el Despliegue
- [ ] Proyecto Railway creado
- [ ] MySQL agregado y configurado
- [ ] Backend desplegado
- [ ] Frontend desplegado
- [ ] Variables de entorno configuradas
- [ ] Script SQL ejecutado

### Después del Despliegue
- [ ] Backend responde (health check)
- [ ] Frontend carga correctamente
- [ ] Login funciona
- [ ] API responde
- [ ] SignalR conecta
- [ ] No hay errores de CORS

---

## 🧪 Verificación

### Backend
```bash
# Health check
curl https://tu-backend.up.railway.app/health

# Test API
curl https://tu-backend.up.railway.app/api/designs

# Test login
curl -X POST https://tu-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userCode":"admin","password":"admin123"}'
```

### Frontend
1. Abre: `https://tu-frontend.up.railway.app`
2. Verifica que carga sin errores
3. Abre consola del navegador (F12)
4. No debe haber errores de CORS
5. Intenta hacer login

### Base de Datos
```sql
-- Conecta a MySQL de Railway
SHOW TABLES;
SELECT COUNT(*) FROM Users;
SELECT * FROM Users WHERE UserCode = 'admin';
```

---

## 🐛 Solución de Problemas

### Backend no inicia
```bash
# Ver logs
railway logs --service backend

# Verificar build
railway logs --service backend --deployment [deployment-id]
```

**Causas comunes:**
- Variables de entorno incorrectas
- Error en ConnectionString
- Puerto incorrecto

### Frontend en blanco
**Causas comunes:**
- API_URL incorrecta
- Backend no responde
- Error en build de Angular

**Solución:**
1. Abre consola del navegador (F12)
2. Revisa errores
3. Verifica que API_URL sea correcta

### Error de CORS
**Síntoma:** Error en consola del navegador
```
Access to XMLHttpRequest at 'https://backend...' from origin 'https://frontend...' 
has been blocked by CORS policy
```

**Solución:**
1. Ve al servicio backend en Railway
2. Variables → Edita `CORS_ORIGINS`
3. Pon la URL exacta del frontend
4. Guarda (se reiniciará automáticamente)

### Error de base de datos
**Síntoma:** Backend logs muestran error de conexión

**Solución:**
1. Verifica que MySQL esté corriendo
2. Verifica variables: `MYSQL_HOST`, `MYSQL_PORT`, etc.
3. Verifica que el script SQL se ejecutó
4. Prueba conexión manual con MySQL Workbench

---

## 💰 Costos Estimados

Railway usa un modelo de pago por uso:

### Plan Hobby ($5/mes + uso)
- $5 de crédito incluido
- ~$0.000231/min por GB de RAM
- ~$0.000463/min por vCPU

### Estimación para FlexoAPP:
- **MySQL**: ~$5-10/mes
- **Backend (.NET)**: ~$5-10/mes
- **Frontend (Nginx)**: ~$3-5/mes
- **Total**: ~$13-25/mes

### Plan Pro ($20/mes + uso)
- $20 de crédito incluido
- Mejor para producción
- Soporte prioritario

---

## 📚 Recursos

### Railway
- [Dashboard](https://railway.app/dashboard)
- [Documentación](https://docs.railway.app)
- [CLI](https://docs.railway.app/develop/cli)
- [Templates](https://railway.app/templates)

### Herramientas
- [BCrypt Generator](https://bcrypt-generator.com/)
- [JWT Debugger](https://jwt.io/)
- [MySQL Workbench](https://www.mysql.com/products/workbench/)

### Documentación del Proyecto
- `GUIA_RAILWAY.md` - Guía completa
- `PASOS_RAILWAY.md` - Checklist rápido
- `ARQUITECTURA_COMPLETA.md` - Arquitectura del sistema

---

## 🎯 Próximos Pasos

Después del despliegue exitoso:

1. **Dominio Personalizado**
   - Railway → Settings → Domains
   - Agrega tu dominio
   - Configura DNS

2. **Monitoreo**
   - Configura alertas en Railway
   - Revisa métricas regularmente
   - Configura logs externos (opcional)

3. **Backups**
   - Configura backups automáticos de MySQL
   - Railway ofrece snapshots

4. **CI/CD**
   - Railway se actualiza automáticamente con cada push
   - Configura branches para staging/production

5. **Seguridad**
   - Cambia contraseña de admin
   - Genera nueva JWT_SECRET_KEY
   - Configura rate limiting
   - Habilita HTTPS (Railway lo hace automáticamente)

---

## ✅ Estado del Proyecto

- ✅ Archivos de configuración creados
- ✅ Dockerfiles listos
- ✅ Scripts SQL preparados
- ✅ Documentación completa
- ⏳ Pendiente: Desplegar en Railway
- ⏳ Pendiente: Configurar variables
- ⏳ Pendiente: Ejecutar script SQL
- ⏳ Pendiente: Verificar funcionamiento

---

## 🎉 ¡Todo Listo!

Tienes todo lo necesario para desplegar FlexoAPP en Railway.

**Siguiente paso:** Sigue la guía en `PASOS_RAILWAY.md`

**Tiempo estimado:** 45 minutos

**¿Necesitas ayuda?** Consulta `GUIA_RAILWAY.md` para detalles completos.

---

**Última actualización:** 2024-11-13
**Versión:** 1.0.0
