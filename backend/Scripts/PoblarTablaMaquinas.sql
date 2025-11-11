-- ===== SCRIPT PARA POBLAR LA TABLA MAQUINAS =====
-- Este script inserta datos de prueba en la tabla maquinas de la base de datos flexoapp_bd
-- Base de datos: flexoapp_bd (MySQL)
-- Tabla: maquinas
-- Fecha: 2025-01-10

-- ===== SELECCIONAR LA BASE DE DATOS =====
USE flexoapp_bd;

-- ===== LIMPIAR DATOS EXISTENTES (OPCIONAL - COMENTAR SI NO SE DESEA) =====
-- TRUNCATE TABLE maquinas;

-- ===== INSERTAR DATOS DE PRUEBA EN LA TABLA MAQUINAS =====
-- Insertar 15 registros de prueba distribuidos en las máquinas 11-15

INSERT INTO maquinas (
    numero_maquina,      -- Número de máquina (11-21)
    articulo,            -- Código del artículo
    ot_sap,              -- Orden de trabajo SAP
    cliente,             -- Nombre del cliente
    referencia,          -- Referencia del producto
    td,                  -- Código TD (Tipo de Diseño)
    numero_colores,      -- Número de colores
    colores,             -- Array JSON de colores
    kilos,               -- Cantidad en kilogramos
    fecha_tinta_en_maquina, -- Fecha de tinta en máquina
    sustrato,            -- Tipo de sustrato
    estado,              -- Estado del programa
    observaciones,       -- Observaciones
    last_action_by,      -- Usuario que realizó la última acción
    last_action_at,      -- Fecha de la última acción
    created_by,          -- ID del usuario creador
    updated_by,          -- ID del usuario actualizador
    created_at,          -- Fecha de creación
    updated_at           -- Fecha de actualización
) VALUES
-- ===== MÁQUINA 11 - 5 PROGRAMAS =====
(11, 'F204567', 'OT123456', 'ABSORBENTES DE COLOMBIA S.A', 'REF-ABS-001', 'TD1', 4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 1500.00, NOW(), 'BOPP', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
(11, 'F204568', 'OT123457', 'PRODUCTOS FAMILIA S.A', 'REF-FAM-002', 'TD2', 3, '["CYAN","MAGENTA","AMARILLO"]', 2000.00, NOW(), 'PE', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
(11, 'F204569', 'OT123458', 'COLOMBINA S.A', 'REF-COL-003', 'TD3', 5, '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO"]', 1800.00, NOW(), 'PET', 'CORRIENDO', 'En producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
(11, 'F204570', 'OT123459', 'ALPINA PRODUCTOS ALIMENTICIOS S.A', 'REF-ALP-004', 'TD1', 4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 2200.00, NOW(), 'BOPP', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
(11, 'F204571', 'OT123460', 'NESTLE DE COLOMBIA S.A', 'REF-NES-005', 'TD2', 6, '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO","VERDE"]', 1900.00, NOW(), 'PE', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),

-- ===== MÁQUINA 12 - 4 PROGRAMAS =====
(12, 'F204572', 'OT123461', 'QUALA S.A', 'REF-QUA-006', 'TD3', 3, '["CYAN","MAGENTA","AMARILLO"]', 1600.00, NOW(), 'BOPP', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
(12, 'F204573', 'OT123462', 'GRUPO NUTRESA S.A', 'REF-NUT-007', 'TD1', 4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 2100.00, NOW(), 'PET', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
(12, 'F204574', 'OT123463', 'BIMBO DE COLOMBIA S.A', 'REF-BIM-008', 'TD2', 5, '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO"]', 1750.00, NOW(), 'PE', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
(12, 'F204575', 'OT123464', 'MONDELEZ COLOMBIA S.A', 'REF-MON-009', 'TD3', 4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 1850.00, NOW(), 'BOPP', 'SUSPENDIDO', 'Falta de material', 'Sistema', NOW(), 1, 1, NOW(), NOW()),

-- ===== MÁQUINA 13 - 3 PROGRAMAS =====
(13, 'F204576', 'OT123465', 'UNILEVER ANDINA COLOMBIA S.A', 'REF-UNI-010', 'TD1', 3, '["CYAN","MAGENTA","AMARILLO"]', 2000.00, NOW(), 'PET', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
(13, 'F204577', 'OT123466', 'COCA-COLA FEMSA COLOMBIA S.A', 'REF-COC-011', 'TD2', 4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 2300.00, NOW(), 'PE', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
(13, 'F204578', 'OT123467', 'BAVARIA S.A', 'REF-BAV-012', 'TD3', 5, '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO"]', 1950.00, NOW(), 'BOPP', 'TERMINADO', 'Programa completado exitosamente', 'Sistema', NOW(), 1, 1, NOW(), NOW()),

-- ===== MÁQUINA 14 - 2 PROGRAMAS =====
(14, 'F204579', 'OT123468', 'POSTOBON S.A', 'REF-POS-013', 'TD1', 3, '["CYAN","MAGENTA","AMARILLO"]', 1700.00, NOW(), 'PET', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
(14, 'F204580', 'OT123469', 'MEALS DE COLOMBIA S.A', 'REF-MEA-014', 'TD2', 4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 1800.00, NOW(), 'PE', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),

-- ===== MÁQUINA 15 - 1 PROGRAMA =====
(15, 'F204581', 'OT123470', 'KELLOGG COLOMBIA S.A', 'REF-KEL-015', 'TD3', 5, '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO"]', 2100.00, NOW(), 'BOPP', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW());

-- ===== VERIFICAR DATOS INSERTADOS =====
-- Consultar todos los registros insertados
SELECT 
    id,
    numero_maquina,
    articulo,
    ot_sap,
    cliente,
    estado,
    fecha_tinta_en_maquina,
    created_at
FROM 
    maquinas
ORDER BY 
    numero_maquina, fecha_tinta_en_maquina DESC;

-- ===== ESTADÍSTICAS POR MÁQUINA =====
-- Mostrar resumen de programas por máquina y estado
SELECT 
    numero_maquina,
    COUNT(*) AS total_programas,
    SUM(CASE WHEN estado = 'LISTO' THEN 1 ELSE 0 END) AS programas_listos,
    SUM(CASE WHEN estado = 'CORRIENDO' THEN 1 ELSE 0 END) AS programas_corriendo,
    SUM(CASE WHEN estado = 'SUSPENDIDO' THEN 1 ELSE 0 END) AS programas_suspendidos,
    SUM(CASE WHEN estado = 'TERMINADO' THEN 1 ELSE 0 END) AS programas_terminados
FROM 
    maquinas
GROUP BY 
    numero_maquina
ORDER BY 
    numero_maquina;

-- ===== FIN DEL SCRIPT =====
