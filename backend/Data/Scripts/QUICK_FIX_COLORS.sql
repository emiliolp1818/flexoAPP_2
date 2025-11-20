-- =====================================================
-- SOLUCIÓN RÁPIDA: ACTUALIZAR ESTRUCTURA DE COLORES
-- Base de datos: flexoapp_bd
-- Propósito: Migrar columna Colors a columnas individuales color 1-10
-- =====================================================

-- ===== SELECCIONAR BASE DE DATOS =====
USE flexoapp_bd;

-- ===== VERIFICAR SI LA COLUMNA COLORS AÚN EXISTE =====
-- Consulta a INFORMATION_SCHEMA para verificar la existencia de la columna Colors
-- Guarda el resultado en una variable @column_exists
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'flexoapp_bd'  -- Base de datos: flexoapp_bd
      AND TABLE_NAME = 'Designs'        -- Tabla: Designs
      AND COLUMN_NAME = 'Colors'        -- Columna antigua: Colors (JSON)
);

-- ===== CREAR COLUMNAS INDIVIDUALES DE COLORES =====
-- Si la columna Colors existe, crear las columnas Color1 a Color10
-- IF: condición para ejecutar solo si @column_exists > 0
-- ALTER TABLE: modificar la estructura de la tabla Designs
-- ADD COLUMN: agregar nuevas columnas para cada color
SET @sql = IF(@column_exists > 0, 
    'ALTER TABLE Designs 
     ADD COLUMN Color1 VARCHAR(100) AFTER ColorCount,   -- Color 1
     ADD COLUMN Color2 VARCHAR(100) AFTER Color1,       -- Color 2
     ADD COLUMN Color3 VARCHAR(100) AFTER Color2,       -- Color 3
     ADD COLUMN Color4 VARCHAR(100) AFTER Color3,       -- Color 4
     ADD COLUMN Color5 VARCHAR(100) AFTER Color4,       -- Color 5
     ADD COLUMN Color6 VARCHAR(100) AFTER Color5,       -- Color 6
     ADD COLUMN Color7 VARCHAR(100) AFTER Color6,       -- Color 7
     ADD COLUMN Color8 VARCHAR(100) AFTER Color7,       -- Color 8
     ADD COLUMN Color9 VARCHAR(100) AFTER Color8,       -- Color 9
     ADD COLUMN Color10 VARCHAR(100) AFTER Color9;',    -- Color 10
    'SELECT "Columnas de colores ya existen" as Status;'
);

-- ===== EJECUTAR SQL DINÁMICO =====
-- PREPARE: preparar la sentencia SQL
-- EXECUTE: ejecutar la sentencia preparada
-- DEALLOCATE: liberar recursos de la sentencia preparada
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===== MIGRAR DATOS EXISTENTES =====
-- Extraer colores del JSON y asignarlos a las columnas individuales
-- JSON_LENGTH: obtiene la cantidad de elementos en el array JSON
-- JSON_EXTRACT: extrae un elemento del array JSON por índice ($[0], $[1], etc.)
-- JSON_UNQUOTE: remueve las comillas del valor JSON
-- CASE WHEN: condición para verificar si existe el color en el índice
UPDATE Designs SET
    Color1 = CASE WHEN JSON_LENGTH(Colors) >= 1 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[0]')) ELSE NULL END,   -- Extraer color 1
    Color2 = CASE WHEN JSON_LENGTH(Colors) >= 2 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[1]')) ELSE NULL END,   -- Extraer color 2
    Color3 = CASE WHEN JSON_LENGTH(Colors) >= 3 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[2]')) ELSE NULL END,   -- Extraer color 3
    Color4 = CASE WHEN JSON_LENGTH(Colors) >= 4 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[3]')) ELSE NULL END,   -- Extraer color 4
    Color5 = CASE WHEN JSON_LENGTH(Colors) >= 5 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[4]')) ELSE NULL END,   -- Extraer color 5
    Color6 = CASE WHEN JSON_LENGTH(Colors) >= 6 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[5]')) ELSE NULL END,   -- Extraer color 6
    Color7 = CASE WHEN JSON_LENGTH(Colors) >= 7 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[6]')) ELSE NULL END,   -- Extraer color 7
    Color8 = CASE WHEN JSON_LENGTH(Colors) >= 8 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[7]')) ELSE NULL END,   -- Extraer color 8
    Color9 = CASE WHEN JSON_LENGTH(Colors) >= 9 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[8]')) ELSE NULL END,   -- Extraer color 9
    Color10 = CASE WHEN JSON_LENGTH(Colors) >= 10 THEN JSON_UNQUOTE(JSON_EXTRACT(Colors, '$[9]')) ELSE NULL END  -- Extraer color 10
WHERE Colors IS NOT NULL AND JSON_VALID(Colors);  -- Solo procesar registros con JSON válido

-- ===== LIMPIAR VALORES 'null' =====
-- Convertir strings 'null' a NULL real de SQL
-- Esto puede ocurrir cuando JSON_UNQUOTE extrae un valor null de JSON
UPDATE Designs SET
    Color1 = NULL WHERE Color1 = 'null',    -- Limpiar Color1
    Color2 = NULL WHERE Color2 = 'null',    -- Limpiar Color2
    Color3 = NULL WHERE Color3 = 'null',    -- Limpiar Color3
    Color4 = NULL WHERE Color4 = 'null',    -- Limpiar Color4
    Color5 = NULL WHERE Color5 = 'null',    -- Limpiar Color5
    Color6 = NULL WHERE Color6 = 'null',    -- Limpiar Color6
    Color7 = NULL WHERE Color7 = 'null',    -- Limpiar Color7
    Color8 = NULL WHERE Color8 = 'null',    -- Limpiar Color8
    Color9 = NULL WHERE Color9 = 'null',    -- Limpiar Color9
    Color10 = NULL WHERE Color10 = 'null';  -- Limpiar Color10

-- ===== VERIFICAR RESULTADO =====
-- Mostrar mensaje de confirmación
SELECT 'Migración completada exitosamente en flexoapp_bd' as Status;

-- Mostrar primeros 3 registros para verificar la migración
SELECT Id, ArticleF, ColorCount, Color1, Color2, Color3, Color4 FROM Designs LIMIT 3;