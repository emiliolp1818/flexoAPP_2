-- =====================================================
-- SCRIPT: CREAR TABLA ACTIVITIES
-- =====================================================
-- Sistema: FlexoAPP - Sistema de Gestión Flexográfica
-- Propósito: Crear tabla de actividades y auditoría del sistema
-- Base de datos: MySQL 8.0+ (Railway/Render)
-- Tabla: Activities
-- Versión: 3.0 (incluye EntityType, Duration, OldValues, NewValues)
-- =====================================================

CREATE TABLE IF NOT EXISTS `Activities` (
    -- ===== IDENTIFICACIÓN =====
    `Id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único de la actividad',
    
    -- ===== INFORMACIÓN DE LA ACCIÓN =====
    `Action` VARCHAR(200) NOT NULL COMMENT 'Acción realizada (LOGIN, CREATE_DESIGN, MACHINE_STATUS_CHANGED, etc.)',
    `Description` VARCHAR(500) NOT NULL COMMENT 'Descripción detallada de la acción',
    `Timestamp` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha y hora exacta de la actividad',
    
    -- ===== CONTEXTO =====
    `Module` VARCHAR(100) NOT NULL COMMENT 'Módulo del sistema (AUTH, DESIGNS, MACHINES, etc.)',
    `Details` VARCHAR(1000) NULL COMMENT 'Detalles adicionales en formato JSON',
    
    -- ===== USUARIO =====
    `UserId` INT NOT NULL COMMENT 'ID del usuario que realizó la acción',
    `UserCode` VARCHAR(50) NULL COMMENT 'Código del usuario (para consultas rápidas)',
    
    -- ===== INFORMACIÓN TÉCNICA =====
    `IpAddress` VARCHAR(45) NULL COMMENT 'Dirección IP desde donde se realizó la acción',
    
    -- ===== ENTIDAD AFECTADA =====
    `EntityType` VARCHAR(100) NULL COMMENT 'Tipo de entidad afectada (Maquina, Design, User, etc.)',
    `EntityId` INT NULL COMMENT 'ID de la entidad afectada',
    `EntityName` VARCHAR(200) NULL COMMENT 'Nombre descriptivo de la entidad',
    
    -- ===== DURACIÓN Y CAMBIOS =====
    `Duration` TIME(6) NULL COMMENT 'Duración de la acción (para tiempos de preparación, etc.)',
    `OldValues` VARCHAR(2000) NULL COMMENT 'Valores anteriores en formato JSON',
    `NewValues` VARCHAR(2000) NULL COMMENT 'Valores nuevos en formato JSON',
    
    -- ===== ÍNDICES =====
    INDEX `idx_activities_userid` (`UserId`),
    INDEX `idx_activities_timestamp` (`Timestamp`),
    INDEX `idx_activities_module` (`Module`),
    INDEX `idx_activities_action` (`Action`),
    INDEX `idx_activities_usercode` (`UserCode`),
    INDEX `idx_activities_entity` (`EntityType`, `EntityId`),
    
    -- ===== CLAVES FORÁNEAS =====
    CONSTRAINT `fk_activities_user` 
        FOREIGN KEY (`UserId`) 
        REFERENCES `users`(`Id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de actividades y auditoría del sistema';

-- ===== VERIFICACIÓN =====
SELECT '✓ Tabla Activities creada exitosamente' as resultado;
DESCRIBE `Activities`;
