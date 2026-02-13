-- =============================================
-- Script: REMOVE CARGA MUESTRA FROM ANILOX
-- Descripción: Eliminar campo carga_muestra de la tabla anilox (se movió a maquinas)
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-02-13
-- =============================================

-- Eliminar columna carga_muestra de anilox
ALTER TABLE `anilox` 
DROP COLUMN IF EXISTS `carga_muestra`;

-- Verificar que la columna se eliminó correctamente
SELECT 'Columna carga_muestra eliminada de tabla anilox' AS resultado;

-- Mostrar estructura actualizada
DESCRIBE `anilox`;
