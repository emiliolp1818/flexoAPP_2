-- Script de prueba para verificar datos de anilox

-- Verificar que la tabla existe
SHOW TABLES LIKE 'anilox';

-- Contar registros totales
SELECT COUNT(*) as total_registros FROM anilox;

-- Contar por BCM
SELECT bcm, COUNT(*) as cantidad 
FROM anilox 
GROUP BY bcm 
ORDER BY bcm;

-- Mostrar todos los anilox para BCM 140
SELECT * FROM anilox WHERE bcm = 140 ORDER BY volumen_real;

-- Mostrar todos los anilox para BCM 200
SELECT * FROM anilox WHERE bcm = 200 ORDER BY volumen_real;

-- Mostrar todos los anilox para BCM 275
SELECT * FROM anilox WHERE bcm = 275 ORDER BY volumen_real;

-- Mostrar todos los anilox para BCM 400
SELECT * FROM anilox WHERE bcm = 400 ORDER BY volumen_real;

-- Mostrar todos los anilox para BCM 80
SELECT * FROM anilox WHERE bcm = 80 ORDER BY volumen_real;
