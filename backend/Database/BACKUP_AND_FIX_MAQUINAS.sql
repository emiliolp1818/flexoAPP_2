-- =====================================================
-- Script para hacer backup y recrear la tabla maquinas
-- Base de datos: flexoapp_bd
-- =====================================================

USE flexoapp_bd;

-- Paso 1: Crear tabla de backup si existe data
CREATE TABLE IF NOT EXISTS `maquinas_backup` AS SELECT * FROM `maquinas`;

-- Paso 2: Eliminar la tabla existente
DROP TABLE IF EXISTS `maquinas`;

-- Paso 3: Crear la tabla con el esquema correcto (snake_case)
CREATE TABLE `maquinas` (
  `articulo` VARCHAR(50) NOT NULL,
  `numero_maquina` INT NOT NULL,
  `ot_sap` VARCHAR(50) NOT NULL,
  `cliente` VARCHAR(200) NOT NULL,
  `referencia` VARCHAR(100) DEFAULT NULL,
  `td` VARCHAR(10) DEFAULT NULL,
  `numero_colores` INT NOT NULL,
  `colores` JSON NOT NULL,
  `kilos` DECIMAL(10,2) NOT NULL,
  `fecha_tinta_en_maquina` DATETIME NOT NULL,
  `sustrato` VARCHAR(100) NOT NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'LISTO',
  `observaciones` VARCHAR(1000) DEFAULT NULL,
  `last_action_by` VARCHAR(100) DEFAULT NULL,
  `last_action_at` DATETIME DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`articulo`),
  
  KEY `IX_Maquinas_NumeroMaquina` (`numero_maquina`),
  KEY `IX_Maquinas_Estado` (`estado`),
  KEY `IX_Maquinas_FechaTintaEnMaquina` (`fecha_tinta_en_maquina`),
  KEY `IX_Maquinas_NumeroMaquina_Estado` (`numero_maquina`, `estado`),
  KEY `IX_Maquinas_OtSap` (`ot_sap`),
  KEY `IX_Maquinas_Cliente` (`cliente`),
  KEY `FK_Maquinas_Users_CreatedBy` (`created_by`),
  KEY `FK_Maquinas_Users_UpdatedBy` (`updated_by`),
  
  CONSTRAINT `FK_Maquinas_Users_CreatedBy` FOREIGN KEY (`created_by`) REFERENCES `users` (`Id`) ON DELETE SET NULL,
  CONSTRAINT `FK_Maquinas_Users_UpdatedBy` FOREIGN KEY (`updated_by`) REFERENCES `users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT '✅ Tabla maquinas recreada correctamente. Backup guardado en maquinas_backup' AS Resultado;
SELECT 'ℹ️  Para restaurar datos, ejecuta: INSERT INTO maquinas SELECT * FROM maquinas_backup;' AS Nota;
