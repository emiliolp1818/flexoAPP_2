# 🗄️ Configuración de Base de Datos - FlexoAPP

## 📋 Información General

- **Base de Datos:** flexoapp_bd
- **Motor:** MySQL 8.0+
- **Charset:** utf8mb4
- **Collation:** utf8mb4_unicode_ci
- **Puerto:** 3306 (por defecto)
- **Host:** localhost

## 🔧 Configuración Inicial

### 1. Crear Base de Datos

```sql
-- Conectar a MySQL
mysql -u root -p

-- Crear base de datos con soporte Unicode completo
CREATE DATABASE flexoapp_bd 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Verificar que se creó correctamente
SHOW DATABASES LIKE 'flexoapp_bd';
```

### 2. Ejecutar Scripts de Configuración

```bash
# Opción 1: Script completo (recomendado para instalación nueva)
mysql -u root -p < backend/Data/Scripts/SETUP_COMPLETE_DATABASE.sql

# Opción 2: Script básico (solo estructura mínima)
mysql -u root -p < backend/Data/Scripts/00_SetupDatabase.sql
```

## 📁 Estructura de Tablas

### Tabla: users
- **Propósito:** Almacenar usuarios del sistema
- **Clave Primaria:** Id (INT AUTO_INCREMENT)
- **Campos Únicos:** UserCode

### Tabla: designs
- **Propósito:** Almacenar diseños flexográficos
- **Clave Primaria:** Id (INT AUTO_INCREMENT)
- **Campos Únicos:** ArticleF

### Tabla: maquinas
- **Propósito:** Información de máquinas y artículos
- **Clave Primaria:** articulo (VARCHAR)

### Tabla: machine_programs
- **Propósito:** Programación de máquinas flexográficas
- **Clave Primaria:** Id (INT AUTO_INCREMENT)
- **Campos Únicos:** OtSap

### Tabla: condicionunica
- **Propósito:** Ubicación de artículos en estantes
- **Clave Primaria:** id (INT AUTO_INCREMENT)

### Tabla: activities
- **Propósito:** Auditoría de acciones de usuarios
- **Clave Primaria:** Id (INT AUTO_INCREMENT)

## 🔗 Cadena de Conexión

### Formato General
```
Server=localhost;Port=3306;Database=flexoapp_bd;User=root;Password=12345;AllowUserVariables=True;UseAffectedRows=False;
```

### Configuración en appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=flexoapp_bd;User=root;Password=12345;AllowUserVariables=True;UseAffectedRows=False;"
  }
}
```

## 🔐 Seguridad

### Usuario Administrador por Defecto
- **UserCode:** admin
- **Password:** admin123
- **Rol:** Admin
- **IMPORTANTE:** Cambiar esta contraseña en producción

### Recomendaciones
1. **Nunca** subir contraseñas a GitHub
2. Usar variables de entorno para producción
3. Cambiar la contraseña por defecto del usuario root
4. Crear usuarios específicos con permisos limitados
5. Usar contraseñas fuertes (mínimo 12 caracteres)

## 📊 Migraciones con Entity Framework

```bash
# Navegar a la carpeta del backend
cd backend

# Crear una nueva migración
dotnet ef migrations add NombreDeLaMigracion

# Aplicar migraciones pendientes
dotnet ef database update

# Revertir última migración
dotnet ef database update NombreMigracionAnterior
```

## 🔍 Verificación

```sql
-- Verificar que la base de datos existe
SHOW DATABASES LIKE 'flexoapp_bd';

-- Verificar tablas creadas
USE flexoapp_bd;
SHOW TABLES;

-- Verificar estructura de una tabla
DESCRIBE users;

-- Contar registros en cada tabla
SELECT 'users' as Tabla, COUNT(*) as Total FROM users
UNION ALL
SELECT 'designs', COUNT(*) FROM designs
UNION ALL
SELECT 'maquinas', COUNT(*) FROM maquinas;
```

## 🐛 Solución de Problemas

### Error: "Access denied for user"
```bash
# Verificar usuario y contraseña
mysql -u root -p
```

### Error: "Unknown database 'flexoapp_bd'"
```sql
-- Crear la base de datos
CREATE DATABASE flexoapp_bd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Connection timeout"
```bash
# Verificar que MySQL está corriendo
# Windows:
net start MySQL80

# Linux/Mac:
sudo systemctl start mysql
```

## 📚 Recursos Adicionales

- [Documentación de MySQL](https://dev.mysql.com/doc/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [Scripts de Base de Datos](backend/Data/Scripts/README.md)

## 📞 Soporte

Si tienes problemas con la configuración:
1. Verifica que MySQL esté instalado y corriendo
2. Verifica la cadena de conexión en appsettings.json
3. Ejecuta los scripts de configuración en orden
4. Revisa los logs en la carpeta `logs/`
