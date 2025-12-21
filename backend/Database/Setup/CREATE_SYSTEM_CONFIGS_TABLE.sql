-- =====================================================
-- CREAR TABLA DE CONFIGURACIONES DEL SISTEMA
-- Base de datos: flexoapp_bd
-- Tabla: system_configs
-- =====================================================

USE flexoapp_bd;

-- Eliminar tabla si existe (solo para desarrollo)
-- DROP TABLE IF EXISTS system_configs;

-- Crear tabla de configuraciones del sistema
CREATE TABLE IF NOT EXISTS system_configs (
    id VARCHAR(100) PRIMARY KEY COMMENT 'Identificador único de la configuración',
    name VARCHAR(200) NOT NULL COMMENT 'Nombre descriptivo de la configuración',
    description VARCHAR(500) COMMENT 'Descripción detallada de la funcionalidad',
    value VARCHAR(1000) NOT NULL COMMENT 'Valor actual de la configuración',
    type VARCHAR(50) NOT NULL DEFAULT 'string' COMMENT 'Tipo de dato: string, number, boolean, select',
    category VARCHAR(100) NOT NULL DEFAULT 'General' COMMENT 'Categoría para agrupar configuraciones',
    options VARCHAR(1000) COMMENT 'Opciones disponibles en formato JSON (para tipo select)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    INDEX idx_category (category),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configuraciones del sistema FlexoApp';

-- Insertar configuraciones predeterminadas
INSERT INTO system_configs (id, name, description, value, type, category, options) VALUES
-- Apariencia
('theme', 'Tema', 'Tema visual de la aplicación', 'light', 'select', 'Apariencia', '["light","dark","auto"]'),

-- Regional
('language', 'Idioma', 'Idioma de la interfaz', 'es', 'select', 'Regional', '["es","en","pt","fr","de"]'),
('timezone', 'Zona Horaria', 'Zona horaria del sistema', 'America/Bogota', 'select', 'Regional', '["America/Bogota","America/Mexico_City","America/Lima","America/Buenos_Aires","America/Santiago","America/Caracas","America/New_York","Europe/Madrid"]'),
('date_format', 'Formato de Fecha', 'Formato de visualización de fechas', 'DD/MM/YYYY', 'select', 'Regional', '["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"]'),
('time_format', 'Formato de Hora', 'Formato de visualización de hora', '24h', 'select', 'Regional', '["24h","12h"]'),

-- Notificaciones
('enable_notifications', 'Habilitar Notificaciones', 'Activar o desactivar las notificaciones del sistema', 'true', 'boolean', 'Notificaciones', NULL),
('notification_sound', 'Sonido de Notificaciones', 'Reproducir sonido al recibir notificaciones', 'true', 'boolean', 'Notificaciones', NULL),
('notification_duration', 'Duración de Notificaciones', 'Tiempo que permanecen visibles las notificaciones (segundos)', '5', 'number', 'Notificaciones', NULL),

-- Seguridad
('session_timeout', 'Tiempo de Sesión', 'Tiempo de inactividad antes de cerrar sesión (minutos)', '30', 'number', 'Seguridad', NULL)

ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    type = VALUES(type),
    category = VALUES(category),
    options = VALUES(options),
    updated_at = CURRENT_TIMESTAMP;

-- Verificar datos insertados
SELECT * FROM system_configs ORDER BY category, id;

-- Mostrar resumen por categoría
SELECT 
    category AS 'Categoría',
    COUNT(*) AS 'Cantidad de Configuraciones'
FROM system_configs
GROUP BY category
ORDER BY category;
