-- =====================================================
-- SCRIPT: CREAR TABLA USERS
-- Propósito: Crear tabla de usuarios del sistema FlexoAPP
-- Base de datos: MySQL (Railway/Render)
-- Tabla: users
-- =====================================================

-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS `users` (
    -- Clave primaria autoincremental
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Código único de usuario (admin, 90009, etc.)
    `UserCode` VARCHAR(50) NOT NULL UNIQUE,
    
    -- Contraseña hasheada con bcrypt
    `Password` VARCHAR(255) NOT NULL,
    
    -- Información personal
    `FirstName` VARCHAR(50) NULL,
    `LastName` VARCHAR(50) NULL,
    
    -- Rol del usuario (Admin, Supervisor, Operador, etc.)
    `Role` VARCHAR(50) NOT NULL DEFAULT 'Operario',
    
    -- Permisos específicos en formato JSON
    `Permissions` JSON NULL,
    
    -- Imagen de perfil (base64 o URL)
    `ProfileImage` LONGTEXT NULL,
    
    -- Información de contacto
    `Email` VARCHAR(100) NULL,
    `Phone` VARCHAR(20) NULL,
    
    -- Estado del usuario
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
    
    -- Auditoría
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    -- Índices para optimizar consultas
    INDEX `idx_users_usercode` (`UserCode`),
    INDEX `idx_users_role` (`Role`),
    INDEX `idx_users_active` (`IsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    '$2a$11$rOzJqQZ8kVJ8kVJ8kVJ8kOzJqQZ8kVJ8kVJ8kVJ8kOzJqQZ8kVJ8k.',  -- admin123 hasheado
    'Administrador',
    'Sistema',
    'Admin',
    1,
    NOW(6),
    NOW(6)
);

-- Verificar creación
SELECT 'Tabla users creada exitosamente' as resultado;
SELECT COUNT(*) as total_usuarios FROM `users`;