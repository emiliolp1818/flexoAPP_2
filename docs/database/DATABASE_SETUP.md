# Configuración de Base de Datos - FlexoAPP

## 📋 Requisitos

- MySQL 8.0 o superior
- Cliente MySQL (MySQL Workbench, DBeaver, etc.)
- Acceso con permisos de administrador

## 🚀 Instalación Local

### 1. Crear Base de Datos

```sql
CREATE DATABASE flexoapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Crear Usuario (Opcional pero recomendado)

```sql
CREATE USER 'flexoapp_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON flexoapp.* TO 'flexoapp_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Ejecutar Scripts de Creación

Los scripts están en `backend/Database/Scripts/` y deben ejecutarse en este orden:

```bash
# Opción 1: Script maestro (ejecuta todo)
mysql -u root -p flexoapp < backend/Database/Scripts/00_MASTER_CREATE_ALL_TABLES.sql

# Opción 2: Scripts individuales (en orden)
mysql -u root -p flexoapp < backend/Database/Scripts/01_CREATE_USERS_TABLE.sql
mysql -u root -p flexoapp < backend/Database/Scripts/02_CREATE_ACTIVITIES_TABLE.sql
mysql -u root -p flexoapp < backend/Database/Scripts/03_CREATE_DESIGNS_TABLE.sql
mysql -u root -p flexoapp < backend/Database/Scripts/04_CREATE_MAQUINAS_TABLE_UPDATED.sql
mysql -u root -p flexoapp < backend/Database/Scripts/07_CREATE_DOCUMENTO_TABLE.sql
mysql -u root -p flexoapp < backend/Database/Scripts/08_CREATE_REFRESH_TOKENS_TABLE.sql
mysql -u root -p flexoapp < backend/Database/Scripts/09_CREATE_ANILOX_TABLE.sql
mysql -u root -p flexoapp < backend/Database/Scripts/10_CREATE_CONDICIONUNICA_TABLE.sql
mysql -u root -p flexoapp < backend/Database/Scripts/11_CREATE_MACHINE_CONFIG_TABLE.sql
mysql -u root -p flexoapp < backend/Database/Scripts/12_CREATE_MAQUINAS_BACKUP_TABLE.sql
mysql -u root -p flexoapp < backend/Database/Scripts/CREATE_PERMISSIONS_TABLES.sql
```

### 4. Verificar Instalación

```sql
USE flexoapp;
SHOW TABLES;
```

Deberías ver estas tablas:
- `users`
- `activities`
- `designs`
- `maquinas`
- `documentos`
- `refresh_tokens`
- `anilox`
- `condicionunica`
- `machine_config`
- `maquinas_backup`
- `permissions`
- `user_permissions`

### 5. Datos Iniciales

El backend crea automáticamente el usuario admin al iniciar:
- **Usuario**: admin
- **Contraseña**: admin123
- **Rol**: Administrador

## 🔧 Configuración del Backend

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=flexoapp;User=flexoapp_user;Password=your_secure_password;AllowUserVariables=True;UseAffectedRows=False;"
  }
}
```

### Variables de Entorno (Alternativa)

```bash
# Linux/Mac
export ConnectionStrings__DefaultConnection="Server=localhost;Port=3306;Database=flexoapp;User=root;Password=your_password;"

# Windows PowerShell
$env:ConnectionStrings__DefaultConnection="Server=localhost;Port=3306;Database=flexoapp;User=root;Password=your_password;"

# Windows CMD
set ConnectionStrings__DefaultConnection=Server=localhost;Port=3306;Database=flexoapp;User=root;Password=your_password;
```

## 🚢 Configuración Railway

### 1. Crear Servicio MySQL en Railway

1. En tu proyecto Railway, haz clic en "+ New"
2. Selecciona "Database" → "Add MySQL"
3. Railway creará automáticamente la base de datos

### 2. Obtener Credenciales

En el servicio MySQL, ve a "Variables" y copia:
- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLDATABASE`
- `MYSQLUSER`
- `MYSQLPASSWORD`

### 3. Conectar desde Local (Opcional)

Usa las credenciales de Railway para conectarte desde MySQL Workbench:

