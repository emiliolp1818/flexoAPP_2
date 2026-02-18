-- PASO 5: Verificar resultados
SELECT 
    COUNT(*) as total_registros,
    MIN(Kilos) as kilos_minimo,
    MAX(Kilos) as kilos_maximo,
    MIN(metros) as metros_minimo,
    MAX(metros) as metros_maximo
FROM maquinas;
