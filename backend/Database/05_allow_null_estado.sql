-- =====================================================
-- SCRIPT: Permitir NULL en campo estado
-- Base de datos: flexoapp_bd
-- Descripción: Cambiar campo estado para permitir NULL
--              y eliminar valor por defecto
-- Razón: Los programas nuevos deben cargarse sin estado
--        para que el operario los asigne manualmente
-- Versión: 5.0.0
-- Fecha: 2024-11-16
-- =====================================================

USE flexoapp_bd;

-- ===== PASO 1: VERIFICAR ESTRUCTURA ACTUAL =====
SELECT 
    COLUMN_NAME,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'flexoapp_bd'
    AND TABLE_NAME = 'maquinas'
    AND COLUMN_NAME = 'estado';

-- ===== PASO 2: MODIFICAR CAMPO ESTADO =====
-- Permitir NULL y eliminar valor por defecto
ALTER TABLE `maquinas` 
    MODIFY COLUMN `estado` VARCHAR(20) NULL DEFAULT NULL;

SELECT '✅ Campo estado modificado - Ahora permite NULL' AS resultado;

-- ===== PASO 3: VERIFICAR CAMBIO =====
SELECT 
    COLUMN_NAME,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'flexoapp_bd'
    AND TABLE_NAME = 'maquinas'
    AND COLUMN_NAME = 'estado';

-- ===== MENSAJE FINAL =====
SELECT '
✅ MIGRACIÓN COMPLETADA EXITOSAMENTE

CAMBIOS REALIZADOS:
- Campo "estado" ahora permite NULL
- Valor por defecto eliminado
- Los programas nuevos se cargarán sin estado asignado

COMPORTAMIENTO:
- Programas cargados desde Excel: estado = NULL
- El operario debe asignar el estado manualmente
- Estados válidos: PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO
' AS RESULTADO_FINAL;
