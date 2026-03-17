-- =====================================================
-- SCRIPT: CREAR TABLA REFRESH_TOKENS
-- =====================================================
-- Sistema: FlexoAPP - Sistema de Gestión Flexográfica
-- Propósito: Crear tabla para tokens de actualización JWT
-- Base de datos: MySQL 8.0+ (Railway/Render)
-- Tabla: refresh_tokens
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-01-17
-- Versión: 2.0
-- =====================================================

-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
    -- ===== IDENTIFICACIÓN =====
    `Id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del token (clave primaria)',
    
    -- ===== INFORMACIÓN DEL TOKEN =====
    `Token` VARCHAR(500) NOT NULL UNIQUE COMMENT 'Token de actualización JWT (único)',
    `UserId` INT NOT NULL COMMENT 'ID del usuario propietario del token',
    
    -- ===== FECHAS =====
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación del token',
    `ExpiresAt` DATETIME(6) NOT NULL COMMENT 'Fecha de expiración del token',
    
    -- ===== REVOCACIÓN =====
    `IsRevoked` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Token revocado (1) o activo (0)',
    `RevokedAt` DATETIME(6) NULL COMMENT 'Fecha de revocación del token',
    `RevokedReason` VARCHAR(200) NULL COMMENT 'Razón de la revocación',
    
    -- ===== INFORMACIÓN DE RED =====
    `CreatedByIp` VARCHAR(45) NULL COMMENT 'Dirección IP desde donde se creó el token',
    `RevokedByIp` VARCHAR(45) NULL COMMENT 'Dirección IP desde donde se revocó el token',
    
    -- ===== REEMPLAZO =====
    `ReplacedByToken` VARCHAR(500) NULL COMMENT 'Token que reemplazó a este (si aplica)',
    
    -- ===== INFORMACIÓN DEL DISPOSITIVO =====
    `UserAgent` VARCHAR(500) NULL COMMENT 'Información del navegador/dispositivo',
    
    -- ===== ÍNDICES PARA OPTIMIZACIÓN =====
    INDEX `idx_refresh_tokens_userid` (`UserId`) COMMENT 'Índice para búsquedas por usuario',
    INDEX `idx_refresh_tokens_expires` (`ExpiresAt`) COMMENT 'Índice para limpiar tokens expirados',
    INDEX `idx_refresh_tokens_revoked` (`IsRevoked`) COMMENT 'Índice para filtrar tokens revocados',
    INDEX `idx_refresh_tokens_created` (`CreatedAt`) COMMENT 'Índice para ordenar por fecha de creación',
    
    -- ===== CLAVES FORÁNEAS =====
    CONSTRAINT `fk_refresh_tokens_user` 
        FOREIGN KEY (`UserId`) 
        REFERENCES `users`(`Id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tokens de actualización JWT para autenticación';

-- ===== VERIFICACIÓN =====
SELECT '✓ Tabla refresh_tokens creada exitosamente' as resultado;

-- ===== INFORMACIÓN DE LA TABLA =====
DESCRIBE `refresh_tokens`;
