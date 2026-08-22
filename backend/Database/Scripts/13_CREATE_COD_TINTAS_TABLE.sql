-- =============================================
-- Script: 13_CREATE_COD_TINTAS_TABLE.sql
-- Descripción: Crear tabla para códigos de tintas por diseño
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-03-06
-- =============================================
USE flexoapp_bd;

-- =============================================
-- TABLA: cod_tintas
-- Descripción: Almacena los códigos de tintas, coberturas y anilox por cada color de un diseño
-- =============================================

CREATE TABLE IF NOT EXISTS cod_tintas (
    -- Identificador único
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Artículo (referencia al diseño)
    articulo VARCHAR(50) NOT NULL,
    
    -- Descripción del diseño (cargada automáticamente)
    descripcion VARCHAR(200) NULL,
    
    -- Estante de ubicación
    estante VARCHAR(100) NULL,
    
    -- Número de carpeta
    carpeta VARCHAR(100) NULL,
    
    -- Línea de tinta (Flexo UV, Base Agua, etc.)
    linea_tinta VARCHAR(100) NULL,
    
    -- Datos de colores en formato JSON
    colores_data JSON NOT NULL,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    
    -- Índices
    INDEX idx_articulo (articulo),
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla de códigos de tintas por diseño flexográfico';

-- =============================================
-- COMENTARIOS DE COLUMNAS
-- =============================================

ALTER TABLE cod_tintas 
    MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'ID único del registro',
    MODIFY COLUMN articulo VARCHAR(50) NOT NULL COMMENT 'Código del artículo (Artículo F)',
    MODIFY COLUMN descripcion VARCHAR(200) NULL COMMENT 'Descripción del diseño',
    MODIFY COLUMN colores_data JSON NOT NULL COMMENT 'Array JSON con datos de colores: nombre, código tinta, cobertura, código anilox',
    MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    MODIFY COLUMN created_by VARCHAR(100) NULL COMMENT 'Usuario que creó el registro',
    MODIFY COLUMN updated_by VARCHAR(100) NULL COMMENT 'Usuario que actualizó el registro';

-- =============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =============================================

-- Ejemplo de registro con 3 colores
INSERT INTO cod_tintas (articulo, descripcion, colores_data, created_by) VALUES
(
    'F12345',
    'Bolsa impresa 3 colores',
    JSON_ARRAY(
        JSON_OBJECT('nombre', 'Cyan', 'codTinta', 'T-CY-001', 'cobertura', 85, 'codAnilox', 'A-350'),
        JSON_OBJECT('nombre', 'Magenta', 'codTinta', 'T-MG-002', 'cobertura', 80, 'codAnilox', 'A-450'),
        JSON_OBJECT('nombre', 'Amarillo', 'codTinta', 'T-YL-003', 'cobertura', 90, 'codAnilox', 'A-550')
    ),
    'Sistema'
);

-- =============================================
-- VERIFICACIÓN
-- =============================================

SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME,
    TABLE_COMMENT
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
AND TABLE_NAME = 'cod_tintas';

-- =============================================
-- CONSULTA DE PRUEBA
-- =============================================

SELECT 
    id,
    articulo,
    descripcion,
    JSON_LENGTH(colores_data) as cantidad_colores,
    created_at,
    updated_at
FROM cod_tintas
ORDER BY created_at DESC
LIMIT 10;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
