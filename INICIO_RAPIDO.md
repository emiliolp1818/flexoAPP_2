# 🚀 INICIO RÁPIDO - FlexoAPP Local

## ⚡ 3 Pasos para Empezar

### 1️⃣ Crear Base de Datos (1 minuto)
```sql
-- En psql o pgAdmin
CREATE DATABASE flexoapp;
```

### 2️⃣ Aplicar Migraciones (2 minutos)
```bash
cd backend
dotnet ef database update
```

### 3️⃣ Iniciar Aplicación (1 minuto)
```powershell
.\iniciar-app.ps1
```

## 🎯 URLs

- **Frontend:** http://localhost:4200
- **Backend:** http://localhost:7003
- **Swagger:** http://localhost:7003/swagger

## 🔑 Credenciales

- **Usuario:** admin
- **Contraseña:** admin123

## 📝 Crear Tabla CondicionUnica

```bash
psql -U postgres -d flexoapp -f backend/Database/Scripts/create_condicionunica_local.sql
```

## ❓ Problemas Comunes

### PostgreSQL no está corriendo
```bash
# Windows
net start postgresql-x64-14

# O busca "Services" y inicia PostgreSQL
```

### Error de contraseña
Edita `backend/appsettings.json`:
```json
"Password=admin"  // Cambia por tu contraseña
```

### Puerto 7003 ocupado
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :7003

# Matar el proceso
taskkill /PID [número] /F
```

## 📚 Más Información

- **README_LOCAL.md** - Guía completa
- **CONFIGURACION_LOCAL.md** - Configuración detallada
- **LIMPIEZA_COMPLETADA.md** - Cambios realizados

---

**¿Listo?** Ejecuta `.\iniciar-app.ps1` y comienza a trabajar! 🎉
