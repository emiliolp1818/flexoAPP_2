-- Script para crear la tabla de Diseños en MySQL
-- FlexoAPP - Gestión de Diseños Flexográficos

USE flexoappbd;

-- Crear tabla de Diseños
CREATE TABLE IF NOT EXISTS Designs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ArticleF VARCHAR(50) NOT NULL UNIQUE,
    Client VARCHAR(255) NOT NULL,
    Description TEXT NOT NULL,
    Substrate VARCHAR(100) NOT NULL,
    Type ENUM('LAMINA', 'TUBULAR', 'SEMITUBULAR') NOT NULL,
    PrintType ENUM('CARA', 'DORSO', 'CARA_DORSO') NOT NULL,
    ColorCount INT NOT NULL CHECK (ColorCount >= 1 AND ColorCount <= 15),
    Colors JSON NOT NULL,
    Status ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    CreatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LastModified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    Designer VARCHAR(100) NOT NULL,
    CreatedBy INT,
    ModifiedBy INT,
    
    -- Índices para mejorar el rendimiento
    INDEX idx_articlef (ArticleF),
    INDEX idx_client (Client),
    INDEX idx_status (Status),
    INDEX idx_type (Type),
    INDEX idx_created_date (CreatedDate),
    INDEX idx_designer (Designer),
    
    -- Claves foráneas (si existe tabla de usuarios)
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE SET NULL,
    FOREIGN KEY (ModifiedBy) REFERENCES Users(Id) ON DELETE SET NULL
);

-- Insertar datos de ejemplo
INSERT INTO Designs (ArticleF, Client, Description, Substrate, Type, PrintType, ColorCount, Colors, Status, Designer, CreatedBy, ModifiedBy) VALUES
('F204567', 'ABSORBENTES DE COLOMBIA S.A', 'IMP BL PROTECTORES MULTIESTILO SERENITY 60und', 'R PE COEX BCO', 'LAMINA', 'CARA', 4, 
 JSON_ARRAY('CYAN', 'MAGENTA', 'YELLOW', 'BLACK'), 'ACTIVO', 'María González', 1, 1),

('F205123', 'PRODUCTOS FAMILIA S.A', 'IMP TOALLAS NOSOTRAS INVISIBLE ULTRA 10und', 'R PE COEX TRANS', 'TUBULAR', 'DORSO', 6, 
 JSON_ARRAY('CYAN', 'MAGENTA', 'YELLOW', 'BLACK', 'BLANCO OPACO', 'PANTONE 15-0343 TPX'), 'ACTIVO', 'Carlos Rodríguez', 1, 1),

('F206789', 'KIMBERLY CLARK COLOMBIA', 'IMP PAÑALES HUGGIES ACTIVE SEC ETAPA 3', 'BOPP PERLADO', 'SEMITUBULAR', 'CARA_DORSO', 8, 
 JSON_ARRAY('CYAN', 'MAGENTA', 'YELLOW', 'BLACK', 'BLANCO OPACO', 'PANTONE 15-0343 TPX', 'PANTONE 18-1750 TPX', 'PANTONE 19-4052 TPX'), 'ACTIVO', 'Ana Martínez', 1, 1),

('F207456', 'UNILEVER ANDINA COLOMBIA', 'IMP BOLSA DETERGENTE FAB LIMÓN 1KG', 'R PP COEX BCO', 'LAMINA', 'CARA', 5, 
 JSON_ARRAY('CYAN', 'MAGENTA', 'YELLOW', 'BLACK', 'PANTONE 15-0343 TPX'), 'INACTIVO', 'Juan Pérez', 1, 1),

('F208321', 'COLGATE PALMOLIVE COLOMBIA', 'IMP EMPAQUE CREMA DENTAL COLGATE TOTAL 75ML', 'BOPP METALIZADO', 'TUBULAR', 'DORSO', 3, 
 JSON_ARRAY('CYAN', 'BLANCO OPACO', 'PANTONE 15-4020 TPX'), 'ACTIVO', 'Laura Sánchez', 1, 1),

