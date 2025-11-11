-- ===== SCRIPT PARA VERIFICAR Y POBLAR LA TABLA machine_programs =====
-- Este script verifica la existencia de la tabla machine_programs y la pobla con datos de prueba
-- Base de datos: flexoapp_bd (MySQL)
-- Fecha: 2025-01-10

USE flexoapp_bd;

-- ===== VERIFICAR SI LA TABLA EXISTE =====
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME,
    UPDATE_TIME
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'flexoapp_bd' 
    AND TABLE_NAME = 'machine_programs';

-- ===== VERIFICAR ESTRUCTURA DE LA TABLA =====
DESCRIBE machine_programs;

-- ===== CONTAR REGISTROS EXISTENTES =====
SELECT COUNT(*) AS total_registros FROM machine_programs;

-- ===== VERIFICAR DATOS EXISTENTES =====
SELECT 
    Id,
    MachineNumber AS numeroMaquina,
    Articulo,
    OtSap,
    Cliente,
    Estado,
    FechaTintaEnMaquina,
    CreatedAt
FROM 
    machine_programs
ORDER BY 
    FechaTintaEnMaquina DESC
LIMIT 10;

-- ===== INSERTAR DATOS DE PRUEBA SI LA TABLA ESTÁ VACÍA =====
-- Solo se ejecuta si no hay datos en la tabla

-- Verificar si hay datos
SET @count = (SELECT COUNT(*) FROM machine_programs);

