-- =====================================================
-- VERIFICACIÓN SIMPLE: Solo ver columnas
-- =====================================================

-- Ver TODAS las columnas de la tabla maquinas
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'maquinas'
ORDER BY ORDINAL_POSITION;
