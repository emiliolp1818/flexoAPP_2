-- =====================================================
-- MIGRACIÓN: Agregar columnas faltantes a Activities
-- Ejecutar en Railway si la tabla ya existe
-- =====================================================

-- EntityType
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Activities' AND COLUMN_NAME = 'EntityType');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE Activities ADD COLUMN `EntityType` VARCHAR(100) NULL COMMENT ''Tipo de entidad afectada''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- EntityId
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Activities' AND COLUMN_NAME = 'EntityId');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE Activities ADD COLUMN `EntityId` INT NULL COMMENT ''ID de la entidad afectada''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- EntityName
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Activities' AND COLUMN_NAME = 'EntityName');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE Activities ADD COLUMN `EntityName` VARCHAR(200) NULL COMMENT ''Nombre de la entidad afectada''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Duration: EF Core lo almacena como ticks (BIGINT). NO usar TIME(6) o el INSERT falla.
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Activities' AND COLUMN_NAME = 'Duration');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE Activities ADD COLUMN `Duration` BIGINT NULL COMMENT ''Duración de la acción en ticks''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Si Duration existe con otro tipo (ej. TIME(6) de migraciones viejas), convertirla a BIGINT
SET @sql = IF(@col_exists = 1, 'ALTER TABLE Activities MODIFY COLUMN `Duration` BIGINT NULL COMMENT ''Duración de la acción en ticks''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- OldValues
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Activities' AND COLUMN_NAME = 'OldValues');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE Activities ADD COLUMN `OldValues` VARCHAR(2000) NULL COMMENT ''Valores anteriores (JSON)''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- NewValues
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Activities' AND COLUMN_NAME = 'NewValues');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE Activities ADD COLUMN `NewValues` VARCHAR(2000) NULL COMMENT ''Valores nuevos (JSON)''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT '✓ Columnas agregadas a Activities' AS resultado;
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Activities' ORDER BY ORDINAL_POSITION;
