-- ============================================================
--  Agregar contraseña TEMPORAL a la tabla users
--  - TempPassword:          hash BCrypt de la contraseña temporal
--  - TempPasswordExpiresAt: expiración de la temporal (UTC)
--  La contraseña original (Password) NO se toca: sigue siendo válida.
--  MySQL no soporta IF NOT EXISTS en ALTER TABLE ADD COLUMN, por eso
--  se comprueba INFORMATION_SCHEMA antes de agregar cada columna.
-- ============================================================

SET @dbname = DATABASE();
SET @tablename = 'users';

-- Columna TempPassword (VARCHAR(255) NULL)
SET @columnname = 'TempPassword';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN TempPassword VARCHAR(255) NULL AFTER Password'
));
PREPARE stmtTempPassword FROM @preparedStatement;
EXECUTE stmtTempPassword;
DEALLOCATE PREPARE stmtTempPassword;

-- Columna TempPasswordExpiresAt (DATETIME NULL)
SET @columnname = 'TempPasswordExpiresAt';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN TempPasswordExpiresAt DATETIME(6) NULL AFTER TempPassword'
));
PREPARE stmtTempExpires FROM @preparedStatement;
EXECUTE stmtTempExpires;
DEALLOCATE PREPARE stmtTempExpires;
