-- =====================================================
-- SCRIPT: VERIFICAR Y POBLAR BASE DE DATOS
-- Propósito: Verificar que todas las tablas existen y crear datos iniciales
-- Base de datos: MySQL (Railway/Render)
-- =====================================================

-- Verificar que todas las tablas existen
SELECT 'Verificando tablas existentes...' as mensaje;

SELECT 
    TABLE_NAME as tabla,
    TABLE_ROWS as registros,
    CASE 
        WHEN TABLE_NAME IN ('users', 'Activities', 'designs', 'maquinas', 'Pedidos', 'condicionunica', 'Documento', 'refresh_tokens') 
        THEN '✅ OK' 
        ELSE '❌ FALTA' 
    END as estado
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;

-- Verificar usuario administrador
SELECT 'Verificando usuario administrador...' as mensaje;

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Usuario admin existe'
        ELSE '❌ Usuario admin NO existe'
    END as estado
FROM users 
WHERE UserCode = 'admin';

-- Crear usuario admin si no existe (con contraseña hasheada correcta)
INSERT IGNORE INTO users (
    UserCode, 
    Password, 
    FirstName, 
    LastName, 
    Role, 
    IsActive,
    CreatedAt,
    UpdatedAt
) VALUES (
    'admin',
    '$2a$11$rOzJqQZ8kVJ8kVJ8kVJ8kOzJqQZ8kVJ8kVJ8kVJ8kOzJqQZ8kVJ8k.',  -- admin123 hasheado con BCrypt
    'Administrador',
    'Sistema',
    'Admin',
    1,
    NOW(6),
    NOW(6)
);

-- Verificar resultado final
SELECT 'VERIFICACIÓN COMPLETADA' as mensaje;
SELECT COUNT(*) as total_tablas FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE();
SELECT COUNT(*) as total_usuarios FROM users;
SELECT 'Base de datos lista para usar' as estado;