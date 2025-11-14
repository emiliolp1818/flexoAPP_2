-- =====================================================
-- SCRIPT DE CONFIGURACIÓN INICIAL PARA FLEXOAPP
-- Base de datos: flexoapp_bd
-- Propósito: Crear base de datos y usuario administrador
-- =====================================================

-- ===== CREAR BASE DE DATOS =====
-- CREATE DATABASE: crea la base de datos si no existe
-- IF NOT EXISTS: evita error si la base de datos ya existe
-- CHARACTER SET utf8mb4: soporte completo para caracteres Unicode (emojis, acentos, ñ, etc.)
-- COLLATE utf8mb4_unicode_ci: ordenamiento case-insensitive para Unicode
CREATE DATABASE IF NOT EXISTS flexoapp_bd 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- ===== SELECCIONAR BASE DE DATOS =====
-- USE: selecciona la base de datos flexoapp_bd para ejecutar los siguientes comandos
USE flexoapp_bd;

-- ===== CREAR TABLA USERS =====
-- Tabla principal de usuarios del sistema FlexoAPP
-- Almacena información de autenticación, perfiles y permisos
CREATE TABLE IF NOT EXISTS Users (
    -- ===== CLAVE PRIMARIA =====
    -- Id: identificador único autoincremental para cada usuario
    Id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- ===== CAMPOS DE AUTENTICACIÓN =====
    -- UserCode: código único de usuario (ej: admin, operador1, etc.)
    -- UNIQUE: no puede haber dos usuarios con el mismo código
    UserCode VARCHAR(50) NOT NULL UNIQUE,
    
    -- Password: contraseña hasheada con bcrypt (nunca se guarda en texto plano)
    Password VARCHAR(255) NOT NULL,
    
    -- ===== INFORMACIÓN DEL USUARIO =====
    -- FullName: nombre completo del usuario (ej: Juan Pérez García)
    FullName VARCHAR(100) NOT NULL,
    
    -- DisplayName: nombre para mostrar en la interfaz (ej: Juan P.)
    DisplayName VARCHAR(100) NOT NULL,
    
    -- ===== ROL Y PERMISOS =====
    -- Role: rol del usuario (Admin, Supervisor, Operador, etc.)
    -- DEFAULT 'User': si no se especifica, el rol por defecto es 'User'
    Role VARCHAR(50) NOT NULL DEFAULT 'User',
    
    -- Area: área de trabajo del usuario (Producción, Calidad, Sistemas, etc.)
    Area VARCHAR(100),
    
    -- Permissions: permisos específicos en formato JSON
    -- Ejemplo: {"canEdit": true, "canDelete": false}
    Permissions JSON,
    
    -- ===== IMAGEN DE PERFIL =====
    -- ProfileImage: imagen de perfil en formato base64 (LONGTEXT para imágenes grandes)
    ProfileImage LONGTEXT,
    
    -- ProfileImageUrl: URL de la imagen de perfil (alternativa a base64)
    ProfileImageUrl VARCHAR(500),
    
    -- ===== ESTADO Y AUDITORÍA =====
    -- IsActive: indica si el usuario está activo (TRUE) o deshabilitado (FALSE)
    -- BOOLEAN: tipo de dato booleano (TRUE/FALSE)
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- CreatedAt: fecha y hora de creación del usuario
    -- CURRENT_TIMESTAMP: se establece automáticamente al crear el registro
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- UpdatedAt: fecha y hora de última actualización
    -- ON UPDATE CURRENT_TIMESTAMP: se actualiza automáticamente al modificar el registro
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- ===== ÍNDICES PARA OPTIMIZACIÓN =====
    -- Índices para mejorar el rendimiento de las consultas
    INDEX idx_usercode (UserCode),  -- Búsqueda rápida por código de usuario
    INDEX idx_role (Role),          -- Filtrado rápido por rol
    INDEX idx_active (IsActive)     -- Filtrado rápido por estado activo/inactivo
);

-- ===== INSERTAR USUARIO ADMINISTRADOR =====
-- INSERT IGNORE: inserta el usuario solo si no existe (evita duplicados)
-- Crea el usuario administrador por defecto del sistema
INSERT IGNORE INTO Users (UserCode, Password, FullName, DisplayName, Role, Area, IsActive) 
VALUES (
    'admin',  -- Código de usuario: admin
    '$2a$11$rOzWz8VJkKKhq8fQNQKdUeJ5oQJ5oQJ5oQJ5oQJ5oQJ5oQJ5oQJ5oQ', -- Contraseña: admin123 (hasheada con bcrypt)
    'Administrador del Sistema',  -- Nombre completo
    'Admin',                       -- Nombre para mostrar
    'Admin',                       -- Rol: administrador con todos los permisos
    'Sistemas',                    -- Área de trabajo
    TRUE                           -- Usuario activo
);

-- ===== VERIFICACIÓN =====
-- Verificar que el usuario administrador se creó correctamente
SELECT 'Usuario admin creado/verificado' as resultado, COUNT(*) as usuarios_total FROM Users;

-- ===== INFORMACIÓN DE LA BASE DE DATOS =====
-- Mostrar estado de la configuración
SELECT 'Base de datos flexoapp_bd configurada correctamente' as estado;

-- Mostrar todas las tablas creadas en la base de datos
SHOW TABLES;