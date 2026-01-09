-- =====================================================
-- SCRIPT: CREAR TABLA REFRESH_TOKENS
-- Propósito: Crear tabla para tokens de actualización JWT
-- Base de datos: MySQL (Railway/Render)
-- Tabla: refresh_tokens
-- =====================================================

-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
    -- Clave primaria autoincremental
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Token de actualización (único)
    `Token` VARCHAR(500) NOT NULL UNIQUE,
    
    -- ID del usuario propietario del token
    `UserId` INT NOT NULL,
    
    -- Fecha de creación del token
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    
    -- Fecha de expiración del token
    `ExpiresAt` DATETIME(6) NOT NULL,
    
    -- Indica si el token ha sido revocado
    `IsRevoked` TINYINT(1) NOT NULL DEFAULT 0,
    
    -- Fecha de revocación (si aplica)
    `RevokedAt` DATETIME(6) NULL,
    
    -- Razón de la revocación
    `RevokedReason` VARCHAR(200) NULL,
    
    -- IP desde donde se creó el token
    `CreatedByIp` VARCHAR(45) NULL,
    
    -- IP desde donde se revocó el token
    `RevokedByIp` VARCHAR(45) NULL,
    
    -- Token que reemplazó a este (si aplica)
    `ReplacedByToken` VARCHAR(500) NULL,
    
    -- Información adicional del dispositivo/navegador
    `UserAgent` VARCHAR(500) NULL,
    
    -- Índices para optimizar consultas
    INDEX `idx_refresh_tokens_userid` (`UserId`),
    INDEX `idx_refresh_tokens_expires` (`ExpiresAt`),
    INDEX `idx_refresh_tokens_revoked` (`IsRevoked`),
    INDEX `idx_refresh_tokens_created` (`CreatedAt`),
    
    -- Clave foránea hacia la tabla users
    CONSTRAINT `fk_refresh_tokens_user` 
        FOREIGN KEY (`UserId`) 
        REFERENCES `users`(`Id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar creación
SELECT 'Tabla refresh_tokens creada exitosamente' as resultado;