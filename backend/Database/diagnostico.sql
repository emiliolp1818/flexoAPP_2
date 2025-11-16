-- =====================================================
-- SCRIPT: Diagnóstico de tabla maquinas
-- Descripción: Verificar estado actual de la tabla y datos
-- =====================================================

USE flexoapp_bd;

-- ===== 1. VERIFICAR ESTRUCTURA DE LA TABLA =====
SELECT '===== ESTRUCTURA DE LA TABLA =====' AS seccion;
SHOW CREATE TABLE maquinas\G

-- ===== 2. VERIFICAR PRIMARY KEY =====
SELECT '===== PRIMARY KEY ACTUAL =====' AS seccion;
SHOW KEYS FROM maquinas WHERE Key_name = 'PRIMARY';

-- ===== 3. CONTAR REGISTROS TOTALES =====
SELECT '===== TOTAL DE REGISTROS =====' AS seccion;
SELECT COUNT(*) as total_registros FROM maquinas;

-- ===== 4. CONTAR REGISTROS POR MÁQUINA =====
SELECT '===== REGISTROS POR MÁQUINA =====' AS seccion;
SELECT 
    numero_maquina,
    COUNT(*) as cantidad_programas
FROM maquinas
GROUP BY numero_maquina
ORDER BY numero_maquina;

-- ===== 5. VERIFICAR SI HAY ARTÍCULOS DUPLICADOS EN DIFERENTES MÁQUINAS =====
SELECT '===== ARTÍCULOS EN MÚLTIPLES MÁQUINAS =====' AS seccion;
SELECT 
    articulo,
    COUNT(DISTINCT numero_maquina) as cantidad_maquinas,
    GROUP_CONCAT(DISTINCT numero_maquina ORDER BY numero_maquina) as maquinas
FROM maquinas
GROUP BY articulo
HAVING COUNT(DISTINCT numero_maquina) > 1
ORDER BY cantidad_maquinas DESC
LIMIT 10;

-- ===== 6. MOSTRAR ÚLTIMOS 10 REGISTROS INSERTADOS =====
SELECT '===== ÚLTIMOS 10 REGISTROS =====' AS seccion;
SELECT 
    articulo,
    numero_maquina,
    ot_sap,
    cliente,
    kilos,
    sustrato,
    estado,
    created_at
FROM maquinas
ORDER BY created_at DESC
LIMIT 10;

-- ===== 7. VERIFICAR ESTADOS DE LOS PROGRAMAS =====
SELECT '===== DISTRIBUCIÓN POR ESTADO =====' AS seccion;
SELECT 
    COALESCE(estado, 'SIN ESTADO') as estado,
    COUNT(*) as cantidad
FROM maquinas
GROUP BY estado
ORDER BY cantidad DESC;

-- ===== 8. VERIFICAR SI HAY REGISTROS CON ESTADO VACÍO =====
SELECT '===== REGISTROS CON ESTADO VACÍO =====' AS seccion;
SELECT COUNT(*) as registros_sin_estado
FROM maquinas
WHERE estado IS NULL OR estado = '';

-- ===== 9. VERIFICAR INTEGRIDAD DE DATOS =====
SELECT '===== VERIFICACIÓN DE INTEGRIDAD =====' AS seccion;
SELECT 
    'Registros con articulo NULL' as verificacion,
    COUNT(*) as cantidad
FROM maquinas
WHERE articulo IS NULL
UNION ALL
SELECT 
    'Registros con numero_maquina NULL',
    COUNT(*)
FROM maquinas
WHERE numero_maquina IS NULL
UNION ALL
SELECT 
    'Registros con colores NULL',
    COUNT(*)
FROM maquinas
WHERE colores IS NULL
UNION ALL
SELECT 
    'Registros con kilos = 0',
    COUNT(*)
FROM maquinas
WHERE kilos = 0;

-- ===== 10. RESUMEN FINAL =====
SELECT '===== RESUMEN FINAL =====' AS seccion;
SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT articulo) as articulos_unicos,
    COUNT(DISTINCT numero_maquina) as maquinas_con_datos,
    MIN(created_at) as primer_registro,
    MAX(created_at) as ultimo_registro
FROM maquinas;
