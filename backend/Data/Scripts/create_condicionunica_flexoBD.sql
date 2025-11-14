-- =====================================================
-- SCRIPT PARA CREAR TABLA CONDICIONUNICA
-- Base de datos: flexoapp_bd
-- Propósito: Almacenar información de condiciones únicas de artículos
-- Tabla: condicionunica
-- =====================================================

-- ===== SELECCIONAR BASE DE DATOS =====
-- USE: selecciona la base de datos flexoapp_bd para ejecutar los siguientes comandos
USE flexoapp_bd;

-- ===== ELIMINAR TABLA SI EXISTE =====
-- DROP TABLE IF EXISTS: elimina la tabla si existe (útil para desarrollo/testing)
-- ADVERTENCIA: esto borrará todos los datos de la tabla
DROP TABLE IF EXISTS condicionunica;

-- ===== CREAR TABLA CONDICIONUNICA =====
-- Tabla para almacenar información de ubicación y referencia de artículos
CREATE TABLE condicionunica (
    -- ===== CLAVE PRIMARIA =====
    -- id: identificador único autoincremental
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- ===== INFORMACIÓN DEL ARTÍCULO =====
    -- farticulo: código del artículo (ej: F204567)
    -- NOT NULL: campo obligatorio
    farticulo VARCHAR(50) NOT NULL,
    
    -- referencia: referencia del producto (ej: REF-BOLSA-001)
    referencia VARCHAR(200) NOT NULL,
    
    -- ===== UBICACIÓN FÍSICA =====
    -- estante: código del estante donde se encuentra (ej: E-01, E-02)
    estante VARCHAR(50) NOT NULL,
    
    -- numerocarpeta: número de carpeta donde está archivado (ej: C-001)
    numerocarpeta VARCHAR(50) NOT NULL,
    
    -- ===== AUDITORÍA =====
    -- createddate: fecha y hora de creación del registro
    -- TIMESTAMP: tipo de dato para fecha y hora
    -- DEFAULT CURRENT_TIMESTAMP: se establece automáticamente al crear
    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- lastmodified: fecha y hora de última modificación
    -- ON UPDATE CURRENT_TIMESTAMP: se actualiza automáticamente al modificar
    lastmodified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- ===== ÍNDICES PARA OPTIMIZACIÓN =====
    -- Índices para mejorar el rendimiento de las consultas
    INDEX idx_farticulo (farticulo),           -- Búsqueda rápida por código de artículo
    INDEX idx_estante (estante),               -- Filtrado rápido por estante
    INDEX idx_lastmodified (lastmodified DESC) -- Ordenamiento rápido por fecha de modificación
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== INSERTAR DATOS DE PRUEBA =====
-- Datos de ejemplo para testing y desarrollo
INSERT INTO condicionunica (farticulo, referencia, estante, numerocarpeta) VALUES
('F204567', 'REF-BOLSA-001', 'E-01', 'C-001'),      -- Artículo 1: Bolsa en estante E-01
('F204568', 'REF-ETIQUETA-002', 'E-01', 'C-002'),   -- Artículo 2: Etiqueta en estante E-01
('F204569', 'REF-EMPAQUE-003', 'E-02', 'C-003'),    -- Artículo 3: Empaque en estante E-02
('F204570', 'REF-BOLSA-004', 'E-02', 'C-004'),      -- Artículo 4: Bolsa en estante E-02
('F204571', 'REF-ETIQUETA-005', 'E-03', 'C-005');   -- Artículo 5: Etiqueta en estante E-03

-- ===== VERIFICACIÓN =====
-- Verificar que la tabla se creó correctamente
SELECT 'Tabla condicionunica creada exitosamente en flexoapp_bd' as mensaje;

-- Contar registros insertados
SELECT COUNT(*) as total_registros FROM condicionunica;

-- Mostrar todos los registros
SELECT * FROM condicionunica;
