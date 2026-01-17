-- =====================================================
-- SCRIPT DE MIGRACIÓN: RENOMBRAR COLUMNA REFERENCIA A DESCRIPCION
-- =====================================================
-- Tabla: condicionunica
-- Descripción: Renombra la columna "referencia" a "descripcion"
--              para mejor claridad semántica en la aplicación
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-01-17
-- Versión: 1.0
-- =====================================================

-- ===== IMPORTANTE: BACKUP ANTES DE EJECUTAR =====
-- SIEMPRE hacer un backup de la base de datos antes de ejecutar migraciones
-- Comando para backup:
-- mysqldump -u root -p flexoapp_bd > backup_condicionunica_$(date +%Y%m%d_%H%M%S).sql

-- ===== PASO 1: VERIFICAR QUE LA TABLA EXISTE =====
-- Verificar que la tabla condicionunica existe antes de modificarla
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME,
    UPDATE_TIME
FROM 
    information_schema.TABLES 
WHERE 
    TABLE_SCHEMA = 'flexoapp_bd' 
    AND TABLE_NAME = 'condicionunica';

-- ===== PASO 2: VERIFICAR ESTRUCTURA ACTUAL =====
-- Mostrar la estructura actual de la tabla para confirmar que existe la columna "referencia"
DESCRIBE condicionunica;

-- ===== PASO 3: VERIFICAR DATOS EXISTENTES =====
-- Contar cuántos registros hay en la tabla
SELECT COUNT(*) AS total_registros FROM condicionunica;

-- Mostrar algunos registros de ejemplo (primeros 5)
SELECT * FROM condicionunica LIMIT 5;

-- ===== PASO 4: RENOMBRAR COLUMNA REFERENCIA A DESCRIPCION =====
-- Cambiar el nombre de la columna "referencia" a "descripcion"
-- Mantener el mismo tipo de dato y restricciones
-- NOTA: Si la columna no existe, este comando fallará (es lo esperado)
ALTER TABLE condicionunica 
CHANGE COLUMN referencia descripcion VARCHAR(500) NOT NULL 
COMMENT 'Descripción del producto o diseño (cargada desde designs o ingresada manualmente)';

-- ===== PASO 5: VERIFICAR CAMBIO =====
-- Mostrar la estructura actualizada de la tabla
DESCRIBE condicionunica;

-- Verificar que los datos se mantuvieron intactos
SELECT COUNT(*) AS total_registros_despues FROM condicionunica;

-- Mostrar algunos registros para verificar que la columna "descripcion" tiene los datos
SELECT 
    id,
    farticulo,
    descripcion,  -- Nueva columna renombrada
    estante,
    numerocarpeta,
    createddate,
    lastmodified
FROM condicionunica 
LIMIT 5;

-- ===== PASO 6: ACTUALIZAR ÍNDICES SI ES NECESARIO =====
-- Si había índices en la columna "referencia", se mantienen automáticamente
-- Verificar índices existentes
SHOW INDEX FROM condicionunica;

-- ===== PASO 7: VERIFICACIÓN FINAL =====
-- Consulta de verificación completa
SELECT 
    'MIGRACIÓN COMPLETADA' AS status,
    COUNT(*) AS total_registros,
    MIN(createddate) AS fecha_primer_registro,
    MAX(lastmodified) AS fecha_ultima_modificacion
FROM condicionunica;

-- ===== ROLLBACK (EN CASO DE ERROR) =====
-- Si algo sale mal, puedes revertir el cambio con este comando:
-- ALTER TABLE condicionunica 
-- CHANGE COLUMN descripcion referencia VARCHAR(500) NOT NULL 
-- COMMENT 'Referencia del producto o diseño';

-- ===== NOTAS IMPORTANTES =====
-- 1. Este script es IDEMPOTENTE: Si la columna "descripcion" ya existe, fallará
-- 2. Los datos NO se pierden, solo se renombra la columna
-- 3. Las aplicaciones que usen "referencia" dejarán de funcionar hasta actualizar el código
-- 4. Asegúrate de actualizar el backend (C#) y frontend (TypeScript) después de ejecutar este script

-- ===== FIN DEL SCRIPT DE MIGRACIÓN =====
