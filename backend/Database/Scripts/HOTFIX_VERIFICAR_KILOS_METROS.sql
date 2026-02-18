-- =====================================================
-- HOTFIX: VERIFICAR Y CORREGIR COLUMNAS KILOS Y METROS
-- =====================================================
-- Propósito: Diagnosticar por qué en producción aparecen valores 999999999999
-- Fecha: 2026-02-18
-- =====================================================

USE flexoapp_bd;

-- ===== PASO 1: VERIFICAR ESTRUCTURA ACTUAL =====
SELECT '===== VERIFICANDO ESTRUCTURA DE COLUMNAS =====' AS paso;

SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT,
    NUMERIC_PRECISION,
    NUMERIC_SCALE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'flexoapp_bd'
  AND TABLE_NAME = 'maquinas'
  AND COLUMN_NAME IN ('Kilos', 'metros')
ORDER BY ORDINAL_POSITION;

-- ===== PASO 2: VERIFICAR CONSTRAINTS =====
SELECT '===== VERIFICANDO CONSTRAINTS =====' AS paso;

SELECT 
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'flexoapp_bd'
  AND TABLE_NAME = 'maquinas'
  AND CONSTRAINT_NAME LIKE '%kilo%' OR CONSTRAINT_NAME LIKE '%metro%';

-- ===== PASO 3: VERIFICAR TRIGGERS =====
SELECT '===== VERIFICANDO TRIGGERS =====' AS paso;

SELECT 
    TRIGGER_NAME,
    EVENT_MANIPULATION,
    EVENT_OBJECT_TABLE,
    ACTION_TIMING,
    ACTION_STATEMENT
FROM INFORMATION_SCHEMA.TRIGGERS
WHERE EVENT_OBJECT_SCHEMA = 'flexoapp_bd'
  AND EVENT_OBJECT_TABLE = 'maquinas';

-- ===== PASO 4: VER VALORES ACTUALES PROBLEMÁTICOS =====
SELECT '===== VALORES PROBLEMÁTICOS ACTUALES =====' AS paso;

SELECT 
    ot_sap,
    Articulo,
    NumeroMaquina,
    Kilos,
    metros,
    UpdatedAt
FROM maquinas
WHERE Kilos > 9999999 OR metros > 99999999
ORDER BY UpdatedAt DESC
LIMIT 10;

-- ===== PASO 5: ELIMINAR CONSTRAINT PROBLEMÁTICO SI EXISTE =====
SELECT '===== ELIMINANDO CONSTRAINTS PROBLEMÁTICOS =====' AS paso;

-- Eliminar constraint de kilos si existe
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = 'flexoapp_bd'
      AND TABLE_NAME = 'maquinas'
      AND CONSTRAINT_NAME = 'chk_maquinas_kilos_positivos'
);

SET @drop_constraint = IF(@constraint_exists > 0,
    'ALTER TABLE maquinas DROP CONSTRAINT chk_maquinas_kilos_positivos;',
    'SELECT ''Constraint chk_maquinas_kilos_positivos no existe'' AS resultado;'
);

PREPARE stmt FROM @drop_constraint;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===== PASO 6: ASEGURAR TIPO DE DATO CORRECTO =====
SELECT '===== CORRIGIENDO TIPO DE DATOS =====' AS paso;

-- Asegurar que Kilos sea DECIMAL(10,3)
ALTER TABLE maquinas 
MODIFY COLUMN Kilos DECIMAL(10,3) NOT NULL DEFAULT 0 
COMMENT 'Cantidad en kilogramos (hasta 3 decimales)';

-- Asegurar que metros sea DECIMAL(10,2) y permita NULL
ALTER TABLE maquinas 
MODIFY COLUMN metros DECIMAL(10,2) NULL DEFAULT NULL
COMMENT 'Metros a fabricar';

-- ===== PASO 7: AGREGAR CONSTRAINT CORRECTO =====
SELECT '===== AGREGANDO CONSTRAINT CORRECTO =====' AS paso;

-- Agregar constraint que permita 0 y valores positivos razonables
ALTER TABLE maquinas 
ADD CONSTRAINT chk_maquinas_kilos_validos 
CHECK (Kilos >= 0 AND Kilos <= 9999999.999);

-- ===== PASO 8: LIMPIAR VALORES INCORRECTOS =====
SELECT '===== LIMPIANDO VALORES INCORRECTOS =====' AS paso;

-- Resetear valores fuera de rango a 0
UPDATE maquinas 
SET Kilos = 0 
WHERE Kilos > 9999999.999;

UPDATE maquinas 
SET metros = NULL 
WHERE metros > 99999999;

-- ===== VERIFICACIÓN FINAL =====
SELECT '===== VERIFICACIÓN FINAL =====' AS paso;

SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    NUMERIC_PRECISION,
    NUMERIC_SCALE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'flexoapp_bd'
  AND TABLE_NAME = 'maquinas'
  AND COLUMN_NAME IN ('Kilos', 'metros');

SELECT '✓ Hotfix completado - Columnas Kilos y Metros corregidas' AS resultado;
