-- Script para verificar la conexión y estructura de la base de datos
-- FlexoAPP - Verificación de tabla machine_programs

-- Verificar si la base de datos existe
SHOW DATABASES LIKE 'flexoapp_db';

-- Usar la base de datos
USE flexoapp_db;

-- Verificar si la tabla machine_programs existe
SHOW TABLES LIKE 'machine_programs';

-- Mostrar la estructura de la tabla machine_programs
DESCRIBE machine_programs;

-- Contar registros en la tabla
SELECT COUNT(*) as total_programs FROM machine_programs;

-- Mostrar algunos registros de ejemplo
SELECT * FROM machine_programs LIMIT 5;

-- Verificar índices de la tabla
SHOW INDEX FROM machine_programs;

-- Verificar las migraciones aplicadas
SELECT * FROM __efmigrationshistory ORDER BY MigrationId DESC;

-- Verificar la conexión y permisos
SELECT USER(), DATABASE(), NOW() as current_time;

-- Verificar el estado de la tabla
SHOW TABLE STATUS LIKE 'machine_programs';