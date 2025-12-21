-- =====================================================
-- ELIMINAR CONFIGURACIÓN DE MONEDA (CURRENCY)
-- Base de datos: flexoapp_bd
-- =====================================================

USE flexoapp_bd;

-- Mostrar configuración de currency antes de eliminar
SELECT 
    id, 
    name, 
    description,
    value,
    category 
FROM system_configs 
WHERE id = 'currency';

-- Eliminar configuración de moneda
DELETE FROM system_configs 
WHERE id = 'currency';

-- Verificar que se eliminó
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
