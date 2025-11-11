-- Script para crear tabla condicionunica en la base de datos flexoBD existente
-- Ejecutar en MySQL Workbench o mysql CLI

-- Usar la base de datos existente
USE flexoBD;

-- Eliminar tabla si existe (solo para desarrollo)
DROP TABLE IF EXISTS condicionunica;

-- Crear tabla condicionunica
CREATE TABLE condicionunica (
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

-- Insertar datos de prueba
INSERT INTO condicionunica (farticulo, referencia, estante, numerocarpeta) VALUES
('F204567', 'REF-BOLSA-001', 'E-01', 'C-001'),
('F204568', 'REF-ETIQUETA-002', 'E-01', 'C-002'),
('F204569', 'REF-EMPAQUE-003', 'E-02', 'C-003'),
('F204570', 'REF-BOLSA-004', 'E-02', 'C-004'),
('F204571', 'REF-ETIQUETA-005', 'E-03', 'C-005');

-- Verificar
SELECT 'Tabla condicionunica creada exitosamente en flexoBD' as mensaje;
SELECT COUNT(*) as total_registros FROM condicionunica;
SELECT * FROM condicionunica;
