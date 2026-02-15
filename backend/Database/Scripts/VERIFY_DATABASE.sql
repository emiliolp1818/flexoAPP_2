-- =====================================================
-- SCRIPT DE VERIFICACIÓN DE BASE DE DATOS
-- =====================================================
-- Sistema: FlexoAPP
-- Propósito: Verificar la estructura y estado de la base de datos
-- Fecha: 2026-02-15
-- =====================================================

SELECT '========================================' as '';
SELECT 'VERIFICACIÓN DE BASE DE DATOS - FLEXOAPP' as '';
SELECT '========================================' as '';

-- ===== 1. INFORMACIÓN DE LA BASE DE DATOS =====
SELECT '' as '';
SELECT '1. INFORMACIÓN DE LA BASE DE DATOS' as '';
SELECT '-----------------------------------' as '';

SELECT 
    DATABASE() as 'Base de Datos Actual',
    VERSION() as 'Versión MySQL',
    @@character_set_database as 'Charset',
    @@collation_database as 'Collation';

-- ===== 2. LISTAR TODAS LAS TABLAS =====
SELECT '' as '';
SELECT '2. TABLAS EXISTENTES' as '';
SELECT '-----------------------------------' as '';

SHOW TABLES;

-- ===== 3. CONTAR REGISTROS EN CADA TABLA =====
SELECT '' as '';
SELECT '3. CONTEO DE REGISTROS POR TABLA' as '';
SELECT '-----------------------------------' as '';

SELECT 'users' as Tabla, COUNT(*) as Registros FROM `users`
UNION ALL
SELECT 'Activities' as Tabla, COUNT(*) as Registros FROM `Activities`
UNION ALL
SELECT 'refresh_tokens' as Tabla, COUNT(*) as Registros FROM `refresh_tokens`
UNION ALL
SELECT 'designs' as Tabla, COUNT(*) as Registros FROM `designs`
UNION ALL
SELECT 'maquinas' as Tabla, COUNT(*) as Registros FROM `maquinas`
UNION ALL
SELECT 'Documento' as Tabla, COUNT(*) as Registros FROM `Documento`
UNION ALL
SELECT 'condicionunica' as Tabla, COUNT(*) as Registros FROM `condicionunica`
UNION ALL
SELECT 'anilox' as Tabla, COUNT(*) as Registros FROM `anilox`
UNION ALL
SELECT 'machine_config' as Tabla, COUNT(*) as Registros FROM `machine_config`
UNION ALL
SELECT 'maquinas_backup' as Tabla, COUNT(*) as Registros FROM `maquinas_backup`
UNION ALL
SELECT 'system_configs' as Tabla, COUNT(*) as Registros FROM `system_configs`;

-- ===== 4. VERIFICAR ESTRUCTURA DE TABLA USERS =====
SELECT '' as '';
SELECT '4. ESTRUCTURA DE TABLA USERS' as '';
SELECT '-----------------------------------' as '';

DESCRIBE `users`;

-- ===== 5. VERIFICAR ÍNDICES DE TABLA USERS =====
SELECT '' as '';
SELECT '5. ÍNDICES DE TABLA USERS' as '';
SELECT '-----------------------------------' as '';

SHOW INDEX FROM `users`;

-- ===== 6. VERIFICAR CLAVES FORÁNEAS =====
SELECT '' as '';
SELECT '6. CLAVES FORÁNEAS' as '';
SELECT '-----------------------------------' as '';

SELECT 
    TABLE_NAME as 'Tabla',
    COLUMN_NAME as 'Columna',
    CONSTRAINT_NAME as 'Constraint',
    REFERENCED_TABLE_NAME as 'Tabla Referenciada',
    REFERENCED_COLUMN_NAME as 'Columna Referenciada'
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- ===== 7. VERIFICAR USUARIOS DEL SISTEMA =====
SELECT '' as '';
SELECT '7. USUARIOS DEL SISTEMA' as '';
SELECT '-----------------------------------' as '';

SELECT 
    Id,
    UserCode,
    FirstName,
    LastName,
    Role,
    IsActive,
    CreatedAt
FROM `users`
ORDER BY Id;

-- ===== 8. VERIFICAR PROCEDIMIENTOS ALMACENADOS =====
SELECT '' as '';
SELECT '8. PROCEDIMIENTOS ALMACENADOS' as '';
SELECT '-----------------------------------' as '';

SHOW PROCEDURE STATUS WHERE Db = DATABASE();

-- ===== 9. VERIFICAR EVENTOS PROGRAMADOS =====
SELECT '' as '';
SELECT '9. EVENTOS PROGRAMADOS' as '';
SELECT '-----------------------------------' as '';

SHOW EVENTS;

-- ===== 10. VERIFICAR TAMAÑO DE TABLAS =====
SELECT '' as '';
SELECT '10. TAMAÑO DE TABLAS' as '';
SELECT '-----------------------------------' as '';

SELECT 
    TABLE_NAME as 'Tabla',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Tamaño (MB)',
    TABLE_ROWS as 'Filas Aprox',
    ENGINE as 'Motor',
    TABLE_COLLATION as 'Collation'
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = DATABASE()
ORDER BY 
    (DATA_LENGTH + INDEX_LENGTH) DESC;

-- ===== 11. VERIFICAR CONFIGURACIÓN DE MÁQUINAS =====
SELECT '' as '';
SELECT '11. CONFIGURACIÓN DE MÁQUINAS' as '';
SELECT '-----------------------------------' as '';

SELECT 
    numero_maquina as 'Máquina',
    carga_muestra as 'Carga Muestra (kg)',
    created_at as 'Creado',
    updated_at as 'Actualizado'
FROM `machine_config`
ORDER BY numero_maquina;

-- ===== 12. VERIFICAR ESTADO DEL EVENT SCHEDULER =====
SELECT '' as '';
SELECT '12. ESTADO DEL EVENT SCHEDULER' as '';
SELECT '-----------------------------------' as '';

SHOW VARIABLES LIKE 'event_scheduler';

-- ===== RESUMEN FINAL =====
SELECT '' as '';
SELECT '========================================' as '';
SELECT '✓ VERIFICACIÓN COMPLETADA' as '';
SELECT '========================================' as '';
