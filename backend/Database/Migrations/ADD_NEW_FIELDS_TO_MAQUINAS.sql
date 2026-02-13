-- =====================================================
-- MIGRACIÓN: Agregar nuevos campos a tabla maquinas
-- Fecha: 2026-02-07
-- Descripción: Agrega campos TIMP (tipo de impresión) y METROS
-- =====================================================

USE flexoapp_bd;

-- ===== VERIFICAR SI LAS COLUMNAS YA EXISTEN =====
-- Esto evita errores si el script se ejecuta múltiples veces

-- Agregar columna TIMP (Tipo de Impresión) si no existe
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'flexoapp_bd' 
    AND TABLE_NAME = 'maquinas' 
    AND COLUMN_NAME = 'tipo_impresion'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE maquinas ADD COLUMN tipo_impresion VARCHAR(50) NULL COMMENT ''Tipo de impresión (ej: 07A)'' AFTER td',
    'SELECT ''La columna tipo_impresion ya existe'' AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar columna METROS si no existe
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'flexoapp_bd' 
    AND TABLE_NAME = 'maquinas' 
    AND COLUMN_NAME = 'metros'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE maquinas ADD COLUMN metros DECIMAL(10,2) NULL DEFAULT 0 COMMENT ''Metros a fabricar'' AFTER kilos',
    'SELECT ''La columna metros ya existe'' AS mensaje'
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
AND TABLE_NAME = 'maquinas'
AND COLUMN_NAME IN ('tipo_impresion', 'metros')
ORDER BY ORDINAL_POSITION;

-- ===== MENSAJE DE CONFIRMACIÓN =====
SELECT 
    '✅ Migración completada exitosamente' AS 'Estado',
    'Se agregaron los campos tipo_impresion y metros a la tabla maquinas' AS 'Descripción',
    NOW() AS 'Fecha de ejecución';
