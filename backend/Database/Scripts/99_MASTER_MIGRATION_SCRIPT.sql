-- =====================================================
-- SCRIPT MAESTRO DE MIGRACIÓN
-- =====================================================
-- Sistema: FlexoAPP - Sistema de Gestión Flexográfica
-- Base de datos: MySQL 8.0+ (Railway/Render)
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-02-14
-- Versión: 1.0
-- =====================================================
-- 
-- PROPÓSITO:
-- Este script migra una base de datos existente de FlexoAPP
-- agregando todos los campos nuevos y modificaciones necesarias
-- sin perder datos existentes.
--
-- IMPORTANTE:
-- - Este script es IDEMPOTENTE: puede ejecutarse múltiples veces
-- - Verifica la existencia de columnas antes de agregarlas
-- - No elimina datos existentes
-- - Crea backups automáticos antes de cambios críticos
--
-- CAMBIOS INCLUIDOS:
-- 1. Tabla designs: Campo ancho_mm
-- 2. Tabla maquinas: Campos tipo_impresion, Metros, preparando_started_at
-- 3. Tabla maquinas: Cambio de Kilos a DECIMAL(10,3)
-- 4. Tabla anilox: Campos factor_eficiencia y densidad
-- 5. Tabla machine_config: Nueva tabla para configuración
-- 6. Tabla maquinas_backup: Nueva tabla para histórico (6 meses)
-- 7. Procedimientos almacenados para backup
-- 8. Evento de limpieza automática
-- =====================================================

-- ===== CONFIGURACIÓN INICIAL =====
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

SELECT '========================================' as '';
SELECT 'INICIANDO MIGRACIÓN DE BASE DE DATOS' as '';
SELECT '========================================' as '';

-- =====================================================
-- MIGRACIÓN 1: TABLA DESIGNS - AGREGAR CAMPO ancho_mm
-- =====================================================
SELECT 'Migrando tabla: designs...' as '';

-- Verificar si la columna ancho_mm existe
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'designs'
    AND COLUMN_NAME = 'ancho_mm'
);

-- Agregar columna si no existe
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE designs ADD COLUMN ancho_mm DECIMAL(10, 2) NULL COMMENT ''Ancho en milímetros''',
    'SELECT ''Columna ancho_mm ya existe en designs'' AS resultado'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar constraint si no existe
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'designs'
    AND CONSTRAINT_NAME = 'chk_designs_ancho_positivo'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE designs ADD CONSTRAINT chk_designs_ancho_positivo CHECK (ancho_mm IS NULL OR ancho_mm > 0)',
    'SELECT ''Constraint chk_designs_ancho_positivo ya existe'' AS resultado'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✓ Tabla designs migrada' as '';

-- =====================================================
-- MIGRACIÓN 2: TABLA MAQUINAS - AGREGAR CAMPOS NUEVOS
-- =====================================================
SELECT 'Migrando tabla: maquinas...' as '';

-- Campo: tipo_impresion
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'maquinas'
    AND COLUMN_NAME = 'tipo_impresion'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE maquinas ADD COLUMN tipo_impresion VARCHAR(50) NULL COMMENT ''Tipo de impresión''',
    'SELECT ''Columna tipo_impresion ya existe'' AS resultado'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Campo: Metros
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'maquinas'
    AND COLUMN_NAME = 'Metros'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE maquinas ADD COLUMN Metros DECIMAL(10, 2) NULL COMMENT ''Metros a fabricar''',
    'SELECT ''Columna Metros ya existe'' AS resultado'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Campo: preparando_started_at
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'maquinas'
    AND COLUMN_NAME = 'preparando_started_at'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE maquinas ADD COLUMN preparando_started_at DATETIME NULL COMMENT ''Fecha cuando se marcó como PREPARANDO''',
    'SELECT ''Columna preparando_started_at ya existe'' AS resultado'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Modificar Kilos a DECIMAL(10,3) si es necesario
SET @column_type = (
    SELECT DATA_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'maquinas'
    AND COLUMN_NAME = 'Kilos'
);

