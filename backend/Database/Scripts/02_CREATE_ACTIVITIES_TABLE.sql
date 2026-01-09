-- =====================================================
-- SCRIPT: CREAR TABLA ACTIVITIES
-- Propósito: Crear tabla de actividades/logs del sistema
-- Base de datos: MySQL (Railway/Render)
-- Tabla: Activities
-- =====================================================

-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS `Activities` (
    -- Clave primaria autoincremental
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Acción realizada (ej: "LOGIN", "CREATE_DESIGN", "UPDATE_MACHINE")
    `Action` VARCHAR(200) NOT NULL,
    
    -- Descripción detallada de la acción
    `Description` VARCHAR(500) NOT NULL,
    
    -- Fecha y hora de la actividad
    `Timestamp` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    
    -- Módulo del sistema (ej: "AUTH", "DESIGNS", "MACHINES")
    `Module` VARCHAR(100) NOT NULL,
    
    -- Detalles adicionales en formato JSON
    `Details` VARCHAR(1000) NULL,
    
    -- ID del usuario que realizó la acción
    `UserId` INT NOT NULL,
    
    -- Código del usuario (para consultas rápidas)
    `UserCode` VARCHAR(50) NULL,
    
    -- Dirección IP desde donde se realizó la acción
    `IpAddress` VARCHAR(45) NULL,
    
    -- Índices para optimizar consultas
    INDEX `idx_activities_userid` (`UserId`),
    INDEX `idx_activities_timestamp` (`Timestamp`),
    INDEX `idx_activities_module` (`Module`),
    INDEX `idx_activities_action` (`Action`),
    INDEX `idx_activities_usercode` (`UserCode`),
    
    -- Clave foránea hacia la tabla users
    CONSTRAINT `fk_activities_user` 
        FOREIGN KEY (`UserId`) 
        REFERENCES `users`(`Id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar creación
SELECT 'Tabla Activities creada exitosamente' as resultado;