-- =====================================================
-- SCRIPT DE CREACIÓN DE TABLA CONDICIÓN ÚNICA
-- =====================================================
-- Tabla: condicionunica
-- Descripción: Almacena información de artículos con su ubicación física
--              y organización documental en el almacén
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-01-17
-- =====================================================

-- ===== PASO 1: ELIMINAR TABLA SI EXISTE (SOLO PARA DESARROLLO) =====
-- ADVERTENCIA: Esto eliminará todos los datos existentes
-- Comentar esta línea en producción si ya tienes datos
DROP TABLE IF EXISTS condicionunica;

-- ===== PASO 2: CREAR TABLA CONDICIONUNICA =====
-- Tabla principal para gestión de condición única de artículos
CREATE TABLE condicionunica (
    -- ===== COLUMNA: ID (Clave Primaria) =====
    -- Identificador único autoincremental para cada registro
    -- Se genera automáticamente al insertar un nuevo registro
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del registro (clave primaria)',
    
    -- ===== COLUMNA: FARTICULO (Código del Artículo) =====
    -- Código del artículo F (ejemplo: F204567)
    -- Campo requerido y único para identificar el artículo
    -- Máximo 50 caracteres
    farticulo VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código del artículo F (ej: F204567)',
    
    -- ===== COLUMNA: DESCRIPCION (Descripción del Producto) =====
    -- Descripción detallada del producto o diseño
    -- Se carga automáticamente desde la tabla designs si el artículo existe
    -- Si no existe en designs, se ingresa manualmente
    -- Campo requerido, máximo 500 caracteres
    descripcion VARCHAR(500) NOT NULL COMMENT 'Descripción del producto o diseño',
    
    -- ===== COLUMNA: ESTANTE (Ubicación Física) =====
    -- Número de estante donde se encuentra físicamente el artículo
    -- Ubicación en el almacén o área de producción
    -- Campo requerido, máximo 50 caracteres
    estante VARCHAR(50) NOT NULL COMMENT 'Número de estante donde se encuentra físicamente',
    
    -- ===== COLUMNA: NUMEROCARPETA (Organización Documental) =====
    -- Número de carpeta donde está archivado el documento del artículo
    -- Organización documental para gestión de archivos físicos
    -- Campo requerido, máximo 50 caracteres
    numerocarpeta VARCHAR(50) NOT NULL COMMENT 'Número de carpeta donde está archivado',
    
    -- ===== COLUMNA: ESTADO (Estado del Registro) =====
    -- Estado actual del registro (ej: "ACTIVO", "INACTIVO", "EN REVISIÓN")
    -- Permite gestionar el ciclo de vida del registro
    -- Campo opcional con valor por defecto "ACTIVO"
    -- Máximo 50 caracteres
    estado VARCHAR(50) DEFAULT 'ACTIVO' COMMENT 'Estado del registro (ACTIVO, INACTIVO, EN REVISIÓN)',
    
    -- ===== COLUMNA: CREATEDDATE (Fecha de Creación) =====
    -- Fecha y hora de creación del registro
    -- Se genera automáticamente con la fecha y hora actual del servidor
    -- Tipo DATETIME para incluir fecha y hora completa
    createddate DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    
    -- ===== COLUMNA: LASTMODIFIED (Fecha de Última Modificación) =====
    -- Fecha y hora de la última modificación del registro
    -- Se actualiza automáticamente cada vez que se modifica el registro
    -- Tipo DATETIME para incluir fecha y hora completa
    lastmodified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de Condición Única - Gestión de artículos con ubicación física';

-- ===== PASO 3: CREAR ÍNDICES PARA OPTIMIZACIÓN =====
-- Índice en la columna farticulo para búsquedas rápidas
-- Ya está indexado por ser UNIQUE, pero lo documentamos aquí
-- CREATE INDEX idx_farticulo ON condicionunica(farticulo); -- No necesario, ya es UNIQUE

-- Índice en la columna estante para búsquedas por ubicación
CREATE INDEX idx_estante ON condicionunica(estante) COMMENT 'Índice para búsquedas por estante';

-- Índice en la columna numerocarpeta para búsquedas por carpeta
CREATE INDEX idx_numerocarpeta ON condicionunica(numerocarpeta) COMMENT 'Índice para búsquedas por número de carpeta';

-- Índice en la columna createddate para ordenamiento por fecha
CREATE INDEX idx_createddate ON condicionunica(createddate) COMMENT 'Índice para ordenamiento por fecha de creación';

-- ===== PASO 4: INSERTAR DATOS DE EJEMPLO (OPCIONAL) =====
-- Datos de prueba para verificar que la tabla funciona correctamente
-- Comentar o eliminar en producción
INSERT INTO condicionunica (farticulo, descripcion, estante, numerocarpeta, estado) VALUES
('F204567', 'Bolsa de polietileno transparente 30x40cm', 'E-01', 'C-001', 'ACTIVO'),
('F204568', 'Bolsa de polipropileno impresa 25x35cm', 'E-01', 'C-002', 'ACTIVO'),
('F204569', 'Film flexible para empaque alimenticio', 'E-02', 'C-003', 'EN REVISIÓN');

-- ===== PASO 5: VERIFICAR CREACIÓN =====
-- Consultar la estructura de la tabla creada
DESCRIBE condicionunica;

-- Consultar los datos insertados
SELECT * FROM condicionunica;

-- ===== FIN DEL SCRIPT =====
-- La tabla condicionunica ha sido creada exitosamente
-- Columnas: id, farticulo, descripcion, estante, numerocarpeta, estado, createddate, lastmodified
