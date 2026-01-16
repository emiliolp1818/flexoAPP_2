-- =====================================================
-- Script para eliminar la tabla 'pedidos' y sus dependencias
-- Base de datos: flexoapp_bd
-- Fecha: 2026-01-16
-- =====================================================

USE flexoapp_bd;

-- Verificar si la tabla existe antes de eliminarla
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'La tabla pedidos existe y será eliminada'
        ELSE 'La tabla pedidos no existe'
    END AS status
FROM information_schema.tables 
WHERE table_schema = 'flexoapp_bd' 
AND table_name = 'pedidos';

-- Eliminar la tabla pedidos si existe
DROP TABLE IF EXISTS pedidos;

-- Verificar que la tabla fue eliminada
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Tabla pedidos eliminada exitosamente'
        ELSE '❌ Error: La tabla pedidos aún existe'
    END AS resultado
FROM information_schema.tables 
WHERE table_schema = 'flexoapp_bd' 
AND table_name = 'pedidos';

-- Mostrar las tablas restantes en la base de datos
SELECT 
    table_name AS 'Tablas Activas',
    table_rows AS 'Filas Aproximadas',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Tamaño (MB)'
FROM information_schema.tables
WHERE table_schema = 'flexoapp_bd'
ORDER BY table_name;
