-- =====================================================
-- SCRIPT: CREAR TABLA USERS
-- =====================================================
-- Sistema: FlexoAPP
-- Tabla: users
-- Descripción: Usuarios del sistema con autenticación
-- Fecha: 2026-02-15
-- Actualizado: 2026-07-11 (eliminada columna Permissions 
--   — los permisos se gestionan en tabla user_permissions)
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tabla si existe (solo para desarrollo)
-- DROP TABLE IF EXISTS `users`;

-- Crear tabla users
CREATE TABLE IF NOT EXISTS `users` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del usuario',
    `UserCode` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único de usuario para login',
    `Password` VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada con BCrypt',
    `FirstName` VARCHAR(50) NULL COMMENT 'Nombre del usuario',
    `LastName` VARCHAR(50) NULL COMMENT 'Apellido del usuario',
    `Role` VARCHAR(50) NOT NULL DEFAULT 'Operario' COMMENT 'Rol del usuario (Admin, Supervisor, Operario)',
    `ProfileImage` LONGTEXT NULL COMMENT 'Imagen de perfil en base64 (data URL)',
    `Email` VARCHAR(100) NULL COMMENT 'Correo electrónico',
    `Phone` VARCHAR(20) NULL COMMENT 'Teléfono de contacto',
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado activo/inactivo del usuario',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación',
    `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Fecha de última actualización',
    
    INDEX `idx_users_usercode` (`UserCode`),
    INDEX `idx_users_role` (`Role`),
    INDEX `idx_users_active` (`IsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios del sistema FlexoAPP';

-- NOTA: Los permisos se gestionan en la tabla `user_permissions` (ver script 15)
-- NOTA: Para eliminar columna legacy en BD existente:
-- ALTER TABLE users DROP COLUMN IF EXISTS Permissions;

-- Insertar usuario administrador por defecto
-- UserCode: admin | Password: admin123
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
    '$2a$11$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa',
    'Administrador',
    'Sistema',
    'Admin',
    1,
    NOW(6),
    NOW(6)
);

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✓ Tabla users creada exitosamente' as '';
SELECT '✓ Usuario administrador creado (UserCode: admin, Password: admin123)' as '';
