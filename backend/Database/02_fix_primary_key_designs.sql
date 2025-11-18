-- ===================================================================
-- SCRIPT DE MIGRACIÓN: Cambiar llave primaria de ID a ArticleF
-- ===================================================================
-- Descripción: Modifica la tabla existente flexographic_designs
--              para usar ArticleF como llave primaria en lugar de ID
-- Base de Datos: MySQL 8.0+
-- Fecha: 2024
-- ===================================================================

USE flexoapp_bd;

-- ===================================================================
-- PASO 1: VERIFICAR ESTADO ACTUAL DE LA TABLA
-- ===================================================================
SELECT 
    'Estado actual de la tabla flexographic_designs' AS Paso,
    COUNT(*) AS TotalRegistros
FROM flexographic_designs;

-- Mostrar estructura actual
DESCRIBE flexographic_designs;

-- Mostrar llaves primarias actuales
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    ORDINAL_POSITION
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'flexoapp_bd'
  AND TABLE_NAME = 'flexographic_designs'
  AND CONSTRAINT_NAME = 'PRIMARY';

-- ===================================================================
-- PASO 2: VERIFICAR QUE ArticleF NO TENGA DUPLICADOS
-- ===================================================================
SELECT 
    'Verificando duplicados en ArticleF' AS Paso,
    ArticleF,
    COUNT(*) AS Cantidad
FROM flexographic_designs
GROUP BY ArticleF
HAVING COUNT(*) > 1;

-- Si hay duplicados, este query los mostrará
-- IMPORTANTE: Resolver duplicados antes de continuar

-- ===================================================================
-- PASO 3: VERIFICAR QUE ArticleF NO TENGA VALORES NULL
-- ===================================================================
SELECT 
    'Verificando valores NULL en ArticleF' AS Paso,
    COUNT(*) AS RegistrosConNULL
FROM flexographic_designs
WHERE ArticleF IS NULL;

-- Si hay valores NULL, deben ser corregidos antes de continuar

-- ===================================================================
-- PASO 4: ELIMINAR LA LLAVE PRIMARIA ACTUAL (ID)
-- ===================================================================
-- Primero, eliminar cualquier índice o constraint que dependa de ID
ALTER TABLE flexographic_designs
DROP PRIMARY KEY;

SELECT 'Llave primaria ID eliminada exitosamente' AS Paso;

-- ===================================================================
-- PASO 5: ELIMINAR LA COLUMNA ID (si existe)
-- ===================================================================
-- Verificar si la columna ID existe
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'flexoapp_bd'
  AND TABLE_NAME = 'flexographic_designs'
  AND COLUMN_NAME = 'ID';

-- Eliminar columna ID si existe
ALTER TABLE flexographic_designs
DROP COLUMN IF EXISTS ID;

SELECT 'Columna ID eliminada exitosamente' AS Paso;

-- ===================================================================
-- PASO 6: ASEGURAR QUE ArticleF NO PERMITA NULL
-- ===================================================================
ALTER TABLE flexographic_designs
MODIFY COLUMN ArticleF VARCHAR(50) NOT NULL;

SELECT 'ArticleF configurado como NOT NULL' AS Paso;

-- ===================================================================
-- PASO 7: AGREGAR ArticleF COMO LLAVE PRIMARIA
-- ===================================================================
ALTER TABLE flexographic_designs
ADD PRIMARY KEY (ArticleF);

SELECT 'ArticleF establecido como llave primaria exitosamente' AS Paso;

-- ===================================================================
-- PASO 8: VERIFICAR LA NUEVA ESTRUCTURA
-- ===================================================================
-- Mostrar estructura actualizada
DESCRIBE flexographic_designs;

-- Verificar la nueva llave primaria
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    ORDINAL_POSITION
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'flexoapp_bd'
  AND TABLE_NAME = 'flexographic_designs'
  AND CONSTRAINT_NAME = 'PRIMARY';

-- Mostrar todos los índices
SHOW INDEX FROM flexographic_designs;

-- ===================================================================
-- PASO 9: VERIFICACIÓN FINAL
-- ===================================================================
SELECT 
    'Migración completada exitosamente' AS Resultado,
    COUNT(*) AS TotalRegistros,
    COUNT(DISTINCT ArticleF) AS ArticlesUnicos
FROM flexographic_designs;

-- ===================================================================
-- RESUMEN DE CAMBIOS
-- ===================================================================
-- ✅ Llave primaria ID eliminada
-- ✅ Columna ID eliminada (si existía)
-- ✅ ArticleF configurado como NOT NULL
-- ✅ ArticleF establecido como nueva llave primaria
-- ✅ Índices actualizados automáticamente
-- ===================================================================

-- ===================================================================
-- NOTAS IMPORTANTES
-- ===================================================================
-- 1. Este script es IRREVERSIBLE - hacer backup antes de ejecutar
-- 2. Asegurarse de que NO haya duplicados en ArticleF
-- 3. Asegurarse de que NO haya valores NULL en ArticleF
-- 4. Todos los registros deben tener un ArticleF único y válido
-- 5. Las relaciones con otras tablas deben actualizarse manualmente
-- ===================================================================
