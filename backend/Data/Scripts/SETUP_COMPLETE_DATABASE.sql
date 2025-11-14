-- =====================================================
-- SCRIPT COMPLETO DE CONFIGURACIÓN - FLEXOAPP
-- Base de datos unificada: flexoapp_bd
-- Propósito: Crear todas las tablas, vistas, triggers y datos iniciales
-- =====================================================

-- ===== CREAR BASE DE DATOS =====
-- CREATE DATABASE: crea la base de datos si no existe
-- CHARACTER SET utf8mb4: soporte completo para caracteres Unicode
-- COLLATE utf8mb4_unicode_ci: ordenamiento case-insensitive
CREATE DATABASE IF NOT EXISTS flexoapp_bd 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- ===== SELECCIONAR BASE DE DATOS =====
USE flexoapp_bd;

-- =====================================================
-- TABLA USERS
-- =====================================================
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
    
    -- Índices
    INDEX idx_usercode (UserCode),
    INDEX idx_role (Role),
    INDEX idx_active (IsActive)
);

-- Insertar usuario admin por defecto
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

-- =====================================================
-- TABLA DESIGNS
-- =====================================================
CREATE TABLE IF NOT EXISTS Designs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ArticleF VARCHAR(50) NOT NULL UNIQUE,
    Client VARCHAR(255) NOT NULL,
    Description TEXT NOT NULL,
    Substrate VARCHAR(100) NOT NULL,
    Type ENUM('LAMINA', 'TUBULAR', 'SEMITUBULAR') NOT NULL,
    PrintType ENUM('CARA', 'DORSO', 'CARA_DORSO') NOT NULL,
    ColorCount INT NOT NULL CHECK (ColorCount >= 1 AND ColorCount <= 10),
    Color1 VARCHAR(100),
    Color2 VARCHAR(100),
    Color3 VARCHAR(100),
    Color4 VARCHAR(100),
    Color5 VARCHAR(100),
    Color6 VARCHAR(100),
    Color7 VARCHAR(100),
    Color8 VARCHAR(100),
    Color9 VARCHAR(100),
    Color10 VARCHAR(100),
    Status ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    CreatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LastModified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    Designer VARCHAR(100) NOT NULL,
    CreatedByUserId INT,
    
    -- Índices para mejorar el rendimiento
    INDEX idx_articlef (ArticleF),
    INDEX idx_client (Client),
    INDEX idx_status (Status),
    INDEX idx_type (Type),
    INDEX idx_created_date (CreatedDate),
    INDEX idx_designer (Designer),
    
    -- Clave foránea
    FOREIGN KEY (CreatedByUserId) REFERENCES Users(Id) ON DELETE SET NULL
);

-- =====================================================
-- DATOS DE EJEMPLO PARA DESIGNS
-- =====================================================
INSERT IGNORE INTO Designs (ArticleF, Client, Description, Substrate, Type, PrintType, ColorCount, Color1, Color2, Color3, Color4, Color5, Color6, Color7, Color8, Status, Designer, CreatedByUserId) VALUES
('F204567', 'ABSORBENTES DE COLOMBIA S.A', 'IMP BL PROTECTORES MULTIESTILO SERENITY 60und', 'R PE COEX BCO', 'LAMINA', 'CARA', 4, 
 'CYAN', 'MAGENTA', 'YELLOW', 'BLACK', NULL, NULL, NULL, NULL, 'ACTIVO', 'María González', 1),

('F205123', 'PRODUCTOS FAMILIA S.A', 'IMP TOALLAS NOSOTRAS INVISIBLE ULTRA 10und', 'R PE COEX TRANS', 'TUBULAR', 'DORSO', 6, 
 'CYAN', 'MAGENTA', 'YELLOW', 'BLACK', 'BLANCO OPACO', 'PANTONE 15-0343 TPX', NULL, NULL, 'ACTIVO', 'Carlos Rodríguez', 1),

('F206789', 'KIMBERLY CLARK COLOMBIA', 'IMP PAÑALES HUGGIES ACTIVE SEC ETAPA 3', 'BOPP PERLADO', 'SEMITUBULAR', 'CARA_DORSO', 8, 
 'CYAN', 'MAGENTA', 'YELLOW', 'BLACK', 'BLANCO OPACO', 'PANTONE 15-0343 TPX', 'PANTONE 18-1750 TPX', 'PANTONE 19-4052 TPX', 'ACTIVO', 'Ana Martínez', 1),

('F207456', 'UNILEVER ANDINA COLOMBIA', 'IMP BOLSA DETERGENTE FAB LIMÓN 1KG', 'R PP COEX BCO', 'LAMINA', 'CARA', 5, 
 'CYAN', 'MAGENTA', 'YELLOW', 'BLACK', 'PANTONE 15-0343 TPX', NULL, NULL, NULL, 'INACTIVO', 'Juan Pérez', 1),

('F208321', 'COLGATE PALMOLIVE COLOMBIA', 'IMP EMPAQUE CREMA DENTAL COLGATE TOTAL 75ML', 'BOPP METALIZADO', 'TUBULAR', 'DORSO', 3, 
 'CYAN', 'BLANCO OPACO', 'PANTONE 15-4020 TPX', NULL, NULL, NULL, NULL, NULL, 'ACTIVO', 'Laura Sánchez', 1),

