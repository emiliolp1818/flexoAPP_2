-- =====================================================
-- Migración: Agregar columna preparando_started_at
-- Fecha: 2026-01-27
-- Descripción: Agrega la columna preparando_started_at a la tabla maquinas
--              para guardar la fecha cuando se marca como PREPARANDO
--              y calcular el tiempo transcurrido hasta LISTO
-- =====================================================

USE flexoapp_bd;

-- Agregar columna preparando_started_at
ALTER TABLE maquinas 
ADD COLUMN preparando_started_at DATETIME NULL 
COMMENT 'Fecha y hora cuando se marcó como PREPARANDO' 
AFTER last_action_at;

-- Verificar que la columna se agregó correctamente
DESCRIBE maquinas;

-- Mensaje de confirmación
SELECT 'Columna preparando_started_at agregada exitosamente' AS resultado;
