-- =====================================================
-- SCRIPT: CREAR TABLA DESIGNS
-- Propósito: Crear tabla de diseños flexográficos
-- Base de datos: MySQL (Railway/Render)
-- Tabla: designs
-- =====================================================

-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS `designs` (
    -- Clave primaria autoincremental
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Código del artículo F
    `ArticleF` VARCHAR(50) NULL,
    
    -- Cliente del diseño
    `Client` VARCHAR(200) NULL,
    
    -- Descripción del diseño
    `Description` TEXT NULL,
    
    -- Tipo de sustrato (BOPP, PE, PET, etc.)
    `Substrate` VARCHAR(100) NULL,
    
    -- Tipo de diseño
    `Type` VARCHAR(100) NULL,
    
    -- Tipo de impresión
    `PrintType` VARCHAR(100) NULL,
    
    -- Número total de colores
    `ColorCount` INT NULL DEFAULT 0,
    
    -- Colores individuales (hasta 10 colores)
    `color 1` VARCHAR(100) NULL,
    `color 2` VARCHAR(100) NULL,
    `color 3` VARCHAR(100) NULL,
    `color 4` VARCHAR(100) NULL,
    `color 5` VARCHAR(100) NULL,
    `color 6` VARCHAR(100) NULL,
    `color 7` VARCHAR(100) NULL,
    `color 8` VARCHAR(100) NULL,
    `color 9` VARCHAR(100) NULL,
    `color 10` VARCHAR(100) NULL,
    
    -- Estado del diseño (DRAFT, ACTIVE, ARCHIVED)
    `Status` VARCHAR(50) NULL DEFAULT 'DRAFT',
    
    -- Auditoría
    `CreatedDate` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `LastModified` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    -- Índices para optimizar consultas
    INDEX `idx_designs_articlef` (`ArticleF`),
    INDEX `idx_designs_client` (`Client`),
    INDEX `idx_designs_status` (`Status`),
    INDEX `idx_designs_substrate` (`Substrate`),
    INDEX `idx_designs_created` (`CreatedDate`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar creación
SELECT 'Tabla designs creada exitosamente' as resultado;