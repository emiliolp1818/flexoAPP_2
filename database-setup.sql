-- ============================================
-- FlexoAPP - Database Setup Script
-- Para Railway MySQL
-- ============================================

-- 1. Crear tabla Users
CREATE TABLE IF NOT EXISTS Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserCode VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Role VARCHAR(50) NOT NULL,
    Permissions JSON,
    ProfileImage LONGTEXT,
    ProfileImageUrl VARCHAR(500),
    Phone VARCHAR(20),
    Email VARCHAR(100),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (Role),
    INDEX idx_active (IsActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Crear tabla designs
CREATE TABLE IF NOT EXISTS designs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    `color 1` VARCHAR(100),
    `color 2` VARCHAR(100),
    `color 3` VARCHAR(100),
    `color 4` VARCHAR(100),
    `color 5` VARCHAR(100),
    `color 6` VARCHAR(100),
    `color 7` VARCHAR(100),
    `color 8` VARCHAR(100),
    `color 9` VARCHAR(100),
    `color 10` VARCHAR(100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Crear tabla maquinas
CREATE TABLE IF NOT EXISTS maquinas (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    NumeroMaquina INT NOT NULL,
    Articulo VARCHAR(50) NOT NULL,
    OtSap VARCHAR(50) NOT NULL,
    Cliente VARCHAR(200) NOT NULL,
    Referencia VARCHAR(100),
    Td VARCHAR(10),
    NumeroColores INT NOT NULL,
    Colores JSON NOT NULL,
    Kilos DECIMAL(10,2) NOT NULL,
    FechaTintaEnMaquina DATETIME NOT NULL,
    Sustrato VARCHAR(100) NOT NULL,
    Estado VARCHAR(20) DEFAULT 'LISTO',
    Observaciones VARCHAR(1000),
    LastActionBy VARCHAR(100),
    CreatedBy INT,
    UpdatedBy INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_numero (NumeroMaquina),
    INDEX idx_estado (Estado),
    INDEX idx_fecha (FechaTintaEnMaquina),
    INDEX idx_otsap (OtSap),
    INDEX idx_cliente (Cliente),
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE SET NULL,
    FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Crear tabla pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    MachineNumber INT NOT NULL,
    NumeroPedido VARCHAR(50) NOT NULL UNIQUE,
    Articulo VARCHAR(50) NOT NULL,
    Cliente VARCHAR(200) NOT NULL,
    Descripcion VARCHAR(500),
    Cantidad DECIMAL(10,2) NOT NULL,
    Unidad VARCHAR(50) DEFAULT 'kg',
    Estado VARCHAR(20) DEFAULT 'PENDIENTE',
    FechaPedido DATETIME NOT NULL,
    Prioridad VARCHAR(20) DEFAULT 'NORMAL',
    Observaciones VARCHAR(1000),
    AsignadoA VARCHAR(100),
    CreatedBy INT,
    UpdatedBy INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_numero_pedido (NumeroPedido),
    INDEX idx_machine (MachineNumber),
    INDEX idx_estado (Estado),
    INDEX idx_fecha (FechaPedido),
    INDEX idx_prioridad (Prioridad),
    INDEX idx_machine_estado (MachineNumber, Estado),
    INDEX idx_cliente_estado (Cliente, Estado),
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE SET NULL,
    FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Crear tabla machine_programs
CREATE TABLE IF NOT EXISTS machine_programs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    MachineNumber INT NOT NULL,
    Name VARCHAR(200) NOT NULL,
    Articulo VARCHAR(50) NOT NULL,
    OtSap VARCHAR(50) NOT NULL UNIQUE,
    Cliente VARCHAR(200) NOT NULL,
    Referencia VARCHAR(500),
    Td VARCHAR(3),
    Colores JSON NOT NULL,
    Sustrato VARCHAR(200),
    Kilos DECIMAL(10,2) NOT NULL,
    Estado VARCHAR(20) DEFAULT 'LISTO',
    FechaInicio DATETIME NOT NULL,
    Progreso INT DEFAULT 0,
    Observaciones VARCHAR(1000),
    LastActionBy VARCHAR(100),
    LastAction VARCHAR(200),
    OperatorName VARCHAR(100),
    CreatedBy INT,
    UpdatedBy INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_machine (MachineNumber),
    INDEX idx_estado (Estado),
    INDEX idx_fecha (FechaInicio),
    INDEX idx_otsap (OtSap),
    INDEX idx_machine_estado (MachineNumber, Estado),
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE SET NULL,
    FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Crear tabla Activities
CREATE TABLE IF NOT EXISTS Activities (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    UserCode VARCHAR(50),
    Action VARCHAR(200) NOT NULL,
    Description VARCHAR(500) NOT NULL,
    Module VARCHAR(100) NOT NULL,
    Details VARCHAR(1000),
    IpAddress VARCHAR(45),
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (UserId),
    INDEX idx_module (Module),
    INDEX idx_timestamp (Timestamp),
    INDEX idx_user_timestamp (UserId, Timestamp),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Crear tabla condicionunica
CREATE TABLE IF NOT EXISTS condicionunica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farticulo VARCHAR(50) NOT NULL,
    referencia VARCHAR(200) NOT NULL,
    estante VARCHAR(50) NOT NULL,
    numerocarpeta VARCHAR(50) NOT NULL,
    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastmodified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_farticulo (farticulo),
    INDEX idx_estante (estante),
    INDEX idx_lastmodified (lastmodified DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Datos iniciales
-- ============================================

-- Insertar usuario admin (password: admin123)
-- Nota: Debes generar el hash BCrypt de tu contraseña
INSERT INTO Users (UserCode, Password, FirstName, LastName, Role, IsActive)
VALUES ('admin', '$2a$11$YourBCryptHashHere', 'Admin', 'System', 'Admin', TRUE)
ON DUPLICATE KEY UPDATE UserCode = UserCode;

-- ============================================
-- Verificación
-- ============================================

-- Mostrar todas las tablas
SHOW TABLES;

-- Contar registros en cada tabla
SELECT 'Users' as tabla, COUNT(*) as registros FROM Users
UNION ALL
SELECT 'designs', COUNT(*) FROM designs
UNION ALL
SELECT 'maquinas', COUNT(*) FROM maquinas
UNION ALL
SELECT 'pedidos', COUNT(*) FROM pedidos
UNION ALL
SELECT 'machine_programs', COUNT(*) FROM machine_programs
UNION ALL
SELECT 'Activities', COUNT(*) FROM Activities
UNION ALL
SELECT 'condicionunica', COUNT(*) FROM condicionunica;

-- ============================================
-- Script completado
-- ============================================
