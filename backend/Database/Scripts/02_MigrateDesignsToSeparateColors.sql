-- =====================================================
-- MIGRACIÓN: Cambiar de JSON a columnas separadas para colores
-- =====================================================

USE flexoapp_db;

-- Agregar las nuevas columnas de colores
ALTER TABLE Designs 
ADD COLUMN Color1 VARCHAR(100) AFTER ColorCount,
ADD COLUMN Color2 VARCHAR(100) AFTER Color1,
ADD COLUMN Color3 VARCHAR(100) AFTER Color2,
ADD COLUMN Color4 VARCHAR(100) AFTER Color3,
ADD COLUMN Color5 VARCHAR(100) AFTER Color4,
ADD COLUMN Color6 VARCHAR(100) AFTER Color5,
ADD COLUMN Color7 VARCHAR(100) AFTER Color6,
ADD COLUMN Color8 VARCHAR(100) AFTER Color7,
ADD COLUMN Color9 VARCHAR(100) AFTER Color8,
ADD COLUMN Color10 VARCHAR(100) AFTER Color9;

-- Migrar datos existentes del JSON a las columnas separadas
UPDATE Designs SET
    Color1 = JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[0]')),
    Color2 = JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[1]')),
    Color3 = JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[2]')),
    Color4 = JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[3]')),
    Color5 = JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[4]')),
    Color6 = JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[5]')),
    Color7 = JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[6]')),
    Color8 = JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[7]')),
    Color9 = JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[8]')),
    Color10 = JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[9]'))
WHERE Colors IS NOT NULL;

-- Limpiar valores 'null' que pueden haber quedado
UPDATE Designs SET
    Color1 = NULL WHERE Color1 = 'null',
    Color2 = NULL WHERE Color2 = 'null',
    Color3 = NULL WHERE Color3 = 'null',
    Color4 = NULL WHERE Color4 = 'null',
    Color5 = NULL WHERE Color5 = 'null',
    Color6 = NULL WHERE Color6 = 'null',
    Color7 = NULL WHERE Color7 = 'null',
    Color8 = NULL WHERE Color8 = 'null',
    Color9 = NULL WHERE Color9 = 'null',
    Color10 = NULL WHERE Color10 = 'null';

-- Opcional: Eliminar la columna Colors después de verificar que la migración fue exitosa
-- ALTER TABLE Designs DROP COLUMN Colors;

-- Verificar la migración
SELECT 'Migración completada. Verificando datos:' as Status;
SELECT Id, ArticleF, ColorCount, Color1, Color2, Color3, Color4, Color5, Color6, Color7, Color8, Color9, Color10 
FROM Designs 
LIMIT 5;

SELECT 'Migración de colores completada exitosamente' as Resultado;