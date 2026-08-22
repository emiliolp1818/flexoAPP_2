# Instrucciones de Migración para Railway/Render

## Sistema de Mensajes en Máquinas - Actualización de Base de Datos

**Fecha:** 2026-03-06  
**Versión:** 3.0  
**Propósito:** Aplicar actualizaciones necesarias para el sistema de mensajes en el componente de máquinas

---

## 📋 Resumen de Cambios

El sistema de mensajes ahora guarda los mensajes en el campo `observaciones` de la tabla `maquinas`. Los cambios incluyen:

1. ✅ Campo `observaciones` (VARCHAR(1000)) - Almacena los mensajes
2. ✅ Campo `last_action_by` (VARCHAR(100)) - Usuario que realizó la última acción
3. ✅ Campo `last_action_at` (DATETIME(6)) - Fecha de la última acción
4. ✅ Campo `preparando_started_at` (DATETIME) - Tracking de tiempo en PREPARANDO
5. ✅ Sincronización con tabla `maquinas_backup`

---

## 🚀 Opción 1: Migración Completa (Recomendada)

Este script es **idempotente** y seguro para ejecutar múltiples veces.

### Archivo: `RAILWAY_MIGRATION_COMPLETE.sql`

```bash
# Conectar a la base de datos de Railway/Render
mysql -h <host> -u <usuario> -p <base_datos> < backend/Database/Scripts/RAILWAY_MIGRATION_COMPLETE.sql
```

### ¿Qué hace este script?

- ✅ Verifica y agrega todas las columnas necesarias
- ✅ No elimina datos existentes
- ✅ Actualiza tabla `maquinas` y `maquinas_backup`
- ✅ Normaliza nombres de columnas a snake_case
- ✅ Muestra un resumen de la estructura final

---

## 🎯 Opción 2: Migración Específica para Mensajes

Si solo necesitas actualizar el soporte de mensajes:

### Archivo: `RAILWAY_UPDATE_MAQUINAS_FOR_MESSAGES.sql`

```bash
mysql -h <host> -u <usuario> -p <base_datos> < backend/Database/Scripts/RAILWAY_UPDATE_MAQUINAS_FOR_MESSAGES.sql
```

### ¿Qué hace este script?

- ✅ Agrega/verifica campo `observaciones` (VARCHAR(1000))
- ✅ Agrega/verifica campo `last_action_by` (VARCHAR(100))
- ✅ Agrega/verifica campo `last_action_at` (DATETIME(6))
- ✅ Agrega/verifica campo `preparando_started_at` (DATETIME)
- ✅ Muestra estructura final de las columnas

---

## 🔧 Pasos para Aplicar en Railway

### 1. Acceder a la Base de Datos

```bash
# Opción A: Desde Railway CLI
railway connect mysql

# Opción B: Desde MySQL Client
mysql -h <host> -P <puerto> -u <usuario> -p<password> <base_datos>
```

### 2. Ejecutar el Script

```sql
-- Copiar y pegar el contenido del archivo RAILWAY_MIGRATION_COMPLETE.sql
-- O ejecutar desde archivo:
source /ruta/al/archivo/RAILWAY_MIGRATION_COMPLETE.sql;
```

### 3. Verificar la Migración

```sql
-- Verificar estructura de la tabla maquinas
DESCRIBE maquinas;

-- Verificar columnas específicas
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'maquinas'
  AND COLUMN_NAME IN ('observaciones', 'last_action_by', 'last_action_at', 'preparando_started_at')
ORDER BY ORDINAL_POSITION;
```

---

## 🔧 Pasos para Aplicar en Render

### 1. Acceder al Dashboard de Render

1. Ir a https://dashboard.render.com
2. Seleccionar tu base de datos MySQL
3. Ir a la pestaña "Shell"

### 2. Conectar a la Base de Datos

```bash
mysql -h <internal-host> -u <usuario> -p<password> <base_datos>
```

### 3. Ejecutar el Script

Copiar y pegar el contenido del archivo `RAILWAY_MIGRATION_COMPLETE.sql` en la consola.

### 4. Verificar la Migración

```sql
-- Verificar que las columnas existen
SHOW COLUMNS FROM maquinas LIKE '%observaciones%';
SHOW COLUMNS FROM maquinas LIKE '%last_action%';
SHOW COLUMNS FROM maquinas LIKE '%preparando_started_at%';
```

---

## 📊 Estructura Final de la Tabla `maquinas`

Después de la migración, la tabla `maquinas` tendrá:

