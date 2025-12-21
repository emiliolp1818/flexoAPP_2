-- ===================================================================
-- SCRIPT DE CREACIÓN DE TABLA: flexographic_designs
-- ===================================================================
-- Descripción: Tabla para almacenar diseños flexográficos
-- Llave Primaria: ArticleF (código único del diseño)
-- Base de Datos: MySQL 8.0+
-- Fecha: 2024
-- ===================================================================

USE flexoapp_bd;

-- Eliminar tabla si existe (para recreación limpia)
DROP TABLE IF EXISTS flexographic_designs;

-- Crear tabla de diseños flexográficos
CREATE TABLE flexographic_designs (
    -- ===== LLAVE PRIMARIA =====
    ArticleF VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'Código único del diseño flexográfico (ej: F204567)',
    
    -- ===== INFORMACIÓN BÁSICA =====
    Client VARCHAR(100) NOT NULL COMMENT 'Nombre de la empresa cliente',
    Description VARCHAR(200) NOT NULL COMMENT 'Descripción detallada del producto',
    Substrate VARCHAR(50) NOT NULL COMMENT 'Material base sobre el que se imprime',
    
    -- ===== ESPECIFICACIONES TÉCNICAS =====
    Type ENUM('LAMINA', 'TUBULAR', 'SEMITUBULAR') NOT NULL DEFAULT 'LAMINA' COMMENT 'Tipo de estructura del empaque',
    PrintType ENUM('CARA', 'DORSO', 'CARA_DORSO') NOT NULL DEFAULT 'CARA' COMMENT 'Tipo de impresión (una o ambas caras)',
    ColorCount INT NOT NULL DEFAULT 1 COMMENT 'Número total de colores en la impresión',
    
    -- ===== COLORES PANTONE (hasta 10 colores) =====
    Color1 VARCHAR(50) NULL COMMENT 'Color Pantone 1',
    Color2 VARCHAR(50) NULL COMMENT 'Color Pantone 2',
    Color3 VARCHAR(50) NULL COMMENT 'Color Pantone 3',
    Color4 VARCHAR(50) NULL COMMENT 'Color Pantone 4',
    Color5 VARCHAR(50) NULL COMMENT 'Color Pantone 5',
    Color6 VARCHAR(50) NULL COMMENT 'Color Pantone 6',
    Color7 VARCHAR(50) NULL COMMENT 'Color Pantone 7',
    Color8 VARCHAR(50) NULL COMMENT 'Color Pantone 8',
    Color9 VARCHAR(50) NULL COMMENT 'Color Pantone 9',
    Color10 VARCHAR(50) NULL COMMENT 'Color Pantone 10',
    
    -- ===== ESTADO Y AUDITORÍA =====
    Status ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO' COMMENT 'Estado del diseño',
    CreatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    LastModified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
    
    -- ===== ÍNDICES PARA OPTIMIZACIÓN =====
    INDEX idx_client (Client),
    INDEX idx_status (Status),
    INDEX idx_type (Type),
    INDEX idx_created_date (CreatedDate),
    INDEX idx_color_count (ColorCount)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabla de diseños flexográficos con ArticleF como llave primaria';

-- ===================================================================
-- VERIFICACIÓN DE CREACIÓN
-- ===================================================================
SELECT 
    'Tabla flexographic_designs creada exitosamente' AS Mensaje,
    COUNT(*) AS TotalRegistros
FROM flexographic_designs;

-- Mostrar estructura de la tabla
DESCRIBE flexographic_designs;

-- Mostrar índices de la tabla
SHOW INDEX FROM flexographic_designs;

-- ===================================================================
-- NOTAS IMPORTANTES
-- ===================================================================
-- 1. ArticleF es la llave primaria (no ID autoincremental)
-- 2. ArticleF debe ser único y no puede ser NULL
-- 3. Los colores son opcionales (NULL permitido)
-- 4. ColorCount indica cuántos colores se usan (1-10)
-- 5. Status por defecto es 'ACTIVO'
-- 6. CreatedDate y LastModified se manejan automáticamente
-- ===================================================================
