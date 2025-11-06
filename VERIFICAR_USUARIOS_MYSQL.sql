-- ===== SCRIPT PARA VERIFICAR USUARIOS EN MYSQL =====
-- Base de datos: flexoapp_bd
-- Tabla: users
-- Puerto: 3306 (localhost)

USE flexoapp_bd;

-- 1. Verificar estructura de la tabla users
DESCRIBE users;

-- 2. Contar total de usuarios
SELECT 'TOTAL DE USUARIOS' as Info, COUNT(*) as Cantidad FROM users;

-- 3. Mostrar todos los usuarios con información completa
SELECT 
    id,
    UserCode as 'Código Usuario',
    CONCAT(FirstName, ' ', LastName) as 'Nombre Completo',
    FirstName as 'Nombre',
    LastName as 'Apellido',
    Email as 'Correo',
    Phone as 'Teléfono',
    Role as 'Rol',
    CASE 
        WHEN IsActive = 1 THEN 'Activo' 
        ELSE 'Inactivo' 
    END as 'Estado',
    CreatedAt as 'Fecha Creación',
    UpdatedAt as 'Última Actualización'
FROM users 
ORDER BY IsActive DESC, Role, FirstName;

-- 4. Usuarios por rol
SELECT 
    'USUARIOS POR ROL' as Info,
    Role as 'Rol',
    COUNT(*) as 'Cantidad',
    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) as 'Activos',
    SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) as 'Inactivos'
FROM users 
GROUP BY Role
ORDER BY COUNT(*) DESC;

-- 5. Usuarios activos solamente
SELECT 
    'USUARIOS ACTIVOS' as Info,
    id,
    UserCode,
    CONCAT(FirstName, ' ', LastName) as 'Nombre Completo',
    Role,
    Email,
    Phone
FROM users 
WHERE IsActive = 1
ORDER BY Role, FirstName;

-- 6. Usuarios inactivos
SELECT 
    'USUARIOS INACTIVOS' as Info,
    id,
    UserCode,
    CONCAT(FirstName, ' ', LastName) as 'Nombre Completo',
    Role,
    Email
FROM users 
WHERE IsActive = 0
ORDER BY Role, FirstName;

-- 7. Verificar usuarios con imágenes de perfil
SELECT 
    'USUARIOS CON FOTOS' as Info,
    UserCode,
    CONCAT(FirstName, ' ', LastName) as 'Nombre',
    CASE 
        WHEN ProfileImage IS NOT NULL THEN 'Tiene imagen base64'
        WHEN ProfileImageUrl IS NOT NULL THEN 'Tiene URL de imagen'
        ELSE 'Sin imagen'
    END as 'Estado Imagen'
FROM users
WHERE ProfileImage IS NOT NULL OR ProfileImageUrl IS NOT NULL;

-- 8. Usuarios sin email o teléfono
SELECT 
    'USUARIOS SIN CONTACTO' as Info,
    UserCode,
    CONCAT(FirstName, ' ', LastName) as 'Nombre',
    CASE 
        WHEN Email IS NULL OR Email = '' THEN 'Sin email'
        ELSE Email
    END as 'Email',
    CASE 
        WHEN Phone IS NULL OR Phone = '' THEN 'Sin teléfono'
        ELSE Phone
    END as 'Teléfono'
FROM users
WHERE (Email IS NULL OR Email = '') OR (Phone IS NULL OR Phone = '');

-- 9. Información de la base de datos
SELECT 
    'INFORMACIÓN DE LA BD' as Info,
    DATABASE() as 'Base de Datos Actual',
    VERSION() as 'Versión MySQL',
    NOW() as 'Fecha y Hora Actual';

-- 10. Verificar permisos (si la columna existe)
SELECT 
    'PERMISOS DE USUARIOS' as Info,
    UserCode,
    Role,
    CASE 
        WHEN Permissions IS NULL OR Permissions = '' THEN 'Sin permisos específicos'
        ELSE Permissions
    END as 'Permisos'
FROM users
ORDER BY Role, UserCode;