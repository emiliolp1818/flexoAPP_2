-- Script para crear la tabla de usuarios en MySQL
-- Base de datos: flexoapp_db

USE flexoapp_db;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserCode VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    DisplayName VARCHAR(100) NOT NULL,
    Role ENUM('Admin', 'Operario', 'Matizadores', 'Supervisor', 'Prealistador', 'Retornos') NOT NULL,
    Area VARCHAR(100) NULL,
    Permissions TEXT NULL,
    ProfileImage LONGTEXT NULL,
    ProfileImageUrl VARCHAR(500) NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_usercode (UserCode),
    INDEX idx_active (IsActive),
    INDEX idx_role (Role)
);

-- Insertar usuario administrador por defecto
INSERT INTO Users (UserCode, Password, FullName, DisplayName, Role, Area, Permissions, IsActive, CreatedAt, UpdatedAt)
VALUES (
    'admin',
    '$2a$11$8K1p/a0dL2LkqvQOuiOX2uy7YhFYc6bOzs5GyVBxUb95G5KuYzK2W', -- admin123 hasheado con BCrypt
    'Administrador del Sistema',
    'Admin',
    'Admin',
    'Administración',
    '["all_access", "user_management", "system_config", "reports_access"]',
    TRUE,
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE
    Password = VALUES(Password),
    FullName = VALUES(FullName),
    DisplayName = VALUES(DisplayName),
    UpdatedAt = NOW();

-- Verificar que la tabla se creó correctamente
SELECT * FROM Users WHERE UserCode = 'admin';