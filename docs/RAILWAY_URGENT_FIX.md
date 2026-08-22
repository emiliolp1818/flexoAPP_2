# 🚨 FIX URGENTE: No se puede iniciar sesión en Railway

## Problema

El backend está corriendo pero no permite iniciar sesión porque los nombres de columnas en la base de datos no coinciden con el código.

## Solución Rápida (5 minutos)

### PASO 1: Identificar el nombre de tu base de datos

En Railway Dashboard:
1. Ve a tu servicio MySQL
2. Click en "Variables"
3. Busca `MYSQLDATABASE` - ese es el nombre de tu base de datos
4. Anota el nombre (probablemente sea `railway` o similar)

### PASO 2: Ejecutar el script

#### Opción A: MySQL Workbench (Recomendado si ya lo tienes)

1. **Conectar a Railway MySQL:**
   - Host: Valor de `MYSQLHOST`
   - Port: Valor de `MYSQLPORT` (usualmente 3306)
   - Username: Valor de `MYSQLUSER`
   - Password: Valor de `MYSQLPASSWORD`
   - Database: Valor de `MYSQLDATABASE`

2. **Seleccionar la base de datos:**
   - En el panel izquierdo (SCHEMAS), haz doble click en el nombre de tu base de datos
   - Debería aparecer en negrita

3. **Ejecutar el script:**
   - Copia y pega el script de abajo
   - Click en el rayo ⚡ o presiona Ctrl+Enter

#### Opción B: Railway CLI

```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Link al proyecto
railway link

# 4. Conectar a MySQL
railway connect mysql

# 5. Seleccionar base de datos (reemplaza 'railway' con tu nombre)
USE railway;

# 6. Copiar y pegar el resto del script
```

### SCRIPT SQL A EJECUTAR

```sql
-- PASO 1: Seleccionar base de datos (reemplaza 'railway' con tu nombre de BD)
USE railway;

-- PASO 2: Renombrar columnas de tabla USERS
ALTER TABLE `users` 
    CHANGE COLUMN `id` `Id` INT AUTO_INCREMENT,
    CHANGE COLUMN `username` `UserCode` VARCHAR(50) NOT NULL,
    CHANGE COLUMN `password_hash` `Password` VARCHAR(255) NOT NULL,
    CHANGE COLUMN `first_name` `FirstName` VARCHAR(50) NULL,
    CHANGE COLUMN `last_name` `LastName` VARCHAR(50) NULL,
    CHANGE COLUMN `is_active` `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
    CHANGE COLUMN `created_at` `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CHANGE COLUMN `updated_at` `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6);

-- TABLA USERS: Agregar columnas faltantes
ALTER TABLE `users` 
    ADD COLUMN `Role` VARCHAR(50) NOT NULL DEFAULT 'Operario' AFTER `LastName`,
    ADD COLUMN `Permissions` JSON NULL AFTER `Role`,
    ADD COLUMN `ProfileImage` LONGTEXT NULL AFTER `Permissions`,
    ADD COLUMN `Phone` VARCHAR(20) NULL AFTER `Email`;

-- TABLA DESIGNS: Renombrar columnas
ALTER TABLE `designs` 
    CHANGE COLUMN `id` `Id` INT AUTO_INCREMENT,
    CHANGE COLUMN `client` `Client` VARCHAR(200) NULL,
    CHANGE COLUMN `description` `Description` VARCHAR(500) NULL,
    CHANGE COLUMN `substrate` `Substrate` VARCHAR(100) NULL,
    CHANGE COLUMN `type` `Type` VARCHAR(50) NULL,
    CHANGE COLUMN `printType` `PrintType` VARCHAR(50) NULL,
    CHANGE COLUMN `status` `Status` VARCHAR(50) NULL,
    CHANGE COLUMN `created_at` `CreatedDate` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_at` `LastModified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

SELECT '✅ Migración completada' AS resultado;
```

```bash
# 6. Presionar Enter para ejecutar

# 7. Salir de MySQL
exit

# 8. Reiniciar el servicio en Railway Dashboard
```

### Opción 2: Railway Dashboard (Más fácil)

1. Ve a tu proyecto en Railway Dashboard
2. Click en el servicio MySQL
3. Click en "Connect" o "Query"
4. Copia y pega el script SQL de arriba
5. Click en "Execute" o presiona Enter
6. Ve al servicio backend y click en "Restart"

### Opción 3: MySQL Workbench / DBeaver

1. Obtén las credenciales de MySQL desde Railway:
   - Host: `MYSQLHOST` de las variables de entorno
   - Port: `MYSQLPORT` (usualmente 3306)
   - Database: `MYSQLDATABASE`
   - User: `MYSQLUSER`
   - Password: `MYSQLPASSWORD`

2. Conecta con tu cliente MySQL favorito

3. Ejecuta el script SQL de arriba

4. Reinicia el backend en Railway

## Verificación

Después de ejecutar el script:

```sql
-- Verificar que las columnas se renombraron correctamente
DESCRIBE users;
DESCRIBE designs;

-- Deberías ver columnas en PascalCase:
-- Id, UserCode, Password, FirstName, LastName, Role, etc.
```

## ¿Por qué pasó esto?

El script master que se ejecutó inicialmente en Railway tenía nombres de columnas en snake_case (`created_at`, `first_name`) pero el código C# espera PascalCase (`CreatedAt`, `FirstName`).

## Después del Fix

Una vez ejecutado el script:

1. ✅ Podrás iniciar sesión con: `admin` / `admin123`
2. ✅ El dashboard cargará correctamente
3. ✅ Todos los endpoints funcionarán
4. ✅ No más errores de "Unknown column"

## Problemas Comunes

### Error: "Column already exists"
Si ves este error, significa que algunas columnas ya están correctas. Ejecuta solo las líneas que faltan.

### Error: "Unknown column in CHANGE"
Significa que la columna ya fue renombrada. Puedes ignorar este error.

### Error: "Duplicate column name"
Significa que la columna ya existe con el nuevo nombre. Puedes ignorar este error.

## Contacto

Si tienes problemas ejecutando el script, comparte el error exacto que recibes.

---

**Archivo del script:** `backend/Database/Scripts/QUICK_FIX_RAILWAY.sql`  
**Fecha:** 2026-03-08  
**Urgencia:** 🔴 ALTA - Bloquea login
