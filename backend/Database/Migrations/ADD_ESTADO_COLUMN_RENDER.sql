-- ===== MIGRACIÓN PARA RENDER: AGREGAR COLUMNA ESTADO =====
-- Este script agrega la columna "estado" a la tabla condicionunica en Render
-- Ejecutar este script en la base de datos de producción de Render

-- IMPORTANTE: Reemplazar 'railway' con el nombre real de tu base de datos en Render
-- Si tu base de datos se llama diferente, cambia 'railway' por el nombre correcto

-- Verificar si la columna ya existe antes de agregarla
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

-- Actualizar registros existentes que tengan estado NULL
UPDATE condicionunica 
SET estado = 'ACTIVO' 
WHERE estado IS NULL;

-- Verificar resultado
SELECT 
    CASE 
        WHEN @column_exists = 0 THEN 'Columna estado agregada exitosamente'
        ELSE 'La columna estado ya existía'
    END AS resultado;

-- Mostrar estructura actualizada de la tabla
DESCRIBE condicionunica;

-- Contar registros actualizados
SELECT COUNT(*) as total_registros FROM condicionunica;
