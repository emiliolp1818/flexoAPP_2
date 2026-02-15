-- =====================================================
-- HOTFIX: CORREGIR CONSTRAINTS DE ANILOX
-- =====================================================
-- Sistema: FlexoAPP
-- Fecha: 2026-02-15
-- Problema: Los constraints de anilox son muy restrictivos y rechazan datos válidos
-- Solución: Flexibilizar constraints para permitir importación desde Excel
-- =====================================================

SELECT '========================================' as '';
SELECT 'HOTFIX: Corrigiendo constraints de anilox' as '';
SELECT '========================================' as '';

-- Desactivar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ===== PASO 1: ELIMINAR CONSTRAINTS ANTIGUOS =====
SELECT 'Eliminando constraints antiguos...' as '';

-- NOTA: MySQL no soporta IF EXISTS en DROP CHECK
-- Si un constraint no existe, ignorar el error y continuar

ALTER TABLE `anilox` DROP CHECK `chk_anilox_bcm_positivo`;
ALTER TABLE `anilox` DROP CHECK `chk_anilox_lineatura_positiva`;
ALTER TABLE `anilox` DROP CHECK `chk_anilox_volumen_positivo`;
ALTER TABLE `anilox` DROP CHECK `chk_anilox_marca_valida`;

SELECT '✓ Constraints antiguos eliminados' as '';

-- ===== PASO 2: AGREGAR CONSTRAINTS CORREGIDOS =====
SELECT 'Agregando constraints corregidos...' as '';

-- BCM: Permitir valores >= 0 (en lugar de > 0)
ALTER TABLE `anilox` 
ADD CONSTRAINT `chk_anilox_bcm_positivo` 
CHECK (`bcm` >= 0);

-- Lineatura: Permitir valores >= 0 (en lugar de > 0)
ALTER TABLE `anilox` 
ADD CONSTRAINT `chk_anilox_lineatura_positiva` 
CHECK (`lineatura` >= 0);

-- Volumen Real: Permitir valores >= 0 (en lugar de > 0)
ALTER TABLE `anilox` 
ADD CONSTRAINT `chk_anilox_volumen_positivo` 
CHECK (`volumen_real` >= 0);

-- Marca: Eliminar restricción para permitir cualquier marca
-- (No agregamos constraint de marca para permitir flexibilidad)

SELECT '✓ Constraints corregidos agregados' as '';

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- ===== VERIFICACIÓN =====
SELECT 'Verificando constraints...' as '';

SELECT 
    CONSTRAINT_NAME as 'Constraint',
    CHECK_CLAUSE as 'Condición'
FROM 
    INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE 
    CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'anilox'
ORDER BY CONSTRAINT_NAME;

SELECT '========================================' as '';
SELECT '✓ HOTFIX APLICADO EXITOSAMENTE' as '';
SELECT '========================================' as '';
SELECT 'Ahora puedes importar anilox desde Excel sin restricciones de marca' as '';
