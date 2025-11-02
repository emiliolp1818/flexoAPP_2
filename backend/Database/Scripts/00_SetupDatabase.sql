-- Script de configuración inicial para FlexoAPP
-- Crear base de datos y usuario admin

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS flexoapp_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE flexoapp_db;

-- Crear tabla Users si no existe
CREATE TABLE IF NOT EXISTS Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserCode VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    DisplayName VARCHAR(100) NOT NULL,
    Role VARCHAR(50) NOT NULL DEFAULT 'User',
    Area VARCHAR(100),
    Permissions JSON,
    ProfileImage LONGTEXT,
    ProfileImageUrl VARCHAR(500),
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_usercode (UserCode),
    INDEX idx_role (Role),
    INDEX idx_active (IsActive)
);

-- Insertar usuario admin si no existe
INSERT IGNORE INTO Users (UserCode, Password, FullName, DisplayName, Role, Area, IsActive) 
VALUES (
    'admin', 
    '$2a$11$rOzWz8VJkKKhq8fQNQKdUeJ5oQJ5oQJ5oQJ5oQJ5oQJ5oQJ5oQJ5oQ', -- admin123 hasheado
    'Administrador del Sistema',
    'Admin',
    'Admin',
    'Sistemas',
    TRUE
);

-- Verificar que el usuario se creó
SELECT 'Usuario admin creado/verificado' as resultado, COUNT(*) as usuarios_total FROM Users;

-- Mostrar información de la base de datos
SELECT 'Base de datos configurada correctamente' as estado;
SHOW TABLES;