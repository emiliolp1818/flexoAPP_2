-- =====================================================
-- HOTFIX: CORREGIR CONSTRAINT DE METROS
-- =====================================================
-- Sistema: FlexoAPP
-- Fecha: 2026-02-15
-- Problema: El constraint chk_maquinas_metros_positivos rechaza valores de 0
-- Solución: Permitir metros >= 0 (en lugar de metros > 0)
-- =====================================================

SELECT '========================================' as '';
SELECT 'HOTFIX: Corrigiendo constraint de metros' as '';
SELECT '========================================' as '';

-- Desactivar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ===== PASO 1: ELIMINAR CONSTRAINT ANTIGUO =====
SELECT 'Eliminando constraint antiguo...' as '';

ALTER TABLE `maquinas` 
DROP CONSTRAINT IF EXISTS `chk_maquinas_metros_positivos`;

SELECT '✓ Constraint antiguo eliminado' as '';

-- ===== PASO 2: AGREGAR CONSTRAINT CORREGIDO =====
SELECT 'Agregando constraint corregido...' as '';

ALTER TABLE `maquinas` 
ADD CONSTRAINT `chk_maquinas_metros_positivos` 
CHECK (`metros` IS NULL OR `metros` >= 0);

SELECT '✓ Constraint corregido agregado' as '';

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- ===== VERIFICACIÓN =====
SELECT 'Verificando constraint...' as '';

SELECT 
    CONSTRAINT_NAME as 'Constraint',
    CHECK_CLAUSE as 'Condición'
FROM 
    INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE 
    CONSTRAINT_SCHEMA = DATABASE()
    AND CONSTRAINT_NAME = 'chk_maquinas_metros_positivos';

SELECT '========================================' as '';
SELECT '✓ HOTFIX APLICADO EXITOSAMENTE' as '';
SELECT '========================================' as '';
SELECT 'Ahora puedes subir programaciones con metros = 0' as '';
