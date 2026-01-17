-- =====================================================
-- SCRIPT: CREAR TABLA MAQUINAS
-- =====================================================
-- Sistema: FlexoAPP - Sistema de Gestión Flexográfica
-- Propósito: Crear tabla de máquinas de producción flexográfica
-- Base de datos: MySQL 8.0+ (Railway/Render)
-- Tabla: maquinas
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-01-17
-- Versión: 2.0
-- =====================================================

-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS `maquinas` (
    -- ===== IDENTIFICACIÓN =====
    `ot_sap` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'Orden de Trabajo SAP (clave primaria única)',
    
    -- ===== INFORMACIÓN DEL ARTÍCULO =====
    `Articulo` VARCHAR(50) NOT NULL COMMENT 'Código del artículo a producir',
    `NumeroMaquina` INT NOT NULL COMMENT 'Número de la máquina flexográfica (11-21)',
    
    -- ===== INFORMACIÓN DEL CLIENTE =====
    `Cliente` VARCHAR(200) NOT NULL COMMENT 'Nombre del cliente',
    `Referencia` VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'Referencia del producto',
    
    -- ===== ESPECIFICACIONES TÉCNICAS =====
    `Td` VARCHAR(10) NOT NULL DEFAULT '' COMMENT 'Código TD (Tipo de Diseño)',
    `NumeroColores` INT NOT NULL DEFAULT 1 COMMENT 'Número total de colores (1-10)',
    `Colores` JSON NOT NULL DEFAULT ('[]') COMMENT 'Array de colores en formato JSON',
    `Kilos` DECIMAL(10,2) NOT NULL COMMENT 'Cantidad en kilogramos',
    `Sustrato` VARCHAR(100) NOT NULL COMMENT 'Tipo de material base (BOPP, PE, PET, etc.)',
    
    -- ===== PROGRAMACIÓN =====
    `FechaTintaEnMaquina` DATETIME(6) NOT NULL COMMENT 'Fecha y hora de aplicación de tinta',
    
    -- ===== ESTADO Y OBSERVACIONES =====
    `Estado` VARCHAR(20) NULL DEFAULT NULL COMMENT 'Estado del programa (PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO)',
    `Observaciones` VARCHAR(1000) NULL COMMENT 'Observaciones adicionales del programa',
    
    -- ===== SEGUIMIENTO =====
    `LastActionBy` VARCHAR(100) NULL COMMENT 'Usuario que realizó la última acción',
    `LastActionAt` DATETIME(6) NULL COMMENT 'Fecha y hora de la última acción',
    
    -- ===== AUDITORÍA =====
    `CreatedBy` INT NULL COMMENT 'ID del usuario que creó el registro',
    `UpdatedBy` INT NULL COMMENT 'ID del usuario que actualizó el registro',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación del registro',
    `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Fecha de última actualización',
    
    -- ===== ÍNDICES PARA OPTIMIZACIÓN =====
    INDEX `idx_maquinas_numero` (`NumeroMaquina`) COMMENT 'Índice para filtrar por número de máquina',
    INDEX `idx_maquinas_articulo` (`Articulo`) COMMENT 'Índice para búsquedas por artículo',
    INDEX `idx_maquinas_cliente` (`Cliente`) COMMENT 'Índice para filtrar por cliente',
    INDEX `idx_maquinas_estado` (`Estado`) COMMENT 'Índice para filtrar por estado',
    INDEX `idx_maquinas_fecha_tinta` (`FechaTintaEnMaquina`) COMMENT 'Índice para ordenar por fecha de tinta',
    INDEX `idx_maquinas_created_by` (`CreatedBy`) COMMENT 'Índice para auditoría de creación',
    INDEX `idx_maquinas_updated_by` (`UpdatedBy`) COMMENT 'Índice para auditoría de actualización',
    
    -- ===== CLAVES FORÁNEAS =====
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
        
    -- ===== RESTRICCIONES DE VALIDACIÓN =====
    CONSTRAINT `chk_maquinas_numero_valido` 
        CHECK (`NumeroMaquina` BETWEEN 11 AND 21),
        
    CONSTRAINT `chk_maquinas_kilos_positivos` 
        CHECK (`Kilos` > 0),
        
    CONSTRAINT `chk_maquinas_colores_positivos` 
        CHECK (`NumeroColores` > 0 AND `NumeroColores` <= 10),
        
    CONSTRAINT `chk_maquinas_estado_valido` 
        CHECK (`Estado` IS NULL OR `Estado` IN ('PREPARANDO', 'LISTO', 'CORRIENDO', 'SUSPENDIDO', 'TERMINADO'))
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Máquinas de producción flexográfica';

-- ===== VERIFICACIÓN =====
SELECT '✓ Tabla maquinas creada exitosamente' as resultado;

-- ===== INFORMACIÓN DE LA TABLA =====
DESCRIBE `maquinas`;
