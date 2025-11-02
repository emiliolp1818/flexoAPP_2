-- SCRIPT RÁPIDO PARA AGREGAR CAMPO EMAIL
-- Ejecutar en MySQL Workbench, phpMyAdmin o cualquier cliente MySQL

USE flexoapp_db;

-- Agregar campo Email a la tabla users
ALTER TABLE users ADD COLUMN Email VARCHAR(100) NULL AFTER LastName;

-- Verificar que se agregó
SHOW COLUMNS FROM users;

-- Generar emails automáticamente para usuarios existentes
UPDATE users SET Email = CONCAT(LOWER(UserCode), '@flexoapp.com') WHERE Email IS NULL;

-- Mostrar resultado
SELECT Id, UserCode, FirstName, LastName, Email, Role FROM users;