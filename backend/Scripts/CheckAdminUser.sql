-- Script para verificar el usuario admin en la base de datos
USE flexoapp_bd;

-- Verificar si existe la tabla Users
SELECT 'Verificando tabla Users...' as Status;
SELECT COUNT(*) as TotalUsers FROM Users;

-- Verificar el usuario admin específicamente
SELECT 'Verificando usuario admin...' as Status;
SELECT 
    Id,
    UserCode,
    FullName,
    DisplayName,
    Role,
    Area,
    IsActive,
    CreatedAt,
    UpdatedAt,
    CASE 
        WHEN Password IS NOT NULL THEN 'Password Set' 
        ELSE 'No Password' 
    END as PasswordStatus
FROM Users 
WHERE UserCode = 'admin';

-- Verificar todos los usuarios activos
SELECT 'Todos los usuarios activos...' as Status;
SELECT 
    Id,
    UserCode,
    FullName,
    DisplayName,
    Role,
    IsActive
FROM Users 
WHERE IsActive = 1
ORDER BY UserCode;

-- Verificar usuarios inactivos
SELECT 'Usuarios inactivos...' as Status;
SELECT 
    Id,
    UserCode,
    FullName,
    DisplayName,
    Role,
    IsActive
FROM Users 
WHERE IsActive = 0
ORDER BY UserCode;