-- =====================================================
-- MIGRACIÓN: Agregar campo ancho_mm a tabla designs
-- Fecha: 2026-02-11
-- Descripción: Agrega campo ancho_mm (ancho en milímetros)
-- =====================================================

USE flexoapp_bd;

-- ===== VERIFICAR SI LA COLUMNA YA EXISTE =====
-- Esto evita errores si el script se ejecuta múltiples veces

SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'flexoapp_bd' 
    AND TABLE_NAME = 'designs' 
    AND COLUMN_NAME = 'ancho_mm'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE designs ADD COLUMN ancho_mm INT NULL COMMENT ''Ancho en milímetros'' AFTER Type',
    'SELECT ''La columna ancho_mm ya existe'' AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===== VERIFICAR ESTRUCTURA ACTUALIZADA =====
SELECT 
    COLUMN_NAME AS 'Columna',
    COLUMN_TYPE AS 'Tipo',
    IS_NULLABLE AS 'Permite NULL',
    COLUMN_DEFAULT AS 'Valor por defecto',
    COLUMN_COMMENT AS 'Comentario'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
AND TABLE_NAME = 'designs'
AND COLUMN_NAME = 'ancho_mm'
ORDER BY ORDINAL_POSITION;

-- ===== MENSAJE DE CONFIRMACIÓN =====
SELECT 
    '✅ Migración completada exitosamente' AS 'Estado',
    'Se agregó el campo ancho_mm a la tabla designs' AS 'Descripción',
    NOW() AS 'Fecha de ejecución';
