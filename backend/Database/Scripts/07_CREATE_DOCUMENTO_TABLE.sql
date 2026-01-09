-- =====================================================
-- SCRIPT: CREAR TABLA DOCUMENTO
-- Propósito: Crear tabla de documentos del sistema
-- Base de datos: MySQL (Railway/Render)
-- Tabla: Documento
-- =====================================================

-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS `Documento` (
    -- Clave primaria autoincremental
    `DocumentoID` INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Información básica del documento
    `Nombre` VARCHAR(255) NOT NULL,
    `Tipo` VARCHAR(50) NOT NULL,
    `Categoria` VARCHAR(100) NOT NULL,
    `Descripcion` TEXT NULL,
    
    -- Información del archivo físico
    `NombreArchivo` VARCHAR(255) NULL,
    `RutaArchivo` VARCHAR(500) NULL,
    `TamanoBytes` BIGINT NULL,
    `TamanoFormateado` VARCHAR(50) NULL,
    `Extension` VARCHAR(20) NULL,
    `HashMD5` VARCHAR(32) NULL,
    
    -- Estado y control
    `Estado` VARCHAR(20) NOT NULL DEFAULT 'draft',
    `Version` VARCHAR(20) NULL,
    
    -- Metadatos
    `Etiquetas` VARCHAR(500) NULL,
    `PalabrasClave` VARCHAR(500) NULL,
    
    -- Auditoría
    `CreadoPor` VARCHAR(100) NULL,
    `FechaCreacion` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `ModificadoPor` VARCHAR(100) NULL,
    `FechaModificacion` DATETIME(6) NULL,
    
    -- Control de acceso
    `EsPublico` TINYINT(1) NOT NULL DEFAULT 0,
    `NivelAcceso` INT NOT NULL DEFAULT 1,
    
    -- Estadísticas
    `NumeroVistas` INT NOT NULL DEFAULT 0,
    `NumeroDescargas` INT NOT NULL DEFAULT 0,
    `FechaUltimoAcceso` DATETIME(6) NULL,
    
    -- Índices para optimizar consultas
    INDEX `idx_documento_nombre` (`Nombre`),
    INDEX `idx_documento_tipo` (`Tipo`),
    INDEX `idx_documento_categoria` (`Categoria`),
    INDEX `idx_documento_estado` (`Estado`),
    INDEX `idx_documento_creado_por` (`CreadoPor`),
    INDEX `idx_documento_fecha_creacion` (`FechaCreacion`),
    INDEX `idx_documento_publico` (`EsPublico`),
    INDEX `idx_documento_nivel_acceso` (`NivelAcceso`),
    INDEX `idx_documento_extension` (`Extension`),
    
    -- Índice de texto completo para búsquedas
    FULLTEXT INDEX `ft_documento_busqueda` (`Nombre`, `Descripcion`, `Etiquetas`, `PalabrasClave`),
    
    -- Restricciones de validación
    CONSTRAINT `chk_documento_estado_valido` 
        CHECK (`Estado` IN ('draft', 'active', 'archived')),
        
    CONSTRAINT `chk_documento_nivel_acceso_valido` 
        CHECK (`NivelAcceso` BETWEEN 0 AND 2),
        
    CONSTRAINT `chk_documento_tamano_positivo` 
        CHECK (`TamanoBytes` IS NULL OR `TamanoBytes` >= 0),
        
    CONSTRAINT `chk_documento_vistas_positivas` 
        CHECK (`NumeroVistas` >= 0),
        
    CONSTRAINT `chk_documento_descargas_positivas` 
        CHECK (`NumeroDescargas` >= 0)
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar creación
SELECT 'Tabla Documento creada exitosamente' as resultado;