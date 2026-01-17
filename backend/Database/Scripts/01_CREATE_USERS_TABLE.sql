-- =====================================================
-- SCRIPT: CREAR TABLA USERS
-- =====================================================
-- Sistema: FlexoAPP - Sistema de Gestión Flexográfica
-- Propósito: Crear tabla de usuarios del sistema con autenticación
-- Base de datos: MySQL 8.0+ (Railway/Render)
-- Tabla: users
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-01-17
-- Versión: 2.0
-- =====================================================

-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS `users` (
    -- ===== IDENTIFICACIÓN =====
    `Id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del usuario (clave primaria)',
    `UserCode` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único de usuario (admin, 90009, etc.)',
    
    -- ===== AUTENTICACIÓN =====
    `Password` VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada con bcrypt',
    
    -- ===== INFORMACIÓN PERSONAL =====
    `FirstName` VARCHAR(50) NULL COMMENT 'Nombre del usuario',
    `LastName` VARCHAR(50) NULL COMMENT 'Apellido del usuario',
    
    -- ===== ROLES Y PERMISOS =====
    `Role` VARCHAR(50) NOT NULL DEFAULT 'Operario' COMMENT 'Rol del usuario (Admin, Supervisor, Operario)',
    `Permissions` JSON NULL COMMENT 'Permisos específicos en formato JSON',
    
    -- ===== PERFIL =====
    `ProfileImage` LONGTEXT NULL COMMENT 'Imagen de perfil en base64 o URL',
    
    -- ===== INFORMACIÓN DE CONTACTO =====
    `Email` VARCHAR(100) NULL COMMENT 'Correo electrónico',
    `Phone` VARCHAR(20) NULL COMMENT 'Teléfono de contacto',
    
    -- ===== ESTADO =====
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado activo (1) o inactivo (0)',
    
    -- ===== AUDITORÍA =====
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación del registro',
    `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Fecha de última actualización',
    
    -- ===== ÍNDICES PARA OPTIMIZACIÓN =====
    INDEX `idx_users_usercode` (`UserCode`) COMMENT 'Índice para búsquedas por código de usuario',
    INDEX `idx_users_role` (`Role`) COMMENT 'Índice para filtrar por rol',
    INDEX `idx_users_active` (`IsActive`) COMMENT 'Índice para filtrar usuarios activos',
    INDEX `idx_users_email` (`Email`) COMMENT 'Índice para búsquedas por email'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios del sistema con autenticación y permisos';

-- ===== DATOS INICIALES =====
-- Insertar usuario administrador por defecto si no existe
INSERT IGNORE INTO `users` (
    `UserCode`, 
    `Password`, 
    `FirstName`, 
    `LastName`, 
    `Role`, 
    `IsActive`,
    `CreatedAt`,
    `UpdatedAt`
) VALUES (
    'admin',
    '$2a$11$rOzJqQZ8kVJ8kVJ8kVJ8kOzJqQZ8kVJ8kVJ8kVJ8kOzJqQZ8kVJ8k.',  -- Contraseña: admin123
    'Administrador',
    'Sistema',
    'Admin',
    1,
    NOW(6),
    NOW(6)
);

-- ===== VERIFICACIÓN =====
SELECT '✓ Tabla users creada exitosamente' as resultado;
SELECT COUNT(*) as total_usuarios FROM `users`;

-- ===== INFORMACIÓN DE LA TABLA =====
DESCRIBE `users`;
