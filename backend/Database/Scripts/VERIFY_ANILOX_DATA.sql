-- =============================================
-- Script: VERIFY ANILOX DATA
-- Descripción: Verificar que la tabla anilox tenga datos
-- =============================================

-- Verificar si la tabla existe
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME,
    UPDATE_TIME
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'flexoapp_bd'
    AND TABLE_NAME = 'anilox';

-- Contar registros totales
SELECT COUNT(*) as total_anilox FROM anilox;

-- Contar registros por lineatura
SELECT 
    lineatura,
    COUNT(*) as cantidad
FROM 
    anilox
GROUP BY 
    lineatura
ORDER BY 
    lineatura;

-- Mostrar algunos registros de ejemplo
SELECT * FROM anilox LIMIT 10;

-- Verificar registros para lineatura 140
SELECT * FROM anilox WHERE lineatura = 140;
