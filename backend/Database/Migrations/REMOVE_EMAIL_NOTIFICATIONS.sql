-- =====================================================
-- ELIMINAR CONFIGURACIONES DE NOTIFICACIONES POR EMAIL
-- Base de datos: flexoapp_bd
-- =====================================================

USE flexoapp_bd;

-- Eliminar configuraciones de email
DELETE FROM system_configs 
WHERE id IN ('enable_email_notifications', 'email_notification_types');

-- Verificar que se eliminaron
SELECT 
    id, 
    name, 
    category 
FROM system_configs 
ORDER BY category, id;

-- Mostrar resumen por categoría
SELECT 
    category AS 'Categoría',
    COUNT(*) AS 'Cantidad de Configuraciones'
FROM system_configs
GROUP BY category
ORDER BY category;
