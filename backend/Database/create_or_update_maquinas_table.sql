-- =====================================================
-- Script para crear o actualizar la tabla maquinas
-- Base de datos: flexoapp_bd
-- =====================================================

USE flexoapp_bd;

-- Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS `maquinas` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `MachineNumber` int NOT NULL,
  `Name` varchar(200) NOT NULL,
  `Articulo` varchar(50) NOT NULL,
  `OtSap` varchar(50) NOT NULL,
  `Cliente` varchar(200) NOT NULL,
  `Referencia` varchar(500) DEFAULT NULL,
  `Td` varchar(3) DEFAULT NULL,
  `NumeroColores` int NOT NULL DEFAULT 0,
  `Colores` json NOT NULL,
  `Kilos` decimal(10,2) NOT NULL DEFAULT 0.00,
  `FechaTintaEnMaquina` datetime DEFAULT NULL,
  `Sustrato` varchar(200) DEFAULT NULL,
  `Estado` varchar(20) NOT NULL DEFAULT 'LISTO',
  `FechaInicio` datetime NOT NULL,
  `FechaFin` datetime DEFAULT NULL,
  `Progreso` int NOT NULL DEFAULT 0,
  `Observaciones` varchar(1000) DEFAULT NULL,
  `OperatorName` varchar(100) DEFAULT NULL,
  `LastAction` varchar(200) DEFAULT NULL,
  `LastActionBy` varchar(100) DEFAULT NULL,
  `LastActionAt` datetime DEFAULT NULL,
  `CreatedBy` int DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Maquinas_OtSap` (`OtSap`),
  KEY `IX_Maquinas_MachineNumber` (`MachineNumber`),
  KEY `IX_Maquinas_Estado` (`Estado`),
  KEY `IX_Maquinas_FechaInicio` (`FechaInicio`),
  KEY `IX_Maquinas_MachineNumber_Estado` (`MachineNumber`, `Estado`),
  KEY `FK_Maquinas_Users_CreatedBy` (`CreatedBy`),
  KEY `FK_Maquinas_Users_UpdatedBy` (`UpdatedBy`),
  CONSTRAINT `FK_Maquinas_Users_CreatedBy` FOREIGN KEY (`CreatedBy`) REFERENCES `users` (`Id`) ON DELETE SET NULL,
  CONSTRAINT `FK_Maquinas_Users_UpdatedBy` FOREIGN KEY (`UpdatedBy`) REFERENCES `users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================
-- Agregar columnas faltantes si no existen
-- =====================================================

