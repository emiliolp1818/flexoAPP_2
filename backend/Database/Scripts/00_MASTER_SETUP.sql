-- =====================================================
-- SCRIPT MAESTRO: CONFIGURACIÓN COMPLETA DE BASE DE DATOS
-- Propósito: Ejecutar todos los scripts de creación de tablas
-- Base de datos: MySQL (Railway/Render)
-- Proyecto: FlexoAPP
-- =====================================================

-- Configurar el conjunto de caracteres y collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Configurar zona horaria
SET time_zone = '+00:00';

-- Deshabilitar verificaciones temporalmente para mejor rendimiento
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;

-- =====================================================
-- INFORMACIÓN DEL SCRIPT
-- =====================================================
SELECT '=====================================================' as '';
SELECT 'FLEXOAPP - CONFIGURACIÓN DE BASE DE DATOS' as '';
SELECT '=====================================================' as '';
SELECT CONCAT('Fecha de ejecución: ', NOW()) as '';
SELECT CONCAT('Base de datos: ', DATABASE()) as '';
SELECT CONCAT('Usuario: ', USER()) as '';
SELECT '=====================================================' as '';

-- =====================================================
-- 1. CREAR TABLA USERS
-- =====================================================
SELECT 'Creando tabla users...' as '';

CREATE TABLE IF NOT EXISTS `users` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `UserCode` VARCHAR(50) NOT NULL UNIQUE,
    `Password` VARCHAR(255) NOT NULL,
    `FirstName` VARCHAR(50) NULL,
    `LastName` VARCHAR(50) NULL,
    `Role` VARCHAR(50) NOT NULL DEFAULT 'Operario',
    `Permissions` JSON NULL,
    `ProfileImage` LONGTEXT NULL,
    `Email` VARCHAR(100) NULL,
    `Phone` VARCHAR(20) NULL,
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX `idx_users_usercode` (`UserCode`),
    INDEX `idx_users_role` (`Role`),
    INDEX `idx_users_active` (`IsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario administrador por defecto
INSERT IGNORE INTO `users` (
    `UserCode`, `Password`, `FirstName`, `LastName`, `Role`, `IsActive`
) VALUES (
    'admin',
    '$2a$11$rOzJqQZ8kVJ8kVJ8kVJ8kOzJqQZ8kVJ8kVJ8kVJ8kOzJqQZ8kVJ8k.',
    'Administrador', 'Sistema', 'Admin', 1
);

SELECT 'Tabla users creada ✓' as '';

-- =====================================================
-- 2. CREAR TABLA ACTIVITIES
-- =====================================================
SELECT 'Creando tabla Activities...' as '';

CREATE TABLE IF NOT EXISTS `Activities` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `Action` VARCHAR(200) NOT NULL,
    `Description` VARCHAR(500) NOT NULL,
    `Timestamp` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `Module` VARCHAR(100) NOT NULL,
    `Details` VARCHAR(1000) NULL,
    `UserId` INT NOT NULL,
    `UserCode` VARCHAR(50) NULL,
    `IpAddress` VARCHAR(45) NULL,
    INDEX `idx_activities_userid` (`UserId`),
    INDEX `idx_activities_timestamp` (`Timestamp`),
    INDEX `idx_activities_module` (`Module`),
    INDEX `idx_activities_action` (`Action`),
    CONSTRAINT `fk_activities_user` 
        FOREIGN KEY (`UserId`) REFERENCES `users`(`Id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabla Activities creada ✓' as '';

-- =====================================================
-- 3. CREAR TABLA DESIGNS
-- =====================================================
SELECT 'Creando tabla designs...' as '';

CREATE TABLE IF NOT EXISTS `designs` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `ArticleF` VARCHAR(50) NULL,
    `Client` VARCHAR(200) NULL,
    `Description` TEXT NULL,
    `Substrate` VARCHAR(100) NULL,
    `Type` VARCHAR(100) NULL,
    `PrintType` VARCHAR(100) NULL,
    `ColorCount` INT NULL DEFAULT 0,
    `color 1` VARCHAR(100) NULL,
    `color 2` VARCHAR(100) NULL,
    `color 3` VARCHAR(100) NULL,
    `color 4` VARCHAR(100) NULL,
    `color 5` VARCHAR(100) NULL,
    `color 6` VARCHAR(100) NULL,
    `color 7` VARCHAR(100) NULL,
    `color 8` VARCHAR(100) NULL,
    `color 9` VARCHAR(100) NULL,
    `color 10` VARCHAR(100) NULL,
    `Status` VARCHAR(50) NULL DEFAULT 'DRAFT',
    `CreatedDate` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `LastModified` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX `idx_designs_articlef` (`ArticleF`),
    INDEX `idx_designs_client` (`Client`),
    INDEX `idx_designs_status` (`Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabla designs creada ✓' as '';

-- =====================================================
-- 4. CREAR TABLA MAQUINAS
-- =====================================================
SELECT 'Creando tabla maquinas...' as '';

CREATE TABLE IF NOT EXISTS `maquinas` (
    `ot_sap` VARCHAR(50) NOT NULL PRIMARY KEY,
    `Articulo` VARCHAR(50) NOT NULL,
    `NumeroMaquina` INT NOT NULL,
    `Cliente` VARCHAR(200) NOT NULL,
    `Referencia` VARCHAR(100) NOT NULL DEFAULT '',
    `Td` VARCHAR(10) NOT NULL DEFAULT '',
    `NumeroColores` INT NOT NULL DEFAULT 1,
    `Colores` JSON NOT NULL DEFAULT ('[]'),
    `Kilos` DECIMAL(10,2) NOT NULL,
    `FechaTintaEnMaquina` DATETIME(6) NOT NULL,
    `Sustrato` VARCHAR(100) NOT NULL,
    `Estado` VARCHAR(20) NULL DEFAULT NULL,
    `Observaciones` VARCHAR(1000) NULL,
    `LastActionBy` VARCHAR(100) NULL,
    `LastActionAt` DATETIME(6) NULL,
    `CreatedBy` INT NULL,
    `UpdatedBy` INT NULL,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX `idx_maquinas_numero` (`NumeroMaquina`),
    INDEX `idx_maquinas_articulo` (`Articulo`),
    INDEX `idx_maquinas_estado` (`Estado`),
    CONSTRAINT `fk_maquinas_created_by` 
        FOREIGN KEY (`CreatedBy`) REFERENCES `users`(`Id`) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_maquinas_updated_by` 
        FOREIGN KEY (`UpdatedBy`) REFERENCES `users`(`Id`) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `chk_maquinas_numero_valido` 
        CHECK (`NumeroMaquina` BETWEEN 11 AND 21),
    CONSTRAINT `chk_maquinas_kilos_positivos` 
        CHECK (`Kilos` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabla maquinas creada ✓' as '';

-- =====================================================
-- 5. CREAR TABLA PEDIDOS
-- =====================================================
SELECT 'Creando tabla Pedidos...' as '';

CREATE TABLE IF NOT EXISTS `Pedidos` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `MachineNumber` INT NOT NULL,
    `NumeroPedido` VARCHAR(50) NOT NULL UNIQUE,
    `Articulo` VARCHAR(50) NOT NULL,
    `Cliente` VARCHAR(200) NOT NULL,
    `Descripcion` VARCHAR(500) NULL,
    `Cantidad` DECIMAL(10,2) NOT NULL,
    `Unidad` VARCHAR(50) NOT NULL DEFAULT 'kg',
    `Estado` VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    `FechaPedido` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `FechaEntrega` DATETIME(6) NULL,
    `Prioridad` VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    `Observaciones` VARCHAR(1000) NULL,
    `AsignadoA` VARCHAR(100) NULL,
    `FechaAsignacion` DATETIME(6) NULL,
    `CreatedBy` INT NULL,
    `UpdatedBy` INT NULL,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX `idx_pedidos_numero` (`NumeroPedido`),
    INDEX `idx_pedidos_machine` (`MachineNumber`),
    INDEX `idx_pedidos_estado` (`Estado`),
    CONSTRAINT `fk_pedidos_created_by` 
        FOREIGN KEY (`CreatedBy`) REFERENCES `users`(`Id`) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_pedidos_updated_by` 
        FOREIGN KEY (`UpdatedBy`) REFERENCES `users`(`Id`) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabla Pedidos creada ✓' as '';

-- =====================================================
-- 6. CREAR TABLA CONDICIONUNICA
-- =====================================================
SELECT 'Creando tabla condicionunica...' as '';

CREATE TABLE IF NOT EXISTS `condicionunica` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `farticulo` VARCHAR(50) NOT NULL,
    `referencia` VARCHAR(100) NOT NULL,
    `estante` VARCHAR(50) NOT NULL,
    `numerocarpeta` VARCHAR(50) NOT NULL,
    `createddate` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `lastmodified` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX `idx_condicionunica_farticulo` (`farticulo`),
    INDEX `idx_condicionunica_referencia` (`referencia`),
    UNIQUE KEY `uk_condicionunica_articulo_ref` (`farticulo`, `referencia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabla condicionunica creada ✓' as '';

-- =====================================================
-- 7. CREAR TABLA DOCUMENTO
-- =====================================================
SELECT 'Creando tabla Documento...' as '';

CREATE TABLE IF NOT EXISTS `Documento` (
    `DocumentoID` INT AUTO_INCREMENT PRIMARY KEY,
    `Nombre` VARCHAR(255) NOT NULL,
    `Tipo` VARCHAR(50) NOT NULL,
    `Categoria` VARCHAR(100) NOT NULL,
    `Descripcion` TEXT NULL,
    `NombreArchivo` VARCHAR(255) NULL,
    `RutaArchivo` VARCHAR(500) NULL,
    `TamanoBytes` BIGINT NULL,
    `TamanoFormateado` VARCHAR(50) NULL,
    `Extension` VARCHAR(20) NULL,
    `HashMD5` VARCHAR(32) NULL,
    `Estado` VARCHAR(20) NOT NULL DEFAULT 'draft',
    `Version` VARCHAR(20) NULL,
    `Etiquetas` VARCHAR(500) NULL,
    `PalabrasClave` VARCHAR(500) NULL,
    `CreadoPor` VARCHAR(100) NULL,
    `FechaCreacion` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `ModificadoPor` VARCHAR(100) NULL,
    `FechaModificacion` DATETIME(6) NULL,
    `EsPublico` TINYINT(1) NOT NULL DEFAULT 0,
    `NivelAcceso` INT NOT NULL DEFAULT 1,
    `NumeroVistas` INT NOT NULL DEFAULT 0,
    `NumeroDescargas` INT NOT NULL DEFAULT 0,
    `FechaUltimoAcceso` DATETIME(6) NULL,
    INDEX `idx_documento_nombre` (`Nombre`),
    INDEX `idx_documento_tipo` (`Tipo`),
    INDEX `idx_documento_categoria` (`Categoria`),
    INDEX `idx_documento_estado` (`Estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabla Documento creada ✓' as '';

-- =====================================================
-- 8. CREAR TABLA REFRESH_TOKENS
-- =====================================================
SELECT 'Creando tabla refresh_tokens...' as '';

CREATE TABLE IF NOT EXISTS `refresh_tokens` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `Token` VARCHAR(500) NOT NULL UNIQUE,
    `UserId` INT NOT NULL,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `ExpiresAt` DATETIME(6) NOT NULL,
    `IsRevoked` TINYINT(1) NOT NULL DEFAULT 0,
    `RevokedAt` DATETIME(6) NULL,
    `RevokedReason` VARCHAR(200) NULL,
    `CreatedByIp` VARCHAR(45) NULL,
    `RevokedByIp` VARCHAR(45) NULL,
    `ReplacedByToken` VARCHAR(500) NULL,
    `UserAgent` VARCHAR(500) NULL,
    INDEX `idx_refresh_tokens_userid` (`UserId`),
    INDEX `idx_refresh_tokens_expires` (`ExpiresAt`),
    CONSTRAINT `fk_refresh_tokens_user` 
        FOREIGN KEY (`UserId`) REFERENCES `users`(`Id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabla refresh_tokens creada ✓' as '';

-- =====================================================
-- FINALIZACIÓN
-- =====================================================

-- Rehabilitar verificaciones
SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

-- Mostrar resumen de tablas creadas
SELECT '=====================================================' as '';
SELECT 'RESUMEN DE TABLAS CREADAS' as '';
SELECT '=====================================================' as '';

SELECT 
    TABLE_NAME as 'Tabla',
    TABLE_ROWS as 'Registros',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Tamaño (MB)'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;

SELECT '=====================================================' as '';
SELECT 'CONFIGURACIÓN COMPLETADA EXITOSAMENTE ✓' as '';
SELECT CONCAT('Total de tablas: ', COUNT(*)) as ''
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE();
SELECT '=====================================================' as '';