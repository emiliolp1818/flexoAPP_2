-- =====================================================
-- SCRIPT: CREAR TABLA ACTIVITIES
-- =====================================================
-- Sistema: FlexoAPP - Sistema de Gestión Flexográfica
-- Propósito: Crear tabla de actividades y auditoría del sistema
-- Base de datos: MySQL 8.0+ (Railway/Render)
-- Tabla: Activities
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-01-17
-- Versión: 2.0
-- =====================================================

-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS `Activities` (
    -- ===== IDENTIFICACIÓN =====
    `Id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único de la actividad (clave primaria)',
    
    -- ===== INFORMACIÓN DE LA ACCIÓN =====
    `Action` VARCHAR(200) NOT NULL COMMENT 'Acción realizada (LOGIN, CREATE_DESIGN, UPDATE_MACHINE, etc.)',
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
    
    -- ===== ÍNDICES PARA OPTIMIZACIÓN =====
    INDEX `idx_activities_userid` (`UserId`) COMMENT 'Índice para búsquedas por usuario',
    INDEX `idx_activities_timestamp` (`Timestamp`) COMMENT 'Índice para ordenar por fecha',
    INDEX `idx_activities_module` (`Module`) COMMENT 'Índice para filtrar por módulo',
    INDEX `idx_activities_action` (`Action`) COMMENT 'Índice para filtrar por acción',
    INDEX `idx_activities_usercode` (`UserCode`) COMMENT 'Índice para búsquedas por código de usuario',
    
    -- ===== CLAVES FORÁNEAS =====
    CONSTRAINT `fk_activities_user` 
        FOREIGN KEY (`UserId`) 
        REFERENCES `users`(`Id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de actividades y auditoría del sistema';

-- ===== VERIFICACIÓN =====
SELECT '✓ Tabla Activities creada exitosamente' as resultado;

-- ===== INFORMACIÓN DE LA TABLA =====
DESCRIBE `Activities`;
