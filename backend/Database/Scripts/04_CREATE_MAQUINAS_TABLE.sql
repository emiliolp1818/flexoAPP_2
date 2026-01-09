-- =====================================================
-- SCRIPT: CREAR TABLA MAQUINAS
-- Propósito: Crear tabla de máquinas flexográficas
-- Base de datos: MySQL (Railway/Render)
-- Tabla: maquinas
-- =====================================================

-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS `maquinas` (
    -- Clave primaria: Orden de Trabajo SAP (único por programación)
    `ot_sap` VARCHAR(50) NOT NULL PRIMARY KEY,
    
    -- Código del artículo a producir
    `Articulo` VARCHAR(50) NOT NULL,
    
    -- Número de la máquina flexográfica (11-21)
    `NumeroMaquina` INT NOT NULL,
    
    -- Información del cliente
    `Cliente` VARCHAR(200) NOT NULL,
    
    -- Referencia del producto
    `Referencia` VARCHAR(100) NOT NULL DEFAULT '',
    
    -- Código TD (Tipo de Diseño)
    `Td` VARCHAR(10) NOT NULL DEFAULT '',
    
    -- Número total de colores
    `NumeroColores` INT NOT NULL DEFAULT 1,
    
    -- Array de colores en formato JSON
    `Colores` JSON NOT NULL DEFAULT ('[]'),
    
    -- Cantidad en kilogramos
    `Kilos` DECIMAL(10,2) NOT NULL,
    
    -- Fecha y hora de aplicación de tinta
    `FechaTintaEnMaquina` DATETIME(6) NOT NULL,
    
    -- Tipo de material base
    `Sustrato` VARCHAR(100) NOT NULL,
    
    -- Estado del programa (PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO)
    `Estado` VARCHAR(20) NULL DEFAULT NULL,
    
    -- Observaciones adicionales
    `Observaciones` VARCHAR(1000) NULL,
    
    -- Usuario que realizó la última acción
    `LastActionBy` VARCHAR(100) NULL,
    
    -- Fecha de la última acción
    `LastActionAt` DATETIME(6) NULL,
    
    -- Auditoría
    `CreatedBy` INT NULL,
    `UpdatedBy` INT NULL,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    -- Índices para optimizar consultas
    INDEX `idx_maquinas_numero` (`NumeroMaquina`),
    INDEX `idx_maquinas_articulo` (`Articulo`),
    INDEX `idx_maquinas_cliente` (`Cliente`),
    INDEX `idx_maquinas_estado` (`Estado`),
    INDEX `idx_maquinas_fecha_tinta` (`FechaTintaEnMaquina`),
    INDEX `idx_maquinas_created_by` (`CreatedBy`),
    INDEX `idx_maquinas_updated_by` (`UpdatedBy`),
    
    -- Claves foráneas hacia la tabla users
    CONSTRAINT `fk_maquinas_created_by` 
        FOREIGN KEY (`CreatedBy`) 
        REFERENCES `users`(`Id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
        
    CONSTRAINT `fk_maquinas_updated_by` 
        FOREIGN KEY (`UpdatedBy`) 
        REFERENCES `users`(`Id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
        
    -- Restricciones de validación
    CONSTRAINT `chk_maquinas_numero_valido` 
        CHECK (`NumeroMaquina` BETWEEN 11 AND 21),
        
    CONSTRAINT `chk_maquinas_kilos_positivos` 
        CHECK (`Kilos` > 0),
        
    CONSTRAINT `chk_maquinas_colores_positivos` 
        CHECK (`NumeroColores` > 0 AND `NumeroColores` <= 10),
        
    CONSTRAINT `chk_maquinas_estado_valido` 
        CHECK (`Estado` IS NULL OR `Estado` IN ('PREPARANDO', 'LISTO', 'CORRIENDO', 'SUSPENDIDO', 'TERMINADO'))
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar creación
SELECT 'Tabla maquinas creada exitosamente' as resultado;