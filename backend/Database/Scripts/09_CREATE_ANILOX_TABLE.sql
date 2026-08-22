-- =============================================
-- Script: CREATE ANILOX TABLE
-- Descripción: Tabla para gestionar el inventario de anilox por máquina
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-02-12
-- =============================================

-- Eliminar tabla si existe (solo para desarrollo)
DROP TABLE IF EXISTS `anilox`;

-- Crear tabla anilox
CREATE TABLE `anilox` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `codigo` VARCHAR(50) NOT NULL UNIQUE,
    `maquina` INT NOT NULL,
    `bcm` DECIMAL(5, 2) NOT NULL,
    `lineatura` INT NOT NULL,
    `marca` VARCHAR(50) NOT NULL,
    `volumen_real` DECIMAL(10, 2) NOT NULL,
    `factor_eficiencia` DECIMAL(5, 2) NULL DEFAULT 35.00,
    `densidad` DECIMAL(5, 3) NULL DEFAULT 0.885,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_maquina` (`maquina`),
    INDEX `idx_codigo` (`codigo`),
    INDEX `idx_marca` (`marca`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentarios de columnas
ALTER TABLE `anilox` 
    MODIFY COLUMN `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del anilox',
    MODIFY COLUMN `codigo` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único del anilox',
    MODIFY COLUMN `maquina` INT NOT NULL COMMENT 'Número de máquina (11-21)',
    MODIFY COLUMN `bcm` DECIMAL(5, 2) NOT NULL COMMENT 'BCM (Billion Cubic Microns) - soporta decimales como 8.3',
    MODIFY COLUMN `lineatura` INT NOT NULL COMMENT 'Lineatura en LPI (Lines Per Inch)',
    MODIFY COLUMN `marca` VARCHAR(50) NOT NULL COMMENT 'Marca del anilox (APEX, ZECHER, HARPER)',
    MODIFY COLUMN `volumen_real` DECIMAL(10, 2) NOT NULL COMMENT 'Volumen real medido',
    MODIFY COLUMN `factor_eficiencia` DECIMAL(5, 2) NULL DEFAULT 35.00 COMMENT 'Factor de eficiencia del anilox (35%)',
    MODIFY COLUMN `densidad` DECIMAL(5, 3) NULL DEFAULT 0.885 COMMENT 'Densidad del anilox (0.885)',
    MODIFY COLUMN `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    MODIFY COLUMN `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización';

-- Insertar datos de ejemplo (basados en los datos proporcionados)
-- Los valores de factor_eficiencia y densidad se establecerán automáticamente con los valores por defecto
INSERT INTO `anilox` (`codigo`, `maquina`, `bcm`, `lineatura`, `marca`, `volumen_real`) VALUES
('1164', 11, 400, 4, 'APEX', 3.00),
('1165', 11, 140, 10, 'APEX', 8.30),
('1166', 11, 140, 10, 'APEX', 7.90),
('1167', 11, 80, 14, 'APEX', 11.00),
('1169', 11, 400, 4, 'APEX', 3.00),
('1170', 11, 400, 4, 'APEX', 3.30),
('1171', 11, 400, 4, 'APEX', 3.00),
('1172', 11, 400, 4, 'APEX', 3.20),
('1173', 11, 275, 6, 'APEX', 5.40),
('1174', 11, 275, 6, 'APEX', 5.70),
('1175', 11, 200, 8, 'APEX', 6.60),
('1176', 11, 200, 8, 'APEX', 6.50),
('1177', 11, 80, 16, 'APEX', 15.80),
('1178', 11, 140, 10, 'APEX', 12.50),
('1179', 11, 200, 8, 'APEX', 7.20),
('1180', 11, 275, 6, 'APEX', 6.30),
('1181', 11, 275, 6, 'APEX', 6.90),
('1182', 11, 200, 8, 'APEX', 9.20),
('1183', 11, 275, 6, 'APEX', 7.30),
('1244', 12, 80, 14, 'APEX', 12.70),
('1246', 12, 140, 10, 'APEX', 9.40),
('1261', 12, 140, 10, 'APEX', 9.70),
('1262', 12, 200, 8, 'APEX', 6.80),
('1263', 12, 200, 8, 'APEX', 5.70),
('1264', 12, 400, 4, 'APEX', 3.10),
('1265', 12, 400, 4, 'APEX', 2.90),
('1266', 12, 400, 4, 'APEX', 3.40),
('1267', 12, 400, 4, 'APEX', 3.30),
('1268', 12, 400, 4, 'APEX', 3.00),
('1269', 12, 275, 6, 'APEX', 5.10),
('1272', 12, 275, 6, 'APEX', 5.40);

SELECT 'Tabla anilox creada exitosamente' AS resultado;
