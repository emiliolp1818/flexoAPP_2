-- =====================================================
-- MIGRACIÓN SIMPLE: Agregar campo ancho_mm a designs
-- =====================================================

USE flexoapp_bd;

-- Agregar columna ancho_mm
ALTER TABLE designs 
ADD COLUMN ancho_mm INT NULL 
COMMENT 'Ancho en milímetros' 
AFTER Type;

-- Verificar
SELECT 'Columna ancho_mm agregada exitosamente' AS Resultado;
