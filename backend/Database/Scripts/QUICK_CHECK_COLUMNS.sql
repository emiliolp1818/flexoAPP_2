-- =====================================================
-- VERIFICACIÓN RÁPIDA: Ver nombres de columnas
-- =====================================================

USE flexoapp_bd;

-- Ver todas las columnas de la tabla maquinas
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'flexoapp_bd'
  AND TABLE_NAME = 'maquinas'
ORDER BY ORDINAL_POSITION;

-- Ver registros con valores sospechosos (sin especificar NumeroMaquina)
SELECT 
    ot_sap,
    Articulo,
    Kilos,
    metros,
    UpdatedAt
FROM maquinas
WHERE Kilos > 9999999 OR (metros IS NOT NULL AND metros > 99999999)
ORDER BY UpdatedAt DESC
LIMIT 10;

-- Ver algunos registros recientes para verificar formato
SELECT 
    ot_sap,
    Articulo,
    Kilos,
    metros,
    UpdatedAt
FROM maquinas
ORDER BY UpdatedAt DESC
LIMIT 5;
