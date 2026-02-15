-- =====================================================
-- SCRIPT MAESTRO: CREAR TODAS LAS TABLAS DEL SISTEMA
-- =====================================================
-- Sistema: FlexoAPP - Sistema de Gestión Flexográfica
-- Base de datos: MySQL 8.0+ (Railway/Render)
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-02-15
-- Versión: 5.0
-- =====================================================
-- 
-- PROPÓSITO:
-- Este script crea todas las tablas necesarias para el sistema FlexoAPP
-- en el orden correcto respetando las dependencias de claves foráneas.
--
-- ORDEN DE CREACIÓN:
-- 1. users - Tabla base de usuarios (sin dependencias)
-- 2. Activities - Logs del sistema (depende de users)
-- 3. refresh_tokens - Tokens JWT (depende de users)
-- 4. designs - Diseños flexográficos (sin dependencias)
-- 5. maquinas - Máquinas de producción (depende de users)
-- 6. Documento - Gestión documental (sin dependencias)
-- 7. condicionunica - Ubicación de artículos (sin dependencias)
-- 8. anilox - Inventario de anilox (sin dependencias)
-- 9. machine_config - Configuración de máquinas (sin dependencias)
-- 10. maquinas_backup - Backup histórico con retención de 6 meses
-- 11. system_configs - Configuraciones del sistema
--
-- PROCEDIMIENTOS ALMACENADOS:
-- - sp_backup_maquina: Crear backup de una máquina específica
-- - sp_backup_maquinas_by_estado: Crear backup masivo por estado
--
-- EVENTOS PROGRAMADOS:
-- - evt_cleanup_old_backups: Limpieza automática diaria (2:00 AM)
--
-- NOTAS:
-- - Usar con precaución en producción
-- - Verificar respaldos antes de ejecutar
-- - Las tablas se crean solo si no existen (IF NOT EXISTS)
-- =====================================================

-- ===== CONFIGURACIÓN INICIAL =====
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

SELECT '========================================' as '';
SELECT 'INICIANDO CREACIÓN DE TABLAS' as '';
SELECT '========================================' as '';

-- =====================================================
-- TABLA 1: USERS
-- Descripción: Usuarios del sistema con autenticación
-- =====================================================
SELECT 'Creando tabla: users...' as '';

CREATE TABLE IF NOT EXISTS `users` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del usuario',
    `UserCode` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único de usuario',
    `Password` VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada con bcrypt',
    `FirstName` VARCHAR(50) NULL COMMENT 'Nombre del usuario',
    `LastName` VARCHAR(50) NULL COMMENT 'Apellido del usuario',
    `Role` VARCHAR(50) NOT NULL DEFAULT 'Operario' COMMENT 'Rol del usuario',
    `Permissions` JSON NULL COMMENT 'Permisos específicos en formato JSON',
    `ProfileImage` LONGTEXT NULL COMMENT 'Imagen de perfil en base64',
    `Email` VARCHAR(100) NULL COMMENT 'Correo electrónico',
    `Phone` VARCHAR(20) NULL COMMENT 'Teléfono de contacto',
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado activo/inactivo',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación',
    `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Fecha de actualización',
    
    INDEX `idx_users_usercode` (`UserCode`),
    INDEX `idx_users_role` (`Role`),
    INDEX `idx_users_active` (`IsActive`),
    INDEX `idx_users_email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios del sistema';

SELECT '✓ Tabla users creada' as '';

-- =====================================================
-- TABLA 2: ACTIVITIES
-- Descripción: Registro de actividades y auditoría
-- =====================================================
SELECT 'Creando tabla: Activities...' as '';

