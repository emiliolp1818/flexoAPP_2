-- =====================================================
-- Script: Crear tabla USERS con especificaciones actualizadas
-- Base de datos: flexoapp_bd (MySQL)
-- Fecha: 2024
-- Descripción: Tabla de usuarios del sistema FlexoAPP
-- =====================================================

-- Eliminar tabla si existe (CUIDADO: esto borrará todos los datos)
-- Comentar esta línea si solo quieres actualizar la estructura
DROP TABLE IF EXISTS users;

-- Crear tabla users con todas las columnas necesarias
CREATE TABLE users (
    -- Clave primaria autoincremental
    Id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del usuario',
    
    -- Información de autenticación
    UserCode VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único de usuario (ej: admin, 90009)',
    Password VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada con bcrypt',
    
    -- Información personal
    FirstName VARCHAR(50) NULL COMMENT 'Primer nombre del usuario',
    LastName VARCHAR(50) NULL COMMENT 'Apellido del usuario',
    Email VARCHAR(100) NULL COMMENT 'Correo electrónico',
    Phone VARCHAR(20) NULL COMMENT 'Número de teléfono',
    
    -- Rol y permisos
    Role VARCHAR(255) NOT NULL DEFAULT 'Operario' COMMENT 'Rol del usuario (Admin, Supervisor, Operario, etc.)',
    Permissions JSON NULL COMMENT 'Permisos específicos en formato JSON',
    
    -- Imagen de perfil (SOLO ProfileImage, sin ProfileImageUrl)
    ProfileImage LONGTEXT NULL COMMENT 'Imagen de perfil: base64 (data:image/...) o URL (/uploads/profiles/...)',
    
    -- Estado y auditoría
    IsActive TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Usuario activo (1) o inactivo (0)',
    CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación',
    UpdatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Fecha de última actualización',
    
    -- Índices para mejorar rendimiento
    INDEX idx_usercode (UserCode),
    INDEX idx_role (Role),
    INDEX idx_isactive (IsActive),
    INDEX idx_createdat (CreatedAt)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Tabla de usuarios del sistema FlexoAPP';
