-- =====================================================
-- SCRIPT: Corregir clave primaria de tabla MAQUINAS
-- Base de datos: flexoapp_bd
-- Descripción: Cambiar PRIMARY KEY de 'articulo' a clave compuesta 'articulo + numero_maquina'
-- Problema: No se pueden guardar el mismo artículo en diferentes máquinas
-- Solución: Usar clave primaria compuesta (articulo, numero_maquina)
-- Versión: 2.0.0
-- Fecha: 2024-11-16
-- =====================================================

USE flexoapp_bd;

-- ===== PASO 1: RESPALDAR DATOS EXISTENTES =====
-- Crear tabla temporal con los datos actuales
CREATE TABLE IF NOT EXISTS `maquinas_backup` AS SELECT * FROM `maquinas`;

SELECT CONCAT('✅ Respaldo creado: ', COUNT(*), ' registros guardados') AS resultado 
FROM `maquinas_backup`;

-- ===== PASO 2: ELIMINAR CLAVES FORÁNEAS =====
-- Eliminar las claves foráneas antes de modificar la estructura
ALTER TABLE `maquinas` DROP FOREIGN KEY IF EXISTS `fk_maquinas_created_by`;
ALTER TABLE `maquinas` DROP FOREIGN KEY IF EXISTS `fk_maquinas_updated_by`;

SELECT '✅ Claves foráneas eliminadas' AS resultado;

-- ===== PASO 3: ELIMINAR PRIMARY KEY ACTUAL =====
-- Eliminar la clave primaria actual (solo 'articulo')
ALTER TABLE `maquinas` DROP PRIMARY KEY;

SELECT '✅ Primary key antigua eliminada' AS resultado;

-- ===== PASO 4: CREAR NUEVA PRIMARY KEY COMPUESTA =====
-- Crear nueva clave primaria compuesta (articulo + numero_maquina)
-- Esto permite tener el mismo artículo en diferentes máquinas
ALTER TABLE `maquinas` ADD PRIMARY KEY (`articulo`, `numero_maquina`);

SELECT '✅ Nueva primary key compuesta creada (articulo + numero_maquina)' AS resultado;

-- ===== PASO 5: RECREAR CLAVES FORÁNEAS =====
-- Recrear las claves foráneas que se eliminaron
ALTER TABLE `maquinas` 
    ADD CONSTRAINT `fk_maquinas_created_by` 
        FOREIGN KEY (`created_by`) 
        REFERENCES `users`(`id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;

ALTER TABLE `maquinas` 
    ADD CONSTRAINT `fk_maquinas_updated_by` 
        FOREIGN KEY (`updated_by`) 
        REFERENCES `users`(`id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;

SELECT '✅ Claves foráneas recreadas' AS resultado;

-- ===== PASO 6: VERIFICAR ESTRUCTURA =====
-- Mostrar la nueva estructura de la tabla
DESCRIBE `maquinas`;

-- ===== PASO 7: VERIFICAR DATOS =====
-- Verificar que los datos se mantuvieron
SELECT CONCAT('✅ Total de registros en maquinas: ', COUNT(*)) AS resultado 
FROM `maquinas`;

-- ===== PASO 8: MOSTRAR EJEMPLOS DE DATOS =====
-- Mostrar algunos registros para verificar
SELECT 
    articulo,
    numero_maquina,
    ot_sap,
    cliente,
    estado
FROM `maquinas`
LIMIT 5;

-- ===== MENSAJE FINAL =====
SELECT '
✅ MIGRACIÓN COMPLETADA EXITOSAMENTE

CAMBIOS REALIZADOS:
- Primary key cambiada de "articulo" a "articulo + numero_maquina"
- Ahora se puede tener el mismo artículo en diferentes máquinas
- Datos existentes preservados

PRÓXIMOS PASOS:
1. Verificar que los datos se carguen correctamente
2. Probar carga de Excel con mismo artículo en diferentes máquinas
3. Si todo funciona, eliminar tabla de respaldo: DROP TABLE maquinas_backup;

NOTA: La tabla maquinas_backup contiene un respaldo de los datos originales
' AS RESULTADO_FINAL;
