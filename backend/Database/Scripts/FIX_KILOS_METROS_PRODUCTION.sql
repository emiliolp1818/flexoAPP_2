-- =====================================================
-- HOTFIX PRODUCCIÓN: Corregir Kilos y Metros
-- =====================================================
-- Este script usa nombres de columnas en minúsculas (snake_case)
-- que es el formato típico en producción Railway/Render
-- =====================================================

-- Ver registros problemáticos (intentando diferentes nombres de columnas)
SELECT 'Buscando registros con valores problemáticos...' AS paso;

-- Intentar con nombres en minúsculas
SELECT 
    ot_sap,
    Articulo,
    Kilos,
    metros
FROM maquinas
WHERE Kilos > 9999999 OR (metros IS NOT NULL AND metros > 99999999)
LIMIT 10;

-- Contar cuántos registros tienen problemas
SELECT 
    COUNT(*) as total_registros_con_kilos_invalidos
FROM maquinas 
WHERE Kilos > 9999999.999 OR Kilos < 0;

SELECT 
    COUNT(*) as total_registros_con_metros_invalidos
FROM maquinas 
WHERE metros IS NOT NULL AND (metros > 99999999 OR metros < 0);

-- CORRECCIÓN: Asegurar tipo de dato correcto
SELECT 'Corrigiendo tipos de datos...' AS paso;

ALTER TABLE maquinas 
MODIFY COLUMN Kilos DECIMAL(10,3) NOT NULL DEFAULT 0.001;

ALTER TABLE maquinas 
MODIFY COLUMN metros DECIMAL(10,2) NULL DEFAULT NULL;

-- LIMPIEZA: Resetear valores fuera de rango
SELECT 'Limpiando 