('F209654', 'JOHNSON & JOHNSON COLOMBIA', 'IMP TOALLITAS HÚMEDAS JOHNSON BABY 80und', 'PET METALIZADO', 'LAMINA', 'CARA_DORSO', 7, 
 JSON_ARRAY('CYAN', 'MAGENTA', 'YELLOW', 'BLACK', 'BLANCO OPACO', 'PANTONE 17-3938 TPX', 'PANTONE 15-4020 TPX'), 'ACTIVO', 'Diego Torres', 1, 1),

('F210987', 'ALPINA PRODUCTOS ALIMENTICIOS', 'IMP EMPAQUE YOGURT GRIEGO ALPINA FRESA 150G', 'R PE COEX BCO', 'SEMITUBULAR', 'CARA', 6, 
 JSON_ARRAY('CYAN', 'MAGENTA', 'YELLOW', 'BLACK', 'BLANCO OPACO', 'PANTONE 18-1142 TPX'), 'ACTIVO', 'Patricia Morales', 1, 1),

('F211234', 'NESTLÉ COLOMBIA S.A', 'IMP BOLSA CAFÉ NESCAFÉ CLÁSICO 170G', 'R PP COEX TRANS', 'LAMINA', 'DORSO', 4, 
 JSON_ARRAY('BLACK', 'YELLOW', 'PANTONE 18-1142 TPX', 'BLANCO OPACO'), 'INACTIVO', 'Roberto Silva', 1, 1);

-- Crear vista para estadísticas de diseños
CREATE VIEW DesignStats AS
SELECT 
    COUNT(*) as TotalDesigns,
    SUM(CASE WHEN Status = 'ACTIVO' THEN 1 ELSE 0 END) as ActiveDesigns,
    SUM(CASE WHEN Status = 'INACTIVO' THEN 1 ELSE 0 END) as InactiveDesigns,
    SUM(CASE WHEN Type = 'LAMINA' THEN 1 ELSE 0 END) as LaminaDesigns,
    SUM(CASE WHEN Type = 'TUBULAR' THEN 1 ELSE 0 END) as TubularDesigns,
    SUM(CASE WHEN Type = 'SEMITUBULAR' THEN 1 ELSE 0 END) as SemitubularDesigns,
    AVG(ColorCount) as AverageColors
FROM Designs;

-- Crear procedimiento almacenado para búsqueda de diseños
DELIMITER //
CREATE PROCEDURE SearchDesigns(
    IN searchTerm VARCHAR(255),
    IN statusFilter VARCHAR(20),
    IN typeFilter VARCHAR(20),
    IN limit_count INT,
    IN offset_count INT
)
BEGIN
    SET @sql = 'SELECT * FROM Designs WHERE 1=1';
    
    IF searchTerm IS NOT NULL AND searchTerm != '' THEN
        SET @sql = CONCAT(@sql, ' AND (ArticleF LIKE ''%', searchTerm, '%'' OR Client LIKE ''%', searchTerm, '%'' OR Description LIKE ''%', searchTerm, '%'')');
    END IF;
    
    IF statusFilter IS NOT NULL AND statusFilter != '' THEN
        SET @sql = CONCAT(@sql, ' AND Status = ''', statusFilter, '''');
    END IF;
    
    IF typeFilter IS NOT NULL AND typeFilter != '' THEN
        SET @sql = CONCAT(@sql, ' AND Type = ''', typeFilter, '''');
    END IF;
    
    SET @sql = CONCAT(@sql, ' ORDER BY LastModified DESC');
    
    IF limit_count IS NOT NULL AND limit_count > 0 THEN
        SET @sql = CONCAT(@sql, ' LIMIT ', limit_count);
        IF offset_count IS NOT NULL AND offset_count > 0 THEN
            SET @sql = CONCAT(@sql, ' OFFSET ', offset_count);
        END IF;
    END IF;
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //
DELIMITER ;

-- Crear trigger para auditoría
CREATE TABLE IF NOT EXISTS DesignAudit (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    DesignId INT NOT NULL,
    Action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    OldValues JSON,
    NewValues JSON,
    ChangedBy INT,
    ChangedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_design_id (DesignId),
    INDEX idx_changed_at (ChangedAt)
);

DELIMITER //
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
    ), NEW.CreatedBy);
END //

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
    ), NEW.ModifiedBy);
END //

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
    ), OLD.ModifiedBy);
END //
DELIMITER ;