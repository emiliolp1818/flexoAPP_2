-- =====================================================
-- Script de Verificación del Sistema de Permisos
-- Ejecuta este script en phpMyAdmin o MySQL Workbench
-- =====================================================

USE flexoapp_bd;

-- =====================================================
-- 1. VERIFICAR SI LAS TABLAS EXISTEN
-- =====================================================

SELECT 
    '✅ VERIFICACIÓN DE TABLAS' as 'PASO 1',
    '' as '';

SELECT 
    TABLE_NAME as 'Tabla',
    TABLE_ROWS as 'Filas Aproximadas',
    CREATE_TIME as 'Fecha Creación'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'flexoapp_bd' 
  AND TABLE_NAME IN ('permissions', 'user_permissions')
ORDER BY TABLE_NAME;

-- =====================================================
-- 2. CONTAR PERMISOS POR CATEGORÍA
-- =====================================================

SELECT 
    '✅ PERMISOS POR CATEGORÍA' as 'PASO 2',
    '' as '';

SELECT 
    category as 'Categoría',
    COUNT(*) as 'Cantidad de Permisos',
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as 'Activos'
FROM permissions
GROUP BY category
ORDER BY category;

-- =====================================================
-- 3. LISTAR TODOS LOS PERMISOS
-- =====================================================

SELECT 
    '✅ LISTA COMPLETA DE PERMISOS' as 'PASO 3',
    '' as '';

SELECT 
    code as 'Código',
    name as 'Nombre',
    category as 'Categoría',
    CASE WHEN is_active = 1 THEN '✅ Sí' ELSE '❌ No' END as 'Activo'
FROM permissions
ORDER BY category, code;

-- =====================================================
-- 4. VERIFICAR PERMISOS DEL ADMIN
-- =====================================================

SELECT 
    '✅ PERMISOS DEL ADMINISTRADOR' as 'PASO 4',
    '' as '';

SELECT 
    u.Id as 'ID Usuario',
    u.UserCode as 'Código',
    CONCAT(u.FirstName, ' ', u.LastName) as 'Nombre Completo',
    u.Role as 'Rol',
    COUNT(up.Id) as 'Permisos Concedidos',
    (SELECT COUNT(*) FROM permissions WHERE is_active = 1) as 'Total Permisos',
    CONCAT(
        ROUND((COUNT(up.Id) / (SELECT COUNT(*) FROM permissions WHERE is_active = 1)) * 100, 1),
        '%'
    ) as 'Porcentaje'
FROM users u
LEFT JOIN user_permissions up ON u.Id = up.user_id AND up.is_granted = 1
WHERE u.Role = 'Admin'
GROUP BY u.Id
ORDER BY u.Id
LIMIT 1;

-- =====================================================
-- 5. VERIFICAR PERMISOS DE MÁQUINAS ESPECÍFICAMENTE
-- =====================================================

SELECT 
    '✅ PERMISOS DEL MÓDULO DE MÁQUINAS' as 'PASO 5',
    '' as '';

SELECT 
    code as 'Código',
    name as 'Nombre',
    description as 'Descripción',
    CASE WHEN is_active = 1 THEN '✅ Activo' ELSE '❌ Inactivo' END as 'Estado'
FROM permissions
WHERE category = 'machines_actions'
ORDER BY code;

-- =====================================================
-- 6. VERIFICAR ASIGNACIONES DE PERMISOS POR USUARIO
-- =====================================================

SELECT 
    '✅ RESUMEN DE PERMISOS POR USUARIO' as 'PASO 6',
    '' as '';

SELECT 
    u.UserCode as 'Código Usuario',
    CONCAT(u.FirstName, ' ', u.LastName) as 'Nombre',
    u.Role as 'Rol',
    COUNT(up.Id) as 'Permisos Concedidos',
    (SELECT COUNT(*) FROM permissions WHERE is_active = 1) as 'Total Disponibles'
FROM users u
LEFT JOIN user_permissions up ON u.Id = up.user_id AND up.is_granted = 1
GROUP BY u.Id
ORDER BY COUNT(up.Id) DESC, u.UserCode;

-- =====================================================
-- 7. VERIFICAR PERMISOS NO ASIGNADOS AL ADMIN
-- =====================================================

SELECT 
    '✅ PERMISOS FALTANTES DEL ADMIN (debería estar vacío)' as 'PASO 7',
    '' as '';

SELECT 
    p.code as 'Código Permiso',
    p.name as 'Nombre Permiso',
    p.category as 'Categoría'
FROM permissions p
WHERE p.is_active = 1
  AND p.code NOT IN (
      SELECT up.permission_code 
      FROM user_permissions up 
      INNER JOIN users u ON up.user_id = u.Id 
      WHERE u.Role = 'Admin' 
        AND up.is_granted = 1
      LIMIT 1
  )
ORDER BY p.category, p.code;

-- =====================================================
-- 8. ESTADÍSTICAS FINALES
-- =====================================================

SELECT 
    '✅ ESTADÍSTICAS FINALES' as 'PASO 8',
    '' as '';

SELECT 
    'Total de Permisos Definidos' as 'Métrica',
    COUNT(*) as 'Valor'
FROM permissions
UNION ALL
SELECT 
    'Permisos Activos' as 'Métrica',
    COUNT(*) as 'Valor'
FROM permissions
WHERE is_active = 1
UNION ALL
SELECT 
    'Total de Usuarios' as 'Métrica',
    COUNT(*) as 'Valor'
FROM users
UNION ALL
SELECT 
    'Usuarios con Permisos Asignados' as 'Métrica',
    COUNT(DISTINCT user_id) as 'Valor'
FROM user_permissions
WHERE is_granted = 1
UNION ALL
SELECT 
    'Total de Asignaciones de Permisos' as 'Métrica',
    COUNT(*) as 'Valor'
FROM user_permissions
WHERE is_granted = 1;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================

/*
RESULTADOS ESPERADOS:

PASO 1 - Tablas:
- permissions (28 filas)
- user_permissions (28 filas para admin)

PASO 2 - Permisos por categoría:
- actions: 5 permisos
- machines_actions: 7 permisos
- modules: 8 permisos
- system: 3 permisos
- users: 4 permisos
TOTAL: 28 permisos

PASO 3 - Lista completa:
Debería mostrar los 28 permisos ordenados por categoría

PASO 4 - Permisos del admin:
- Permisos Concedidos: 28
- Total Permisos: 28
- Porcentaje: 100%

PASO 5 - Permisos de máquinas:
Debería mostrar 7 permisos:
- machines.print
- machines.send_message
- machines.status.corriendo
- machines.status.listo
- machines.status.prealistando
- machines.status.suspendido
- machines.status.terminado

PASO 6 - Resumen por usuario:
El admin debería tener 28 permisos
Otros usuarios deberían tener 0 (hasta que se asignen)

PASO 7 - Permisos faltantes:
Debería estar VACÍO (el admin tiene todos)

PASO 8 - Estadísticas:
- Total de Permisos Definidos: 28
- Permisos Activos: 28
- Total de Usuarios: (depende de tu BD)
- Usuarios con Permisos: 1 (solo admin)
- Total de Asignaciones: 28
*/
