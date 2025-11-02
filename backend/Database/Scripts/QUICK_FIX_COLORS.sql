-- SOLUCIÓN RÁPIDA: Actualizar estructura de colores
USE flexoapp_db;

-- Verificar si la columna Colors aún existe
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'flexoapp_db' 
      AND TABLE_NAME = 'Designs' 
      AND COLUMN_NAME = 'Colors'
);

-- Si la columna Colors existe, hacer la migración
SET @sql = IF(@column_exists > 0, 
    'ALTER TABLE Designs 
     ADD COLUMN Color1 VARCHAR(100) AFTER ColorCount,
     ADD COLUMN Color2 VARCHAR(100) AFTER Color1,
     ADD COLUMN Color3 VARCHAR(100) AFTER Color2,
     ADD COLUMN Color4 VARCHAR(100) AFTER Color3,
     ADD COLUMN Color5 VARCHAR(100) AFTER Color4,
     ADD COLUMN Color6 VARCHAR(100) AFTER Color5,
     ADD COLUMN Color7 VARCHAR(100) AFTER Color6,
     ADD COLUMN Color8 VARCHAR(100) AFTER Color7,
     ADD COLUMN Color9 VARCHAR(100) AFTER Color8,
     ADD COLUMN Color10 VARCHAR(100) AFTER Color9;',
    'SELECT "Columnas de colores ya existen" as Status;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Migrar datos existentes si hay registros
UPDATE Designs SET
    Color1 = CASE WHEN JSON_LENGTH(Colors) >= 1 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[0]')) ELSE NULL END,
    Color2 = CASE WHEN JSON_LENGTH(Colors) >= 2 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[1]')) ELSE NULL END,
    Color3 = CASE WHEN JSON_LENGTH(Colors) >= 3 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[2]')) ELSE NULL END,
    Color4 = CASE WHEN JSON_LENGTH(Colors) >= 4 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[3]')) ELSE NULL END,
    Color5 = CASE WHEN JSON_LENGTH(Colors) >= 5 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[4]')) ELSE NULL END,
    Color6 = CASE WHEN JSON_LENGTH(Colors) >= 6 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[5]')) ELSE NULL END,
    Color7 = CASE WHEN JSON_LENGTH(Colors) >= 7 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[6]')) ELSE NULL END,
    Color8 = CASE WHEN JSON_LENGTH(Colors) >= 8 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[7]')) ELSE NULL END,
    Color9 = CASE WHEN JSON_LENGTH(Colors) >= 9 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[8]')) ELSE NULL END,
    Color10 = CASE WHEN JSON_LENGTH(Colors) >= 10 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[9]')) ELSE NULL END
WHERE Colors IS NOT NULL AND JSON_VALID(Colors);

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

-- Verificar resultado
SELECT 'Migración completada' as Status;
SELECT Id, ArticleF, ColorCount, Color1, Color2, Color3, Color4 FROM Designs LIMIT 3;