-- ===== SCRIPT SQL: CREAR TABLA CONDICIONUNICA =====
-- Script para crear la tabla condicionunica en MySQL
-- Base de datos: flexoapp_bd
-- Ejecutar este script si la tabla no existe

-- ===== USAR BASE DE DATOS =====
USE flexoapp_bd;

-- ===== ELIMINAR TABLA SI EXISTE (OPCIONAL) =====
-- Descomentar la siguiente línea si quieres recrear la tabla desde cero
-- DROP TABLE IF EXISTS condicionunica;

-- ===== CREAR TABLA CONDICIONUNICA =====
CREATE TABLE IF NOT EXISTS condicionunica (
    -- ID: Clave primaria autoincremental
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- F Artículo: Código del artículo F (ejemplo: F204567)
    -- Campo requerido, máximo 50 caracteres
    farticulo VARCHAR(50) NOT NULL,
    
    -- Referencia: Referencia del producto o diseño
    -- Campo requerido, máximo 200 caracteres
    referencia VARCHAR(200) NOT NULL,
    
    -- Estante: Número de estante donde se encuentra físicamente
    -- Campo requerido, máximo 50 caracteres
    estante VARCHAR(50) NOT NULL,
    
    -- Número de Carpeta: Número de carpeta donde está archivado
    -- Campo requerido, máximo 50 caracteres
    numerocarpeta VARCHAR(50) NOT NULL,
    
    -- Fecha de Creación: Timestamp de cuando se creó el registro
    -- Se establece automáticamente al crear el registro
    createddate DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Última Modificación: Timestamp de la última actualización
    -- Se actualiza automáticamente al modificar el registro
    lastmodified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- ===== ÍNDICES PARA OPTIMIZACIÓN =====
    -- Índice en farticulo para búsquedas rápidas
    INDEX idx_farticulo (farticulo),
    
    -- Índice en estante para filtros por ubicación
    INDEX idx_estante (estante),
    
    -- Índice en lastmodified para ordenar por fecha
    INDEX idx_lastmodified (lastmodified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== INSERTAR DATOS DE PRUEBA =====
-- Insertar 5 registros de ejemplo para probar el módulo
INSERT INTO condicionunica (farticulo, referencia, estante, numerocarpeta) VALUES
('F204567', 'REF-001-2024', 'E-01', 'C-001'),
('F204568', 'REF-002-2024', 'E-01', 'C-002'),
('F204569', 'REF-003-2024', 'E-02', 'C-003'),
('F204570', 'REF-004-2024', 'E-02', 'C-004'),
('F204571', 'REF-005-2024', 'E-03', 'C-005');

-- ===== VERIFICAR CREACIÓN =====
-- Mostrar estructura de la tabla
DESCRIBE condicionunica;

-- Mostrar registros insertados
SELECT * FROM condicionunica;

-- Mostrar cantidad de registros
SELECT COUNT(*) as total_registros FROM condicionunica;

-- ===== MENSAJE DE CONFIRMACIÓN =====
SELECT '✅ Tabla condicionunica creada exitosamente' AS mensaje;
