-- =====================================================
-- SCRIPT: CREAR TABLA CONDICIONUNICA
-- =====================================================
-- Sistema: FlexoAPP - Sistema de Gestión Flexográfica
-- Propósito: Crear tabla de ubicación física de artículos
-- Base de datos: MySQL 8.0+ (Railway/Render)
-- Tabla: condicionunica
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-01-17
-- Versión: 2.0
-- =====================================================

-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS `condicionunica` (
    -- ===== IDENTIFICACIÓN =====
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del registro (clave primaria)',
    
    -- ===== INFORMACIÓN DEL ARTÍCULO =====
    `farticulo` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código del artículo F (ej: F204567) - único',
    `descripcion` VARCHAR(500) NOT NULL COMMENT 'Descripción del producto o diseño',
    
    -- ===== UBICACIÓN FÍSICA =====
    `estante` VARCHAR(50) NOT NULL COMMENT 'Número de estante donde se encuentra físicamente',
    `numerocarpeta` VARCHAR(50) NOT NULL COMMENT 'Número de carpeta donde está archivado',
    
    -- ===== ESTADO =====
    `estado` VARCHAR(50) DEFAULT 'ACTIVO' COMMENT 'Estado del registro (ACTIVO, INACTIVO, EN REVISIÓN)',
    
    -- ===== AUDITORÍA =====
    `createddate` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    `lastmodified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
    
    -- ===== ÍNDICES PARA OPTIMIZACIÓN =====
    INDEX `idx_condicionunica_farticulo` (`farticulo`) COMMENT 'Índice para búsquedas por código de artículo',
    INDEX `idx_condicionunica_estante` (`estante`) COMMENT 'Índice para búsquedas por estante',
    INDEX `idx_condicionunica_numerocarpeta` (`numerocarpeta`) COMMENT 'Índice para búsquedas por carpeta',
    INDEX `idx_condicionunica_estado` (`estado`) COMMENT 'Índice para filtrar por estado',
    INDEX `idx_condicionunica_createddate` (`createddate`) COMMENT 'Índice para ordenar por fecha de creación',
    
    -- ===== RESTRICCIONES DE VALIDACIÓN =====
    CONSTRAINT `chk_condicionunica_estado_valido` 
        CHECK (`estado` IN ('ACTIVO', 'INACTIVO', 'EN REVISIÓN'))
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ubicación física de artículos en almacén';

-- ===== DATOS DE EJEMPLO (OPCIONAL) =====
-- Descomentar para insertar datos de prueba
/*
INSERT INTO condicionunica (farticulo, descripcion, estante, numerocarpeta, estado) VALUES
('F204567', 'Bolsa de polietileno transparente 30x40cm', 'E-01', 'C-001', 'ACTIVO'),
('F204568', 'Bolsa de polipropileno impresa 25x35cm', 'E-01', 'C-002', 'ACTIVO'),
('F204569', 'Film flexible para empaque alimenticio', 'E-02', 'C-003', 'EN REVISIÓN');
*/

-- ===== VERIFICACIÓN =====
SELECT '✓ Tabla condicionunica creada exitosamente' as resultado;

-- ===== INFORMACIÓN DE LA TABLA =====
DESCRIBE `condicionunica`;
