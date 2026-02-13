-- =====================================================
-- SCRIPT: CREAR/ACTUALIZAR TABLA MAQUINAS (VERSIÓN ACTUALIZADA)
-- =====================================================
-- Sistema: FlexoAPP - Sistema de Gestión Flexográfica
-- Propósito: Crear tabla de máquinas con todos los campos actualizados
-- Base de datos: MySQL 8.0+ (Railway/Render)
-- Tabla: maquinas
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-02-11
-- Versión: 2.2 (Incluye tipo_impresion y metros)
-- =====================================================

USE flexoapp_bd;

-- Eliminar tabla si existe (CUIDADO: Esto borra todos los datos)
-- Descomenta la siguiente línea solo si quieres recrear la tabla desde cero
-- DROP TABLE IF EXISTS `maquinas`;

-- Crear tabla maquinas con la nueva columna preparando_started_at
CREATE TABLE IF NOT EXISTS `maquinas` (
    -- ===== IDENTIFICACIÓN =====
    `ot_sap` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'Orden de Trabajo SAP (clave primaria única)',
    
    -- ===== INFORMACIÓN DEL ARTÍCULO =====
    `Articulo` VARCHAR(50) NOT NULL COMMENT 'Código del artículo a producir',
    `NumeroMaquina` INT NOT NULL COMMENT 'Número de la máquina flexográfica (11-21)',
    
    -- ===== INFORMACIÓN DEL CLIENTE =====
    `Cliente` VARCHAR(200) NOT NULL COMMENT 'Nombre del cliente',
    `Referencia` VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'Referencia del producto',
    
    -- ===== ESPECIFICACIONES TÉCNICAS =====
    `Td` VARCHAR(10) NOT NULL DEFAULT '' COMMENT 'Código TD (Tipo de Diseño)',
    `tipo_impresion` VARCHAR(50) NULL COMMENT 'Tipo de impresión (ej: 07A)',
    `NumeroColores` INT NOT NULL DEFAULT 1 COMMENT 'Número total de colores (1-10)',
    `Colores` JSON NOT NULL DEFAULT ('[]') COMMENT 'Array de colores en formato JSON',
    `Kilos` DECIMAL(10,3) NOT NULL COMMENT 'Cantidad en kilogramos (hasta 3 decimales)',
    `metros` DECIMAL(10,2) NULL DEFAULT 0 COMMENT 'Metros a fabricar',
    `Sustrato` VARCHAR(100) NOT NULL COMMENT 'Tipo de material base (BOPP, PE, PET, etc.)',
    
    -- ===== PROGRAMACIÓN =====
    `FechaTintaEnMaquina` DATETIME(6) NOT NULL COMMENT 'Fecha y hora de aplicación de tinta',
    
    -- ===== ESTADO Y OBSERVACIONES =====
    `Estado` VARCHAR(20) NULL DEFAULT NULL COMMENT 'Estado del programa (PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO)',
    `Observaciones` VARCHAR(1000) NULL COMMENT 'Observaciones adicionales del programa',
    
    -- ===== SEGUIMIENTO =====
    `LastActionBy` VARCHAR(100) NULL COMMENT 'Usuario que realizó la última acción',
    `LastActionAt` DATETIME(6) NULL COMMENT 'Fecha y hora de la última acción',
    `preparando_started_at` DATETIME NULL COMMENT 'Fecha y hora cuando se marcó como PREPARANDO (para calcular tiempo transcurrido)',
    
    -- ===== AUDITORÍA =====
    `CreatedBy` INT NULL COMMENT 'ID del usuario que creó el registro',
    `UpdatedBy` INT NULL COMMENT 'ID del usuario que actualizó el registro',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación del registro',
    `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Fecha de última actualización',
    
    -- ===== ÍNDICES PARA OPTIMIZACIÓN =====
    INDEX `idx_maquinas_numero` (`NumeroMaquina`) COMMENT 'Índice para filtrar por número de máquina',
    INDEX `idx_maquinas_articulo` (`Articulo`) COMMENT 'Índice para búsquedas por artículo',
    INDEX `idx_maquinas_cliente` (`Cliente`) COMMENT 'Índice para filtrar por cliente',
    INDEX `idx_maquinas_estado` (`Estado`) COMMENT 'Índice para filtrar por estado',
    INDEX `idx_maquinas_fecha_tinta` (`FechaTintaEnMaquina`) COMMENT 'Índice para ordenar por fecha de tinta',
    INDEX `idx_maquinas_created_by` (`CreatedBy`) COMMENT 'Índice para auditoría de creación',
    INDEX `idx_maquinas_updated_by` (`UpdatedBy`) COMMENT 'Índice para auditoría de actualización',
    
    -- ===== CLAVES FORÁNEAS =====
    CONSTRAINT `fk_maquinas_created_by` 
        FOREIGN KEY (`CreatedBy`) 
        REFERENCES `users`(`Id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
        
    CONSTRAINT `fk_maquinas_updated_by` 
        FOREIGN KEY (`UpdatedBy`) 
        REFERENCES `users`(`Id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
        
    -- ===== RESTRICCIONES DE VALIDACIÓN =====
    CONSTRAINT `chk_maquinas_numero_valido` 
        CHECK (`NumeroMaquina` BETWEEN 11 AND 21),
        
    CONSTRAINT `chk_maquinas_kilos_positivos` 
        CHECK (`Kilos` > 0),
        
    CONSTRAINT `chk_maquinas_colores_positivos` 
        CHECK (`NumeroColores` > 0 AND `NumeroColores` <= 10),
        
    CONSTRAINT `chk_maquinas_estado_valido` 
        CHECK (`Estado` IS NULL OR `Estado` IN ('PREPARANDO', 'LISTO', 'CORRIENDO', 'SUSPENDIDO', 'TERMINADO'))
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Máquinas de producción flexográfica';

-- ===== SI LA TABLA YA EXISTE, AGREGAR LAS COLUMNAS FALTANTES =====

-- Agregar columna preparando_started_at si no existe
SET @dbname = DATABASE();
SET @tablename = 'maquinas';
SET @columnname = 'preparando_started_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT ''La columna preparando_started_at ya existe'' AS resultado;',
  'ALTER TABLE maquinas ADD COLUMN preparando_started_at DATETIME NULL COMMENT ''Fecha y hora cuando se marcó como PREPARANDO'' AFTER LastActionAt;'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar columna tipo_impresion si no existe
SET @columnname = 'tipo_impresion';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT ''La columna tipo_impresion ya existe'' AS resultado;',
  'ALTER TABLE maquinas ADD COLUMN tipo_impresion VARCHAR(50) NULL COMMENT ''Tipo de impresión (ej: 07A)'' AFTER Td;'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar columna metros si no existe
SET @columnname = 'metros';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT ''La columna metros ya existe'' AS resultado;',
  'ALTER TABLE maquinas ADD COLUMN metros DECIMAL(10,2) NULL DEFAULT 0 COMMENT ''Metros a fabricar'' AFTER Kilos;'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Actualizar precisión de Kilos a 3 decimales si es necesario
SET @preparedStatement = (SELECT IF(
  (
    SELECT NUMERIC_SCALE FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = 'Kilos'
  ) >= 3,
  'SELECT ''La columna Kilos ya tiene 3 decimales'' AS resultado;',
  'ALTER TABLE maquinas MODIFY COLUMN Kilos DECIMAL(10,3) NOT NULL COMMENT ''Cantidad en kilogramos (hasta 3 decimales)'';'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ===== VERIFICACIÓN =====
SELECT '✓ Tabla maquinas creada/actualizada exitosamente' as resultado;

-- ===== INFORMACIÓN DE LA TABLA =====
DESCRIBE `maquinas`;

-- ===== VERIFICAR QUE LAS COLUMNAS EXISTEN =====
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'flexoapp_bd'
  AND TABLE_NAME = 'maquinas'
  AND COLUMN_NAME IN ('preparando_started_at', 'tipo_impresion', 'metros', 'Kilos')
ORDER BY ORDINAL_POSITION;

SELECT '✓ Script completado exitosamente' as resultado;
SELECT '✓ Nuevos campos agregados: tipo_impresion, metros' as info;
SELECT '✓ Campo Kilos actualizado a DECIMAL(10,3)' as info2;