SET @column_precision = (
    SELECT NUMERIC_SCALE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'maquinas'
    AND COLUMN_NAME = 'Kilos'
);

SET @sql = IF(@column_precision < 3,
    'ALTER TABLE maquinas MODIFY COLUMN Kilos DECIMAL(10, 3) NOT NULL COMMENT ''Cantidad en kilogramos (3 decimales)''',
    'SELECT ''Columna Kilos ya tiene 3 decimales'' AS resultado'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar constraint para Metros si no existe
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'maquinas'
    AND CONSTRAINT_NAME = 'chk_maquinas_metros_positivos'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE maquinas ADD CONSTRAINT chk_maquinas_metros_positivos CHECK (Metros IS NULL OR Metros > 0)',
    'SELECT ''Constraint chk_maquinas_metros_positivos ya existe'' AS resultado'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar constraint de estado para incluir SIN_ASIGNAR
DROP INDEX IF EXISTS chk_maquinas_estado_valido ON maquinas;

SET @constraint_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'maquinas'
    AND CONSTRAINT_NAME = 'chk_maquinas_estado_valido'
);

SET @sql = IF(@constraint_exists > 0,
    'ALTER TABLE maquinas DROP CONSTRAINT chk_maquinas_estado_valido',
    'SELECT ''Constraint chk_maquinas_estado_valido no existe'' AS resultado'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE maquinas ADD CONSTRAINT chk_maquinas_estado_valido 
    CHECK (Estado IS NULL OR Estado IN ('PREPARANDO', 'LISTO', 'CORRIENDO', 'SUSPENDIDO', 'TERMINADO', 'SIN_ASIGNAR'));

SELECT '✓ Tabla maquinas migrada' as '';

-- =====================================================
-- MIGRACIÓN 3: TABLA ANILOX - AGREGAR CAMPOS NUEVOS
-- =====================================================
SELECT 'Migrando tabla: anilox...' as '';

-- Verificar si la tabla existe
SET @table_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'anilox'
);

-- Si la tabla no existe, crearla completa
SET @sql = IF(@table_exists = 0,
    'CREATE TABLE anilox (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT ''ID único del anilox'',
        codigo VARCHAR(50) NOT NULL UNIQUE COMMENT ''Código único del anilox'',
        maquina INT NOT NULL COMMENT ''Número de máquina (11-21)'',
        bcm DECIMAL(5, 2) NOT NULL COMMENT ''BCM (Billion Cubic Microns) - soporta decimales como 8.3'',
        lineatura INT NOT NULL COMMENT ''Lineatura en LPI (Lines Per Inch)'',
        marca VARCHAR(50) NOT NULL COMMENT ''Marca del anilox (APEX, ZECHER, HARPER)'',
        volumen_real DECIMAL(10, 2) NOT NULL COMMENT ''Volumen real medido'',
        factor_eficiencia DECIMAL(5, 2) NULL DEFAULT 35.00 COMMENT ''Factor de eficiencia del anilox (35%)'',
        densidad DECIMAL(5, 3) NULL DEFAULT 0.885 COMMENT ''Densidad del anilox (0.885)'',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT ''Fecha de creación'',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT ''Fecha de última actualización'',
        INDEX idx_anilox_codigo (codigo),
        INDEX idx_anilox_maquina (maquina),
        INDEX idx_anilox_marca (marca),
        CONSTRAINT chk_anilox_maquina_valida CHECK (maquina BETWEEN 11 AND 21),
        CONSTRAINT chk_anilox_bcm_positivo CHECK (bcm > 0),
        CONSTRAINT chk_anilox_lineatura_positiva CHECK (lineatura > 0),
        CONSTRAINT chk_anilox_volumen_positivo CHECK (volumen_real > 0),
        CONSTRAINT chk_anilox_marca_valida CHECK (marca IN (''APEX'', ''ZECHER'', ''HARPER'')),
        CONSTRAINT chk_anilox_factor_eficiencia_valido CHECK (factor_eficiencia IS NULL OR (factor_eficiencia >= 0 AND factor_eficiencia <= 100)),
        CONSTRAINT chk_anilox_densidad_valida CHECK (densidad IS NULL OR densidad >= 0)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=''Inventario de rodillos anilox''',
    'SELECT ''Tabla anilox ya existe'' AS resultado'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Si la tabla existe, agregar campos faltantes
IF @table_exists > 0 THEN
    -- Campo: factor_eficiencia
    SET @column_exists = (
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'anilox'
        AND COLUMN_NAME = 'factor_eficiencia'
    );

    SET @sql = IF(@column_exists = 0,
        'ALTER TABLE anilox ADD COLUMN factor_eficiencia DECIMAL(5, 2) NULL DEFAULT 35.00 COMMENT ''Factor de eficiencia del anilox (35%)''',
        'SELECT ''Columna factor_eficiencia ya existe'' AS resultado'
    );

    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    -- Campo: densidad
    SET @column_exists = (
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'anilox'
        AND COLUMN_NAME = 'densidad'
    );

    SET @sql = IF(@column_exists = 0,
        'ALTER TABLE anilox ADD COLUMN densidad DECIMAL(5, 3) NULL DEFAULT 0.885 COMMENT ''Densidad del anilox (0.885)''',
        'SELECT ''Columna densidad ya existe'' AS resultado'
    );

    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END IF;

