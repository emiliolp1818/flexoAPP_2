-- ===== SCRIPT DE VERIFICACIÓN DE CONEXIONES DE BASE DE DATOS =====
-- FlexoAPP - Verificación completa de tablas y datos

-- Verificar conexión y mostrar información del servidor
SELECT 
    'Conexión exitosa a MySQL' as status,
    VERSION() as mysql_version,
    DATABASE() as current_database,
    USER() as current_user,
    NOW() as connection_time;

-- Verificar que la base de datos flexoapp_bd existe
SHOW DATABASES LIKE 'flexoapp_bd';

-- Usar la base de datos
USE flexoapp_bd;

-- ===== VERIFICACIÓN DE TABLAS PRINCIPALES =====

-- 1. Verificar tabla de usuarios
SELECT 
    'users' as table_name,
    COUNT(*) as record_count,
    'Tabla de usuarios del sistema' as description
FROM users
WHERE 1=1;

-- Mostrar usuarios existentes
SELECT 
    id,
    userCode,
    firstName,
    lastName,
    email,
    role,
    isActive,
    createdAt
FROM users
ORDER BY createdAt DESC
LIMIT 5;

-- 2. Verificar tabla de programas de máquinas
SELECT 
    'machine_programs' as table_name,
    COUNT(*) as record_count,
    'Programación de máquinas flexográficas' as description
FROM machine_programs
WHERE 1=1;

-- Mostrar programas recientes
SELECT 
    id,
    MachineNumber,
    Name,
    Articulo,
    Cliente,
    Estado,
    Kilos,
    FechaInicio,
    CreatedAt
FROM machine_programs
ORDER BY CreatedAt DESC
LIMIT 10;

-- 3. Verificar tabla de diseños
SELECT 
    'designs' as table_name,
    COUNT(*) as record_count,
    'Diseños flexográficos' as description
FROM designs
WHERE 1=1;

-- Mostrar diseños recientes
SELECT 
    Id,
    ArticleF,
    Client,
    Description,
    Type,
    ColorCount,
    Status,
    CreatedDate
FROM designs
ORDER BY CreatedDate DESC
LIMIT 10;

-- 4. Verificar tabla de actividades (si existe)
SELECT 
    'activities' as table_name,
    COUNT(*) as record_count,
    'Registro de actividades del sistema' as description
FROM activities
WHERE CreatedAt >= DATE_SUB(NOW(), INTERVAL 7 DAY);

-- ===== ESTADÍSTICAS POR MÓDULO =====

-- Estadísticas de máquinas por estado
SELECT 
    'Estadísticas de Máquinas' as module,
    Estado as status,
    COUNT(*) as count,
    SUM(Kilos) as total_kilos
FROM machine_programs
GROUP BY Estado
ORDER BY count DESC;

-- Estadísticas de máquinas por número
SELECT 
    'Distribución por Máquina' as module,
    MachineNumber as machine,
    COUNT(*) as programs,
    AVG(Kilos) as avg_kilos
FROM machine_programs
GROUP BY MachineNumber
ORDER BY MachineNumber;

-- Estadísticas de diseños por estado
SELECT 
    'Estadísticas de Diseños' as module,
    Status as status,
    COUNT(*) as count
FROM designs
GROUP BY Status;

-- Estadísticas de diseños por tipo
SELECT 
    'Tipos de Diseño' as module,
    Type as type,
    COUNT(*) as count,
    AVG(ColorCount) as avg_colors
FROM designs
WHERE Type IS NOT NULL
GROUP BY Type;

-- ===== VERIFICACIÓN DE INTEGRIDAD =====

-- Verificar integridad referencial (usuarios creadores)
SELECT 
    'Integridad Referencial' as check_type,
    'machine_programs -> users' as relation,
    COUNT(*) as records_with_valid_creator
FROM machine_programs mp
LEFT JOIN users u ON mp.CreatedBy = u.id
WHERE mp.CreatedBy IS NOT NULL AND u.id IS NOT NULL;

-- Verificar registros huérfanos
SELECT 
    'Registros Huérfanos' as check_type,
    'machine_programs sin usuario creador' as issue,
    COUNT(*) as orphaned_records
FROM machine_programs mp
LEFT JOIN users u ON mp.CreatedBy = u.id
WHERE mp.CreatedBy IS NOT NULL AND u.id IS NULL;

-- ===== VERIFICACIÓN DE RENDIMIENTO =====

-- Mostrar tamaño de las tablas
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows as 'Rows'
FROM information_schema.TABLES 
WHERE table_schema = 'flexoapp_bd'
ORDER BY (data_length + index_length) DESC;

-- Verificar índices importantes
SHOW INDEX FROM machine_programs WHERE Key_name != 'PRIMARY';
SHOW INDEX FROM users WHERE Key_name != 'PRIMARY';
SHOW INDEX FROM designs WHERE Key_name != 'PRIMARY';

-- ===== VERIFICACIÓN DE CONFIGURACIÓN =====

-- Verificar configuración de MySQL
SELECT 
    'Configuración MySQL' as category,
    'max_connections' as setting,
    @@max_connections as value
UNION ALL
SELECT 
    'Configuración MySQL',
    'innodb_buffer_pool_size',
    @@innodb_buffer_pool_size
UNION ALL
SELECT 
    'Configuración MySQL',
    'query_cache_size',
    @@query_cache_size;

-- Verificar charset y collation
SELECT 
    'Configuración Base de Datos' as category,
    'charset' as setting,
    DEFAULT_CHARACTER_SET_NAME as value
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'flexoapp_bd'
UNION ALL
SELECT 
    'Configuración Base de Datos',
    'collation',
    DEFAULT_COLLATION_NAME
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'flexoapp_bd';

-- ===== RESUMEN FINAL =====
SELECT 
    '=== RESUMEN DE VERIFICACIÓN ===' as summary,
    NOW() as verification_time,
    'FlexoAPP Database Health Check' as description,
    'COMPLETED' as status;

-- Mostrar información de conexión final
SELECT 
    CONNECTION_ID() as connection_id,
    USER() as connected_user,
    DATABASE() as active_database,
    'Verificación completada exitosamente' as message;