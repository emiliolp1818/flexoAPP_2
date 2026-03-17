-- =============================================
-- Script: CREATE MAQUINAS_BACKUP TABLE
-- Descripción: Tabla de backup histórico de programación de máquinas
--              con retención automática de 6 meses
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-02-14
-- =============================================

-- Eliminar tabla si existe (solo para desarrollo)
DROP TABLE IF EXISTS `maquinas_backup`;

-- Crear tabla maquinas_backup
CREATE TABLE `maquinas_backup` (
    `backup_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del registro de backup',
    `ot_sap` VARCHAR(50) NOT NULL COMMENT 'Orden de Trabajo SAP',
    `Articulo` VARCHAR(50) NOT NULL COMMENT 'Código del artículo',
    `NumeroMaquina` INT NOT NULL COMMENT 'Número de máquina (11-21)',
    `Cliente` VARCHAR(200) NOT NULL COMMENT 'Cliente',
    `Referencia` VARCHAR(100) NULL COMMENT 'Referencia del producto',
    `Td` VARCHAR(10) NULL COMMENT 'Código TD',
    `tipo_impresion` VARCHAR(50) NULL COMMENT 'Tipo de impresión',
    `NumeroColores` INT NOT NULL DEFAULT 1 COMMENT 'Número de colores',
    `Colores` JSON NOT NULL DEFAULT ('[]') COMMENT 'Array de colores',
    `Kilos` DECIMAL(10,3) NOT NULL COMMENT 'Cantidad en kilogramos',
    `Metros` DECIMAL(10,2) NULL COMMENT 'Metros a fabricar',
    `FechaTintaEnMaquina` DATETIME(6) NOT NULL COMMENT 'Fecha de aplicación de tinta',
    `Sustrato` VARCHAR(100) NOT NULL COMMENT 'Tipo de material',
    `Estado` VARCHAR(20) NULL COMMENT 'Estado del programa',
    `Observaciones` VARCHAR(1000) NULL COMMENT 'Observaciones adicionales',
    `LastActionBy` VARCHAR(100) NULL COMMENT 'Último usuario que modificó',
    `LastActionAt` DATETIME(6) NULL COMMENT 'Fecha de última acción',
    `preparando_started_at` DATETIME NULL COMMENT 'Fecha cuando se marcó como PREPARANDO',
    `CreatedBy` INT NULL COMMENT 'Usuario creador',
    `UpdatedBy` INT NULL COMMENT 'Usuario que actualizó',
    `CreatedAt` DATETIME(6) NULL COMMENT 'Fecha de creación original',
    `UpdatedAt` DATETIME(6) NULL COMMENT 'Fecha de actualización original',
    `backup_date` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha y hora del backup',
    `backup_reason` VARCHAR(100) NOT NULL COMMENT 'Razón del backup (TERMINADO, ELIMINADO, REEMPLAZADO)',
    `backup_user_id` INT NULL COMMENT 'ID del usuario que generó el backup',
    `backup_user_name` VARCHAR(100) NULL COMMENT 'Nombre del usuario que generó el backup',
    
    INDEX `idx_backup_ot_sap` (`ot_sap`),
    INDEX `idx_backup_articulo` (`Articulo`),
    INDEX `idx_backup_numero_maquina` (`NumeroMaquina`),
    INDEX `idx_backup_cliente` (`Cliente`),
    INDEX `idx_backup_estado` (`Estado`),
    INDEX `idx_backup_fecha_tinta` (`FechaTintaEnMaquina`),
    INDEX `idx_backup_date` (`backup_date`),
    INDEX `idx_backup_reason` (`backup_reason`),
    INDEX `idx_backup_user_id` (`backup_user_id`),
    INDEX `idx_backup_created_at` (`CreatedAt`),
    INDEX `idx_backup_date_range` (`backup_date`, `NumeroMaquina`),
    INDEX `idx_backup_articulo_fecha` (`Articulo`, `backup_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Backup histórico de programación de máquinas (retención 6 meses)';

-- =============================================
-- PROCEDIMIENTO: sp_backup_maquina
-- Descripción: Crea un backup de una máquina específica
-- =============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_backup_maquina`$$

CREATE PROCEDURE `sp_backup_maquina`(
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
    
    -- Insertar backup desde la tabla maquinas
    INSERT INTO `maquinas_backup` (
        `ot_sap`,
        `Articulo`,
        `NumeroMaquina`,
        `Cliente`,
        `Referencia`,
        `Td`,
        `tipo_impresion`,
        `NumeroColores`,
        `Colores`,
        `Kilos`,
        `Metros`,
        `FechaTintaEnMaquina`,
        `Sustrato`,
        `Estado`,
        `Observaciones`,
        `LastActionBy`,
        `LastActionAt`,
        `preparando_started_at`,
        `CreatedBy`,
        `UpdatedBy`,
        `CreatedAt`,
        `UpdatedAt`,
        `backup_date`,
        `backup_reason`,
        `backup_user_id`,
        `backup_user_name`
    )
    SELECT 
        `ot_sap`,
        `Articulo`,
        `NumeroMaquina`,
        `Cliente`,
        `Referencia`,
        `Td`,
        `tipo_impresion`,
        `NumeroColores`,
        `Colores`,
        `Kilos`,
        `Metros`,
        `FechaTintaEnMaquina`,
        `Sustrato`,
        `Estado`,
        `Observaciones`,
        `LastActionBy`,
        `LastActionAt`,
        `preparando_started_at`,
        `CreatedBy`,
        `UpdatedBy`,
        `CreatedAt`,
        `UpdatedAt`,
        NOW(6),
        p_backup_reason,
        p_backup_user_id,
        p_backup_user_name
    FROM `maquinas`
    WHERE `ot_sap` = p_ot_sap;
    
    COMMIT;
    
    SELECT 'Backup creado exitosamente' AS resultado;
END$$

DELIMITER ;

-- =============================================
-- PROCEDIMIENTO: sp_backup_maquinas_by_estado
-- Descripción: Crea backup de todas las máquinas con un estado específico
-- =============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_backup_maquinas_by_estado`$$

CREATE PROCEDURE `sp_backup_maquinas_by_estado`(
    IN p_estado VARCHAR(20),
    IN p_backup_reason VARCHAR(100),
    IN p_backup_user_id INT,
    IN p_backup_user_name VARCHAR(100)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error al crear backups masivos';
    END;
    
    START TRANSACTION;
    
    -- Insertar backups de todas las máquinas con el estado especificado
    INSERT INTO `maquinas_backup` (
        `ot_sap`,
        `Articulo`,
        `NumeroMaquina`,
        `Cliente`,
        `Referencia`,
        `Td`,
        `tipo_impresion`,
        `NumeroColores`,
        `Colores`,
        `Kilos`,
        `Metros`,
        `FechaTintaEnMaquina`,
        `Sustrato`,
        `Estado`,
        `Observaciones`,
        `LastActionBy`,
        `LastActionAt`,
        `preparando_started_at`,
        `CreatedBy`,
        `UpdatedBy`,
        `CreatedAt`,
        `UpdatedAt`,
        `backup_date`,
        `backup_reason`,
        `backup_user_id`,
        `backup_user_name`
    )
    SELECT 
        `ot_sap`,
        `Articulo`,
        `NumeroMaquina`,
        `Cliente`,
        `Referencia`,
        `Td`,
        `tipo_impresion`,
        `NumeroColores`,
        `Colores`,
        `Kilos`,
        `Metros`,
        `FechaTintaEnMaquina`,
        `Sustrato`,
        `Estado`,
        `Observaciones`,
        `LastActionBy`,
        `LastActionAt`,
        `preparando_started_at`,
        `CreatedBy`,
        `UpdatedBy`,
        `CreatedAt`,
        `UpdatedAt`,
        NOW(6),
        p_backup_reason,
        p_backup_user_id,
        p_backup_user_name
    FROM `maquinas`
    WHERE `Estado` = p_estado;
    
    SET v_count = ROW_COUNT();
    
    COMMIT;
    
    SELECT CONCAT(v_count, ' backups creados exitosamente') AS resultado;
END$$

DELIMITER ;

-- =============================================
-- EVENTO: Limpieza automática de backups antiguos
-- Descripción: Elimina backups con más de 6 meses de antigüedad
--              Se ejecuta diariamente a las 2:00 AM
-- =============================================

-- Habilitar el scheduler de eventos (si no está habilitado)
SET GLOBAL event_scheduler = ON;

-- Eliminar evento si existe
DROP EVENT IF EXISTS `evt_cleanup_old_backups`;

-- Crear evento de limpieza
DELIMITER $$

CREATE EVENT `evt_cleanup_old_backups`
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 2 HOUR)
DO
BEGIN
    DECLARE v_deleted_count INT DEFAULT 0;
    
    -- Eliminar registros con más de 6 meses
    DELETE FROM `maquinas_backup`
    WHERE `backup_date` < DATE_SUB(NOW(), INTERVAL 6 MONTH);
    
    SET v_deleted_count = ROW_COUNT();
    
    -- Log de la limpieza (opcional - requiere tabla de logs)
    -- INSERT INTO system_logs (message, created_at) 
    -- VALUES (CONCAT('Limpieza automática: ', v_deleted_count, ' backups eliminados'), NOW());
END$$

DELIMITER ;

-- =============================================
-- COMENTARIOS Y VERIFICACIÓN
-- =============================================

SELECT 'Tabla maquinas_backup creada exitosamente' AS resultado;
SELECT 'Procedimientos almacenados creados:' AS '';
SELECT '  - sp_backup_maquina' AS '';
SELECT '  - sp_backup_maquinas_by_estado' AS '';
SELECT 'Evento de limpieza automática creado:' AS '';
SELECT '  - evt_cleanup_old_backups (ejecuta diariamente a las 2:00 AM)' AS '';
SELECT '  - Retención: 6 meses' AS '';

-- Verificar que el evento esté activo
SHOW EVENTS WHERE Name = 'evt_cleanup_old_backups';

-- Mostrar procedimientos creados
SHOW PROCEDURE STATUS WHERE Db = DATABASE() AND Name LIKE 'sp_backup%';

