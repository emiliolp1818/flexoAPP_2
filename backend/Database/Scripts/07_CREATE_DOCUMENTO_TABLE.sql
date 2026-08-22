-- =====================================================
-- SCRIPT: CREAR TABLA DOCUMENTO
-- =====================================================
-- Sistema: FlexoAPP - Sistema de Gestión Flexográfica
-- Propósito: Crear tabla de gestión documental del sistema
-- Base de datos: MySQL 8.0+ (Railway/Render)
-- Tabla: Documento
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-01-17
-- Versión: 2.0
-- =====================================================

-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS `Documento` (
    -- ===== IDENTIFICACIÓN =====
    `DocumentoID` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del documento (clave primaria)',
    
    -- ===== INFORMACIÓN BÁSICA =====
    `Nombre` VARCHAR(255) NOT NULL COMMENT 'Nombre del documento',
    `Tipo` VARCHAR(50) NOT NULL COMMENT 'Tipo de documento (PDF, Word, Excel, Image, etc.)',
    `Categoria` VARCHAR(100) NOT NULL COMMENT 'Categoría del documento',
    `Descripcion` TEXT NULL COMMENT 'Descripción detallada del documento',
    
    -- ===== INFORMACIÓN DEL ARCHIVO FÍSICO =====
    `NombreArchivo` VARCHAR(255) NULL COMMENT 'Nombre del archivo físico original',
    `RutaArchivo` VARCHAR(500) NULL COMMENT 'Ruta del archivo en el servidor',
    `TamanoBytes` BIGINT NULL COMMENT 'Tamaño del archivo en bytes',
    `TamanoFormateado` VARCHAR(50) NULL COMMENT 'Tamaño formateado (ej: 2.5 MB)',
    `Extension` VARCHAR(20) NULL COMMENT 'Extensión del archivo (pdf, docx, xlsx, etc.)',
    `HashMD5` VARCHAR(32) NULL COMMENT 'Hash MD5 del archivo para verificación de integridad',
    
    -- ===== ESTADO Y CONTROL =====
    `Estado` VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT 'Estado del documento (draft, active, archived)',
    `Version` VARCHAR(20) NULL COMMENT 'Versión del documento',
    
    -- ===== METADATOS =====
    `Etiquetas` VARCHAR(500) NULL COMMENT 'Etiquetas del documento separadas por comas',
    `PalabrasClave` VARCHAR(500) NULL COMMENT 'Palabras clave para búsqueda',
    
    -- ===== AUDITORÍA =====
    `CreadoPor` VARCHAR(100) NULL COMMENT 'Usuario que creó el documento',
    `FechaCreacion` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación del documento',
    `ModificadoPor` VARCHAR(100) NULL COMMENT 'Usuario que modificó el documento',
    `FechaModificacion` DATETIME(6) NULL COMMENT 'Fecha de última modificación',
    
    -- ===== CONTROL DE ACCESO =====
    `EsPublico` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Documento público (1) o privado (0)',
    `NivelAcceso` INT NOT NULL DEFAULT 1 COMMENT 'Nivel de acceso (0=público, 1=privado, 2=restringido)',
    
    -- ===== ESTADÍSTICAS =====
    `NumeroVistas` INT NOT NULL DEFAULT 0 COMMENT 'Número de veces que se ha visualizado',
    `NumeroDescargas` INT NOT NULL DEFAULT 0 COMMENT 'Número de veces que se ha descargado',
    `FechaUltimoAcceso` DATETIME(6) NULL COMMENT 'Fecha del último acceso al documento',
    
    -- ===== ÍNDICES PARA OPTIMIZACIÓN =====
    INDEX `idx_documento_nombre` (`Nombre`) COMMENT 'Índice para búsquedas por nombre',
    INDEX `idx_documento_tipo` (`Tipo`) COMMENT 'Índice para filtrar por tipo',
    INDEX `idx_documento_categoria` (`Categoria`) COMMENT 'Índice para filtrar por categoría',
    INDEX `idx_documento_estado` (`Estado`) COMMENT 'Índice para filtrar por estado',
    INDEX `idx_documento_creado_por` (`CreadoPor`) COMMENT 'Índice para filtrar por creador',
    INDEX `idx_documento_fecha_creacion` (`FechaCreacion`) COMMENT 'Índice para ordenar por fecha',
    INDEX `idx_documento_publico` (`EsPublico`) COMMENT 'Índice para filtrar documentos públicos',
    INDEX `idx_documento_nivel_acceso` (`NivelAcceso`) COMMENT 'Índice para filtrar por nivel de acceso',
    INDEX `idx_documento_extension` (`Extension`) COMMENT 'Índice para filtrar por extensión',
    
    -- ===== ÍNDICE DE TEXTO COMPLETO =====
    FULLTEXT INDEX `ft_documento_busqueda` (`Nombre`, `Descripcion`, `Etiquetas`, `PalabrasClave`) COMMENT 'Índice de texto completo para búsquedas',
    
    -- ===== RESTRICCIONES DE VALIDACIÓN =====
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
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sistema de gestión documental';

-- ===== VERIFICACIÓN =====
SELECT '✓ Tabla Documento creada exitosamente' as resultado;

-- ===== INFORMACIÓN DE LA TABLA =====
DESCRIBE `Documento`;
