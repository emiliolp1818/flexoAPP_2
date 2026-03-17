# Fix: Error de Nombres de Columnas - Users y Designs

## 🐛 Errores Originales

```
[ERR] Unknown column 'u.CreatedAt' in 'field list'
[ERR] Unknown column 'd.CreatedDate' in 'field list'
[ERR] Unknown column 'u.Id' in 'field list'
```

## 🔍 Causa Raíz

El script master (`00_MASTER_CREATE_ALL_TABLES.sql`) tenía nombres de columnas en **snake_case** que no coincidían con las entidades C# en **PascalCase**.

### Tabla USERS

**Script Master (INCORRECTO):**
```sql
CREATE TABLE `users` (
    `id` INT,                    -- ❌ Debería ser `Id`
    `username` VARCHAR(50),      -- ❌ Debería ser `UserCode`
    `password_hash` VARCHAR(255),-- ❌ Debería ser `Password`
    `first_name` VARCHAR(100),   -- ❌ Debería ser `FirstName`
    `last_name` VARCHAR(100),    -- ❌ Debería ser `LastName`
    `is_active` BOOLEAN,         -- ❌ Debería ser `IsActive`
    `created_at` DATETIME,       -- ❌ Debería ser `CreatedAt`
    `updated_at` DATETIME,       -- ❌ Debería ser `UpdatedAt`
    -- ❌ FALTAN: Role, Permissions, ProfileImage, Phone
);
```

**Entidad C# (CORRECTO):**
```csharp
public class User {
    public int Id { get; set; }
    public string UserCode { get; set; }
    public string Password { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string Role { get; set; }
    public string Permissions { get; set; }
    public string ProfileImage { get; set; }
    public string Phone { get; set; }
}
```

### Tabla DESIGNS

**Script Master (INCORRECTO):**
```sql
CREATE TABLE `designs` (
    `id` INT,                -- ❌ Debería ser `Id`
    `client` VARCHAR(200),   -- ❌ Debería ser `Client`
    `description` VARCHAR(500), -- ❌ Debería ser `Description`
    `substrate` VARCHAR(100),-- ❌ Debería ser `Substrate`
    `type` VARCHAR(50),      -- ❌ Debería ser `Type`
    `printType` VARCHAR(50), -- ❌ Debería ser `PrintType`
    `status` VARCHAR(50),    -- ❌ Debería ser `Status`
    `created_at` DATETIME,   -- ❌ Debería ser `CreatedDate`
    `updated_at` DATETIME,   -- ❌ Debería ser `LastModified`
);
```

**Entidad C# (CORRECTO):**
```csharp
public class Design {
    public int Id { get; set; }
    public string Client { get; set; }
    public string Description { get; set; }
    public string Substrate { get; set; }
    public string Type { get; set; }
    public string PrintType { get; set; }
    public string Status { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime LastModified { get; set; }
}
```

## ✅ Solución Aplicada

### 1. Corregir Script Master (Commit: e7101b4)

Actualizado `00_MASTER_CREATE_ALL_TABLES.sql` con nombres correctos en PascalCase.

### 2. Script de Migración para Railway

Creado `MIGRATE_COLUMN_NAMES_RAILWAY.sql` que:
- ✅ Detecta si las tablas tienen nombres antiguos
- ✅ Renombra columnas automáticamente
- ✅ Agrega columnas faltantes
- ✅ Preserva todos los datos existentes
- ✅ No falla si ya están correctas

## 🚀 Cómo Ejecutar la Migración en Railway

### Opción 1: Desde Railway CLI

```bash
# Conectar a Railway
railway login

# Conectar a MySQL
railway connect mysql

# Ejecutar script de migración
source backend/Database/Scripts/MIGRATE_COLUMN_NAMES_RAILWAY.sql
```

### Opción 2: Desde MySQL Workbench / DBeaver

1. Conectar a la base de datos de Railway
2. Abrir `backend/Database/Scripts/MIGRATE_COLUMN_NAMES_RAILWAY.sql`
3. Ejecutar el script completo
4. Verificar con:
   ```sql
   DESCRIBE users;
   DESCRIBE designs;
   ```

### Opción 3: Recrear Base de Datos (SOLO SI NO HAY DATOS IMPORTANTES)

```bash
# Conectar a Railway MySQL
railway connect mysql

# Ejecutar master script
source backend/Database/Scripts/00_MASTER_CREATE_ALL_TABLES.sql
```

