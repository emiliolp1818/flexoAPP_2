-- Script para verificar las columnas actuales de la tabla maquinas
USE flexoapp_bd;

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_KEY,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'flexoapp_bd'
  AND TABLE_NAME = 'maquinas'
ORDER BY ORDINAL_POSITION;
