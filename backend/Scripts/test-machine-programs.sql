-- Script de prueba para machine_programs
USE flexoapp_bd;

-- Verificar tabla
SHOW TABLES LIKE 'machine_programs';
DESCRIBE machine_programs;

-- Contar registros
SELECT COUNT(*) as total_programs FROM machine_programs;

-- Mostrar algunos registros
SELECT * FROM machine_programs LIMIT 5;

SELECT 'Prueba completada' as resultado;