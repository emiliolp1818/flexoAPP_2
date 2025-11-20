-- =====================================================
-- SCRIPT: Agregar campo ID auto-incremental como PRIMARY KEY
-- Base de datos: flexoapp_bd
-- Descripción: Agregar campo id INT AUTO_INCREMENT como PRIMARY KEY
--              y mantener articulo + numero_maquina como UNIQUE KEY
-- Versión: 3.0.0
-- Fecha: 2024-11-16
-- =====================================================

USE flexoapp_bd;

-- ===== PASO 1: RESPALDAR DATOS EXISTENTES =====
DROP TABLE IF EXISTS `maquinas_backup_v3`;
CREATE TABLE `maquinas_backup_v3` AS SELECT * FROM `maquinas`;

SELECT CONCAT('✅ Respaldo creado: ', COUNT(*), ' registros guardados') AS resultado 
FROM `maquinas_backup_v3`;

-- ===== PASO 2: ELIMINAR PRIMARY KEY ACTUAL =====
ALTER TABLE `maquinas` DROP PRIMARY KEY;

SELECT '✅ Primary key compuesta eliminada' AS resultado;

-- ===== PASO 3: AGREGAR CAMPO ID AUTO_INCREMENT =====
-- Agregar campo id al inicio de la tabla
ALTER TABLE `maquinas` 
    ADD COLUMN `id` INT NOT NULL AUTO_INCREMENT FIRST,
    ADD PRIMARY KEY (`id`);

SELECT '✅ Campo id agregado como PRIMARY KEY' AS resultado;

-- ===== PASO 4: CREAR UNIQUE KEY PARA ARTICULO + NUMERO_MAQUINA =====
-- Esto asegura que no se puedan duplicar combinaciones de articulo + maquina
ALTER TABLE `maquinas` 
    ADD UNIQUE KEY `uk_articulo_maquina` (`articulo`, `numero_maquina`);

SELECT '✅ UNIQUE KEY creada para articulo + numero_maquina' AS resultado;

-- ===== PASO 5: VERIFICAR ESTRUCTURA =====
DESCRIBE `maquinas`;

-- ===== PASO 6: VERIFICAR DATOS =====
SELECT CONCAT('✅ Total de registros: ', COUNT(*)) AS resultado 
FROM `maquinas`;

-- ===== PASO 7: MOSTRAR EJEMPLOS =====
SELECT 
    id,
    articulo,
    numero_maquina,
    cliente,
    estado
FROM `maquinas`
LIMIT 5;

-- ===== MENSAJE FINAL =====
SELECT '
✅ MIGRACIÓN COMPLETADA EXITOSAMENTE

CAMBIOS REALIZADOS:
- Campo "id" agregado como PRIMARY KEY AUTO_INCREMENT
- UNIQUE KEY creada para "articulo + numero_maquina"
- Ahora cada registro tiene un ID único interno
- Se mantiene la restricción de no duplicar articulo en la misma máquina

ESTRUCTURA FINAL:
- PRIMARY KEY: id (auto-incremental, interno)
- UNIQUE KEY: articulo + numero_maquina (validación de negocio)

PRÓXIMOS PASOS:
1. Actualizar el código backend para usar el campo id
2. Probar carga de Excel
3. Si todo funciona, eliminar tabla de respaldo: DROP TABLE maquinas_backup_v3;
' AS RESULTADO_FINAL;
