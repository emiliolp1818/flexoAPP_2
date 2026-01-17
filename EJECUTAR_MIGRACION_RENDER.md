# 🚀 Ejecutar Migración de Columna Estado en Render

## ⚠️ Problema Actual

El frontend en Render está mostrando error **400 Bad Request** al intentar cargar la tabla de Condición Única porque:

1. ✅ El código del backend ya tiene el campo `estado` en el modelo
2. ✅ El código del frontend ya envía el campo `estado`
3. ❌ **La base de datos en Render NO tiene la columna `estado`**

**Error en consola:**
```
Failed to load resource: the server responded with a status of 400
flexoapp-backend.onrender.com/api/condicion-unica
```

---

## 🎯 Solución: Ejecutar Migración SQL en Render

Necesitas ejecutar el script SQL en la base de datos de producción de Render para agregar la columna `estado`.

---

## 📋 Pasos para Ejecutar la Migración

### Opción 1: Desde el Panel de Render (Recomendado)

#### 1. Acceder a la Base de Datos en Render

1. Ir a [Render Dashboard](https://dashboard.render.com/)
2. Seleccionar tu servicio de base de datos (PostgreSQL o MySQL)
3. Ir a la pestaña **"Shell"** o **"Connect"**

#### 2. Conectarse a la Base de Datos

Render te proporcionará un comando de conexión. Ejemplo:

**Para PostgreSQL:**
```bash
psql postgresql://usuario:password@host:puerto/database
```

**Para MySQL:**
```bash
mysql -h host -P puerto -u usuario -p database
```

#### 3. Ejecutar el Script SQL

Una vez conectado, ejecuta los siguientes comandos:

```sql
-- Verificar si la columna ya existe
SELECT COUNT(*) as columna_existe
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'condicionunica'
AND COLUMN_NAME = 'estado';

-- Si el resultado es 0, ejecutar:
ALTER TABLE condicionunica 
ADD COLUMN estado VARCHAR(50) DEFAULT 'ACTIVO' 
AFTER numerocarpeta;

-- Actualizar registros existentes
UPDATE condicionunica 
SET estado = 'ACTIVO' 
WHERE estado IS NULL;

-- Verificar que se agregó correctamente
DESCRIBE condicionunica;
```

---

### Opción 2: Usando Cliente de Base de Datos (MySQL Workbench, DBeaver, etc.)

#### 1. Obtener Credenciales de Conexión

En Render Dashboard:
1. Ir a tu servicio de base de datos
2. Copiar las credenciales de conexión:
   - **Host** (Internal/External)
   - **Port**
   - **Database**
   - **Username**
   - **Password**

#### 2. Conectar con tu Cliente

Configurar una nueva conexión con las credenciales de Render.

#### 3. Ejecutar el Script

Abrir el archivo `backend/Database/Migrations/ADD_ESTADO_COLUMN_RENDER.sql` y ejecutarlo completo.

---

### Opción 3: Desde la Terminal Local

#### 1. Instalar Cliente de Base de Datos

**Para MySQL:**
```bash
# Windows (con Chocolatey)
choco install mysql-cli

# Mac
brew install mysql-client

# Linux
sudo apt-get install mysql-client
```

**Para PostgreSQL:**
```bash
# Windows (con Chocolatey)
choco install postgresql

# Mac
brew install postgresql

# Linux
sudo apt-get install postgresql-client
```

#### 2. Conectar a Render

Usar las credenciales de Render para conectar:

**MySQL:**
```bash
mysql -h [RENDER_HOST] -P [PUERTO] -u [USUARIO] -p [DATABASE]
# Cuando pida password, ingresar el password de Render
```

**PostgreSQL:**
```bash
psql postgresql://[USUARIO]:[PASSWORD]@[HOST]:[PUERTO]/[DATABASE]
```

#### 3. Ejecutar el Script

Copiar y pegar el contenido del archivo `ADD_ESTADO_COLUMN_RENDER.sql` en la terminal.

---

## 📝 Script SQL Completo

```sql
-- Verificar si la columna ya existe
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'condicionunica'
    AND COLUMN_NAME = 'estado'
);

-- Agregar columna solo si no existe
SET @sql = IF(
    @column_exists = 0,
    'ALTER TABLE condicionunica ADD COLUMN estado VARCHAR(50) DEFAULT ''ACTIVO'' AFTER numerocarpeta',
    'SELECT ''La columna estado ya existe'' AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar registros existentes
UPDATE condicionunica 
SET estado = 'ACTIVO' 
WHERE estado IS NULL;

-- Verificar resultado
DESCRIBE condicionunica;
```

---

## ✅ Verificación Post-Migración

### 1. Verificar Estructura de la Tabla

```sql
DESCRIBE condicionunica;
```

**Resultado esperado:**
```
+---------------+--------------+------+-----+-------------------+
| Field         | Type         | Null | Key | Default           |
+---------------+--------------+------+-----+-------------------+
| id            | int          | NO   | PRI | NULL              |
| farticulo     | varchar(50)  | NO   | UNI | NULL              |
| descripcion   | varchar(500) | NO   |     | NULL              |
| estante       | varchar(50)  | NO   |     | NULL              |
| numerocarpeta | varchar(50)  | NO   |     | NULL              |
| estado        | varchar(50)  | YES  |     | ACTIVO            | ← NUEVA COLUMNA
| createddate   | datetime     | YES  |     | CURRENT_TIMESTAMP |
| lastmodified  | datetime     | YES  |     | CURRENT_TIMESTAMP |
+---------------+--------------+------+-----+-------------------+
```

### 2. Verificar Datos

```sql
SELECT id, farticulo, descripcion, estado 
FROM condicionunica 
LIMIT 5;
```

Todos los registros deberían tener `estado = 'ACTIVO'`.

### 3. Reiniciar el Backend en Render

Después de ejecutar la migración:

1. Ir a Render Dashboard
2. Seleccionar tu servicio de backend
3. Click en **"Manual Deploy"** → **"Deploy latest commit"**
4. Esperar a que el deploy termine

### 4. Probar el Frontend

1. Abrir la aplicación en Render
2. Ir al módulo "Condición Única"
3. Verificar que la tabla carga correctamente
4. Verificar que la columna "Estado" aparece con badges de colores
5. Crear un nuevo registro y verificar que funciona

---

## 🔍 Troubleshooting

### Error: "Column 'estado' cannot be null"

**Causa:** La columna se agregó sin valor por defecto.

**Solución:**
```sql
ALTER TABLE condicionunica 
MODIFY COLUMN estado VARCHAR(50) DEFAULT 'ACTIVO';

UPDATE condicionunica 
SET estado = 'ACTIVO' 
WHERE estado IS NULL;
```

### Error: "Table 'condicionunica' doesn't exist"

**Causa:** La tabla no existe en la base de datos de Render.

**Solución:** Ejecutar primero el script de creación de la tabla:
```sql
-- Ejecutar el contenido de:
backend/Database/Scripts/10_CREATE_CONDICIONUNICA_TABLE.sql
```

### Error: "Access denied"

**Causa:** Las credenciales de conexión son incorrectas.

**Solución:** Verificar las credenciales en Render Dashboard y asegurarse de usar las credenciales correctas (Internal o External según desde dónde te conectes).

---

## 📊 Resumen

| Paso | Acción | Estado |
|------|--------|--------|
| 1 | Conectar a base de datos de Render | ⏳ Pendiente |
| 2 | Ejecutar script SQL de migración | ⏳ Pendiente |
| 3 | Verificar columna agregada | ⏳ Pendiente |
| 4 | Reiniciar backend en Render | ⏳ Pendiente |
| 5 | Probar frontend | ⏳ Pendiente |

---

## 🎯 Resultado Esperado

Después de ejecutar la migración:

✅ La tabla `condicionunica` tendrá la columna `estado`  
✅ Todos los registros existentes tendrán `estado = 'ACTIVO'`  
✅ El frontend cargará la tabla sin errores 400  
✅ Los badges de estado se mostrarán correctamente:
- 🟢 ACTIVO (verde)
- 🔴 INACTIVO (rojo)
- 🟡 EN REVISIÓN (amarillo)

---

## 📞 Ayuda Adicional

Si tienes problemas ejecutando la migración:

1. Verifica que tienes acceso a la base de datos en Render
2. Verifica que la tabla `condicionunica` existe
3. Verifica que tienes permisos para ejecutar ALTER TABLE
4. Contacta al soporte de Render si no puedes acceder a la base de datos

---

**Fecha:** 17 de enero de 2026  
**Archivo de migración:** `backend/Database/Migrations/ADD_ESTADO_COLUMN_RENDER.sql`  
**Prioridad:** 🔴 ALTA - Requerido para que funcione Condición Única en producción
