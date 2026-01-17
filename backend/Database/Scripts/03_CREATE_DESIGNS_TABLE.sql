-- =====================================================
-- SCRIPT: CREAR TABLA DESIGNS
-- =====================================================
-- Sistema: FlexoAPP - Sistema de Gestión Flexográfica
-- Propósito: Crear tabla de diseños flexográficos
-- Base de datos: MySQL 8.0+ (Railway/Render)
-- Tabla: designs
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-01-17
-- Versión: 2.0
-- =====================================================

-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS `designs` (
    -- ===== IDENTIFICACIÓN =====
    `Id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del diseño (clave primaria)',
    
    -- ===== INFORMACIÓN DEL ARTÍCULO =====
    `ArticleF` VARCHAR(50) NULL COMMENT 'Código del artículo F (ej: F204567)',
    `Client` VARCHAR(200) NULL COMMENT 'Cliente del diseño',
    `Description` TEXT NULL COMMENT 'Descripción detallada del diseño',
    
    -- ===== ESPECIFICACIONES TÉCNICAS =====
    `Substrate` VARCHAR(100) NULL COMMENT 'Tipo de sustrato (BOPP, PE, PET, etc.)',
    `Type` VARCHAR(100) NULL COMMENT 'Tipo de diseño',
    `PrintType` VARCHAR(100) NULL COMMENT 'Tipo de impresión (Flexografía, Rotograbado, etc.)',
    
    -- ===== INFORMACIÓN DE COLORES =====
    `ColorCount` INT NULL DEFAULT 0 COMMENT 'Número total de colores (0-10)',
    `color 1` VARCHAR(100) NULL COMMENT 'Color 1 del diseño',
    `color 2` VARCHAR(100) NULL COMMENT 'Color 2 del diseño',
    `color 3` VARCHAR(100) NULL COMMENT 'Color 3 del diseño',
    `color 4` VARCHAR(100) NULL COMMENT 'Color 4 del diseño',
    `color 5` VARCHAR(100) NULL COMMENT 'Color 5 del diseño',
    `color 6` VARCHAR(100) NULL COMMENT 'Color 6 del diseño',
    `color 7` VARCHAR(100) NULL COMMENT 'Color 7 del diseño',
    `color 8` VARCHAR(100) NULL COMMENT 'Color 8 del diseño',
    `color 9` VARCHAR(100) NULL COMMENT 'Color 9 del diseño',
    `color 10` VARCHAR(100) NULL COMMENT 'Color 10 del diseño',
    
    -- ===== ESTADO =====
    `Status` VARCHAR(50) NULL DEFAULT 'DRAFT' COMMENT 'Estado del diseño (DRAFT, ACTIVE, ARCHIVED)',
    
    -- ===== AUDITORÍA =====
    `CreatedDate` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación del diseño',
    `LastModified` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Fecha de última modificación',
    
    -- ===== ÍNDICES PARA OPTIMIZACIÓN =====
    INDEX `idx_designs_articlef` (`ArticleF`) COMMENT 'Índice para búsquedas por código de artículo',
    INDEX `idx_designs_client` (`Client`) COMMENT 'Índice para filtrar por cliente',
    INDEX `idx_designs_status` (`Status`) COMMENT 'Índice para filtrar por estado',
    INDEX `idx_designs_substrate` (`Substrate`) COMMENT 'Índice para filtrar por sustrato',
    INDEX `idx_designs_created` (`CreatedDate`) COMMENT 'Índice para ordenar por fecha de creación',
    
    -- ===== RESTRICCIONES DE VALIDACIÓN =====
    CONSTRAINT `chk_designs_colorcount_valido` 
        CHECK (`ColorCount` >= 0 AND `ColorCount` <= 10),
        
    CONSTRAINT `chk_designs_status_valido` 
        CHECK (`Status` IN ('DRAFT', 'ACTIVE', 'ARCHIVED'))
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Diseños flexográficos del sistema';

-- ===== VERIFICACIÓN =====
SELECT '✓ Tabla designs creada exitosamente' as resultado;

-- ===== INFORMACIÓN DE LA TABLA =====
DESCRIBE `designs`;