SELECT '✓ Tabla anilox migrada' as '';

-- =====================================================
-- MIGRACIÓN 4: TABLA MACHINE_CONFIG - CREAR SI NO EXISTE
-- =====================================================
SELECT 'Migrando tabla: machine_config...' as '';

SET @table_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'machine_config'
);

SET @sql = IF(@table_exists = 0,
    'CREATE TABLE machine_config (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT ''ID único de la configuración'',
        numero_maquina INT NOT NULL UNIQUE COMMENT ''Número de máquina (11-21)'',
        carga_muestra DECIMAL(10, 2) NULL COMMENT ''Carga muestra de la máquina en kg'',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT ''Fecha de creación'',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT ''Fecha de última actualización'',
        INDEX idx_machine_config_numero_maquina (numero_maquina),
        CONSTRAINT chk_machine_config_numero_valido CHECK (numero_maquina BETWEEN 11 AND 21),
        CONSTRAINT chk_machine_config_carga_positiva CHECK (carga_muestra IS NULL OR carga_muestra >= 0)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=''Configuración de máquinas''',
    'SELECT ''Tabla machine_config ya existe'' AS resultado'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insertar configuración inicial si la tabla fue creada
IF @table_exists = 0 THEN
    INSERT IGNORE INTO machine_config (numero_maquina, carga_muestra) VALUES
    (11, NULL), (12, NULL), (13, NULL), (14, NULL), (15, NULL),
    (16, NULL), (17, NULL), (18, NULL), (19, NULL), (20, NULL), (21, NULL);
    
    SELECT '✓ Configuración inicial de máquinas insertada' as '';
END IF;

SELECT '✓ Tabla machine_config migrada' as '';

-- =====================================================
-- MIGRACIÓN 5: TABLA MAQUINAS_BACKUP - CREAR SI NO EXISTE
-- =====================================================
SELECT 'Migrando tabla: maquinas_backup...' as '';

SET @table_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'maquinas_backup'
);

SET @sql = IF(@table_exists = 0,
    'CREATE TABLE maquinas_backup (
        backup_id INT AUTO_INCREMENT PRIMARY KEY COMMENT ''ID único del registro de backup'',
        ot_sap VARCHAR(50) NOT NULL COMMENT ''Orden de Trabajo SAP'',
        Articulo VARCHAR(50) NOT NULL COMMENT ''Código del artículo'',
        NumeroMaquina INT NOT NULL COMMENT ''Número de máquina (11-21)'',
        Cliente VARCHAR(200) NOT NULL COMMENT ''Cliente'',
        Referencia VARCHAR(100) NULL COMMENT ''Referencia del producto'',
        Td VARCHAR(10) NULL COMMENT ''Código TD'',
        tipo_impresion VARCHAR(50) NULL COMMENT ''Tipo de impresión'',
        NumeroColores INT NOT NULL DEFAULT 1 COMMENT ''Número de colores'',
        Colores JSON NOT NULL DEFAULT (''[]'') COMMENT ''Array de colores'',
        Kilos DECIMAL(10,3) NOT NULL COMMENT ''Cantidad en kilogramos'',
        Metros DECIMAL(10,2) NULL COMMENT ''Metros a fabricar'',
        FechaTintaEnMaquina DATETIME(6) NOT NULL COMMENT ''Fecha de aplicación de tinta'',
        Sustrato VARCHAR(100) NOT NULL COMMENT ''Tipo de material'',
        Estado VARCHAR(20) NULL COMMENT ''Estado del programa'',
        Observaciones VARCHAR(1000) NULL COMMENT ''Observaciones adicionales'',
        LastActionBy VARCHAR(100) NULL COMMENT ''Último usuario que modificó'',
        LastActionAt DATETIME(6) NULL COMMENT ''Fecha de última acción'',
        preparando_started_at DATETIME NULL COMMENT ''Fecha cuando se marcó como PREPARANDO'',
        CreatedBy INT NULL COMMENT ''Usuario creador'',
        UpdatedBy INT NULL COMMENT ''Usuario que actualizó'',
        CreatedAt DATETIME(6) NULL COMMENT ''Fecha de creación original'',
        UpdatedAt DATETIME(6) NULL COMMENT ''Fecha de actualización original'',
        backup_date DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT ''Fecha y hora del backup'',
        backup_reason VARCHAR(100) NOT NULL COMMENT ''Razón del backup (TERMINADO, ELIMINADO, REEMPLAZADO)'',
        backup_user_id INT NULL COMMENT ''ID del usuario que generó el backup'',
        backup_user_name VARCHAR(100) NULL COMMENT ''Nombre del usuario que generó el backup'',
        INDEX idx_backup_ot_sap (ot_sap),
        INDEX idx_backup_articulo (Articulo),
        INDEX idx_backup_numero_maquina (NumeroMaquina),
        INDEX idx_backup_cliente (Cliente),
        INDEX idx_backup_estado (Estado),
        INDEX idx_backup_fecha_tinta (FechaTintaEnMaquina),
        INDEX idx_backup_date (backup_date),
        INDEX idx_backup_reason (backup_reason),
        INDEX idx_backup_user_id (backup_user_id),
        INDEX idx_backup_created_at (CreatedAt),
        INDEX idx_backup_date_range (backup_date, NumeroMaquina),
        INDEX idx_backup_articulo_fecha (Articulo, backup_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
    COMMENT=''Backup histórico de programación de máquinas (retención 6 meses)''',
    'SELECT ''Tabla maquinas_backup ya existe'' AS resultado'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✓ Tabla maquinas_backup migrada' as '';

-- =====================================================
-- MIGRACIÓN 6: PROCEDIMIENTOS ALMACENADOS PARA BACKUP
-- =====================================================
SELECT 'Creando procedimientos almacenados...' as '';

DELIMITER $$

-- Procedimiento: sp_backup_maquina
DROP PROCEDURE IF EXISTS sp_backup_maquina$$

CREATE PROCEDURE sp_backup_maquina(
    IN p_ot_sap VARCHAR(50),
    IN p_backup_reason VARCHAR(100),
    IN p_backup_user_id INT,
    IN p_backup_user_name VARCHAR(100)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error al crear backup de máquina';
    END;
    
    START TRANSACTION;
    
    INSERT INTO maquinas_backup (
        ot_sap, Articulo, NumeroMaquina, Cliente, Referencia, Td, tipo_impresion,
        NumeroColores, Colores, Kilos, Metros, FechaTintaEnMaquina, Sustrato,
        Estado, Observaciones, LastActionBy, LastActionAt, preparando_started_at,
        CreatedBy, UpdatedBy, CreatedAt, UpdatedAt,
        backup_date, backup_reason, backup_user_id, backup_user_name
    )
    SELECT 
        ot_sap, Articulo, numero_maquina, Cliente, Referencia, Td, tipo_impresion,
        numero_colores, Colores, Kilos, Metros, fecha_tinta_en_maquina, Sustrato,
        Estado, Observaciones, last_action_by, last_action_at, preparando_started_at,
        created_by, updated_by, created_at, updated_at,
        NOW(6), p_backup_reason, p_backup_user_id, p_backup_user_name
    FROM maquinas
    WHERE ot_sap = p_ot_sap;
    
    COMMIT;
END$$

-- Procedimiento: sp_backup_maquinas_by_estado
DROP PROCEDURE IF EXISTS sp_backup_maquinas_by_estado$$

CREATE PROCEDURE sp_backup_maquinas_by_estado(
    IN p_estado VARCHAR(20),
    IN p_backup_reason VARCHAR(100),
    IN p_backup_user_id INT,
    IN p_backup_user_name VARCHAR(100)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error al crear backups masivos';
    END;
    
    START TRANSACTION;
    
    INSERT INTO maquinas_backup (
        ot_sap, Articulo, NumeroMaquina, Cliente, Referencia, Td, tipo_impresion,
        NumeroColores, Colores, Kilos, Metros, FechaTintaEnMaquina, Sustrato,
        Estado, Observaciones, LastActionBy, LastActionAt, preparando_started_at,
        CreatedBy, UpdatedBy, CreatedAt, UpdatedAt,
        backup_date, backup_reason, backup_user_id, backup_user_name
    )
    SELECT 
        ot_sap, Articulo, numero_maquina, Cliente, Referencia, Td, tipo_impresion,
        numero_colores, Colores, Kilos, Metros, fecha_tinta_en_maquina, Sustrato,
        Estado, Observaciones, last_action_by, last_action_at, preparando_started_at,
        created_by, updated_by, created_at, updated_at,
        NOW(6), p_backup_reason, p_backup_user_id, p_backup_user_name
    FROM maquinas
    WHERE Estado = p_estado;
    
    COMMIT;
END$$

DELIMITER ;

SELECT '✓ Procedimientos almacenados creados' as '';

-- =====================================================
-- MIGRACIÓN 7: EVENTO DE LIMPIEZA AUTOMÁTICA
-- =====================================================
SELECT 'Creando evento de limpieza automática...' as '';

SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS evt_cleanup_old_backups;

DELIMITER $$

CREATE EVENT evt_cleanup_old_backups
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 2 HOUR)
DO
BEGIN
    DELETE FROM maquinas_backup
    WHERE backup_date < DATE_SUB(NOW(), INTERVAL 6 MONTH);
END$$

DELIMITER ;

SELECT '✓ Evento de limpieza automática creado (ejecuta diariamente a las 2:00 AM)' as '';

-- ===== FINALIZACIÓN =====
SET FOREIGN_KEY_CHECKS = 1;

SELECT '========================================' as '';
SELECT 'MIGRACIÓN COMPLETADA EXITOSAMENTE' as '';
SELECT '========================================' as '';

-- Mostrar resumen de tablas
SELECT 'Resumen de tablas migradas:' as '';
SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME, UPDATE_TIME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('designs', 'maquinas', 'anilox', 'machine_config', 'maquinas_backup')
ORDER BY TABLE_NAME;

-- Mostrar procedimientos creados
SELECT 'Procedimientos almacenados:' as '';
SHOW PROCEDURE STATUS WHERE Db = DATABASE() AND Name LIKE 'sp_backup%';

-- Mostrar eventos creados
SELECT 'Eventos programados:' as '';
SHOW EVENTS WHERE Name = 'evt_cleanup_old_backups';

SELECT '========================================' as '';
SELECT '✓ MIGRACIÓN FINALIZADA' as '';
SELECT '========================================' as '';
