-- ===== MIGRACIÓN: AGREGAR COLUMNA ESTADO =====
-- Agrega la columna "estado" a la tabla condicionunica
-- Permite gestionar el estado del registro (ACTIVO, INACTIVO, EN REVISIÓN, etc.)
-- Fecha: 2026-01-17
-- Autor: Sistema FlexoAPP

USE flexoapp_bd;

-- Verificar si la columna ya existe antes de agregarla
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'flexoapp_bd'
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

-- Actualizar registros existentes que tengan estado NULL
UPDATE condicionunica 
SET estado = 'ACTIVO' 
WHERE estado IS NULL;

-- Verificar resultado
SELECT 
    CASE 
        WHEN @column_exists = 0 THEN '✅ Columna estado agregada exitosamente'
        ELSE '⚠️ La columna estado ya existía'
    END AS resultado;

-- Mostrar estructura actualizada de la tabla
DESCRIBE condicionunica;

-- Mostrar algunos registros de ejemplo con el nuevo campo
SELECT 
    id,
    farticulo,
    descripcion,
    estante,
    numerocarpeta,
    estado,
    createddate,
    lastmodified
FROM condicionunica
LIMIT 5;
