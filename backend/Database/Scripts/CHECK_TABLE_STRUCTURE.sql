-- Verificar estructura actual de la tabla Designs
USE flexoapp_db;

-- Mostrar estructura de la tabla
DESCRIBE Designs;

-- Verificar si existen las columnas de colores separadas
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'flexoapp_db' 
  AND TABLE_NAME = 'Designs'
  AND COLUMN_NAME LIKE 'Color%'
ORDER BY COLUMN_NAME;

-- Contar registros existentes
SELECT COUNT(*) as TotalDesigns FROM Designs;