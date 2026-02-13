-- =============================================
-- Script: VERIFICAR Y CONFIGURAR MACHINE_CONFIG
-- Descripción: Verifica si la tabla machine_config existe y tiene datos
-- Si no existe, la crea. Si existe pero está vacía, inserta los registros iniciales.
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-02-13
-- =============================================

-- Verificar si la tabla existe
SELECT 
    COUNT(*) as tabla_existe
FROM 
    information_schema.tables 
WHERE 
    table_schema = DATABASE() 
    AND table_name = 'machine_config';

-- Si la tabla no existe, crearla
CREATE TABLE IF NOT EXISTS `machine_config` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `numero_maquina` INT NOT NULL UNIQUE,
    `carga_muestra` DECIMAL(10, 2) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_numero_maquina` (`numero_maquina`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar cuántos registros hay
SELECT COUNT(*) as total_registros FROM `machine_config`;

-- Insertar registros solo si la tabla está vacía
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

-- Verificar el resultado final
SELECT 
    'Verificación completada' as estado,
    COUNT(*) as total_registros 
FROM `machine_config`;

-- Mostrar todos los registros
SELECT * FROM `machine_config` ORDER BY `numero_maquina`;
