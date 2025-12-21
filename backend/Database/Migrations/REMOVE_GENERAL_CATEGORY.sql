-- =====================================================
-- ELIMINAR CATEGORÍA GENERAL Y SUS CONFIGURACIONES
-- Base de datos: flexoapp_bd
-- =====================================================

USE flexoapp_bd;

-- Mostrar configuraciones de General antes de eliminar
SELECT 
    id, 
    name, 
    description,
    category 
FROM system_configs 
WHERE category = 'General';

-- Eliminar todas las configuraciones de la categoría General
DELETE FROM system_configs 
WHERE category = 'General';

-- Verificar que se eliminaron
SELECT 
    category AS 'Categoría',
    COUNT(*) AS 'Cantidad de Configuraciones'
FROM system_configs
GROUP BY category
ORDER BY category;

-- Mostrar todas las configuraciones restantes
SELECT 
    id, 
    name, 
    category 
FROM system_configs 
ORDER BY category, id;