-- Si no hay datos, insertar registros de prueba
INSERT INTO machine_programs (
    MachineNumber,
    Name,
    Articulo,
    OtSap,
    Cliente,
    Referencia,
    Td,
    NumeroColores,
    Colores,
    Sustrato,
    Kilos,
    Estado,
    FechaInicio,
    FechaTintaEnMaquina,
    Progreso,
    Observaciones,
    LastActionBy,
    LastAction,
    OperatorName,
    CreatedBy,
    UpdatedBy,
    CreatedAt,
    UpdatedAt
)
SELECT * FROM (
    -- ===== MÁQUINA 11 - 5 PROGRAMAS =====
    SELECT 
        11 AS MachineNumber,
        'Programa F204567' AS Name,
        'F204567' AS Articulo,
        'OT123456' AS OtSap,
        'ABSORBENTES DE COLOMBIA S.A' AS Cliente,
        'REF-ABS-001' AS Referencia,
        'TD1' AS Td,
        4 AS NumeroColores,
        '["CYAN","MAGENTA","AMARILLO","NEGRO"]' AS Colores,
        'BOPP' AS Sustrato,
        1500.00 AS Kilos,
        'LISTO' AS Estado,
        NOW() AS FechaInicio,
        NOW() AS FechaTintaEnMaquina,
        0 AS Progreso,
        'Programa listo para producción' AS Observaciones,
        'Sistema' AS LastActionBy,
        'Programa creado' AS LastAction,
        'Juan Pérez' AS OperatorName,
        1 AS CreatedBy,
        1 AS UpdatedBy,
        NOW() AS CreatedAt,
        NOW() AS UpdatedAt
    
    UNION ALL
    
    SELECT 
        11, 'Programa F204568', 'F204568', 'OT123457',
        'PRODUCTOS FAMILIA S.A', 'REF-FAM-002', 'TD2',
        3, '["CYAN","MAGENTA","AMARILLO"]', 'PE',
        2000.00, 'LISTO', NOW(), NOW(), 0,
        'Programa listo para producción', 'Sistema', 'Programa creado',
        'María García', 1, 1, NOW(), NOW()
    
    UNION ALL
    
    SELECT 
        11, 'Programa F204569', 'F204569', 'OT123458',
        'COLOMBINA S.A', 'REF-COL-003', 'TD3',
        5, '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO"]', 'PET',
        1800.00, 'CORRIENDO', NOW(), NOW(), 45,
        'En producción', 'Sistema', 'Programa iniciado',
        'Carlos López', 1, 1, NOW(), NOW()
    
    UNION ALL
    
    SELECT 
        11, 'Programa F204570', 'F204570', 'OT123459',
        'ALPINA PRODUCTOS ALIMENTICIOS S.A', 'REF-ALP-004', 'TD1',
        4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 'BOPP',
        2200.00, 'LISTO', NOW(), NOW(), 0,
        'Programa listo para producción', 'Sistema', 'Programa creado',
        'Ana Martínez', 1, 1, NOW(), NOW()
    
    UNION ALL
    
    SELECT 
        11, 'Programa F204571', 'F204571', 'OT123460',
        'NESTLE DE COLOMBIA S.A', 'REF-NES-005', 'TD2',
        6, '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO","VERDE"]', 'PE',
        1900.00, 'LISTO', NOW(), NOW(), 0,
        'Programa listo para producción', 'Sistema', 'Programa creado',
        'Pedro Rodríguez', 1, 1, NOW(), NOW()
    
    -- ===== MÁQUINA 12 - 4 PROGRAMAS =====
    UNION ALL
    
    SELECT 
        12, 'Programa F204572', 'F204572', 'OT123461',
        'QUALA S.A', 'REF-QUA-006', 'TD3',
        3, '["CYAN","MAGENTA","AMARILLO"]', 'BOPP',
        1600.00, 'LISTO', NOW(), NOW(), 0,
        'Programa listo para producción', 'Sistema', 'Programa creado',
        'Laura Sánchez', 1, 1, NOW(), NOW()
    
    UNION ALL
    
    SELECT 
        12, 'Programa F204573', 'F204573', 'OT123462',
        'GRUPO NUTRESA S.A', 'REF-NUT-007', 'TD1',
        4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 'PET',
        2100.00, 'LISTO', NOW(), NOW(), 0,
        'Programa listo para producción', 'Sistema', 'Programa creado',
        'Diego Torres', 1, 1, NOW(), NOW()
    
    UNION ALL
    
    SELECT 
        12, 'Programa F204574', 'F204574', 'OT123463',
        'BIMBO DE COLOMBIA S.A', 'REF-BIM-008', 'TD2',
        5, '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO"]', 'PE',
        1750.00, 'LISTO', NOW(), NOW(), 0,
        'Programa listo para producción', 'Sistema', 'Programa creado',
        'Sofía Ramírez', 1, 1, NOW(), NOW()
    
    UNION ALL
    
    SELECT 
        12, 'Programa F204575', 'F204575', 'OT123464',
        'MONDELEZ COLOMBIA S.A', 'REF-MON-009', 'TD3',
        4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 'BOPP',
        1850.00, 'SUSPENDIDO', NOW(), NOW(), 25,
        'Falta de material', 'Sistema', 'Programa suspendido',
        'Andrés Gómez', 1, 1, NOW(), NOW()
    
    -- ===== MÁQUINA 13 - 3 PROGRAMAS =====
    UNION ALL
    
    SELECT 
        13, 'Programa F204576', 'F204576', 'OT123465',
        'UNILEVER ANDINA COLOMBIA S.A', 'REF-UNI-010', 'TD1',
        3, '["CYAN","MAGENTA","AMARILLO"]', 'PET',
        2000.00, 'LISTO', NOW(), NOW(), 0,
        'Programa listo para producción', 'Sistema', 'Programa creado',
        'Camila Herrera', 1, 1, NOW(), NOW()
    
    UNION ALL
    
    SELECT 
        13, 'Programa F204577', 'F204577', 'OT123466',
        'COCA-COLA FEMSA COLOMBIA S.A', 'REF-COC-011', 'TD2',
        4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 'PE',
        2300.00, 'LISTO', NOW(), NOW(), 0,
        'Programa listo para producción', 'Sistema', 'Programa creado',
        'Felipe Castro', 1, 1, NOW(), NOW()
    
    UNION ALL
    
    SELECT 
        13, 'Programa F204578', 'F204578', 'OT123467',
        'BAVARIA S.A', 'REF-BAV-012', 'TD3',
        5, '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO"]', 'BOPP',
        1950.00, 'TERMINADO', NOW(), NOW(), 100,
        'Programa completado exitosamente', 'Sistema', 'Programa terminado',
        'Valentina Morales', 1, 1, NOW(), NOW()
    
    -- ===== MÁQUINA 14 - 2 PROGRAMAS =====
    UNION ALL
    
    SELECT 
        14, 'Programa F204579', 'F204579', 'OT123468',
        'POSTOBON S.A', 'REF-POS-013', 'TD1',
        3, '["CYAN","MAGENTA","AMARILLO"]', 'PET',
        1700.00, 'LISTO', NOW(), NOW(), 0,
        'Programa listo para producción', 'Sistema', 'Programa creado',
        'Sebastián Vargas', 1, 1, NOW(), NOW()
    
    UNION ALL
    
    SELECT 
        14, 'Programa F204580', 'F204580', 'OT123469',
        'MEALS DE COLOMBIA S.A', 'REF-MEA-014', 'TD2',
        4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 'PE',
        1800.00, 'LISTO', NOW(), NOW(), 0,
        'Programa listo para producción', 'Sistema', 'Programa creado',
        'Isabella Ruiz', 1, 1, NOW(), NOW()
    
    -- ===== MÁQUINA 15 - 1 PROGRAMA =====
    UNION ALL
    
    SELECT 
        15, 'Programa F204581', 'F204581', 'OT123470',
        'KELLOGG COLOMBIA S.A', 'REF-KEL-015', 'TD3',
        5, '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO"]', 'BOPP',
        2100.00, 'LISTO', NOW(), NOW(), 0,
        'Programa listo para producción', 'Sistema', 'Programa creado',
        'Mateo Jiménez', 1, 1, NOW(), NOW()
) AS datos
WHERE @count = 0;

-- ===== VERIFICAR DATOS INSERTADOS =====
SELECT 
    MachineNumber AS numeroMaquina,
    COUNT(*) AS total_programas,
    SUM(CASE WHEN Estado = 'LISTO' THEN 1 ELSE 0 END) AS programas_listos,
    SUM(CASE WHEN Estado = 'CORRIENDO' THEN 1 ELSE 0 END) AS programas_corriendo,
    SUM(CASE WHEN Estado = 'SUSPENDIDO' THEN 1 ELSE 0 END) AS programas_suspendidos,
    SUM(CASE WHEN Estado = 'TERMINADO' THEN 1 ELSE 0 END) AS programas_terminados
FROM 
    machine_programs
GROUP BY 
    MachineNumber
ORDER BY 
    MachineNumber;

-- ===== MOSTRAR TODOS LOS PROGRAMAS INSERTADOS =====
SELECT 
    Id,
    MachineNumber AS numeroMaquina,
    Articulo,
    OtSap,
    Cliente,
    Referencia,
    Td,
    NumeroColores,
    Colores,
    Sustrato,
    Kilos,
    Estado,
    FechaTintaEnMaquina,
    Observaciones,
    LastActionBy,
    CreatedAt
FROM 
    machine_programs
ORDER BY 
    MachineNumber, FechaTintaEnMaquina DESC;

-- ===== FIN DEL SCRIPT =====
