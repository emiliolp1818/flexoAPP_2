-- =============================================
-- Script: VERIFY MACHINE CONFIG TABLE
-- Descripción: Verificar si la tabla machine_config existe y tiene datos
-- =============================================

-- Verificar si la tabla existe
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME,
    UPDATE_TIME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'machine_config';

-- Si la tabla existe, mostrar su estructura
DESCRIBE machine_config;

-- Si la tabla existe, mostrar los datos
SELECT * FROM machine_config ORDER BY numero_maquina;