-- Verificar y agregar columna MachineNumber
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'MachineNumber';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `MachineNumber` int NOT NULL AFTER `Id`',
  'SELECT "Columna MachineNumber ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna Name
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'Name';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `Name` varchar(200) NOT NULL AFTER `MachineNumber`',
  'SELECT "Columna Name ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna Articulo
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'Articulo';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `Articulo` varchar(50) NOT NULL AFTER `Name`',
  'SELECT "Columna Articulo ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna OtSap
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'OtSap';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `OtSap` varchar(50) NOT NULL AFTER `Articulo`',
  'SELECT "Columna OtSap ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna Cliente
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'Cliente';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `Cliente` varchar(200) NOT NULL AFTER `OtSap`',
  'SELECT "Columna Cliente ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna Referencia
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'Referencia';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `Referencia` varchar(500) DEFAULT NULL AFTER `Cliente`',
  'SELECT "Columna Referencia ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna Td
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'Td';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `Td` varchar(3) DEFAULT NULL AFTER `Referencia`',
  'SELECT "Columna Td ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna NumeroColores
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'NumeroColores';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `NumeroColores` int NOT NULL DEFAULT 0 AFTER `Td`',
  'SELECT "Columna NumeroColores ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna Colores
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'Colores';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `Colores` json NOT NULL AFTER `NumeroColores`',
  'SELECT "Columna Colores ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna Kilos
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'Kilos';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `Kilos` decimal(10,2) NOT NULL DEFAULT 0.00 AFTER `Colores`',
  'SELECT "Columna Kilos ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna FechaTintaEnMaquina
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'FechaTintaEnMaquina';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `FechaTintaEnMaquina` datetime DEFAULT NULL AFTER `Kilos`',
  'SELECT "Columna FechaTintaEnMaquina ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna Sustrato
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'Sustrato';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `Sustrato` varchar(200) DEFAULT NULL AFTER `FechaTintaEnMaquina`',
  'SELECT "Columna Sustrato ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna Estado
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'Estado';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `Estado` varchar(20) NOT NULL DEFAULT ''LISTO'' AFTER `Sustrato`',
  'SELECT "Columna Estado ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna FechaInicio
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'FechaInicio';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `FechaInicio` datetime NOT NULL AFTER `Estado`',
  'SELECT "Columna FechaInicio ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna FechaFin
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'FechaFin';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `FechaFin` datetime DEFAULT NULL AFTER `FechaInicio`',
  'SELECT "Columna FechaFin ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna Progreso
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'Progreso';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `Progreso` int NOT NULL DEFAULT 0 AFTER `FechaFin`',
  'SELECT "Columna Progreso ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna Observaciones
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'Observaciones';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `Observaciones` varchar(1000) DEFAULT NULL AFTER `Progreso`',
  'SELECT "Columna Observaciones ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna OperatorName
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'OperatorName';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `OperatorName` varchar(100) DEFAULT NULL AFTER `Observaciones`',
  'SELECT "Columna OperatorName ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna LastAction
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'LastAction';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `LastAction` varchar(200) DEFAULT NULL AFTER `OperatorName`',
  'SELECT "Columna LastAction ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna LastActionBy
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'LastActionBy';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `LastActionBy` varchar(100) DEFAULT NULL AFTER `LastAction`',
  'SELECT "Columna LastActionBy ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna LastActionAt
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'LastActionAt';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `LastActionAt` datetime DEFAULT NULL AFTER `LastActionBy`',
  'SELECT "Columna LastActionAt ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna CreatedBy
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'CreatedBy';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `CreatedBy` int DEFAULT NULL AFTER `LastActionAt`',
  'SELECT "Columna CreatedBy ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna UpdatedBy
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'UpdatedBy';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `UpdatedBy` int DEFAULT NULL AFTER `CreatedBy`',
  'SELECT "Columna UpdatedBy ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna CreatedAt
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'CreatedAt';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `UpdatedBy`',
  'SELECT "Columna CreatedAt ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna UpdatedAt
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND COLUMN_NAME = 'UpdatedAt';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `maquinas` ADD COLUMN `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `CreatedAt`',
  'SELECT "Columna UpdatedAt ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- Crear índices si no existen
-- =====================================================

-- Índice único para OtSap
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND INDEX_NAME = 'IX_Maquinas_OtSap';

SET @query = IF(@index_exists = 0, 
  'ALTER TABLE `maquinas` ADD UNIQUE INDEX `IX_Maquinas_OtSap` (`OtSap`)',
  'SELECT "Índice IX_Maquinas_OtSap ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para MachineNumber
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND INDEX_NAME = 'IX_Maquinas_MachineNumber';

SET @query = IF(@index_exists = 0, 
  'ALTER TABLE `maquinas` ADD INDEX `IX_Maquinas_MachineNumber` (`MachineNumber`)',
  'SELECT "Índice IX_Maquinas_MachineNumber ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para Estado
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND INDEX_NAME = 'IX_Maquinas_Estado';

SET @query = IF(@index_exists = 0, 
  'ALTER TABLE `maquinas` ADD INDEX `IX_Maquinas_Estado` (`Estado`)',
  'SELECT "Índice IX_Maquinas_Estado ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para FechaInicio
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND INDEX_NAME = 'IX_Maquinas_FechaInicio';

SET @query = IF(@index_exists = 0, 
  'ALTER TABLE `maquinas` ADD INDEX `IX_Maquinas_FechaInicio` (`FechaInicio`)',
  'SELECT "Índice IX_Maquinas_FechaInicio ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice compuesto para MachineNumber y Estado
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME = 'maquinas' 
  AND INDEX_NAME = 'IX_Maquinas_MachineNumber_Estado';

SET @query = IF(@index_exists = 0, 
  'ALTER TABLE `maquinas` ADD INDEX `IX_Maquinas_MachineNumber_Estado` (`MachineNumber`, `Estado`)',
  'SELECT "Índice IX_Maquinas_MachineNumber_Estado ya existe" AS resultado');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- Mensaje final
-- =====================================================
SELECT '✅ Script ejecutado correctamente. Tabla maquinas creada/actualizada.' AS Resultado;
