-- ===== SCRIPT COMPLETO PARA CREAR Y POBLAR LA TABLA MAQUINAS =====
-- Este script crea la tabla maquinas y la pobla con datos de prueba
-- Base de datos: flexoapp_bd (MySQL)
-- Fecha: 2025-01-10

-- ===== SELECCIONAR LA BASE DE DATOS =====
USE flexoapp_bd;

-- ===== ELIMINAR TABLA SI EXISTE (OPCIONAL - DESCOMENTAR SI NECESITAS RECREARLA) =====
-- DROP TABLE IF EXISTS maquinas;

-- ===== CREAR TABLA MAQUINAS =====
-- Tabla que almacena los programas de máquinas flexográficas
-- CLAVE PRIMARIA: articulo (código único del artículo que se usará para cargar información de otra BD)
-- SIN campo id - articulo es suficiente como identificador único
CREATE TABLE IF NOT EXISTS maquinas (
    -- ===== CLAVE PRIMARIA =====
    -- articulo: código único del artículo (ej: F204567, F204568)
    -- PRIMARY KEY: identifica de forma única cada registro
    -- VARCHAR(50): cadena de texto de máximo 50 caracteres
    -- NOT NULL: campo obligatorio, no puede ser nulo
    articulo VARCHAR(50) PRIMARY KEY COMMENT 'Código del artículo a producir - CLAVE PRIMARIA (ej: F204567)',
    
    -- ===== CAMPOS PRINCIPALES =====
    -- numero_maquina: número de la máquina flexográfica (11-21)
    -- INT: número entero
    -- NOT NULL: campo obligatorio
    numero_maquina INT NOT NULL COMMENT 'Número de máquina (11-21)',
    
    -- ot_sap: orden de trabajo del sistema SAP
    -- VARCHAR(50): cadena de texto de máximo 50 caracteres
    -- NOT NULL: campo obligatorio
    ot_sap VARCHAR(50) NOT NULL COMMENT 'Orden de trabajo SAP (ej: OT123456)',
    
    -- cliente: nombre de la empresa cliente
    -- VARCHAR(200): cadena de texto de máximo 200 caracteres
    -- NOT NULL: campo obligatorio
    cliente VARCHAR(200) NOT NULL COMMENT 'Nombre del cliente (ej: ABSORBENTES DE COLOMBIA S.A)',
    
    -- referencia: referencia del producto
    -- VARCHAR(100): cadena de texto de máximo 100 caracteres
    -- NULL: campo opcional, puede ser nulo
    referencia VARCHAR(100) COMMENT 'Referencia del producto (ej: REF-001)',
    
    -- td: código TD (Tipo de Diseño)
    -- VARCHAR(10): cadena de texto de máximo 10 caracteres
    -- NULL: campo opcional
    td VARCHAR(10) COMMENT 'Código TD - Tipo de Diseño (ej: TD-ABC)',
    
    -- numero_colores: cantidad de colores utilizados en la impresión
    -- INT: número entero (máximo 2 caracteres según especificación)
    -- NOT NULL: campo obligatorio
    numero_colores INT NOT NULL COMMENT 'Número total de colores utilizados en la impresión (1-99)',
    
    -- colores: array de colores en formato JSON
    -- JSON: tipo de dato JSON nativo de MySQL
    -- NOT NULL: campo obligatorio
    -- Ejemplo: ["CYAN","MAGENTA","AMARILLO","NEGRO"]
    colores JSON NOT NULL COMMENT 'Array de colores en formato JSON (ej: ["CYAN","MAGENTA","AMARILLO"])',
    
    -- kilos: cantidad en kilogramos a producir
    -- DECIMAL(10,2): número decimal con 10 dígitos totales y 2 decimales
    -- NOT NULL: campo obligatorio
    -- Ejemplo: 1500.50
    kilos DECIMAL(10,2) NOT NULL COMMENT 'Cantidad en kilogramos a producir',
    
    -- fecha_tinta_en_maquina: fecha y hora cuando se aplicó la tinta
    -- DATETIME: fecha y hora (formato: YYYY-MM-DD HH:MM:SS)
    -- NOT NULL: campo obligatorio
    -- Formato de visualización: día/mes/año hora AM/PM
    fecha_tinta_en_maquina DATETIME NOT NULL COMMENT 'Fecha y hora cuando se aplicó la tinta en la máquina (formato: día/mes/año hora AM/PM)',
    
    -- sustrato: tipo de material base utilizado
    -- VARCHAR(100): cadena de texto de máximo 100 caracteres
    -- NOT NULL: campo obligatorio
    -- Ejemplos: BOPP, PE, PET
    sustrato VARCHAR(100) NOT NULL COMMENT 'Tipo de material base (ej: BOPP, PE, PET)',
    
    -- estado: estado actual del programa de producción
    -- VARCHAR(20): cadena de texto de máximo 20 caracteres
    -- NOT NULL: campo obligatorio
    -- DEFAULT 'LISTO': valor por defecto cuando se crea un registro
    -- Valores posibles: LISTO, CORRIENDO, SUSPENDIDO, TERMINADO
    estado VARCHAR(20) NOT NULL DEFAULT 'LISTO' COMMENT 'Estado actual: LISTO/CORRIENDO/SUSPENDIDO/TERMINADO',
    
    -- observaciones: notas o comentarios adicionales sobre el programa
    -- VARCHAR(1000): cadena de texto de máximo 1000 caracteres
    -- NULL: campo opcional
    observaciones VARCHAR(1000) COMMENT 'Observaciones adicionales del programa',
    
    -- ===== CAMPOS DE AUDITORÍA =====
    -- Campos para rastrear quién y cuándo modificó los registros
    
    -- last_action_by: nombre del usuario que realizó la última acción
    -- VARCHAR(100): cadena de texto de máximo 100 caracteres
    -- NULL: campo opcional
    last_action_by VARCHAR(100) COMMENT 'Usuario que realizó la última acción',
    
    -- last_action_at: fecha y hora de la última acción realizada
    -- DATETIME: fecha y hora completa
    -- NULL: campo opcional
    last_action_at DATETIME COMMENT 'Fecha y hora de la última acción',
    
    -- created_by: ID del usuario que creó el registro
    -- INT: número entero que referencia a la tabla users
    -- NULL: campo opcional
    created_by INT COMMENT 'ID del usuario que creó el registro',
    
    -- updated_by: ID del usuario que actualizó el registro por última vez
    -- INT: número entero que referencia a la tabla users
    -- NULL: campo opcional
    updated_by INT COMMENT 'ID del usuario que actualizó el registro',
    
    -- created_at: fecha y hora de creación del registro
    -- TIMESTAMP: marca de tiempo automática
    -- DEFAULT CURRENT_TIMESTAMP: se establece automáticamente al crear el registro
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    
    -- updated_at: fecha y hora de última actualización del registro
    -- TIMESTAMP: marca de tiempo automática
    -- DEFAULT CURRENT_TIMESTAMP: valor inicial al crear
    -- ON UPDATE CURRENT_TIMESTAMP: se actualiza automáticamente al modificar el registro
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    -- ===== ÍNDICES PARA MEJORAR RENDIMIENTO DE CONSULTAS =====
    -- Los índices aceleran las búsquedas y ordenamientos en la base de datos
    -- NOTA: articulo ya tiene índice automático por ser PRIMARY KEY
    
    -- Índice para búsquedas por número de máquina (ej: WHERE numero_maquina = 11)
    INDEX idx_numero_maquina (numero_maquina) COMMENT 'Índice para búsquedas por número de máquina',
    
    -- Índice para búsquedas por estado (ej: WHERE estado = 'LISTO')
    INDEX idx_estado (estado) COMMENT 'Índice para búsquedas por estado',
    
    -- Índice para ordenamiento por fecha (ej: ORDER BY fecha_tinta_en_maquina DESC)
    INDEX idx_fecha_tinta (fecha_tinta_en_maquina) COMMENT 'Índice para ordenamiento por fecha',
    
    -- Índice compuesto para búsquedas combinadas (ej: WHERE numero_maquina = 11 AND estado = 'LISTO')
    INDEX idx_maquina_estado (numero_maquina, estado) COMMENT 'Índice compuesto para búsquedas combinadas',
    
    -- Índice para búsquedas por orden SAP (ej: WHERE ot_sap = 'OT123456')
    INDEX idx_ot_sap (ot_sap) COMMENT 'Índice para búsquedas por orden SAP',
    
    -- Índice para búsquedas por cliente (ej: WHERE cliente LIKE '%ABSORBENTES%')
    INDEX idx_cliente (cliente) COMMENT 'Índice para búsquedas por cliente',
    
    -- ===== CLAVES FORÁNEAS (FOREIGN KEYS) =====
    -- Relaciones con otras tablas para mantener integridad referencial
    
    -- Relación con tabla users: usuario que creó el registro
    -- ON DELETE SET NULL: si se elimina el usuario, el campo se establece en NULL
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL COMMENT 'Relación con usuario creador',
    
    -- Relación con tabla users: usuario que actualizó el registro
    -- ON DELETE SET NULL: si se elimina el usuario, el campo se establece en NULL
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL COMMENT 'Relación con usuario actualizador'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de programas de máquinas flexográficas - articulo es PRIMARY KEY';

-- ===== VERIFICAR QUE LA TABLA SE CREÓ CORRECTAMENTE =====
DESCRIBE maquinas;

-- ===== INSERTAR DATOS DE PRUEBA =====
-- Insertar 15 registros de prueba distribuidos en las máquinas 11-15
-- IMPORTANTE: articulo es la clave primaria (PRIMARY KEY), debe ser único
-- NO se incluye el campo id porque ya no existe en la tabla

INSERT INTO maquinas (
    articulo,              -- Código del artículo (PRIMARY KEY) - debe ser único
    numero_maquina,        -- Número de máquina (11-21)
    ot_sap,                -- Orden de trabajo SAP
    cliente,               -- Nombre del cliente
    referencia,            -- Referencia del producto
    td,                    -- Código TD (Tipo de Diseño)
    numero_colores,        -- Número de colores (1-99)
    colores,               -- Array JSON de colores
    kilos,                 -- Cantidad en kilogramos
    fecha_tinta_en_maquina,-- Fecha y hora de tinta en máquina
    sustrato,              -- Tipo de material base
    estado,                -- Estado del programa
    observaciones,         -- Observaciones adicionales
    last_action_by,        -- Usuario que realizó la última acción
    last_action_at,        -- Fecha de la última acción
    created_by,            -- ID del usuario creador
    updated_by,            -- ID del usuario actualizador
    created_at,            -- Fecha de creación
    updated_at             -- Fecha de actualización
) VALUES
-- ===== MÁQUINA 11 - 5 PROGRAMAS =====
-- articulo es la clave primaria (PRIMARY KEY) - debe ser único
('F204567', 11, 'OT123456', 'ABSORBENTES DE COLOMBIA S.A', 'REF-ABS-001', 'TD1', 4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 1500.00, NOW(), 'BOPP', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
('F204568', 11, 'OT123457', 'PRODUCTOS FAMILIA S.A', 'REF-FAM-002', 'TD2', 3, '["CYAN","MAGENTA","AMARILLO"]', 2000.00, NOW(), 'PE', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
('F204569', 11, 'OT123458', 'COLOMBINA S.A', 'REF-COL-003', 'TD3', 5, '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO"]', 1800.00, NOW(), 'PET', 'CORRIENDO', 'En producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
('F204570', 11, 'OT123459', 'ALPINA PRODUCTOS ALIMENTICIOS S.A', 'REF-ALP-004', 'TD1', 4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 2200.00, NOW(), 'BOPP', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
('F204571', 11, 'OT123460', 'NESTLE DE COLOMBIA S.A', 'REF-NES-005', 'TD2', 6, '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO","VERDE"]', 1900.00, NOW(), 'PE', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),

-- ===== MÁQUINA 12 - 4 PROGRAMAS =====
('F204572', 12, 'OT123461', 'QUALA S.A', 'REF-QUA-006', 'TD3', 3, '["CYAN","MAGENTA","AMARILLO"]', 1600.00, NOW(), 'BOPP', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
('F204573', 12, 'OT123462', 'GRUPO NUTRESA S.A', 'REF-NUT-007', 'TD1', 4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 2100.00, NOW(), 'PET', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
('F204574', 12, 'OT123463', 'BIMBO DE COLOMBIA S.A', 'REF-BIM-008', 'TD2', 5, '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO"]', 1750.00, NOW(), 'PE', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
('F204575', 12, 'OT123464', 'MONDELEZ COLOMBIA S.A', 'REF-MON-009', 'TD3', 4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 1850.00, NOW(), 'BOPP', 'SUSPENDIDO', 'Falta de material', 'Sistema', NOW(), 1, 1, NOW(), NOW()),

-- ===== MÁQUINA 13 - 3 PROGRAMAS =====
('F204576', 13, 'OT123465', 'UNILEVER ANDINA COLOMBIA S.A', 'REF-UNI-010', 'TD1', 3, '["CYAN","MAGENTA","AMARILLO"]', 2000.00, NOW(), 'PET', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
('F204577', 13, 'OT123466', 'COCA-COLA FEMSA COLOMBIA S.A', 'REF-COC-011', 'TD2', 4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 2300.00, NOW(), 'PE', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
('F204578', 13, 'OT123467', 'BAVARIA S.A', 'REF-BAV-012', 'TD3', 5, '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO"]', 1950.00, NOW(), 'BOPP', 'TERMINADO', 'Programa completado exitosamente', 'Sistema', NOW(), 1, 1, NOW(), NOW()),

-- ===== MÁQUINA 14 - 2 PROGRAMAS =====
('F204579', 14, 'OT123468', 'POSTOBON S.A', 'REF-POS-013', 'TD1', 3, '["CYAN","MAGENTA","AMARILLO"]', 1700.00, NOW(), 'PET', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),
('F204580', 14, 'OT123469', 'MEALS DE COLOMBIA S.A', 'REF-MEA-014', 'TD2', 4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]', 1800.00, NOW(), 'PE', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW()),

-- ===== MÁQUINA 15 - 1 PROGRAMA =====
('F204581', 15, 'OT123470', 'KELLOGG COLOMBIA S.A', 'REF-KEL-015', 'TD3', 5, '["CYAN","MAGENTA","AMARILLO","NEGRO","BLANCO"]', 2100.00, NOW(), 'BOPP', 'LISTO', 'Programa listo para producción', 'Sistema', NOW(), 1, 1, NOW(), NOW());

-- ===== VERIFICAR DATOS INSERTADOS =====
-- Mostrar todos los registros ordenados por máquina
-- NOTA: articulo es la PRIMARY KEY (no hay campo id)
SELECT 
    articulo AS 'Artículo (PK)',           -- Clave primaria
    numero_maquina AS 'Máquina',           -- Número de máquina
    ot_sap AS 'OT SAP',                    -- Orden SAP
    cliente AS 'Cliente',                  -- Nombre del cliente
    numero_colores AS '# Colores',         -- Cantidad de colores
    kilos AS 'Kilos',                      -- Cantidad en kg
    estado AS 'Estado',                    -- Estado actual
    fecha_tinta_en_maquina AS 'Fecha Tinta', -- Fecha de tinta
    created_at AS 'Creado'                 -- Fecha de creación
FROM 
    maquinas
ORDER BY 
    numero_maquina, fecha_tinta_en_maquina DESC;

-- ===== ESTADÍSTICAS POR MÁQUINA =====
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

-- ===== MENSAJE DE ÉXITO =====
SELECT '✅ Tabla maquinas creada y poblada exitosamente con 15 registros de prueba' AS mensaje;

-- ===== FIN DEL SCRIPT =====
