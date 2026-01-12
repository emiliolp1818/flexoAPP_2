-- =====================================================
-- MIGRACIÓN: Actualizar precisión decimal de columna kilos
-- FECHA: 2026-01-12
-- DESCRIPCIÓN: Cambiar columna kilos de DECIMAL(10,2) a DECIMAL(10,3)
--              para permitir 3 decimales (ej: 2.234 kilos)
-- =====================================================

-- Verificar estructura actual
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    NUMERIC_PRECISION,
    NUMERIC_SCALE,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'maquinas' 
AND COLUMN_NAME = 'kilos';

-- Actualizar columna kilos para permitir 3 decimales
ALTER TABLE maquinas 
MODIFY COLUMN kilos DECIMAL(10,3) NOT NULL 
COMMENT 'Cantidad en kilogramos a producir (hasta 3 decimales)';

-- Verificar cambio aplicado
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    NUMERIC_PRECISION,
    NUMERIC_SCALE,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'maquinas' 
AND COLUMN_NAME = 'kilos';

-- Mostrar algunos registros para verificar que los datos se mantienen
SELECT 
    ot_sap,
    articulo,
    kilos,
    cliente
FROM maquinas 
LIMIT 5;