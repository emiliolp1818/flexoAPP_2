-- Script para actualizar la tabla users con los campos necesarios
-- Ejecutar este script directamente en MySQL

USE flexoapp_bd;

-- Verificar estructura actual de la tabla
DESCRIBE users;

-- Agregar la columna Email si no existe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS Email VARCHAR(100) NULL 
AFTER LastName;

-- Agregar la columna Phone si no existe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS Phone VARCHAR(20) NULL 
AFTER Email;

-- Agregar la columna ProfileImageUrl si no existe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ProfileImageUrl VARCHAR(500) NULL 
AFTER ProfileImage;

-- Verificar que se agregaron correctamente
DESCRIBE users;

-- Actualizar algunos registros de ejemplo con datos de contacto (opcional)
UPDATE users SET 
    Email = CASE 
        WHEN UserCode = 'admin' THEN 'admin@flexoapp.com'
        WHEN UserCode = 'supervisor' THEN 'supervisor@flexoapp.com'
        ELSE CONCAT(LOWER(UserCode), '@flexoapp.com')
    END,
    Phone = CASE 
        WHEN UserCode = 'admin' THEN '+57 300 123 4567'
        WHEN UserCode = 'supervisor' THEN '+57 301 987 6543'
        ELSE NULL
    END
WHERE Email IS NULL;

-- Mostrar los usuarios actualizados
SELECT Id, UserCode, FirstName, LastName, Email, Phone, Role, IsActive, ProfileImageUrl 
FROM users 
ORDER BY Id;

COMMIT;