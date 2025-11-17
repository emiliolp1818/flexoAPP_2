-- Script para verificar la tabla designs y sus datos
-- Ejecutar este script para diagnosticar el problema

-- 1. Verificar que la tabla designs existe
SHOW TABLES LIKE 'designs';

-- 2. Ver la estructura de la tabla designs
DESCRIBE designs;

-- 3. Contar cuántos registros hay en la tabla designs
SELECT COUNT(*) as total_designs FROM designs;

-- 4. Ver los primeros 10 registros de la tabla designs
SELECT 
    Id,
    ArticleF,
    Client,
    Substrate,
    Description,
    Type,
    ColorCount,
    `color 1` as Color1,
    `color 2` as Color2,
    `color 3` as Color3,
    `color 4` as Color4
FROM designs
LIMIT 10;

-- 5. Buscar un artículo específico (reemplazar 'F204567' con el artículo que estás probando)
SELECT 
    Id,
    ArticleF,
    Client,
    Substrate,
    Description,
    Type,
    ColorCount,
    `color 1` as Color1,
    `color 2` as Color2,
    `color 3` as Color3,
    `color 4` as Color4
FROM designs
WHERE ArticleF = 'F204567';

-- 6. Ver todos los ArticleF disponibles (para verificar el formato)
SELECT DISTINCT ArticleF 
FROM designs 
ORDER BY ArticleF
LIMIT 20;

-- 7. Verificar si hay espacios en blanco en ArticleF
SELECT 
    ArticleF,
    LENGTH(ArticleF) as longitud,
    CHAR_LENGTH(ArticleF) as caracteres,
    CONCAT('[', ArticleF, ']') as con_corchetes
FROM designs
LIMIT 10;
