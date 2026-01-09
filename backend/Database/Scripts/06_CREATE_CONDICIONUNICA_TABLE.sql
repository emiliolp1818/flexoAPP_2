-- =====================================================
-- SCRIPT: CREAR TABLA CONDICIONUNICA
-- Propósito: Crear tabla de condiciones únicas de artículos
-- Base de datos: MySQL (Railway/Render)
-- Tabla: condicionunica
-- =====================================================

-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS `condicionunica` (
    -- Clave primaria autoincremental
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Código del artículo F (ejemplo: F204567)
    `farticulo` VARCHAR(50) NOT NULL,
    
    -- Referencia del producto o diseño
    `referencia` VARCHAR(100) NOT NULL,
    
    -- Número de estante donde se encuentra físicamente
    `estante` VARCHAR(50) NOT NULL,
    
    -- Número de carpeta donde está archivado
    `numerocarpeta` VARCHAR(50) NOT NULL,
    
    -- Auditoría
    `createddate` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `lastmodified` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    -- Índices para optimizar consultas
    INDEX `idx_condicionunica_farticulo` (`farticulo`),
    INDEX `idx_condicionunica_referencia` (`referencia`),
    INDEX `idx_condicionunica_estante` (`estante`),
    INDEX `idx_condicionunica_carpeta` (`numerocarpeta`),
    
    -- Índice único para evitar duplicados
    UNIQUE KEY `uk_condicionunica_articulo_ref` (`farticulo`, `referencia`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar creación
SELECT 'Tabla condicionunica creada exitosamente' as resultado;