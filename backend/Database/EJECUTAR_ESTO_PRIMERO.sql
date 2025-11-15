-- =====================================================
-- SCRIPT RAPIDO: Crear tabla MAQUINAS
-- EJECUTA ESTO EN MySQL Workbench ANTES de iniciar el backend
-- =====================================================

USE flexoapp_bd;

-- Eliminar tabla si existe
DROP TABLE IF EXISTS `maquinas`;

-- Crear tabla maquinas
CREATE TABLE `maquinas` (
    `articulo` VARCHAR(50) NOT NULL PRIMARY KEY,
    `numero_maquina` INT NOT NULL,
    `ot_sap` VARCHAR(50) NOT NULL,
    `cliente` VARCHAR(200) NOT NULL,
    `referencia` VARCHAR(100) NULL,
    `td` VARCHAR(10) NULL,
    `numero_colores` INT NOT NULL DEFAULT 0,
    `colores` JSON NOT NULL,
    `kilos` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `fecha_tinta_en_maquina` DATETIME NOT NULL,
    `sustrato` VARCHAR(100) NOT NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'LISTO',
    `observaciones` VARCHAR(1000) NULL,
    `last_action_by` VARCHAR(100) NULL,
    `last_action_at` DATETIME NULL,
    `created_by` INT NULL,
    `updated_by` INT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_numero_maquina` (`numero_maquina`),
    INDEX `idx_estado` (`estado`),
    INDEX `idx_fecha_tinta` (`fecha_tinta_en_maquina`),
    INDEX `idx_maquina_estado` (`numero_maquina`, `estado`),
    INDEX `idx_ot_sap` (`ot_sap`),
    INDEX `idx_cliente` (`cliente`),
    
    CONSTRAINT `fk_maquinas_created_by` 
        FOREIGN KEY (`created_by`) 
        REFERENCES `users`(`id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    
    CONSTRAINT `fk_maquinas_updated_by` 
        FOREIGN KEY (`updated_by`) 
        REFERENCES `users`(`id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar
SELECT 'Tabla maquinas creada exitosamente' AS resultado;
DESCRIBE maquinas;
