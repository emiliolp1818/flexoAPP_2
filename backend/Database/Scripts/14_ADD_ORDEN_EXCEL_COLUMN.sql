-- Agregar columna orden_excel para mantener el orden de importación del Excel
-- MySQL no soporta IF NOT EXISTS en ALTER TABLE ADD COLUMN
SET @dbname = DATABASE();
SET @tablename = 'maquinas';
SET @columnname = 'orden_excel';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE maquinas ADD COLUMN orden_excel INT NOT NULL DEFAULT 0'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
