# Configuración MySQL - FlexoAPP

## ✅ Cambio Completado

La aplicación ha sido migrada de PostgreSQL a MySQL.

## 📋 Requisitos

- MySQL 8.0+ instalado
- MySQL Workbench (opcional)
- .NET 8.0 SDK
- Node.js 18+ y Angular CLI

## 🚀 Configuración Rápida

### 1. Instalar MySQL

**Windows:**
- Descarga MySQL Installer desde https://dev.mysql.com/downloads/installer/
- Instala MySQL Server 8.0
- Durante la instalación, configura:
  - Usuario: root
  - Contraseña: admin (o la que prefieras)
  - Puerto: 3306

### 2. Crear Base de Datos

**Opción A: MySQL Workbench**
1. Abre MySQL Workbench
2. Conecta a localhost
3. Abre el archivo: `backend/Database/Scripts/create_database_mysql.sql`
4. Ejecuta (Ctrl+Shift+Enter)

**Opción B: Línea de comandos**
```bash
mysql -u root -p < backend/Database/Scripts/create_database_mysql.sql
```

### 3. Verificar Configuración

Edita `backend/appsettings.json` si tu contraseña es diferente:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=flexoapp;User=root;Password=TU_CONTRASEÑA;"
  }
}
```

### 4. Aplicar Migraciones

```bash
cd backend

# Eliminar migraciones antiguas de PostgreSQL
dotnet ef migrations remove

# Crear nueva migración para MySQL
dotnet ef migrations add InitialMySQL

# Aplicar migración
dotnet ef database update
```

### 5. Iniciar Aplicación

```powershell
.\iniciar-app.ps1
```

## 🔧 Configuración Actual

### Base de Datos
```
Servidor: localhost
Puerto: 3306
Base de datos: flexoapp
Usuario: root
Contraseña: admin
```

### URLs
```
Backend: http://localhost:7003
Frontend: http://localhost:4200
Swagger: http://localhost:7003/swagger
```

## 📝 Cambios Realizados

### Backend
1. ✅ `flexoAPP.csproj` - Cambiado a Pomelo.EntityFrameworkCore.MySql
2. ✅ `appsettings.json` - Connection string de MySQL
3. ✅ `Program.cs` - UseMySql en lugar de UseNpgsql
4. ✅ `FlexoAPPDbContext.cs` - Configuración MySQL (JSON, LONGTEXT, TIMESTAMP)

### Scripts SQL
1. ✅ `create_database_mysql.sql` - Script completo para MySQL
2. ❌ Eliminados scripts de PostgreSQL

## 🆘 Troubleshooting

### Error: "Unable to connect to MySQL server"
```bash
# Verificar que MySQL esté corriendo
net start MySQL80

# O en Services, busca MySQL80 e inícialo
```

### Error: "Access denied for user 'root'"
- Verifica la contraseña en `appsettings.json`
- Resetea la contraseña de root si es necesario

### Error: "Unknown database 'flexoapp'"
```sql
CREATE DATABASE flexoapp;
```

### Error: "Table doesn't exist"
```bash
cd backend
dotnet ef database update
```

## 📊 Diferencias PostgreSQL vs MySQL

| Característica | PostgreSQL | MySQL |
|---------------|------------|-------|
| JSON | `jsonb` | `JSON` |
| Texto largo | `text` | `LONGTEXT` |
| Auto incremento | `SERIAL` | `AUTO_INCREMENT` |
| Timestamp | `TIMESTAMP` | `TIMESTAMP` |
| Update timestamp | Trigger | `ON UPDATE CURRENT_TIMESTAMP` |

## 🎯 Verificación

### 1. Verificar MySQL
```bash
mysql -u root -p
```

```sql
SHOW DATABASES;
USE flexoapp;
SHOW TABLES;
SELECT * FROM condicionunica;
```

### 2. Verificar Backend
```bash
cd backend
dotnet run
```

Abrir: http://localhost:7003/swagger

### 3. Verificar Frontend
```bash
cd Frontend
ng serve
```

Abrir: http://localhost:4200

## 📚 Comandos Útiles

### MySQL
```bash
# Conectar
mysql -u root -p

# Crear base de datos
CREATE DATABASE flexoapp;

# Usar base de datos
USE flexoapp;

# Ver tablas
SHOW TABLES;

# Describir tabla
DESCRIBE condicionunica;

# Ver datos
SELECT * FROM condicionunica;

# Backup
mysqldump -u root -p flexoapp > backup.sql

# Restore
mysql -u root -p flexoapp < backup.sql
```

### Entity Framework
```bash
# Ver migraciones
dotnet ef migrations list

# Crear migración
dotnet ef migrations add NombreMigracion

# Aplicar migraciones
dotnet ef database update

# Revertir migración
dotnet ef database update MigracionAnterior

# Eliminar última migración
dotnet ef migrations remove

# Generar script SQL
dotnet ef migrations script
```

## ✅ Checklist

- [ ] MySQL instalado y corriendo
- [ ] Base de datos `flexoapp` creada
- [ ] Tabla `condicionunica` creada
- [ ] Migraciones aplicadas
- [ ] Backend compila sin errores
- [ ] Backend se conecta a MySQL
- [ ] Frontend se conecta al backend
- [ ] Login funciona
- [ ] Módulo CondicionUnica funciona

## 🎉 ¡Listo!

La aplicación ahora usa MySQL en lugar de PostgreSQL.

Para iniciar: `.\iniciar-app.ps1`