CREATE TABLE IF NOT EXISTS `Activities` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único de la actividad',
    `Action` VARCHAR(200) NOT NULL COMMENT 'Acción realizada',
    `Description` VARCHAR(500) NOT NULL COMMENT 'Descripción detallada',
    `Timestamp` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha y hora',
    `Module` VARCHAR(100) NOT NULL COMMENT 'Módulo del sistema',
    `Details` VARCHAR(1000) NULL COMMENT 'Detalles en formato JSON',
    `UserId` INT NOT NULL COMMENT 'ID del usuario',
    `UserCode` VARCHAR(50) NULL COMMENT 'Código del usuario',
    `IpAddress` VARCHAR(45) NULL COMMENT 'Dirección IP',
    `EntityType` VARCHAR(100) NULL COMMENT 'Tipo de entidad afectada',
    `EntityId` INT NULL COMMENT 'ID de la entidad afectada',
    `EntityName` VARCHAR(200) NULL COMMENT 'Nombre o código de la entidad',
    `Duration` BIGINT NULL COMMENT 'Duración de la operación en ticks',
    `OldValues` VARCHAR(2000) NULL COMMENT 'Valores anteriores (JSON)',
    `NewValues` VARCHAR(2000) NULL COMMENT 'Valores nuevos (JSON)',
    
    INDEX `idx_activities_userid` (`UserId`),
    INDEX `idx_activities_timestamp` (`Timestamp`),
    INDEX `idx_activities_module` (`Module`),
    INDEX `idx_activities_action` (`Action`),
    INDEX `idx_activities_usercode` (`UserCode`),
    INDEX `idx_activities_entity` (`EntityType`, `EntityId`),
    
    CONSTRAINT `fk_activities_user` 
        FOREIGN KEY (`UserId`) 
        REFERENCES `users`(`Id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de actividades del sistema';

SELECT '✓ Tabla Activities creada' as '';

-- =====================================================
-- TABLA 3: REFRESH_TOKENS
-- Descripción: Tokens de actualización JWT
-- =====================================================
SELECT 'Creando tabla: refresh_tokens...' as '';

CREATE TABLE IF NOT EXISTS `refresh_tokens` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del token',
    `Token` VARCHAR(500) NOT NULL UNIQUE COMMENT 'Token de actualización',
    `UserId` INT NOT NULL COMMENT 'ID del usuario propietario',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación',
    `ExpiresAt` DATETIME(6) NOT NULL COMMENT 'Fecha de expiración',
    `IsRevoked` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Token revocado',
    `RevokedAt` DATETIME(6) NULL COMMENT 'Fecha de revocación',
    `RevokedReason` VARCHAR(200) NULL COMMENT 'Razón de revocación',
    `CreatedByIp` VARCHAR(45) NULL COMMENT 'IP de creación',
    `RevokedByIp` VARCHAR(45) NULL COMMENT 'IP de revocación',
    `ReplacedByToken` VARCHAR(500) NULL COMMENT 'Token de reemplazo',
    `UserAgent` VARCHAR(500) NULL COMMENT 'Información del navegador',
    
    INDEX `idx_refresh_tokens_userid` (`UserId`),
    INDEX `idx_refresh_tokens_expires` (`ExpiresAt`),
    INDEX `idx_refresh_tokens_revoked` (`IsRevoked`),
    INDEX `idx_refresh_tokens_created` (`CreatedAt`),
    
    CONSTRAINT `fk_refresh_tokens_user` 
        FOREIGN KEY (`UserId`) 
        REFERENCES `users`(`Id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tokens de actualización JWT';

SELECT '✓ Tabla refresh_tokens creada' as '';

-- =====================================================
-- TABLA 4: DESIGNS
-- Descripción: Diseños flexográficos
-- =====================================================
SELECT 'Creando tabla: designs...' as '';

CREATE TABLE IF NOT EXISTS `designs` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del diseño',
    `ArticleF` VARCHAR(50) NULL COMMENT 'Código del artículo F',
    `Client` VARCHAR(200) NULL COMMENT 'Cliente del diseño',
    `Description` TEXT NULL COMMENT 'Descripción del diseño',
    `Substrate` VARCHAR(100) NULL COMMENT 'Tipo de sustrato',
    `Type` VARCHAR(100) NULL COMMENT 'Tipo de diseño',
    `PrintType` VARCHAR(100) NULL COMMENT 'Tipo de impresión',
    `ColorCount` INT NULL DEFAULT 0 COMMENT 'Número total de colores',
    `color 1` VARCHAR(100) NULL COMMENT 'Color 1',
    `color 2` VARCHAR(100) NULL COMMENT 'Color 2',
    `color 3` VARCHAR(100) NULL COMMENT 'Color 3',
    `color 4` VARCHAR(100) NULL COMMENT 'Color 4',
    `color 5` VARCHAR(100) NULL COMMENT 'Color 5',
    `color 6` VARCHAR(100) NULL COMMENT 'Color 6',
    `color 7` VARCHAR(100) NULL COMMENT 'Color 7',
    `color 8` VARCHAR(100) NULL COMMENT 'Color 8',
    `color 9` VARCHAR(100) NULL COMMENT 'Color 9',
    `color 10` VARCHAR(100) NULL COMMENT 'Color 10',
    `ancho_mm` INT NULL COMMENT 'Ancho en milímetros',
    `Status` VARCHAR(50) NULL DEFAULT 'DRAFT' COMMENT 'Estado del diseño',
    `CreatedDate` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación',
    `LastModified` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Última modificación',
    
    INDEX `idx_designs_articlef` (`ArticleF`),
    INDEX `idx_designs_client` (`Client`),
    INDEX `idx_designs_status` (`Status`),
    INDEX `idx_designs_substrate` (`Substrate`),
    INDEX `idx_designs_created` (`CreatedDate`),
    
    CONSTRAINT `chk_designs_colorcount_valido` 
        CHECK (`ColorCount` >= 0 AND `ColorCount` <= 10),
        
    CONSTRAINT `chk_designs_ancho_positivo` 
        CHECK (`ancho_mm` IS NULL OR `ancho_mm` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Diseños flexográficos';

SELECT '✓ Tabla designs creada' as '';

-- =====================================================
-- TABLA 5: MAQUINAS
-- Descripción: Máquinas de producción flexográfica
-- =====================================================
SELECT 'Creando tabla: maquinas...' as '';

CREATE TABLE IF NOT EXISTS `maquinas` (
    `ot_sap` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'Orden de Trabajo SAP',
    `articulo` VARCHAR(50) NOT NULL COMMENT 'Código del artículo',
    `numero_maquina` INT NOT NULL COMMENT 'Número de máquina (11-21)',
    `cliente` VARCHAR(200) NOT NULL COMMENT 'Cliente',
    `referencia` VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'Referencia del producto',
    `td` VARCHAR(10) NOT NULL DEFAULT '' COMMENT 'Código TD',
    `tipo_impresion` VARCHAR(50) NULL COMMENT 'Tipo de impresión',
    `numero_colores` INT NOT NULL DEFAULT 1 COMMENT 'Número de colores',
    `colores` JSON NOT NULL DEFAULT ('[]') COMMENT 'Array de colores',
    `kilos` DECIMAL(10,3) NOT NULL COMMENT 'Cantidad en kilogramos',
    `metros` DECIMAL(10,2) NULL COMMENT 'Metros a fabricar',
    `fecha_tinta_en_maquina` DATETIME(6) NOT NULL COMMENT 'Fecha de aplicación de tinta',
    `sustrato` VARCHAR(100) NOT NULL COMMENT 'Tipo de material',
    `estado` VARCHAR(20) NULL DEFAULT NULL COMMENT 'Estado del programa',
    `observaciones` VARCHAR(1000) NULL COMMENT 'Observaciones adicionales',
    `last_action_by` VARCHAR(100) NULL COMMENT 'Último usuario que modificó',
    `last_action_at` DATETIME(6) NULL COMMENT 'Fecha de última acción',
    `preparando_started_at` DATETIME NULL COMMENT 'Fecha y hora cuando se marcó como PREPARANDO',
    `created_by` INT NULL COMMENT 'Usuario creador',
    `updated_by` INT NULL COMMENT 'Usuario que actualizó',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación',
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Fecha de actualización',
    
    INDEX `idx_maquinas_numero` (`numero_maquina`),
    INDEX `idx_maquinas_articulo` (`articulo`),
    INDEX `idx_maquinas_cliente` (`cliente`),
    INDEX `idx_maquinas_estado` (`estado`),
    INDEX `idx_maquinas_fecha_tinta` (`fecha_tinta_en_maquina`),
    INDEX `idx_maquinas_created_by` (`created_by`),
    INDEX `idx_maquinas_updated_by` (`updated_by`),
    INDEX `idx_maquinas_numero_estado` (`numero_maquina`, `estado`),
    
    CONSTRAINT `fk_maquinas_created_by` 
        FOREIGN KEY (`created_by`) 
        REFERENCES `users`(`Id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
        
    CONSTRAINT `fk_maquinas_updated_by` 
        FOREIGN KEY (`updated_by`) 
        REFERENCES `users`(`Id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
        
    CONSTRAINT `chk_maquinas_numero_valido` 
        CHECK (`numero_maquina` BETWEEN 11 AND 21),
        
    CONSTRAINT `chk_maquinas_kilos_positivos` 
        CHECK (`kilos` > 0),
        
    CONSTRAINT `chk_maquinas_metros_positivos` 
        CHECK (`metros` IS NULL OR `metros` >= 0),
        
    CONSTRAINT `chk_maquinas_colores_positivos` 
        CHECK (`numero_colores` > 0 AND `numero_colores` <= 10),
        
    CONSTRAINT `chk_maquinas_estado_valido` 
        CHECK (`estado` IS NULL OR `estado` IN ('PREPARANDO', 'LISTO', 'CORRIENDO', 'SUSPENDIDO', 'TERMINADO', 'SIN_ASIGNAR'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Máquinas de producción flexográfica';

SELECT '✓ Tabla maquinas creada' as '';

-- =====================================================
-- TABLA 6: DOCUMENTO
-- Descripción: Sistema de gestión documental
-- =====================================================
SELECT 'Creando tabla: Documento...' as '';

CREATE TABLE IF NOT EXISTS `Documento` (
    `DocumentoID` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del documento',
    `Nombre` VARCHAR(255) NOT NULL COMMENT 'Nombre del documento',
    `Tipo` VARCHAR(50) NOT NULL COMMENT 'Tipo de documento',
    `Categoria` VARCHAR(100) NOT NULL COMMENT 'Categoría del documento',
    `Descripcion` TEXT NULL COMMENT 'Descripción detallada',
    `NombreArchivo` VARCHAR(255) NULL COMMENT 'Nombre del archivo físico',
    `RutaArchivo` VARCHAR(500) NULL COMMENT 'Ruta del archivo',
    `TamanoBytes` BIGINT NULL COMMENT 'Tamaño en bytes',
    `TamanoFormateado` VARCHAR(50) NULL COMMENT 'Tamaño formateado',
    `Extension` VARCHAR(20) NULL COMMENT 'Extensión del archivo',
    `HashMD5` VARCHAR(32) NULL COMMENT 'Hash MD5 del archivo',
    `Estado` VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT 'Estado del documento',
    `Version` VARCHAR(20) NULL COMMENT 'Versión del documento',
    `Etiquetas` VARCHAR(500) NULL COMMENT 'Etiquetas del documento',
    `PalabrasClave` VARCHAR(500) NULL COMMENT 'Palabras clave',
    `CreadoPor` VARCHAR(100) NULL COMMENT 'Usuario creador',
    `FechaCreacion` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación',
    `ModificadoPor` VARCHAR(100) NULL COMMENT 'Usuario que modificó',
    `FechaModificacion` DATETIME(6) NULL COMMENT 'Fecha de modificación',
    `EsPublico` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Documento público',
    `NivelAcceso` INT NOT NULL DEFAULT 1 COMMENT 'Nivel de acceso (0-2)',
    `NumeroVistas` INT NOT NULL DEFAULT 0 COMMENT 'Número de vistas',
    `NumeroDescargas` INT NOT NULL DEFAULT 0 COMMENT 'Número de descargas',
    `FechaUltimoAcceso` DATETIME(6) NULL COMMENT 'Fecha de último acceso',
    
    INDEX `idx_documento_nombre` (`Nombre`),
    INDEX `idx_documento_tipo` (`Tipo`),
    INDEX `idx_documento_categoria` (`Categoria`),
    INDEX `idx_documento_estado` (`Estado`),
    INDEX `idx_documento_creado_por` (`CreadoPor`),
    INDEX `idx_documento_fecha_creacion` (`FechaCreacion`),
    INDEX `idx_documento_publico` (`EsPublico`),
    INDEX `idx_documento_nivel_acceso` (`NivelAcceso`),
    INDEX `idx_documento_extension` (`Extension`),
    
    FULLTEXT INDEX `ft_documento_busqueda` (`Nombre`, `Descripcion`, `Etiquetas`, `PalabrasClave`),
    
    CONSTRAINT `chk_documento_estado_valido` 
        CHECK (`Estado` IN ('draft', 'active', 'archived')),
        
    CONSTRAINT `chk_documento_nivel_acceso_valido` 
        CHECK (`NivelAcceso` BETWEEN 0 AND 2),
        
    CONSTRAINT `chk_documento_tamano_positivo` 
        CHECK (`TamanoBytes` IS NULL OR `TamanoBytes` >= 0),
        
    CONSTRAINT `chk_documento_vistas_positivas` 
        CHECK (`NumeroVistas` >= 0),
        
    CONSTRAINT `chk_documento_descargas_positivas` 
        CHECK (`NumeroDescargas` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sistema de gestión documental';

SELECT '✓ Tabla Documento creada' as '';

-- =====================================================
-- TABLA 7: CONDICIONUNICA
-- Descripción: Ubicación física de artículos
-- =====================================================
SELECT 'Creando tabla: condicionunica...' as '';

CREATE TABLE IF NOT EXISTS `condicionunica` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del registro',
    `farticulo` VARCHAR(50) NOT NULL COMMENT 'Código del artículo F',
    `descripcion` VARCHAR(500) NOT NULL COMMENT 'Descripción del producto',
    `estante` VARCHAR(50) NOT NULL COMMENT 'Número de estante',
    `numerocarpeta` VARCHAR(50) NOT NULL COMMENT 'Número de carpeta',
    `estado` VARCHAR(50) DEFAULT 'ACTIVO' COMMENT 'Estado del registro',
    `createddate` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    `lastmodified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última modificación',
    
    INDEX `idx_condicionunica_farticulo` (`farticulo`),
    INDEX `idx_condicionunica_estante` (`estante`),
    INDEX `idx_condicionunica_numerocarpeta` (`numerocarpeta`),
    INDEX `idx_condicionunica_estado` (`estado`),
    INDEX `idx_condicionunica_createddate` (`createddate`),
    
    CONSTRAINT `chk_condicionunica_estado_valido` 
        CHECK (`estado` IN ('ACTIVO', 'INACTIVO', 'EN REVISIÓN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ubicación física de artículos';

SELECT '✓ Tabla condicionunica creada' as '';

-- =====================================================
-- TABLA 8: ANILOX
-- Descripción: Inventario de rodillos anilox
-- =====================================================
SELECT 'Creando tabla: anilox...' as '';

CREATE TABLE IF NOT EXISTS `anilox` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del anilox',
    `codigo` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único del anilox',
    `maquina` INT NOT NULL COMMENT 'Número de máquina (11-21)',
    `bcm` INT NOT NULL COMMENT 'BCM (Billion Cubic Microns)',
    `lineatura` INT NOT NULL COMMENT 'Lineatura en LPI (Lines Per Inch)',
    `marca` VARCHAR(50) NOT NULL COMMENT 'Marca del anilox (APEX, ZECHER, HARPER)',
    `volumen_real` DECIMAL(10, 2) NOT NULL COMMENT 'Volumen real medido',
    `factor_eficiencia` DECIMAL(5, 2) NULL DEFAULT 35.00 COMMENT 'Factor de eficiencia del anilox (35%)',
    `densidad` DECIMAL(5, 3) NULL DEFAULT 0.885 COMMENT 'Densidad del anilox (0.885)',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    INDEX `idx_anilox_codigo` (`codigo`),
    INDEX `idx_anilox_maquina` (`maquina`),
    INDEX `idx_anilox_bcm` (`bcm`),
    INDEX `idx_anilox_lineatura` (`lineatura`),
    INDEX `idx_anilox_marca` (`marca`),
    INDEX `idx_anilox_maquina_lineatura` (`maquina`, `lineatura`),
    
    CONSTRAINT `chk_anilox_maquina_valida` 
        CHECK (`maquina` BETWEEN 11 AND 21),
        
    CONSTRAINT `chk_anilox_bcm_positivo` 
        CHECK (`bcm` > 0),
        
    CONSTRAINT `chk_anilox_lineatura_positiva` 
        CHECK (`lineatura` > 0),
        
    CONSTRAINT `chk_anilox_volumen_positivo` 
        CHECK (`volumen_real` > 0),
        
    CONSTRAINT `chk_anilox_marca_valida` 
        CHECK (`marca` IN ('APEX', 'ZECHER', 'HARPER')),
        
    CONSTRAINT `chk_anilox_factor_eficiencia_valido` 
        CHECK (`factor_eficiencia` IS NULL OR (`factor_eficiencia` >= 0 AND `factor_eficiencia` <= 100)),
        
    CONSTRAINT `chk_anilox_densidad_valida` 
        CHECK (`densidad` IS NULL OR `densidad` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Inventario de rodillos anilox';

SELECT '✓ Tabla anilox creada' as '';

-- =====================================================
-- TABLA 9: MACHINE_CONFIG
-- Descripción: Configuración de máquinas (carga muestra, etc.)
-- =====================================================
SELECT 'Creando tabla: machine_config...' as '';

CREATE TABLE IF NOT EXISTS `machine_config` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único de la configuración',
    `numero_maquina` INT NOT NULL UNIQUE COMMENT 'Número de máquina (11-21)',
    `carga_muestra` DECIMAL(10, 2) NULL COMMENT 'Carga muestra de la máquina en kg',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    INDEX `idx_machine_config_numero_maquina` (`numero_maquina`),
    
    CONSTRAINT `chk_machine_config_numero_valido` 
        CHECK (`numero_maquina` BETWEEN 11 AND 21),
        
    CONSTRAINT `chk_machine_config_carga_positiva` 
        CHECK (`carga_muestra` IS NULL OR `carga_muestra` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuración de máquinas';

SELECT '✓ Tabla machine_config creada' as '';

-- Insertar configuración inicial para todas las máquinas (11-21)
INSERT IGNORE INTO `machine_config` (`numero_maquina`, `carga_muestra`) VALUES
(11, NULL),
(12, NULL),
(13, NULL),
(14, NULL),
(15, NULL),
(16, NULL),
(17, NULL),
(18, NULL),
(19, NULL),
(20, NULL),
(21, NULL);

SELECT '✓ Configuración inicial de máquinas insertada' as '';

-- =====================================================
-- TABLA 10: MAQUINAS_BACKUP
-- Descripción: Backup histórico de programación (retención 6 meses)
-- =====================================================
SELECT 'Creando tabla: maquinas_backup...' as '';

CREATE TABLE IF NOT EXISTS `maquinas_backup` (
    `backup_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del registro de backup',
    `ot_sap` VARCHAR(50) NOT NULL COMMENT 'Orden de Trabajo SAP',
    `articulo` VARCHAR(50) NOT NULL COMMENT 'Código del artículo',
    `numero_maquina` INT NOT NULL COMMENT 'Número de máquina (11-21)',
    `cliente` VARCHAR(200) NOT NULL COMMENT 'Cliente',
    `referencia` VARCHAR(100) NULL COMMENT 'Referencia del producto',
    `td` VARCHAR(10) NULL COMMENT 'Código TD',
    `tipo_impresion` VARCHAR(50) NULL COMMENT 'Tipo de impresión',
    `numero_colores` INT NOT NULL DEFAULT 1 COMMENT 'Número de colores',
    `colores` JSON NOT NULL DEFAULT ('[]') COMMENT 'Array de colores',
    `kilos` DECIMAL(10,3) NOT NULL COMMENT 'Cantidad en kilogramos',
    `metros` DECIMAL(10,2) NULL COMMENT 'Metros a fabricar',
    `fecha_tinta_en_maquina` DATETIME(6) NOT NULL COMMENT 'Fecha de aplicación de tinta',
    `sustrato` VARCHAR(100) NOT NULL COMMENT 'Tipo de material',
    `estado` VARCHAR(20) NULL COMMENT 'Estado del programa',
    `observaciones` VARCHAR(1000) NULL COMMENT 'Observaciones adicionales',
    `last_action_by` VARCHAR(100) NULL COMMENT 'Último usuario que modificó',
    `last_action_at` DATETIME(6) NULL COMMENT 'Fecha de última acción',
    `preparando_started_at` DATETIME NULL COMMENT 'Fecha cuando se marcó como PREPARANDO',
    `created_by` INT NULL COMMENT 'Usuario creador',
    `updated_by` INT NULL COMMENT 'Usuario que actualizó',
    `created_at` DATETIME(6) NULL COMMENT 'Fecha de creación original',
    `updated_at` DATETIME(6) NULL COMMENT 'Fecha de actualización original',
    `backup_date` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha y hora del backup',
    `backup_reason` VARCHAR(100) NOT NULL COMMENT 'Razón del backup (TERMINADO, ELIMINADO, REEMPLAZADO)',
    `backup_user_id` INT NULL COMMENT 'ID del usuario que generó el backup',
    `backup_user_name` VARCHAR(100) NULL COMMENT 'Nombre del usuario que generó el backup',
    
    INDEX `idx_backup_ot_sap` (`ot_sap`),
    INDEX `idx_backup_articulo` (`articulo`),
    INDEX `idx_backup_numero_maquina` (`numero_maquina`),
    INDEX `idx_backup_cliente` (`cliente`),
    INDEX `idx_backup_estado` (`estado`),
    INDEX `idx_backup_fecha_tinta` (`fecha_tinta_en_maquina`),
    INDEX `idx_backup_date` (`backup_date`),
    INDEX `idx_backup_reason` (`backup_reason`),
    INDEX `idx_backup_user_id` (`backup_user_id`),
    INDEX `idx_backup_created_at` (`created_at`),
    INDEX `idx_backup_date_range` (`backup_date`, `numero_maquina`),
    INDEX `idx_backup_articulo_fecha` (`articulo`, `backup_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Backup histórico de programación de máquinas (retención 6 meses)';

SELECT '✓ Tabla maquinas_backup creada' as '';

-- =====================================================
-- TABLA 11: SYSTEM_CONFIGS
-- Descripción: Configuraciones del sistema
-- =====================================================
SELECT 'Creando tabla: system_configs...' as '';

CREATE TABLE IF NOT EXISTS `system_configs` (
    `Id` VARCHAR(100) NOT NULL PRIMARY KEY COMMENT 'ID único de la configuración',
    `Name` VARCHAR(200) NOT NULL COMMENT 'Nombre de la configuración',
    `Description` VARCHAR(500) NULL COMMENT 'Descripción de la configuración',
    `Value` VARCHAR(1000) NOT NULL COMMENT 'Valor de la configuración',
    `Type` VARCHAR(50) NOT NULL DEFAULT 'string' COMMENT 'Tipo de dato (string, number, boolean, json)',
    `Category` VARCHAR(100) NOT NULL DEFAULT 'General' COMMENT 'Categoría de la configuración',
    `Options` VARCHAR(1000) NULL COMMENT 'Opciones disponibles (JSON)',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación',
    `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Fecha de actualización',
    
    INDEX `idx_system_configs_category` (`Category`),
    INDEX `idx_system_configs_type` (`Type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuraciones del sistema';

SELECT '✓ Tabla system_configs creada' as '';

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS PARA BACKUP
-- =====================================================
SELECT 'Creando procedimientos almacenados...' as '';

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
    
    INSERT INTO `maquinas_backup` (
        `ot_sap`, `articulo`, `numero_maquina`, `cliente`, `referencia`, `td`,
        `tipo_impresion`, `numero_colores`, `colores`, `kilos`, `metros`,
        `fecha_tinta_en_maquina`, `sustrato`, `estado`, `observaciones`,
        `last_action_by`, `last_action_at`, `preparando_started_at`,
        `created_by`, `updated_by`, `created_at`, `updated_at`,
        `backup_date`, `backup_reason`, `backup_user_id`, `backup_user_name`
    )
    SELECT 
        `ot_sap`, `articulo`, `numero_maquina`, `cliente`, `referencia`, `td`,
        `tipo_impresion`, `numero_colores`, `colores`, `kilos`, `metros`,
        `fecha_tinta_en_maquina`, `sustrato`, `estado`, `observaciones`,
        `last_action_by`, `last_action_at`, `preparando_started_at`,
        `created_by`, `updated_by`, `created_at`, `updated_at`,
        NOW(6), p_backup_reason, p_backup_user_id, p_backup_user_name
    FROM `maquinas`
    WHERE `ot_sap` = p_ot_sap;
    
    COMMIT;
END$$

DROP PROCEDURE IF EXISTS `sp_backup_maquinas_by_estado`$$

CREATE PROCEDURE `sp_backup_maquinas_by_estado`(
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
    
    INSERT INTO `maquinas_backup` (
        `ot_sap`, `articulo`, `numero_maquina`, `cliente`, `referencia`, `td`,
        `tipo_impresion`, `numero_colores`, `colores`, `kilos`, `metros`,
        `fecha_tinta_en_maquina`, `sustrato`, `estado`, `observaciones`,
        `last_action_by`, `last_action_at`, `preparando_started_at`,
        `created_by`, `updated_by`, `created_at`, `updated_at`,
        `backup_date`, `backup_reason`, `backup_user_id`, `backup_user_name`
    )
    SELECT 
        `ot_sap`, `articulo`, `numero_maquina`, `cliente`, `referencia`, `td`,
        `tipo_impresion`, `numero_colores`, `colores`, `kilos`, `metros`,
        `fecha_tinta_en_maquina`, `sustrato`, `estado`, `observaciones`,
        `last_action_by`, `last_action_at`, `preparando_started_at`,
        `created_by`, `updated_by`, `created_at`, `updated_at`,
        NOW(6), p_backup_reason, p_backup_user_id, p_backup_user_name
    FROM `maquinas`
    WHERE `estado` = p_estado;
    
    COMMIT;
END$$

DELIMITER ;

SELECT '✓ Procedimientos almacenados creados' as '';

-- =====================================================
-- EVENTO: Limpieza automática de backups (6 meses)
-- =====================================================
SELECT 'Creando evento de limpieza automática...' as '';

SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS `evt_cleanup_old_backups`;

DELIMITER $$

CREATE EVENT `evt_cleanup_old_backups`
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 2 HOUR)
DO
BEGIN
    DELETE FROM `maquinas_backup`
    WHERE `backup_date` < DATE_SUB(NOW(), INTERVAL 6 MONTH);
END$$

DELIMITER ;

SELECT '✓ Evento de limpieza automática creado (ejecuta diariamente a las 2:00 AM)' as '';

-- ===== INSERTAR DATOS INICIALES =====
SELECT '========================================' as '';
SELECT 'INSERTANDO DATOS INICIALES' as '';
SELECT '========================================' as '';

-- Usuario administrador por defecto (password: admin123)
-- Hash generado con bcrypt: $2a$11$...
INSERT IGNORE INTO `users` (
    `UserCode`, 
    `Password`, 
    `FirstName`, 
    `LastName`, 
    `Role`, 
    `IsActive`,
    `CreatedAt`,
    `UpdatedAt`
) VALUES (
    'admin',
    '$2a$11$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa',
    'Administrador',
    'Sistema',
    'Admin',
    1,
    NOW(6),
    NOW(6)
);

SELECT '✓ Usuario administrador creado (UserCode: admin, Password: admin123)' as '';

-- ===== FINALIZACIÓN =====
SET FOREIGN_KEY_CHECKS = 1;

SELECT '========================================' as '';
SELECT 'CREACIÓN DE TABLAS COMPLETADA' as '';
SELECT '========================================' as '';

-- Verificar tablas creadas
SELECT 'Verificando tablas creadas...' as '';
SHOW TABLES;

-- Contar registros en cada tabla
SELECT 'users' as tabla, COUNT(*) as registros FROM `users`
UNION ALL
SELECT 'Activities' as tabla, COUNT(*) as registros FROM `Activities`
UNION ALL
SELECT 'refresh_tokens' as tabla, COUNT(*) as registros FROM `refresh_tokens`
UNION ALL
SELECT 'designs' as tabla, COUNT(*) as registros FROM `designs`
UNION ALL
SELECT 'maquinas' as tabla, COUNT(*) as registros FROM `maquinas`
UNION ALL
SELECT 'Documento' as tabla, COUNT(*) as registros FROM `Documento`
UNION ALL
SELECT 'condicionunica' as tabla, COUNT(*) as registros FROM `condicionunica`
UNION ALL
SELECT 'anilox' as tabla, COUNT(*) as registros FROM `anilox`
UNION ALL
SELECT 'machine_config' as tabla, COUNT(*) as registros FROM `machine_config`
UNION ALL
SELECT 'maquinas_backup' as tabla, COUNT(*) as registros FROM `maquinas_backup`
UNION ALL
SELECT 'system_configs' as tabla, COUNT(*) as registros FROM `system_configs`;

SELECT '========================================' as '';
SELECT '✓ PROCESO COMPLETADO EXITOSAMENTE' as '';
SELECT '========================================' as '';
