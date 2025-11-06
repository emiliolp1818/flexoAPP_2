-- Script para agregar el campo Email a la tabla users
-- Ejecutar este script directamente en MySQL

USE flexoapp_bd;

-- Verificar si la columna Email ya existe
SELECT COUNT(*) as email_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_db' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'Email';

-- Agregar la columna Email si no existe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS Email VARCHAR(100) NULL 
AFTER LastName;

-- Verificar que se agregó correctamente
DESCRIBE users;

-- Actualizar algunos registros de ejemplo con emails (opcional)
UPDATE users SET Email = CONCAT(LOWER(UserCode), '@flexoapp.com') WHERE Email IS NULL;

-- Mostrar los usuarios con sus emails
SELECT Id, UserCode, FirstName, LastName, Email, Role, IsActive FROM users;

COMMIT;