```sql
CREATE TABLE `maquinas` (
    -- Campos existentes...
    `estado` VARCHAR(20) NULL,
    `observaciones` VARCHAR(1000) NULL COMMENT 'Observaciones y mensajes',
    `last_action_by` VARCHAR(100) NULL COMMENT 'Último usuario',
    `last_action_at` DATETIME(6) NULL COMMENT 'Fecha última acción',
    `preparando_started_at` DATETIME NULL COMMENT 'Inicio PREPARANDO',
    -- Más campos...
);
```

---

## ✅ Verificación Post-Migración

### 1. Verificar Columnas

```sql
SELECT COUNT(*) as total_columnas
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'maquinas'
  AND COLUMN_NAME IN ('observaciones', 'last_action_by', 'last_action_at', 'preparando_started_at');
-- Debe retornar: 4
```

### 2. Probar Inserción de Mensaje

```sql
-- Actualizar un registro con un mensaje de prueba
UPDATE maquinas
SET observaciones = 'Mensaje de prueba',
    last_action_by = 'Admin',
    last_action_at = NOW()
WHERE ot_sap = '<alguna_ot_existente>'
LIMIT 1;

-- Verificar
SELECT ot_sap, observaciones, last_action_by, last_action_at
FROM maquinas
WHERE observaciones IS NOT NULL
LIMIT 5;
```

### 3. Verificar Funcionamiento en la Aplicación

1. Iniciar sesión en FlexoAPP
2. Ir al componente de Máquinas
3. Seleccionar una máquina
4. Hacer clic en el botón de pausa (naranja)
5. Seleccionar "Enviar mensaje"
6. Escribir un mensaje de prueba
7. Verificar que:
   - ✅ El mensaje se guarda correctamente
   - ✅ El mensaje aparece en la columna de estado
   - ✅ El botón de pausa parpadea cuando hay mensaje
   - ✅ El mensaje es visible para otros operarios

---

## 🔄 Rollback (Si es necesario)

Si necesitas revertir los cambios:

```sql
-- ADVERTENCIA: Esto eliminará los mensajes guardados
ALTER TABLE maquinas DROP COLUMN observaciones;
ALTER TABLE maquinas DROP COLUMN last_action_by;
ALTER TABLE maquinas DROP COLUMN last_action_at;
ALTER TABLE maquinas DROP COLUMN preparando_started_at;
```

---

## 📝 Notas Importantes

1. **Seguridad de Datos:**
   - ✅ Los scripts NO eliminan datos existentes
   - ✅ Solo agregan columnas nuevas
   - ✅ Son idempotentes (pueden ejecutarse múltiples veces)

2. **Compatibilidad:**
   - ✅ Compatible con MySQL 8.0+
   - ✅ Compatible con Railway y Render
   - ✅ No requiere downtime

3. **Mensajes:**
   - Los mensajes se guardan en `observaciones`
   - Máximo 1000 caracteres por mensaje
   - Los mensajes son visibles para todos los operarios
   - Se sincronizan automáticamente vía SignalR

4. **Backup:**
   - La tabla `maquinas_backup` también se actualiza
   - Los mensajes se preservan en el histórico
   - Retención de 6 meses automática

---

## 🆘 Solución de Problemas

### Error: "Column already exists"

**Solución:** Esto es normal, el script detecta columnas existentes y las omite.

### Error: "Access denied"

**Solución:** Verificar que el usuario tenga permisos de ALTER TABLE.

```sql
GRANT ALTER ON <base_datos>.* TO '<usuario>'@'%';
FLUSH PRIVILEGES;
```

### Error: "Table doesn't exist"

**Solución:** Ejecutar primero el script maestro de creación de tablas:

```bash
mysql -h <host> -u <usuario> -p <base_datos> < backend/Database/Scripts/00_MASTER_CREATE_ALL_TABLES.sql
```

---

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Verificar los logs de la base de datos
2. Revisar los permisos del usuario
3. Consultar la documentación de Railway/Render
4. Contactar al equipo de desarrollo

---

## ✨ Resultado Final

Después de aplicar la migración:

- ✅ Los mensajes se guardan en la base de datos
- ✅ Los mensajes son visibles para todos los operarios
- ✅ El sistema rastrea quién y cuándo modificó cada registro
- ✅ Los mensajes aparecen en la columna de estado de la tabla
- ✅ El botón de pausa parpadea cuando hay mensajes pendientes
- ✅ Los mensajes se sincronizan en tiempo real vía SignalR

---

**¡Migración completada exitosamente!** 🎉
