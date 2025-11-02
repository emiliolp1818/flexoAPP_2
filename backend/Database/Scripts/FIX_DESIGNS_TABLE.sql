-- SOLUCIÓN RÁPIDA: Recrear tabla Designs con estructura correcta
USE flexoapp_db;

-- Hacer backup de datos existentes si los hay
CREATE TABLE IF NOT EXISTS Designs_backup AS SELECT * FROM Designs;

-- Eliminar tabla actual
DROP TABLE IF EXISTS Designs;

-- Recrear tabla con estructura correcta
CREATE TABLE Designs (
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

-- Insertar datos de ejemplo
INSERT INTO Designs (ArticleF, Client, Description, Substrate, Type, PrintType, ColorCount, Color1, Color2, Color3, Color4, Color5, Color6, Color7, Color8, Status, Designer, CreatedByUserId) VALUES
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

-- Verificar que todo esté correcto
SELECT 'Tabla Designs recreada exitosamente' as Status;
SELECT COUNT(*) as TotalDesigns FROM Designs;
SELECT Id, ArticleF, Client, ColorCount, Color1, Color2, Color3, Status FROM Designs LIMIT 3;