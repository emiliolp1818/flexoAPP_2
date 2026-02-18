-- PASO 2: Ver registros con valores problemáticos
SELECT 
    ot_sap,
    Articulo,
    Kilos,
    metros
FROM maquinas
WHERE Kilos > 9999999 OR (metros IS NOT NULL AND metros > 99999999)
LIMIT 10;
