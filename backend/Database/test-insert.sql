-- =====================================================
-- SCRIPT: Probar inserción en tabla maquinas
-- Descripción: Verificar que se pueden insertar registros con la nueva PRIMARY KEY
-- =====================================================

USE flexoapp_bd;

-- ===== VERIFICAR ESTRUCTURA ACTUAL =====
SHOW CREATE TABLE maquinas;

-- ===== PROBAR INSERCIÓN DE DATOS DE PRUEBA =====
-- Intentar insertar el mismo artículo en diferentes máquinas

-- Limpiar datos de prueba anteriores
DELETE FROM maquinas WHERE articulo LIKE 'TEST%';

-- Insertar artículo TEST001 en máquina 11
INSERT INTO maquinas (
    articulo, numero_maquina, ot_sap, cliente, referencia, td,
    numero_colores, colores, kilos, fecha_tinta_en_maquina, sustrato,
    estado, observaciones
) VALUES (
    'TEST001', 11, 'OT001', 'Cliente Prueba', 'REF-001', 'TD-001',
    4, '["COLOR1","COLOR2","COLOR3","COLOR4"]', 1500.00, NOW(), 'BOPP',
    '', 'Programa de prueba - Máquina 11'
);

-- Insertar el MISMO artículo TEST001 en máquina 12
INSERT INTO maquinas (
    articulo, numero_maquina, ot_sap, cliente, referencia, td,
    numero_colores, colores, kilos, fecha_tinta_en_maquina, sustrato,
    estado, observaciones
) VALUES (
    'TEST001', 12, 'OT001', 'Cliente Prueba', 'REF-001', 'TD-001',
    4, '["COLOR1","COLOR2","COLOR3","COLOR4"]', 2000.00, NOW(), 'PE',
    '', 'Programa de prueba - Máquina 12'
);

-- Insertar el MISMO artículo TEST001 en máquina 13
INSERT INTO maquinas (
    articulo, numero_maquina, ot_sap, cliente, referencia, td,
    numero_colores, colores, kilos, fecha_tinta_en_maquina, sustrato,
    estado, observaciones
) VALUES (
    'TEST001', 13, 'OT001', 'Cliente Prueba', 'REF-001', 'TD-001',
    4, '["COLOR1","COLOR2","COLOR3","COLOR4"]', 1750.00, NOW(), 'PET',
    '', 'Programa de prueba - Máquina 13'
);

-- ===== VERIFICAR RESULTADOS =====
SELECT 
    articulo,
    numero_maquina,
    ot_sap,
    cliente,
    kilos,
    sustrato,
    observaciones
FROM maquinas
WHERE articulo = 'TEST001'
ORDER BY numero_maquina;

-- ===== CONTAR REGISTROS =====
SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT articulo) as articulos_unicos,
    COUNT(DISTINCT numero_maquina) as maquinas_con_datos
FROM maquinas
WHERE articulo = 'TEST001';

-- ===== MENSAJE FINAL =====
SELECT CASE 
    WHEN (SELECT COUNT(*) FROM maquinas WHERE articulo = 'TEST001') = 3 
    THEN '✅ PRUEBA EXITOSA: Se insertaron 3 registros con el mismo artículo en diferentes máquinas'
    ELSE '❌ PRUEBA FALLIDA: No se pudieron insertar los 3 registros'
END AS resultado;

-- ===== LIMPIAR DATOS DE PRUEBA =====
-- Descomentar la siguiente línea para eliminar los datos de prueba
-- DELETE FROM maquinas WHERE articulo LIKE 'TEST%';
