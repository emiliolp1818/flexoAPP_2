-- =============================================
-- HOTFIX: Agregar columnas factor_eficiencia y densidad a tabla anilox
-- Descripción: Script seguro que verifica existencia antes de agregar
-- Fecha: 2026-02-14
-- =============================================

-- Agregar factor_eficiencia si no existe
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'anilox'
    AND COLUMN_NAME = 'factor_eficiencia'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE anilox ADD COLUMN factor_eficiencia DECIMAL(5, 2) NULL DEFAULT 35.00 COMMENT ''Factor de eficiencia del anilox (35%)''',
    'SELECT ''Columna factor_eficiencia ya existe'' AS resultado'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar densidad si no existe
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'anilox'
    AND COLUMN_NAME = 'densidad'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE anilox ADD COLUMN densidad DECIMAL(5, 3) NULL DEFAULT 0.885 COMMENT ''Densidad del anilox (0.885)''',
    'SELECT ''Columna densidad ya existe'' AS resultado'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar que las columnas fueron agregadas
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_DEFAULT,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'anilox'
AND COLUMN_NAME IN ('factor_eficiencia', 'densidad')
ORDER BY ORDINAL_POSITION;

SELECT '✓ Columnas agregadas exitosamente a tabla anilox' AS resultado;
