-- =====================================================
-- Script para verificar y limpiar estados
-- =====================================================

USE flexoapp_bd;

-- 1. Ver la estructura actual de la columna estado
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'flexoapp_bd'
  AND TABLE_NAME = 'maquinas'
  AND COLUMN_NAME = 'estado';

-- 2. Modificar la columna para permitir NULL
ALTER TABLE maquinas 
MODIFY COLUMN estado VARCHAR(20) NULL DEFAULT NULL
COMMENT 'Estado del programa: PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO. NULL = Sin asignar';

-- 3. Verificar el cambio
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'flexoapp_bd'
  AND TABLE_NAME = 'maquinas'
  AND COLUMN_NAME = 'estado';

-- 4. OPCIONAL: Limpiar estados de programas existentes
-- DESCOMENTA ESTAS LÍNEAS SI QUIERES QUE LOS PROGRAMAS EXISTENTES TAMBIÉN QUEDEN SIN ESTADO
-- UPDATE maquinas SET estado = NULL WHERE estado = 'PREPARANDO';
-- UPDATE maquinas SET observaciones = 'Programa existente - Pendiente de asignación de estado' WHERE estado IS NULL;

-- 5. Ver estadísticas de estados
SELECT 
    CASE 
        WHEN estado IS NULL THEN 'SIN_ASIGNAR (NULL)'
        WHEN estado = '' THEN 'SIN_ASIGNAR (VACÍO)'
        ELSE estado 
    END AS estado_display,
    COUNT(*) as cantidad
FROM maquinas
GROUP BY estado
ORDER BY cantidad DESC;

SELECT '✅ Script ejecutado correctamente' AS resultado;
