-- =============================================
-- Script: UPDATE ANILOX DEFAULT VALUES
-- Descripción: Actualizar todos los anilox con valores por defecto
--              Factor Eficiencia: 35%
--              Densidad: 0.885
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-02-12
-- =============================================

-- Verificar registros antes de actualizar
SELECT 
    COUNT(*) as total_registros,
    SUM(CASE WHEN factor_eficiencia IS NULL THEN 1 ELSE 0 END) as sin_factor_eficiencia,
    SUM(CASE WHEN densidad IS NULL THEN 1 ELSE 0 END) as sin_densidad
FROM anilox;

-- Actualizar todos los registros con los valores por defecto
UPDATE `anilox` 
SET 
    `factor_eficiencia` = 35.00,
    `densidad` = 0.885
WHERE 
    `factor_eficiencia` IS NULL 
    OR `densidad` IS NULL;

-- Verificar registros después de actualizar
SELECT 
    COUNT(*) as total_registros,
    SUM(CASE WHEN factor_eficiencia IS NULL THEN 1 ELSE 0 END) as sin_factor_eficiencia,
    SUM(CASE WHEN densidad IS NULL THEN 1 ELSE 0 END) as sin_densidad,
    SUM(CASE WHEN factor_eficiencia = 35.00 THEN 1 ELSE 0 END) as con_factor_35,
    SUM(CASE WHEN densidad = 0.885 THEN 1 ELSE 0 END) as con_densidad_0885
FROM anilox;

-- Mostrar algunos registros actualizados
SELECT 
    id,
    codigo,
    maquina,
    bcm,
    volumen_real,
    factor_eficiencia,
    densidad
FROM anilox
LIMIT 10;

SELECT 'Actualización completada exitosamente' AS resultado;
