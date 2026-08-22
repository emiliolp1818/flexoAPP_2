-- =============================================
-- Script: MIGRATE MAQUINAS_BACKUP TABLE COLUMNS
-- Descripción: Actualiza la tabla maquinas_backup para que tenga
--              los nombres de columna correctos usados por el código.
--              Ejecutar sobre la BD existente - NO borra datos.
-- =============================================

-- Si la tabla tiene la estructura vieja (OtSap, BackupDate, etc.), renombrar columnas
-- Si ya tiene la estructura nueva, los ALTER fallan silenciosamente

-- Renombrar OtSap -> ot_sap (si existe la columna vieja)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' AND COLUMN_NAME = 'OtSap');
SET @sql = IF(@col_exists > 0, 'ALTER TABLE maquinas_backup CHANGE COLUMN `OtSap` `ot_sap` VARCHAR(50) NOT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Renombrar BackupDate -> backup_date
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' AND COLUMN_NAME = 'BackupDate');
SET @sql = IF(@col_exists > 0, 'ALTER TABLE maquinas_backup CHANGE COLUMN `BackupDate` `backup_date` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Renombrar BackupReason -> backup_reason
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' AND COLUMN_NAME = 'BackupReason');
SET @sql = IF(@col_exists > 0, 'ALTER TABLE maquinas_backup CHANGE COLUMN `BackupReason` `backup_reason` VARCHAR(100) NOT NULL DEFAULT ''''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Renombrar PreparandoStartedAt -> preparando_started_at
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' AND COLUMN_NAME = 'PreparandoStartedAt');
SET @sql = IF(@col_exists > 0, 'ALTER TABLE maquinas_backup CHANGE COLUMN `PreparandoStartedAt` `preparando_started_at` DATETIME NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Renombrar TipoImpresion -> tipo_impresion
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' AND COLUMN_NAME = 'TipoImpresion');
SET @sql = IF(@col_exists > 0, 'ALTER TABLE maquinas_backup CHANGE COLUMN `TipoImpresion` `tipo_impresion` VARCHAR(50) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Renombrar Id -> backup_id (si existe Id como PK)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' AND COLUMN_NAME = 'Id');
SET @sql = IF(@col_exists > 0, 'ALTER TABLE maquinas_backup CHANGE COLUMN `Id` `backup_id` INT AUTO_INCREMENT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Agregar columnas faltantes si no existen

-- backup_user_id
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' AND COLUMN_NAME = 'backup_user_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE maquinas_backup ADD COLUMN `backup_user_id` INT NULL COMMENT ''ID del usuario que generó el backup''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- backup_user_name
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' AND COLUMN_NAME = 'backup_user_name');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE maquinas_backup ADD COLUMN `backup_user_name` VARCHAR(100) NULL COMMENT ''Nombre del usuario que generó el backup''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- CreatedBy
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' AND COLUMN_NAME = 'CreatedBy');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE maquinas_backup ADD COLUMN `CreatedBy` INT NULL COMMENT ''Usuario creador''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- UpdatedBy
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' AND COLUMN_NAME = 'UpdatedBy');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE maquinas_backup ADD COLUMN `UpdatedBy` INT NULL COMMENT ''Usuario que actualizó''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- CreatedAt
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' AND COLUMN_NAME = 'CreatedAt');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE maquinas_backup ADD COLUMN `CreatedAt` DATETIME(6) NULL COMMENT ''Fecha de creación original''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- UpdatedAt
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' AND COLUMN_NAME = 'UpdatedAt');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE maquinas_backup ADD COLUMN `UpdatedAt` DATETIME(6) NULL COMMENT ''Fecha de actualización original''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Asegurar que backup_reason no sea NULL (migrar datos existentes)
UPDATE maquinas_backup SET backup_reason = 'LEGACY' WHERE backup_reason IS NULL;

-- Agregar índices si no existen
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' AND INDEX_NAME = 'idx_backup_estado');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_backup_estado ON maquinas_backup (Estado)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' AND INDEX_NAME = 'idx_backup_articulo');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_backup_articulo ON maquinas_backup (Articulo)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT '✓ Migración de maquinas_backup completada' AS resultado;
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' ORDER BY ORDINAL_POSITION;
