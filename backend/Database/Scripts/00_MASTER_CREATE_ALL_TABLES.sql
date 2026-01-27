-- =====================================================
-- SCRIPT MAESTRO: CREAR TODAS LAS TABLAS DEL SISTEMA
-- =====================================================
-- Sistema: FlexoAPP - Sistema de Gestión Flexográfica
-- Base de datos: MySQL 8.0+ (Railway/Render)
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-01-17
-- Versión: 2.0
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
    
    INDEX `idx_activities_userid` (`UserId`),
    INDEX `idx_activities_timestamp` (`Timestamp`),
    INDEX `idx_activities_module` (`Module`),
    INDEX `idx_activities_action` (`Action`),
    INDEX `idx_activities_usercode` (`UserCode`),
    
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
    `Status` VARCHAR(50) NULL DEFAULT 'DRAFT' COMMENT 'Estado del diseño',
    `CreatedDate` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación',
    `LastModified` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Última modificación',
    
    INDEX `idx_designs_articlef` (`ArticleF`),
    INDEX `idx_designs_client` (`Client`),
    INDEX `idx_designs_status` (`Status`),
    INDEX `idx_designs_substrate` (`Substrate`),
    INDEX `idx_designs_created` (`CreatedDate`),
    
    CONSTRAINT `chk_designs_colorcount_valido` 
        CHECK (`ColorCount` >= 0 AND `ColorCount` <= 10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Diseños flexográficos';

SELECT '✓ Tabla designs creada' as '';

-- =====================================================
-- TABLA 5: MAQUINAS
-- Descripción: Máquinas de producción flexográfica
-- =====================================================
SELECT 'Creando tabla: maquinas...' as '';

CREATE TABLE IF NOT EXISTS `maquinas` (
    `ot_sap` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'Orden de Trabajo SAP',
    `Articulo` VARCHAR(50) NOT NULL COMMENT 'Código del artículo',
    `NumeroMaquina` INT NOT NULL COMMENT 'Número de máquina (11-21)',
    `Cliente` VARCHAR(200) NOT NULL COMMENT 'Cliente',
    `Referencia` VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'Referencia del producto',
    `Td` VARCHAR(10) NOT NULL DEFAULT '' COMMENT 'Código TD',
    `NumeroColores` INT NOT NULL DEFAULT 1 COMMENT 'Número de colores',
    `Colores` JSON NOT NULL DEFAULT ('[]') COMMENT 'Array de colores',
    `Kilos` DECIMAL(10,2) NOT NULL COMMENT 'Cantidad en kilogramos',
    `FechaTintaEnMaquina` DATETIME(6) NOT NULL COMMENT 'Fecha de aplicación de tinta',
    `Sustrato` VARCHAR(100) NOT NULL COMMENT 'Tipo de material',
    `Estado` VARCHAR(20) NULL DEFAULT NULL COMMENT 'Estado del programa',
    `Observaciones` VARCHAR(1000) NULL COMMENT 'Observaciones adicionales',
    `LastActionBy` VARCHAR(100) NULL COMMENT 'Último usuario que modificó',
    `LastActionAt` DATETIME(6) NULL COMMENT 'Fecha de última acción',
    `preparando_started_at` DATETIME NULL COMMENT 'Fecha y hora cuando se marcó como PREPARANDO',
    `CreatedBy` INT NULL COMMENT 'Usuario creador',
    `UpdatedBy` INT NULL COMMENT 'Usuario que actualizó',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación',
    `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Fecha de actualización',
    
    INDEX `idx_maquinas_numero` (`NumeroMaquina`),
    INDEX `idx_maquinas_articulo` (`Articulo`),
    INDEX `idx_maquinas_cliente` (`Cliente`),
    INDEX `idx_maquinas_estado` (`Estado`),
    INDEX `idx_maquinas_fecha_tinta` (`FechaTintaEnMaquina`),
    INDEX `idx_maquinas_created_by` (`CreatedBy`),
    INDEX `idx_maquinas_updated_by` (`UpdatedBy`),
    
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
        
    CONSTRAINT `chk_maquinas_numero_valido` 
        CHECK (`NumeroMaquina` BETWEEN 11 AND 21),
        
    CONSTRAINT `chk_maquinas_kilos_positivos` 
        CHECK (`Kilos` > 0),
        
    CONSTRAINT `chk_maquinas_colores_positivos` 
        CHECK (`NumeroColores` > 0 AND `NumeroColores` <= 10),
        
    CONSTRAINT `chk_maquinas_estado_valido` 
        CHECK (`Estado` IS NULL OR `Estado` IN ('PREPARANDO', 'LISTO', 'CORRIENDO', 'SUSPENDIDO', 'TERMINADO'))
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
    `farticulo` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código del artículo F',
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

-- ===== INSERTAR DATOS INICIALES =====
SELECT '========================================' as '';
SELECT 'INSERTANDO DATOS INICIALES' as '';
SELECT '========================================' as '';

-- Usuario administrador por defecto
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
    '$2a$11$rOzJqQZ8kVJ8kVJ8kVJ8kOzJqQZ8kVJ8kVJ8kVJ8kOzJqQZ8kVJ8k.',
    'Administrador',
    'Sistema',
    'Admin',
    1,
    NOW(6),
    NOW(6)
);

SELECT '✓ Usuario administrador creado' as '';

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
SELECT 'condicionunica' as tabla, COUNT(*) as registros FROM `condicionunica`;

SELECT '========================================' as '';
SELECT '✓ PROCESO COMPLETADO EXITOSAMENTE' as '';
SELECT '========================================' as '';
