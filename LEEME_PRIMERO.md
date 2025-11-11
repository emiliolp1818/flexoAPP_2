# 📖 LÉEME PRIMERO - FlexoAPP Local

## ✅ Estado Actual

La aplicación ha sido **completamente limpiada** y configurada para trabajar **100% en modo local**.

- ✅ Sin dependencias de Railway
- ✅ Sin dependencias de Render
- ✅ Sin servicios remotos
- ✅ PostgreSQL local
- ✅ Configuración simplificada

## 🚀 Inicio Rápido (5 minutos)

### 1. Crear Base de Datos
```sql
CREATE DATABASE flexoapp;
```

### 2. Aplicar Migraciones
```bash
cd backend
dotnet ef database update
```

### 3. Iniciar Aplicación
```powershell
.\iniciar-app.ps1
```

## 📚 Documentación

### Esenciales
1. **INICIO_RAPIDO.md** ⚡ - Empieza aquí
2. **README_LOCAL.md** 📖 - Guía completa
3. **CONFIGURACION_LOCAL.md** ⚙️ - Configuración de BD

### Referencia
4. **LIMPIEZA_COMPLETADA.md** - Cambios realizados
5. **CAMBIOS_REALIZADOS.md** - Detalle técnico

## 🔧 Configuración

### Base de Datos
```
Host:     localhost
Port:     5432
Database: flexoapp
Username: postgres
Password: admin
```

### URLs
```
Frontend: http://localhost:4200
Backend:  http://localhost:7003
Swagger:  http://localhost:7003/swagger
```

## 📝 Módulos Disponibles

1. ✅ **Autenticación** - Login y usuarios
2. ✅ **Máquinas** - Gestión de máquinas
3. ✅ **Pedidos** - Gestión de pedidos
4. ✅ **Diseños** - Catálogo de diseños
5. ✅ **Programas** - Programas de máquina
6. ✅ **Condición Única** - Gestión de artículos (nuevo)

## ⚠️ Requisitos

- PostgreSQL 12+
- .NET 8.0 SDK
- Node.js 18+
- Angular CLI

## 🆘 Ayuda Rápida

### PostgreSQL no inicia
```bash
net start postgresql-x64-14
```

### Error de contraseña
Edita `backend/appsettings.json` y cambia la contraseña

### Puerto ocupado
```bash
netstat -ano | findstr :7003
taskkill /PID [número] /F
```

## 📊 Archivos Importantes

```
flexoAPP3/
├── iniciar-app.ps1              ← Script de inicio
├── INICIO_RAPIDO.md             ← Guía rápida
├── README_LOCAL.md              ← Guía completa
├── CONFIGURACION_LOCAL.md       ← Config de BD
├── backend/
│   ├── appsettings.json        ← Configuración
│   └── Database/Scripts/
│       └── create_condicionunica_local.sql
└── Frontend/
    └── src/environments/
        └── environment.ts       ← URLs del frontend
```

## 🎯 Próximos Pasos

1. Lee **INICIO_RAPIDO.md**
2. Crea la base de datos
3. Ejecuta `.\iniciar-app.ps1`
4. Accede a http://localhost:4200
5. Login con admin/admin123

---

**¿Listo para empezar?** 🚀

Ejecuta: `.\iniciar-app.ps1`
