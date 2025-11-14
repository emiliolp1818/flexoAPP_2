-- =====================================================
-- SCRIPT PARA EJECUTAR LA MIGRACIÓN COMPLETA
-- FlexoAPP - Sistema de Gestión Flexográfica
-- Base de datos: flexoapp_bd
-- =====================================================

-- ===== CREAR BASE DE DATOS =====
-- CREATE DATABASE: crea la base de datos si no existe
CREATE DATABASE IF NOT EXISTS flexoapp_bd 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- ===== SELECCIONAR BASE DE DATOS =====
USE flexoapp_bd;

-- ===== VERIFICAR SI LA TABLA DESIGNS YA EXISTE =====
-- Consulta a information_schema para verificar la existencia de la tabla
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_schema = 'flexoapp_bd'  -- Base de datos: flexoapp_bd
AND table_name = 'Designs';         -- Tabla: Designs

-- Si la tabla no existe, ejecutar el script de creación
-- (Este script debe ejecutarse manualmente si la tabla no existe)

-- Verificar la estructura actual de la tabla Designs
DESCRIBE Designs;

-- Mostrar datos existentes
SELECT COUNT(*) as total_designs FROM Designs;
SELECT Status, COUNT(*) as count FROM Designs GROUP BY Status;
SELECT Type, COUNT(*) as count FROM Designs GROUP BY Type;

-- Verificar índices
SHOW INDEX FROM Designs;

-- Verificar triggers
SHOW TRIGGERS LIKE 'Designs';

-- Verificar la vista de estadísticas
SELECT * FROM DesignStats;

-- Script de verificación de integridad
SELECT 
    d.Id,
    d.ArticleF,
    d.Client,
    d.Status,
    d.Type,
    d.ColorCount,
    JSON_LENGTH(d.Colors) as colors_array_length,
    u.DisplayName as CreatedBy
FROM Designs d
LEFT JOIN Users u ON d.CreatedByUserId = u.Id
ORDER BY d.LastModified DESC
LIMIT 10;