⚠️ **ADVERTENCIA:** Esta opción elimina TODOS los datos existentes.

## 📊 Cambios Detallados

### Tabla USERS

| Columna Antigua | Columna Nueva | Tipo | Cambios |
|----------------|---------------|------|---------|
| `id` | `Id` | INT | Renombrada |
| `username` | `UserCode` | VARCHAR(50) | Renombrada |
| `password_hash` | `Password` | VARCHAR(255) | Renombrada |
| `first_name` | `FirstName` | VARCHAR(50) | Renombrada |
| `last_name` | `LastName` | VARCHAR(50) | Renombrada |
| `is_active` | `IsActive` | TINYINT(1) | Renombrada |
| `created_at` | `CreatedAt` | DATETIME(6) | Renombrada + precisión |
| `updated_at` | `UpdatedAt` | DATETIME(6) | Renombrada + precisión |
| - | `Role` | VARCHAR(50) | ✅ Agregada |
| - | `Permissions` | JSON | ✅ Agregada |
| - | `ProfileImage` | LONGTEXT | ✅ Agregada |
| - | `Phone` | VARCHAR(20) | ✅ Agregada |

### Tabla DESIGNS

| Columna Antigua | Columna Nueva | Tipo | Cambios |
|----------------|---------------|------|---------|
| `id` | `Id` | INT | Renombrada |
| `client` | `Client` | VARCHAR(200) | Renombrada |
| `description` | `Description` | VARCHAR(500) | Renombrada |
| `substrate` | `Substrate` | VARCHAR(100) | Renombrada |
| `type` | `Type` | VARCHAR(50) | Renombrada |
| `printType` | `PrintType` | VARCHAR(50) | Renombrada |
| `status` | `Status` | VARCHAR(50) | Renombrada |
| `created_at` | `CreatedDate` | DATETIME | Renombrada |
| `updated_at` | `LastModified` | DATETIME | Renombrada |

## 🎯 Resultado Esperado

### Antes:
```
❌ Error: Unknown column 'u.CreatedAt' in 'field list'
❌ Error: Unknown column 'd.CreatedDate' in 'field list'
❌ Dashboard no carga
❌ Usuarios no se muestran
❌ Diseños no se cargan
```

### Después:
```
✅ Todas las queries funcionan correctamente
✅ Dashboard carga sin errores
✅ Usuarios se muestran correctamente
✅ Diseños se cargan sin problemas
✅ Nombres de columnas coinciden con entidades C#
```

## 🔍 Verificación

Después de ejecutar la migración, verificar con:

```sql
-- Verificar estructura de users
DESCRIBE users;

-- Verificar estructura de designs
DESCRIBE designs;

-- Probar query de usuarios
SELECT Id, UserCode, FirstName, LastName, CreatedAt FROM users LIMIT 5;

-- Probar query de diseños
SELECT Id, ArticleF, Client, Description, CreatedDate FROM designs LIMIT 5;
```

## 📝 Archivos Modificados

1. **backend/Database/Scripts/00_MASTER_CREATE_ALL_TABLES.sql**
   - Tabla users actualizada con nombres correctos
   - Tabla designs actualizada con nombres correctos

2. **backend/Database/Scripts/MIGRATE_COLUMN_NAMES_RAILWAY.sql** (NUEVO)
   - Script de migración para Railway
   - Renombra columnas existentes
   - Agrega columnas faltantes
   - Preserva datos

## 🚨 Notas Importantes

1. **Backup Recomendado**: Antes de ejecutar la migración, hacer backup de la base de datos
2. **Downtime**: La migración puede tomar unos segundos, considerar hacerla en horario de bajo tráfico
3. **Verificación**: Después de la migración, verificar que todas las funcionalidades funcionen correctamente
4. **Rollback**: Si algo sale mal, restaurar desde el backup

## 📚 Referencias

- Script master: `backend/Database/Scripts/00_MASTER_CREATE_ALL_TABLES.sql`
- Script de migración: `backend/Database/Scripts/MIGRATE_COLUMN_NAMES_RAILWAY.sql`
- Entidad User: `backend/Models/Entities/User.cs`
- Entidad Design: `backend/Models/Entities/Design.cs`

---

**Commit:** e7101b4  
**Fecha:** 2026-03-08  
**Branch:** render  
**Estado:** ✅ Resuelto (requiere ejecutar migración en Railway)
