-- Script para insertar datos de prueba en la tabla maquinas
-- Ejecutar este script en MySQL para tener datos de prueba

USE flexoapp_bd;

-- Limpiar datos existentes (opcional)
-- DELETE FROM maquinas;

-- Insertar datos de prueba para diferentes máquinas
INSERT INTO maquinas (
    articulo, numero_maquina, ot_sap, cliente, referencia, td,
    numero_colores, colores, kilos, fecha_tinta_en_maquina, sustrato,
    estado, observaciones, last_action_by, last_action_at,
    created_by, updated_by, created_at, updated_at
) VALUES 
-- Máquina 11
('F204567', 11, 'OT123456', 'ABSORBENTES DE COLOMBIA S.A', 'REF-001', 'TD1', 
 4, '["CYAN", "MAGENTA", "AMARILLO", "NEGRO"]', 1500.00, '2026-01-06 14:30:00', 'BOPP',
 'LISTO', 'Programa preparado para producción', 'Juan Pérez', '2026-01-06 14:30:00',
 1, 1, NOW(), NOW()),

('F204568', 11, 'OT123457', 'PRODUCTOS FAMILIA S.A', 'REF-002', 'TD2',
 3, '["CYAN", "MAGENTA", "AMARILLO"]', 2000.00, '2026-01-06 15:00:00', 'PE',
 'PREPARANDO', 'En proceso de preparación', 'María García', '2026-01-06 15:00:00',
 1, 1, NOW(), NOW()),

-- Máquina 12
('F204569', 12, 'OT123458', 'EMPAQUES DEL VALLE LTDA', 'REF-003', 'TD3',
 5, '["CYAN", "MAGENTA", "AMARILLO", "NEGRO", "PANTONE 186C"]', 1200.00, '2026-01-06 16:00:00', 'PET',
 'CORRIENDO', 'Producción en curso', 'Carlos López', '2026-01-06 16:00:00',
 1, 1, NOW(), NOW()),

('F204570', 12, 'OT123459', 'INDUSTRIAS ALIMENTARIAS S.A', 'REF-004', 'TD4',
 2, '["CYAN", "NEGRO"]', 800.00, '2026-01-06 17:00:00', 'BOPP',
 'SUSPENDIDO', 'Falta material', 'Ana Rodríguez', '2026-01-06 17:00:00',
 1, 1, NOW(), NOW()),

-- Máquina 13
('F204571', 13, 'OT123460', 'FLEXIBLES MODERNOS S.A', 'REF-005', 'TD5',
 6, '["CYAN", "MAGENTA", "AMARILLO", "NEGRO", "PANTONE 186C", "PANTONE 287C"]', 2500.00, '2026-01-06 18:00:00', 'CPP',
 'TERMINADO', 'Producción completada', 'Luis Martínez', '2026-01-06 18:00:00',
 1, 1, NOW(), NOW()),

('F204572', 13, 'OT123461', 'EMBALAJES PREMIUM LTDA', 'REF-006', 'TD6',
 4, '["CYAN", "MAGENTA", "AMARILLO", "PANTONE 186C"]', 1800.00, '2026-01-06 19:00:00', 'BOPP',
 'LISTO', 'Listo para iniciar', 'Sandra Díaz', '2026-01-06 19:00:00',
 1, 1, NOW(), NOW()),

-- Máquina 14
('F204573', 14, 'OT123462', 'CORPORACIÓN DE EMPAQUES S.A', 'REF-007', 'TD7',
 3, '["CYAN", "MAGENTA", "NEGRO"]', 1000.00, '2026-01-06 20:00:00', 'PE',
 'PREPARANDO', 'Preparando tintas', 'Roberto Silva', '2026-01-06 20:00:00',
 1, 1, NOW(), NOW()),

-- Máquina 15
('F204574', 15, 'OT123463', 'SOLUCIONES DE EMPAQUE LTDA', 'REF-008', 'TD8',
 5, '["CYAN", "MAGENTA", "AMARILLO", "NEGRO", "PANTONE 300C"]', 2200.00, '2026-01-06 21:00:00', 'PET',
 'LISTO', 'Programa verificado', 'Patricia Morales', '2026-01-06 21:00:00',
 1, 1, NOW(), NOW()),

('F204575', 15, 'OT123464', 'INDUSTRIAS GRÁFICAS S.A', 'REF-009', 'TD9',
 4, '["CYAN", "MAGENTA", "AMARILLO", "NEGRO"]', 1600.00, '2026-01-06 22:00:00', 'BOPP',
 'CORRIENDO', 'En producción', 'Miguel Torres', '2026-01-06 22:00:00',
 1, 1, NOW(), NOW()),

-- Máquina 16
('F204576', 16, 'OT123465', 'EMPAQUES SOSTENIBLES LTDA', 'REF-010', 'TD10',
 2, '["CYAN", "NEGRO"]', 900.00, '2026-01-06 23:00:00', 'CPP',
 'SIN_ASIGNAR', 'Programa nuevo', 'Sistema', '2026-01-06 23:00:00',
 1, 1, NOW(), NOW());

-- Verificar que los datos se insertaron correctamente
SELECT 
    articulo, numero_maquina, cliente, estado, 
    DATE_FORMAT(fecha_tinta_en_maquina, '%d/%m/%Y %H:%i') as fecha_tinta,
    last_action_by
FROM maquinas 
ORDER BY numero_maquina, fecha_tinta_en_maquina;