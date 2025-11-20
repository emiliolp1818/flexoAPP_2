-- =====================================================
-- SCRIPT: Insertar 10 programas de prueba
-- Base de datos: flexoapp_bd
-- Tabla: maquinas
-- =====================================================

USE flexoapp_bd;

-- Limpiar datos existentes (opcional)
-- DELETE FROM maquinas;

-- Insertar 10 programas de prueba para diferentes máquinas
INSERT INTO `maquinas` (
    `articulo`,
    `numero_maquina`,
    `ot_sap`,
    `cliente`,
    `referencia`,
    `td`,
    `numero_colores`,
    `colores`,
    `kilos`,
    `fecha_tinta_en_maquina`,
    `sustrato`,
    `estado`,
    `observaciones`,
    `last_action_by`,
    `last_action_at`,
    `created_by`,
    `updated_by`
) VALUES
-- Programa 1 - Máquina 11
(
    'F204567',
    11,
    'OT123456',
    'ABSORBENTES DE COLOMBIA S.A',
    'REF-001',
    'TD1',
    4,
    '["CYAN","MAGENTA","AMARILLO","NEGRO"]',
    1500.50,
    '2024-11-14 08:00:00',
    'BOPP',
    'LISTO',
    'Programa de prueba 1',
    'Sistema',
    NOW(),
    1,
    1
),

-- Programa 2 - Máquina 12
(
    'F204568',
    12,
    'OT123457',
    'EMPAQUES DEL VALLE LTDA',
    'REF-002',
    'TD2',
    6,
    '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO","VERDE"]',
    2000.00,
    '2024-11-14 09:00:00',
    'PE',
    'CORRIENDO',
    'Programa de prueba 2',
    'Sistema',
    NOW(),
    1,
    1
),

-- Programa 3 - Máquina 13
(
    'F204569',
    13,
    'OT123458',
    'PLASTICOS INDUSTRIALES S.A.S',
    'REF-003',
    'TD3',
    3,
    '["ROJO","AZUL","AMARILLO"]',
    800.00,
    '2024-11-14 10:00:00',
    'PET',
    'PREPARANDO',
    'Programa de prueba 3',
    'Sistema',
    NOW(),
    1,
    1
),

-- Programa 4 - Máquina 14
(
    'F204570',
    14,
    'OT123459',
    'ALIMENTOS DEL CARIBE S.A',
    'REF-004',
    'TD4',
    5,
    '["CYAN","MAGENTA","AMARILLO","NEGRO","PANTONE 185"]',
    1200.75,
    '2024-11-14 11:00:00',
    'BOPP',
    'LISTO',
    'Programa de prueba 4',
    'Sistema',
    NOW(),
    1,
    1
),

-- Programa 5 - Máquina 15
(
    'F204571',
    15,
    'OT123460',
    'PRODUCTOS LACTEOS DEL NORTE',
    'REF-005',
    'TD5',
    4,
    '["CYAN","MAGENTA","AMARILLO","NEGRO"]',
    1800.00,
    '2024-11-14 12:00:00',
    'PP',
    'SUSPENDIDO',
    'Programa de prueba 5 - Suspendido por mantenimiento',
    'Sistema',
    NOW(),
    1,
    1
),

-- Programa 6 - Máquina 16
(
    'F204572',
    16,
    'OT123461',
    'BEBIDAS REFRESCANTES S.A',
    'REF-006',
    'TD6',
    7,
    '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO","VERDE","NARANJA"]',
    2500.00,
    '2024-11-14 13:00:00',
    'PET',
    'CORRIENDO',
    'Programa de prueba 6',
    'Sistema',
    NOW(),
    1,
    1
),

-- Programa 7 - Máquina 17
(
    'F204573',
    17,
    'OT123462',
    'SNACKS Y CONFITERIA LTDA',
    'REF-007',
    'TD7',
    5,
    '["CYAN","MAGENTA","AMARILLO","NEGRO","DORADO"]',
    950.25,
    '2024-11-14 14:00:00',
    'BOPP',
    'LISTO',
    'Programa de prueba 7',
    'Sistema',
    NOW(),
    1,
    1
),

-- Programa 8 - Máquina 18
(
    'F204574',
    18,
    'OT123463',
    'FARMACEUTICOS DEL SUR S.A.S',
    'REF-008',
    'TD8',
    3,
    '["AZUL","BLANCO","NEGRO"]',
    600.00,
    '2024-11-14 15:00:00',
    'PE',
    'TERMINADO',
    'Programa de prueba 8 - Completado',
    'Sistema',
    NOW(),
    1,
    1
),

-- Programa 9 - Máquina 19
(
    'F204575',
    19,
    'OT123464',
    'COSMETICOS Y BELLEZA LTDA',
    'REF-009',
    'TD9',
    6,
    '["CYAN","MAGENTA","AMARILLO","NEGRO","PLATEADO","ROSA"]',
    1350.50,
    '2024-11-14 16:00:00',
    'BOPP',
    'LISTO',
    'Programa de prueba 9',
    'Sistema',
    NOW(),
    1,
    1
),

-- Programa 10 - Máquina 20
(
    'F204576',
    20,
    'OT123465',
    'PRODUCTOS DE LIMPIEZA S.A',
    'REF-010',
    'TD10',
    4,
    '["CYAN","MAGENTA","AMARILLO","NEGRO"]',
    1750.00,
    '2024-11-14 17:00:00',
    'PE',
    'PREPARANDO',
    'Programa de prueba 10',
    'Sistema',
    NOW(),
    1,
    1
);

-- Verificar los datos insertados
SELECT 
    numero_maquina AS 'Máquina',
    articulo AS 'Artículo',
    ot_sap AS 'OT SAP',
    cliente AS 'Cliente',
    numero_colores AS 'Colores',
    kilos AS 'Kilos',
    estado AS 'Estado',
    fecha_tinta_en_maquina AS 'Fecha Tinta'
FROM maquinas
ORDER BY numero_maquina;

-- Mostrar resumen
SELECT 
    estado AS 'Estado',
    COUNT(*) AS 'Cantidad'
FROM maquinas
GROUP BY estado
ORDER BY estado;

SELECT '✅ 10 programas de prueba insertados exitosamente' AS resultado;
