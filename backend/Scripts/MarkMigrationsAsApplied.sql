-- Script para marcar las migraciones como aplicadas
-- Ejecutar este script en MySQL Workbench o phpMyAdmin

USE flexoapp_bd;

-- Crear la tabla de historial de migraciones si no existe
CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) NOT NULL,
    `ProductVersion` varchar(32) NOT NULL,
    PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar las migraciones que ya están aplicadas (las tablas ya existen)
INSERT IGNORE INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`) VALUES
('20250930125018_InitialCreate', '8.0.0'),
('20251009171728_SyncDesignsTable', '8.0.0'),
('20251024001115_AddMachineProgramsTable', '8.0.0');

-- Agregar el campo Email a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS Email VARCHAR(100) NULL 
AFTER LastName;

-- Marcar la migración del Email como aplicada
INSERT IGNORE INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`) VALUES
('20251031150354_AddEmailToUsers', '8.0.0');

-- Actualizar algunos registros con emails de ejemplo
UPDATE users SET Email = CONCAT(LOWER(UserCode), '@flexoapp.com') WHERE Email IS NULL;

-- Verificar el resultado
SELECT 'Migraciones aplicadas:' as Info;
SELECT MigrationId, ProductVersion FROM `__EFMigrationsHistory` ORDER BY MigrationId;

SELECT 'Estructura de la tabla users:' as Info;
DESCRIBE users;

SELECT 'Usuarios con emails:' as Info;
SELECT Id, UserCode, FirstName, LastName, Email, Role, IsActive FROM users LIMIT 10;

COMMIT;