```
Host: [MYSQLHOST]
Port: [MYSQLPORT]
Database: [MYSQLDATABASE]
User: [MYSQLUSER]
Password: [MYSQLPASSWORD]
```

### 4. Ejecutar Scripts

Conectado a Railway, ejecuta los scripts de creación:

```sql
-- Ejecutar cada script manualmente desde MySQL Workbench
-- o usar el script maestro
```

### 5. Configurar Backend

Las variables de entorno se configuran automáticamente en Railway cuando vinculas el servicio MySQL con el backend.

## 📊 Esquema de Base de Datos

### Tabla: users
```sql
CREATE TABLE users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    FullName VARCHAR(100),
    Role VARCHAR(20) NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    ProfilePhotoUrl VARCHAR(500),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabla: maquinas
```sql
CREATE TABLE maquinas (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ot_sap VARCHAR(50),
    Articulo VARCHAR(200),
    Cliente VARCHAR(200),
    Kilos DECIMAL(10,3),
    metros INT,
    Estado VARCHAR(50),
    Observaciones TEXT,
    -- ... más campos
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Ver [esquema completo](./DATABASE_SCHEMA.md) para todas las tablas.

## 🔍 Consultas Útiles

### Ver todas las máquinas
```sql
SELECT * FROM maquinas ORDER BY CreatedAt DESC LIMIT 10;
```

### Ver usuarios activos
```sql
SELECT Id, Username, Email, Role, IsActive FROM users WHERE IsActive = TRUE;
```

### Ver actividades recientes
```sql
SELECT a.*, u.Username 
FROM activities a 
JOIN users u ON a.UserId = u.Id 
ORDER BY a.Timestamp DESC 
LIMIT 20;
```

### Estadísticas de máquinas por estado
```sql
SELECT Estado, COUNT(*) as Total 
FROM maquinas 
GROUP BY Estado;
```

## 🛠️ Mantenimiento

### Backup Manual

```bash
# Backup completo
mysqldump -u root -p flexoapp > backup_$(date +%Y%m%d).sql

# Backup solo estructura
mysqldump -u root -p --no-data flexoapp > schema_$(date +%Y%m%d).sql

# Backup solo datos
mysqldump -u root -p --no-create-info flexoapp > data_$(date +%Y%m%d).sql
```

### Restaurar Backup

```bash
mysql -u root -p flexoapp < backup_20260226.sql
```

### Limpiar Logs Antiguos

```sql
-- Eliminar actividades de más de 6 meses
DELETE FROM activities WHERE Timestamp < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- Eliminar tokens expirados
DELETE FROM refresh_tokens WHERE ExpiresAt < NOW();
```

### Optimizar Tablas

```sql
OPTIMIZE TABLE maquinas;
OPTIMIZE TABLE activities;
OPTIMIZE TABLE users;
```

## 🔐 Seguridad

### Mejores Prácticas

1. **Usar usuario específico** (no root) para la aplicación
2. **Contraseñas fuertes** para usuarios de base de datos
3. **Backups regulares** (diarios recomendado)
4. **Limitar acceso** solo desde IPs conocidas
5. **SSL/TLS** para conexiones remotas

### Configurar SSL (Producción)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=host;Database=flexoapp;User=user;Password=pass;SslMode=Required;"
  }
}
```

## 📝 Troubleshooting

### Error: "Access denied for user"
```bash
# Verificar usuario y contraseña
mysql -u flexoapp_user -p

# Verificar permisos
SHOW GRANTS FOR 'flexoapp_user'@'localhost';
```

### Error: "Unknown database 'flexoapp'"
```bash
# Crear la base de datos
mysql -u root -p -e "CREATE DATABASE flexoapp;"
```

### Error: "Table doesn't exist"
```bash
# Ejecutar scripts de creación
mysql -u root -p flexoapp < backend/Database/Scripts/00_MASTER_CREATE_ALL_TABLES.sql
```

### Conexión lenta
```sql
-- Verificar índices
SHOW INDEX FROM maquinas;

-- Analizar queries lentas
SHOW PROCESSLIST;
```

## 📚 Referencias

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Entity Framework Core](https://docs.microsoft.com/ef/core/)
- [Railway MySQL](https://docs.railway.app/databases/mysql)

---

**Última actualización**: Febrero 2026
