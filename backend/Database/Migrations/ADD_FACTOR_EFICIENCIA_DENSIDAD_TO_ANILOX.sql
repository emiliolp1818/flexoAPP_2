-- =============================================
-- Script: ADD FACTOR EFICIENCIA AND DENSIDAD TO ANILOX
-- Descripción: Agregar campos factor_eficiencia y densidad a la tabla anilox
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-02-12
-- =============================================

-- Verificar si la tabla existe
SELECT COUNT(*) as tabla_existe 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
AND TABLE_NAME = 'anilox';

-- Agregar columna factor_eficiencia si no existe
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'flexoapp_bd' 
    AND TABLE_NAME = 'anilox' 
    AND COLUMN_NAME = 'factor_eficiencia'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `anilox` ADD COLUMN `factor_eficiencia` DECIMAL(5, 2) NULL DEFAULT 35.00 COMMENT ''Factor de eficiencia del anilox'' AFTER `volumen_real`',
    'SELECT ''La columna factor_eficiencia ya existe'' AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar columna densidad si no existe
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'flexoapp_bd' 
    AND TABLE_NAME = 'anilox' 
    AND COLUMN_NAME = 'densidad'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `anilox` ADD COLUMN `densidad` DECIMAL(5, 3) NULL DEFAULT 0.885 COMMENT ''Densidad del anilox'' AFTER `factor_eficiencia`',
    'SELECT ''La columna densidad ya existe'' AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar todos los registros existentes con los valores por defecto
UPDATE `anilox` 
SET 
    `factor_eficiencia` = 35.00,
    `densidad` = 0.885
WHERE 
    `factor_eficiencia` IS NULL 
    OR `densidad` IS NULL;

-- Verificar que las columnas se agregaron correctamente
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM 
    information_schema.COLUMNS
WHERE 
    TABLE_SCHEMA = 'flexoapp_bd'
    AND TABLE_NAME = 'anilox'
    AND COLUMN_NAME IN ('factor_eficiencia', 'densidad');

SELECT 'Migración completada exitosamente' AS resultado;
