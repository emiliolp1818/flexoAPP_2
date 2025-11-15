-- =====================================================
-- Script para permitir que el campo 'estado' esté vacío
-- Los programas nuevos se cargarán sin estado asignado
-- El operario debe aplicar la primera acción
-- =====================================================

USE flexoapp_bd;

-- Modificar la columna 'estado' para permitir valores vacíos
ALTER TABLE maquinas 
MODIFY COLUMN estado VARCHAR(20) NULL DEFAULT NULL
COMMENT 'Estado del programa: PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO. NULL = Sin asignar';

-- Verificar el cambio
DESCRIBE maquinas;

-- Mostrar programas sin estado
SELECT 
    articulo,
    numero_maquina,
    cliente,
    estado,
    observaciones,
    fecha_tinta_en_maquina
FROM maquinas
WHERE estado IS NULL OR estado = ''
ORDER BY numero_maquina, fecha_tinta_en_maquina;

SELECT '✅ Campo estado ahora permite valores vacíos (NULL)' AS resultado;
