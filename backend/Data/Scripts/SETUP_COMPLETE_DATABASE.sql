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
-- TABLA: DOCUMENTO
-- Gestión de documentos del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS Documento (
    -- ID único autoincremental
    DocumentoID INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del documento',
    
    -- Información básica
    Nombre VARCHAR(255) NOT NULL COMMENT 'Nombre del documento',
    Tipo VARCHAR(50) NOT NULL COMMENT 'Tipo de documento (PDF, Word, Excel, etc.)',
    Categoria VARCHAR(100) NOT NULL COMMENT 'Categoría del documento',
    Descripcion TEXT NULL COMMENT 'Descripción detallada del documento',
    
    -- Información del archivo
    NombreArchivo VARCHAR(255) NULL COMMENT 'Nombre del archivo físico',
    RutaArchivo VARCHAR(500) NULL COMMENT 'Ruta o URL del archivo',
    TamanoBytes BIGINT NULL COMMENT 'Tamaño del archivo en bytes',
    TamanoFormateado VARCHAR(50) NULL COMMENT 'Tamaño formateado del archivo',
    Extension VARCHAR(20) NULL COMMENT 'Extensión del archivo',
    HashMD5 VARCHAR(32) NULL COMMENT 'Hash MD5 del archivo',
    
    -- Estado y control
    Estado ENUM('active', 'draft', 'archived') NOT NULL DEFAULT 'draft' 
        COMMENT 'Estado del documento',
    Version VARCHAR(20) NULL DEFAULT '1.0' COMMENT 'Versión del documento',
    
    -- Metadatos
    Etiquetas VARCHAR(500) NULL COMMENT 'Etiquetas separadas por comas',
    PalabrasClave VARCHAR(500) NULL COMMENT 'Palabras clave para búsqueda',
    
    -- Auditoría
    CreadoPor VARCHAR(100) NULL COMMENT 'Usuario que creó el documento',
    FechaCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ModificadoPor VARCHAR(100) NULL COMMENT 'Usuario que modificó',
    FechaModificacion DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Control de acceso
    EsPublico BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Documento público',
    NivelAcceso INT NOT NULL DEFAULT 1 COMMENT 'Nivel de acceso requerido',
    
    -- Estadísticas
    NumeroVistas INT NOT NULL DEFAULT 0 COMMENT 'Número de vistas',
    NumeroDescargas INT NOT NULL DEFAULT 0 COMMENT 'Número de descargas',
    FechaUltimoAcceso DATETIME NULL COMMENT 'Fecha de último acceso',
    
    -- Índices
    INDEX idx_nombre (Nombre),
    INDEX idx_tipo (Tipo),
    INDEX idx_categoria (Categoria),
    INDEX idx_estado (Estado),
    INDEX idx_fecha_creacion (FechaCreacion),
    INDEX idx_creado_por (CreadoPor),
    FULLTEXT INDEX idx_busqueda (Nombre, Descripcion, Etiquetas, PalabrasClave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Gestión de documentos del sistema';

-- Insertar documentos de ejemplo con categorías actualizadas
INSERT IGNORE INTO Documento (
    Nombre, Tipo, Categoria, Descripcion, NombreArchivo, RutaArchivo,
    TamanoBytes, TamanoFormateado, Extension, Estado, Version,
    Etiquetas, PalabrasClave, CreadoPor, EsPublico, NivelAcceso
) VALUES 
-- Documento 1: Reporte de Producción
('Reporte de Producción Enero 2024', 'Excel', 'reportes', 
 'Reporte mensual de producción del mes de enero con estadísticas detalladas',
 'reporte_produccion_enero_2024.xlsx', '/documentos/reportes/reporte_produccion_enero_2024.xlsx',
 3355443, '3.2 MB', 'xlsx', 'active', '1.0',
 'reporte,produccion,enero,mensual,estadisticas', 'reporte produccion enero mensual estadisticas',
 'admin', FALSE, 1),
 
-- Documento 2: Formato de Solicitud
('Formato de Solicitud de Materiales', 'PDF', 'formatos',
 'Formato estándar para solicitud de materiales de producción',
 'formato_solicitud_materiales.pdf', '/documentos/formatos/formato_solicitud_materiales.pdf',
 524288, '512 KB', 'pdf', 'active', '2.0',
 'formato,solicitud,materiales,produccion', 'formato solicitud materiales',
 'admin', TRUE, 0),
 
-- Documento 3: Especificaciones Técnicas
('Especificaciones Técnicas del Sistema', 'Word', 'tecnicos',
 'Documento técnico con especificaciones completas del sistema FlexoAPP',
 'especificaciones_tecnicas_sistema.docx', '/documentos/tecnicos/especificaciones_tecnicas_sistema.docx',
 1887436, '1.8 MB', 'docx', 'active', '3.1',
 'tecnico,especificaciones,sistema,arquitectura', 'especificaciones tecnicas sistema arquitectura',
 'admin', FALSE, 2),
 
-- Documento 4: Manual de Procedimientos
('Manual de Procedimientos Operativos', 'PDF', 'otros',
 'Manual completo de procedimientos operativos estándar',
 'manual_procedimientos_operativos.pdf', '/documentos/otros/manual_procedimientos_operativos.pdf',
 2097152, '2.0 MB', 'pdf', 'active', '1.5',
 'manual,procedimientos,operativos,estandar', 'manual procedimientos operativos',
 'admin', TRUE, 0),
 
-- Documento 5: Reporte de Calidad
('Reporte de Control de Calidad Q1', 'Excel', 'reportes',
 'Reporte trimestral de control de calidad del primer trimestre',
 'reporte_calidad_q1.xlsx', '/documentos/reportes/reporte_calidad_q1.xlsx',
 1572864, '1.5 MB', 'xlsx', 'archived', '1.0',
 'reporte,calidad,control,trimestral', 'reporte calidad control trimestral',
 'calidad', FALSE, 1);

-- Procedimientos almacenados para documentos
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS IncrementarVistaDocumento(IN p_DocumentoID INT)
BEGIN
    UPDATE Documento 
    SET NumeroVistas = NumeroVistas + 1,
        FechaUltimoAcceso = CURRENT_TIMESTAMP
    WHERE DocumentoID = p_DocumentoID;
END //

CREATE PROCEDURE IF NOT EXISTS IncrementarDescargaDocumento(IN p_DocumentoID INT)
BEGIN
    UPDATE Documento 
    SET NumeroDescargas = NumeroDescargas + 1,
        FechaUltimoAcceso = CURRENT_TIMESTAMP
    WHERE DocumentoID = p_DocumentoID;
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

SELECT 'Documentos de ejemplo:' as Info;
SELECT COUNT(*) as TotalDocumentos FROM Documento;

SELECT 'Estadísticas:' as Info;
SELECT * FROM DesignStats;

SELECT '¡Configuración completa!' as Resultado;