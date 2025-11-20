-- =====================================================
-- Script: Actualizar tabla USERS (sin perder datos)
-- Base de datos: flexoapp_bd (MySQL)
-- Descripción: Actualiza la estructura de la tabla users
--              eliminando ProfileImageUrl y manteniendo solo ProfileImage
-- =====================================================

-- Verificar si la columna ProfileImageUrl existe y eliminarla
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'ProfileImageUrl';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'ALTER TABLE users DROP COLUMN ProfileImageUrl;',
  'SELECT ''Column ProfileImageUrl does not exist, skipping...'';'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

-- Asegurar que ProfileImage existe y tiene el tipo correcto
ALTER TABLE users 
MODIFY COLUMN ProfileImage LONGTEXT NULL 
COMMENT 'Imagen de perfil: base64 (data:image/...) o URL (/uploads/profiles/...)';

-- Verificar la estructura actualizada
DESCRIBE users;

-- Mostrar mensaje de confirmación
SELECT 'Tabla users actualizada correctamente. Solo ProfileImage está disponible.' AS Resultado;
