-- =====================================================
-- Script: 16_ADD_CARPETA_ESTANTE_TO_COD_TINTAS.sql
-- Descripción: Agregar campos estante y carpeta a cod_tintas
-- Fecha: 2026-04-01
-- IDEMPOTENTE: puede ejecutarse múltiples veces
-- =====================================================

USE flexoapp_bd;

-- ===== AGREGAR COLUMNA ESTANTE =====
SET @col1 = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cod_tintas' AND COLUMN_NAME = 'estante'
);
SET @sql1 = IF(@col1 = 0,
    'ALTER TABLE cod_tintas ADD COLUMN estante VARCHAR(100) NULL COMMENT ''Estante de ubicación'' AFTER descripcion',
    'SELECT ''Columna estante ya existe'' AS status'
);
PREPARE stmt FROM @sql1;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===== AGREGAR COLUMNA CARPETA =====
SET @col2 = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cod_tintas' AND COLUMN_NAME = 'carpeta'
);
SET @sql2 = IF(@col2 = 0,
    'ALTER TABLE cod_tintas ADD COLUMN carpeta VARCHAR(100) NULL COMMENT ''Número de carpeta'' AFTER estante',
    'SELECT ''Columna carpeta ya existe'' AS status'
);
PREPARE stmt FROM @sql2;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===== AGREGAR COLUMNA LINEA_TINTA =====
SET @col3 = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cod_tintas' AND COLUMN_NAME = 'linea_tinta'
);
SET @sql3 = IF(@col3 = 0,
    'ALTER TABLE cod_tintas ADD COLUMN linea_tinta VARCHAR(100) NULL COMMENT ''Línea de tinta (Flexo UV, Base Agua, etc.)'' AFTER carpeta',
    'SELECT ''Columna linea_tinta ya existe'' AS status'
);
PREPARE stmt FROM @sql3;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===== AGREGAR ÍNDICES =====
SET @idx1 = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cod_tintas' AND INDEX_NAME = 'idx_cod_tintas_estante'
);
SET @sqlidx1 = IF(@idx1 = 0,
    'CREATE INDEX idx_cod_tintas_estante ON cod_tintas (estante)',
    'SELECT ''Índice estante ya existe'' AS status'
);
PREPARE stmt FROM @sqlidx1;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx2 = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cod_tintas' AND INDEX_NAME = 'idx_cod_tintas_carpeta'
);
SET @sqlidx2 = IF(@idx2 = 0,
    'CREATE INDEX idx_cod_tintas_carpeta ON cod_tintas (carpeta)',
    'SELECT ''Índice carpeta ya existe'' AS status'
);
PREPARE stmt FROM @sqlidx2;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===== VERIFICACIÓN =====
SELECT 
    COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'cod_tintas'
    AND COLUMN_NAME IN ('estante', 'carpeta', 'linea_tinta')
ORDER BY ORDINAL_POSITION;

SELECT '✓ Campos estante, carpeta y linea_tinta listos en cod_tintas' AS status;
