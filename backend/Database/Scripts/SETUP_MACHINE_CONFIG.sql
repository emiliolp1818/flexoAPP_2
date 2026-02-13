-- =============================================
-- Script: SETUP MACHINE CONFIG (CONSOLIDADO)
-- Descripción: Crear tabla machine_config y verificar
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-02-13
-- =============================================

-- Paso 1: Crear tabla si no existe
CREATE TABLE IF NOT EXISTS `machine_config` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `numero_maquina` INT NOT NULL UNIQUE,
    `carga_muestra` DECIMAL(10, 2) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_numero_maquina` (`numero_maquina`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Paso 2: Agregar comentarios
ALTER TABLE `machine_config` 
    MODIFY COLUMN `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único de la configuración',
    MODIFY COLUMN `numero_maquina` INT NOT NULL UNIQUE COMMENT 'Número de máquina (11-21)',
    MODIFY COLUMN `carga_muestra` DECIMAL(10, 2) NULL COMMENT 'Carga muestra de la máquina en kg',
    MODIFY COLUMN `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    MODIFY COLUMN `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización';

-- Paso 3: Insertar configuración inicial (solo si no existen)
INSERT IGNORE INTO `machine_config` (`numero_maquina`, `carga_muestra`) VALUES
(11, NULL),
(12, NULL),
(13, NULL),
(14, NULL),
(15, NULL),
(16, NULL),
(17, NULL),
(18, NULL),
(19, NULL),
(20, NULL),
(21, NULL);

-- Paso 4: Verificar
SELECT '✅ Tabla machine_config configurada' AS resultado;
SELECT * FROM machine_config ORDER BY numero_maquina;
