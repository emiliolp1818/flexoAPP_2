-- =====================================================
-- SCRIPT: Eliminar UNIQUE KEY de articulo + numero_maquina
-- Base de datos: flexoapp_bd
-- Descripción: Permitir duplicados de articulo en la misma máquina
--              Solo mantener id como PRIMARY KEY
-- Razón: El mismo artículo puede estar programado varias veces
--        en la misma máquina (diferentes lotes, fechas, etc.)
-- Versión: 4.0.0
-- Fecha: 2024-11-16
-- =====================================================

USE flexoapp_bd;

-- ===== PASO 1: VERIFICAR UNIQUE KEY ACTUAL =====
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'flexoapp_bd'
    AND TABLE_NAME = 'maquinas'
    AND CONSTRAINT_NAME = 'uk_articulo_maquina';

-- ===== PASO 2: ELIMINAR UNIQUE KEY =====
ALTER TABLE `maquinas` DROP INDEX `uk_articulo_maquina`;

SELECT '✅ UNIQUE KEY eliminada - Ahora se permiten artículos duplicados' AS resultado;

-- ===== PASO 3: VERIFICAR ESTRUCTURA FINAL =====
SHOW KEYS FROM `maquinas`;

-- ===== PASO 4: VERIFICAR DATOS =====
SELECT CONCAT('✅ Total de registros: ', COUNT(*)) AS resultado 
FROM `maquinas`;

-- ===== MENSAJE FINAL =====
SELECT '
✅ MIGRACIÓN COMPLETADA EXITOSAMENTE

CAMBIOS REALIZADOS:
- UNIQUE KEY eliminada de "articulo + numero_maquina"
- Ahora se pueden duplicar artículos en la misma máquina
- Solo "id" es PRIMARY KEY (auto-incremental)

ESTRUCTURA FINAL:
- PRIMARY KEY: id (único, auto-incremental)
- Sin restricciones de unicidad en articulo o numero_maquina
- Permite múltiples programas del mismo artículo en la misma máquina

CASOS DE USO PERMITIDOS:
✅ Mismo artículo en diferentes máquinas
✅ Mismo artículo en la misma máquina (diferentes lotes/fechas)
✅ Artículos completamente diferentes
' AS RESULTADO_FINAL;