('F209654', 'JOHNSON & JOHNSON COLOMBIA', 'IMP TOALLITAS HÚMEDAS JOHNSON BABY 80und', 'PET METALIZADO', 'LAMINA', 'CARA_DORSO', 7, 
 'CYAN', 'MAGENTA', 'YELLOW', 'BLACK', 'BLANCO OPACO', 'PANTONE 17-3938 TPX', 'PANTONE 15-4020 TPX', NULL, 'ACTIVO', 'Diego Torres', 1);

-- =====================================================
-- TABLA DE AUDITORÍA
-- =====================================================
CREATE TABLE IF NOT EXISTS DesignAudit (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    DesignId INT NOT NULL,
    Action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    OldValues JSON,
    NewValues JSON,
    ChangedBy INT,
    ChangedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_design_id (DesignId),
    INDEX idx_changed_at (ChangedAt),
    FOREIGN KEY (ChangedBy) REFERENCES Users(Id) ON DELETE SET NULL
);

-- =====================================================
-- VISTA DE ESTADÍSTICAS
-- =====================================================
CREATE OR REPLACE VIEW DesignStats AS
SELECT 
    COUNT(*) as TotalDesigns,
    SUM(CASE WHEN Status = 'ACTIVO' THEN 1 ELSE 0 END) as ActiveDesigns,
    SUM(CASE WHEN Status = 'INACTIVO' THEN 1 ELSE 0 END) as InactiveDesigns,
    SUM(CASE WHEN Type = 'LAMINA' THEN 1 ELSE 0 END) as LaminaDesigns,
    SUM(CASE WHEN Type = 'TUBULAR' THEN 1 ELSE 0 END) as TubularDesigns,
    SUM(CASE WHEN Type = 'SEMITUBULAR' THEN 1 ELSE 0 END) as SemitubularDesigns,
    AVG(ColorCount) as AverageColors
FROM Designs;

-- =====================================================
-- TRIGGERS DE AUDITORÍA
-- =====================================================
DELIMITER //

DROP TRIGGER IF EXISTS DesignAuditInsert//
CREATE TRIGGER DesignAuditInsert
    AFTER INSERT ON Designs
    FOR EACH ROW
BEGIN
    INSERT INTO DesignAudit (DesignId, Action, NewValues, ChangedBy)
    VALUES (NEW.Id, 'INSERT', JSON_OBJECT(
        'ArticleF', NEW.ArticleF,
        'Client', NEW.Client,
        'Description', NEW.Description,
        'Substrate', NEW.Substrate,
        'Type', NEW.Type,
        'PrintType', NEW.PrintType,
        'ColorCount', NEW.ColorCount,
        'Colors', NEW.Colors,
        'Status', NEW.Status,
        'Designer', NEW.Designer
    ), NEW.CreatedByUserId);
END //

DROP TRIGGER IF EXISTS DesignAuditUpdate//
CREATE TRIGGER DesignAuditUpdate
    AFTER UPDATE ON Designs
    FOR EACH ROW
BEGIN
    INSERT INTO DesignAudit (DesignId, Action, OldValues, NewValues, ChangedBy)
    VALUES (NEW.Id, 'UPDATE', JSON_OBJECT(
        'ArticleF', OLD.ArticleF,
        'Client', OLD.Client,
        'Description', OLD.Description,
        'Substrate', OLD.Substrate,
        'Type', OLD.Type,
        'PrintType', OLD.PrintType,
        'ColorCount', OLD.ColorCount,
        'Colors', OLD.Colors,
        'Status', OLD.Status,
        'Designer', OLD.Designer
    ), JSON_OBJECT(
        'ArticleF', NEW.ArticleF,
        'Client', NEW.Client,
        'Description', NEW.Description,
        'Substrate', NEW.Substrate,
        'Type', NEW.Type,
        'PrintType', NEW.PrintType,
        'ColorCount', NEW.ColorCount,
        'Colors', NEW.Colors,
        'Status', NEW.Status,
        'Designer', NEW.Designer
    ), NEW.CreatedByUserId);
END //

DROP TRIGGER IF EXISTS DesignAuditDelete//
CREATE TRIGGER DesignAuditDelete
    AFTER DELETE ON Designs
    FOR EACH ROW
BEGIN
    INSERT INTO DesignAudit (DesignId, Action, OldValues, ChangedBy)
    VALUES (OLD.Id, 'DELETE', JSON_OBJECT(
        'ArticleF', OLD.ArticleF,
        'Client', OLD.Client,
        'Description', OLD.Description,
        'Substrate', OLD.Substrate,
        'Type', OLD.Type,
        'PrintType', OLD.PrintType,
        'ColorCount', OLD.ColorCount,
        'Colors', OLD.Colors,
        'Status', OLD.Status,
        'Designer', OLD.Designer
    ), OLD.CreatedByUserId);
END //

DELIMITER ;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT 'Base de datos configurada correctamente' as Estado;
SELECT 'Tablas creadas:' as Info;
SHOW TABLES;

SELECT 'Usuario admin verificado:' as Info;
SELECT UserCode, FullName, Role, IsActive FROM Users WHERE UserCode = 'admin';

SELECT 'Diseños de ejemplo:' as Info;
SELECT COUNT(*) as TotalDesigns FROM Designs;

SELECT 'Estadísticas:' as Info;
SELECT * FROM DesignStats;

SELECT '¡Configuración completa!' as Resultado;