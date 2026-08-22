-- =============================================
-- Script: 00_MASTER_CREATE_ALL_TABLES.sql
-- Descripción: Script maestro para crear toda la base de datos FlexoAPP
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-03-06
-- Versión: 2.0
-- =============================================
-- IMPORTANTE: Este script elimina y recrea TODA la base de datos
-- Ejecutar solo en ambientes de desarrollo o cuando se necesite resetear
-- =============================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- =============================================
-- PASO 1: ELIMINAR BASE DE DATOS EXISTENTE (OPCIONAL)
-- =============================================
-- Descomentar la siguiente línea si deseas eliminar la base de datos existente
-- DROP DATABASE IF EXISTS flexoapp_bd;

-- =============================================
-- PASO 2: CREAR BASE DE DATOS
-- =============================================

CREATE DATABASE IF NOT EXISTS flexoapp_bd 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE flexoapp_bd;

SELECT '✓ Base de datos flexoapp_bd creada/seleccionada' as status;

-- =============================================
-- PASO 3: ELIMINAR TABLAS EXISTENTES (en orden correcto)
-- =============================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `cod_tintas`;
DROP TABLE IF EXISTS `pantone_colors`;
DROP TABLE IF EXISTS `maquinas_backup`;
DROP TABLE IF EXISTS `machine_config`;
DROP TABLE IF EXISTS `condicion_unica`;
DROP TABLE IF EXISTS `anilox`;
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `documentos`;
DROP TABLE IF EXISTS `maquinas`;
DROP TABLE IF EXISTS `designs`;
DROP TABLE IF EXISTS `Activities`;
DROP TABLE IF EXISTS `user_permissions`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✓ Tablas existentes eliminadas' as status;

-- =============================================
-- PASO 4: CREAR TABLA USERS
-- =============================================

CREATE TABLE `users` (
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

-- Usuario administrador por defecto (UserCode: admin, Password: admin123)
INSERT INTO `users` (`UserCode`, `Password`, `FirstName`, `LastName`, `Role`, `IsActive`, `CreatedAt`, `UpdatedAt`) 
VALUES ('admin', '$2a$11$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Administrador', 'Sistema', 'Admin', 1, NOW(6), NOW(6));

SELECT '✓ Tabla users creada' as status;

-- =============================================
-- PASO 5: CREAR TABLA PERMISSIONS
-- =============================================

CREATE TABLE `permissions` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Código único del permiso',
    `name` VARCHAR(200) NOT NULL COMMENT 'Nombre legible del permiso',
    `category` VARCHAR(50) NOT NULL COMMENT 'Categoría del permiso',
    `description` VARCHAR(500) NULL COMMENT 'Descripción del permiso',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Si el permiso está activo',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_permissions_code` (`code`),
    INDEX `idx_permissions_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de permisos del sistema';

SELECT '✓ Tabla permissions creada' as status;

-- =============================================
-- PASO 6: CREAR TABLA USER_PERMISSIONS
-- =============================================

CREATE TABLE `user_permissions` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL COMMENT 'ID del usuario',
    `permission_code` VARCHAR(100) NOT NULL COMMENT 'Código del permiso',
    `is_granted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Si el permiso está concedido',
    `granted_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de concesión',
    `granted_by` INT NULL COMMENT 'ID del usuario que concedió el permiso',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uq_user_permission` (`user_id`, `permission_code`),
    INDEX `idx_user_permissions_user` (`user_id`),
    INDEX `idx_user_permissions_code` (`permission_code`),
    CONSTRAINT `fk_user_permissions_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`Id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_permissions_granted_by` FOREIGN KEY (`granted_by`) REFERENCES `users`(`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Permisos asignados a cada usuario';

SELECT '✓ Tabla user_permissions creada' as status;

-- =============================================
-- PASO 7: CREAR TABLA ACTIVITIES
-- =============================================

CREATE TABLE `Activities` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único de la actividad',
    `Action` VARCHAR(200) NOT NULL COMMENT 'Acción realizada',
    `Description` VARCHAR(500) NOT NULL COMMENT 'Descripción detallada',
    `Timestamp` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha y hora de la actividad',
    `Module` VARCHAR(100) NOT NULL COMMENT 'Módulo del sistema',
    `Details` VARCHAR(1000) NULL COMMENT 'Detalles adicionales en JSON',
    `UserId` INT NOT NULL COMMENT 'ID del usuario',
    `UserCode` VARCHAR(50) NULL COMMENT 'Código del usuario',
    `IpAddress` VARCHAR(45) NULL COMMENT 'Dirección IP',
    `EntityType` VARCHAR(100) NULL COMMENT 'Tipo de entidad afectada',
    `EntityId` INT NULL COMMENT 'ID de la entidad afectada',
    `EntityName` VARCHAR(200) NULL COMMENT 'Nombre de la entidad afectada',
    `Duration` TIME(6) NULL COMMENT 'Duración de la acción',
    `OldValues` VARCHAR(2000) NULL COMMENT 'Valores anteriores (JSON)',
    `NewValues` VARCHAR(2000) NULL COMMENT 'Valores nuevos (JSON)',
    FOREIGN KEY (`UserId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_activities_userid` (`UserId`),
    INDEX `idx_activities_timestamp` (`Timestamp`),
    INDEX `idx_activities_module` (`Module`),
    INDEX `idx_activities_action` (`Action`),
    INDEX `idx_activities_usercode` (`UserCode`),
    INDEX `idx_activities_entity` (`EntityType`, `EntityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de actividades y auditoría del sistema';

SELECT '✓ Tabla Activities creada' as status;

-- =============================================
-- PASO 8: CREAR TABLA DESIGNS
-- =============================================

CREATE TABLE `designs` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `ArticleF` VARCHAR(50) NOT NULL UNIQUE,
    `Client` VARCHAR(200) NULL,
    `Description` VARCHAR(500) NULL,
    `Substrate` VARCHAR(100) NULL,
    `Type` VARCHAR(50) NULL,
    `ancho_mm` INT NULL,
    `PrintType` VARCHAR(50) NULL,
    `Status` VARCHAR(50) NULL,
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
    `ColorCount` INT DEFAULT 0,
    `CreatedDate` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `LastModified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_article` (`ArticleF`),
    INDEX `idx_client` (`Client`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✓ Tabla designs creada' as status;

-- =============================================
-- PASO 9: CREAR TABLA MAQUINAS
-- =============================================

CREATE TABLE `maquinas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `numero_maquina` INT NOT NULL,
    `ot_sap` VARCHAR(50) NOT NULL,
    `articulo` VARCHAR(50) NOT NULL,
    `cliente` VARCHAR(200) NOT NULL,
    `referencia` VARCHAR(100) NULL,
    `td` VARCHAR(50) NULL,
    `tipo_impresion` VARCHAR(50) NULL,
    `numero_colores` INT DEFAULT 0,
    `colores` JSON NULL,
    `kilos` DECIMAL(10,3) DEFAULT 0.001,
    `metros` DECIMAL(10,0) NULL,
    `sustrato` VARCHAR(100) NULL,
    `fecha_tinta_en_maquina` DATETIME NULL,
    `estado` VARCHAR(50) NULL,
    `observaciones` TEXT NULL,
    `last_action_by` VARCHAR(100) NULL,
    `last_action_at` DATETIME NULL,
    `preparando_started_at` DATETIME NULL,
    `orden_excel` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` INT NULL,
    `updated_by` INT NULL,
    UNIQUE KEY `unique_ot_sap` (`ot_sap`),
    INDEX `idx_numero_maquina` (`numero_maquina`),
    INDEX `idx_articulo` (`articulo`),
    INDEX `idx_estado` (`estado`),
    INDEX `idx_fecha_tinta` (`fecha_tinta_en_maquina`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✓ Tabla maquinas creada' as status;

-- =============================================
-- PASO 10: CREAR TABLA DOCUMENTOS
-- =============================================

CREATE TABLE `documentos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `articulo` VARCHAR(50) NOT NULL,
    `nombre_archivo` VARCHAR(255) NOT NULL,
    `tipo_archivo` VARCHAR(50) NOT NULL,
    `tamano_bytes` BIGINT NOT NULL,
    `ruta_archivo` VARCHAR(500) NOT NULL,
    `descripcion` TEXT NULL,
    `subido_por` INT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`subido_por`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_articulo` (`articulo`),
    INDEX `idx_tipo_archivo` (`tipo_archivo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✓ Tabla documentos creada' as status;

-- =============================================
-- PASO 11: CREAR TABLA REFRESH_TOKENS
-- =============================================

CREATE TABLE `refresh_tokens` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `token` VARCHAR(500) NOT NULL UNIQUE,
    `expires_at` DATETIME NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `revoked_at` DATETIME NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_token` (`token`),
    INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✓ Tabla refresh_tokens creada' as status;

-- =============================================
-- PASO 12: CREAR TABLA ANILOX
-- =============================================

CREATE TABLE `anilox` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del anilox',
    `codigo` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único del anilox',
    `maquina` INT NOT NULL COMMENT 'Número de máquina (11-21)',
    `bcm` DECIMAL(5, 2) NOT NULL COMMENT 'BCM (Billion Cubic Microns) - soporta decimales como 8.3',
    `lineatura` INT NOT NULL COMMENT 'Lineatura en LPI (Lines Per Inch)',
    `marca` VARCHAR(50) NOT NULL COMMENT 'Marca del anilox (APEX, ZECHER, HARPER)',
    `volumen_real` DECIMAL(10, 2) NOT NULL COMMENT 'Volumen real medido',
    `factor_eficiencia` DECIMAL(5, 2) NULL DEFAULT 35.00 COMMENT 'Factor de eficiencia del anilox (35%)',
    `densidad` DECIMAL(5, 3) NULL DEFAULT 0.885 COMMENT 'Densidad del anilox (0.885)',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    INDEX `idx_maquina` (`maquina`),
    INDEX `idx_codigo` (`codigo`),
    INDEX `idx_marca` (`marca`),
    INDEX `idx_lineatura` (`lineatura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✓ Tabla anilox creada' as status;

-- =============================================
-- PASO 13: CREAR TABLA CONDICION_UNICA
-- =============================================

CREATE TABLE `condicion_unica` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `f_articulo` VARCHAR(50) NOT NULL UNIQUE,
    `estante` VARCHAR(50) NULL,
    `carpeta` VARCHAR(50) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_f_articulo` (`f_articulo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✓ Tabla condicion_unica creada' as status;

-- =============================================
-- PASO 14: CREAR TABLA MACHINE_CONFIG
-- =============================================

CREATE TABLE `machine_config` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `numero_maquina` INT NOT NULL UNIQUE,
    `nombre` VARCHAR(100) NOT NULL,
    `ancho_max_mm` INT NULL,
    `velocidad_max_mpm` INT NULL,
    `numero_colores_max` INT NULL,
    `estado` VARCHAR(50) DEFAULT 'Activa',
    `observaciones` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_numero_maquina` (`numero_maquina`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✓ Tabla machine_config creada' as status;

-- =============================================
-- PASO 15: CREAR TABLA MAQUINAS_BACKUP
-- =============================================

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
    `Colores` JSON NOT NULL COMMENT 'Array de colores en JSON',
    `Kilos` DECIMAL(10,3) NOT NULL DEFAULT 0.001 COMMENT 'Cantidad en kilogramos',
    `Metros` DECIMAL(10,2) NULL COMMENT 'Metros a fabricar',
    `FechaTintaEnMaquina` DATETIME(6) NOT NULL COMMENT 'Fecha de aplicación de tinta',
    `Sustrato` VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'Tipo de material',
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
    `backup_reason` VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'Razón del backup',
    `backup_user_id` INT NULL COMMENT 'ID del usuario que generó el backup',
    `backup_user_name` VARCHAR(100) NULL COMMENT 'Nombre del usuario que generó el backup',
    
    INDEX `idx_backup_ot_sap` (`ot_sap`),
    INDEX `idx_backup_articulo` (`Articulo`),
    INDEX `idx_backup_numero_maquina` (`NumeroMaquina`),
    INDEX `idx_backup_estado` (`Estado`),
    INDEX `idx_backup_date` (`backup_date`),
    INDEX `idx_backup_reason` (`backup_reason`),
    INDEX `idx_backup_date_range` (`backup_date`, `NumeroMaquina`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Backup histórico de programación de máquinas (retención 3 meses)';

SELECT '✓ Tabla maquinas_backup creada' as status;

-- =============================================
-- PASO 16: CREAR TABLA COD_TINTAS
-- =============================================

CREATE TABLE `cod_tintas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `articulo` VARCHAR(50) NOT NULL,
    `descripcion` VARCHAR(200) NULL,
    `estante` VARCHAR(100) NULL COMMENT 'Estante de ubicación',
    `carpeta` VARCHAR(100) NULL COMMENT 'Número de carpeta',
    `colores_data` JSON NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    INDEX `idx_articulo` (`articulo`),
    INDEX `idx_estante` (`estante`),
    INDEX `idx_carpeta` (`carpeta`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✓ Tabla cod_tintas creada' as status;

-- =============================================
-- PASO 16B: CREAR TABLA PANTONE_COLORS
-- =============================================

CREATE TABLE `pantone_colors` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `display_name` VARCHAR(100) NOT NULL,
    `hex` VARCHAR(10) NOT NULL DEFAULT '#000000',
    `rgb_r` INT NOT NULL DEFAULT 0,
    `rgb_g` INT NOT NULL DEFAULT 0,
    `rgb_b` INT NOT NULL DEFAULT 0,
    `cmyk_c` INT NOT NULL DEFAULT 0,
    `cmyk_m` INT NOT NULL DEFAULT 0,
    `cmyk_y` INT NOT NULL DEFAULT 0,
    `cmyk_k` INT NOT NULL DEFAULT 0,
    `lab_l` DOUBLE NULL,
    `lab_a` DOUBLE NULL,
    `lab_b` DOUBLE NULL,
    `category` VARCHAR(50) NOT NULL DEFAULT 'Manual',
    `color_type` VARCHAR(20) NOT NULL DEFAULT 'pantone',
    `is_custom` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_pantone_code` (`code`),
    INDEX `idx_pantone_type` (`color_type`),
    INDEX `idx_pantone_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✓ Tabla pantone_colors creada' as status;

-- =============================================
-- PASO 17: INSERTAR PERMISOS PREDETERMINADOS
-- =============================================

INSERT INTO `permissions` (`code`, `name`, `description`, `category`, `is_active`) VALUES
-- Usuarios
('users.view',              'Ver usuarios',                    'Permite ver la lista de usuarios del sistema',              'users',    1),
('users.create',            'Crear usuarios',                  'Permite crear nuevos usuarios',                             'users',    1),
('users.edit',              'Editar usuarios',                 'Permite modificar información de usuarios existentes',       'users',    1),
('users.delete',            'Eliminar usuarios',               'Permite eliminar usuarios del sistema',                      'users',    1),
-- Sistema
('system.configure',        'Configurar sistema',              'Permite modificar configuraciones generales del sistema',    'system',   1),
('permissions.manage',      'Gestión de permisos',             'Permite administrar permisos de usuarios',                   'system',   1),
('settings.change',         'Cambiar ajustes',                 'Permite modificar ajustes de la aplicación',                 'system',   1),
-- Módulos
('module.settings',         'Módulo de configuraciones',       'Acceso al módulo de configuraciones',                       'modules',  1),
('module.reports',          'Módulo de reportes',              'Acceso al módulo de reportes',                              'modules',  1),
('module.machines',         'Módulo de máquinas',              'Acceso al módulo de máquinas',                              'modules',  1),
('module.design',           'Módulo de diseño',                'Acceso al módulo de diseño',                                'modules',  1),
('module.documents',        'Módulo de documentos',            'Acceso al módulo de documentos',                            'modules',  1),
('module.information',      'Módulo de información',           'Acceso al módulo de información',                           'modules',  1),
('module.unique_condition', 'Módulo de condición única',       'Acceso al módulo de condición única',                       'modules',  1),
('module.order_query',      'Módulo de consulta de pedido',    'Acceso al módulo de consulta de pedido',                    'modules',  1),
-- Acciones
('action.export',           'Exportar datos',                  'Permite exportar datos del sistema',                        'actions',  1),
('action.import',           'Importar Excel',                  'Permite importar archivos Excel',                           'actions',  1),
('action.add_programming',  'Agregar programación',            'Permite agregar programación manual',                       'actions',  1),
('action.create',           'Crear registros',                 'Permite crear nuevos registros',                            'actions',  1),
('reports.view',            'Ver reportes',                    'Permite ver reportes del sistema',                          'actions',  1),
-- Máquinas
('machines.status.prealistando', 'Cambiar a Prealistando',     'Permite cambiar estado a Prealistando',                     'machines', 1),
('machines.status.listo',        'Cambiar a Listo',            'Permite cambiar estado a Listo',                            'machines', 1),
('machines.status.corriendo',    'Cambiar a Corriendo',        'Permite cambiar estado a Corriendo',                        'machines', 1),
('machines.status.terminado',    'Cambiar a Terminado',        'Permite cambiar estado a Terminado',                        'machines', 1),
('machines.status.suspendido',   'Cambiar a Suspendido',       'Permite cambiar estado a Suspendido',                       'machines', 1),
('machines.send_message',        'Enviar mensajes',            'Permite enviar mensajes a programas',                       'machines', 1),
('machines.print',               'Imprimir formatos',          'Permite imprimir formatos FF459',                           'machines', 1);

SELECT '✓ Permisos predeterminados insertados' as status;

-- =============================================
-- PASO 18: ASIGNAR TODOS LOS PERMISOS AL ADMIN
-- =============================================

INSERT INTO `user_permissions` (`user_id`, `permission_code`, `is_granted`, `granted_by`)
SELECT 1, `code`, 1, 1 FROM `permissions` WHERE `is_active` = 1;

SELECT '✓ Permisos asignados al usuario admin' as status;

-- =============================================
-- PASO 19: CREAR ÍNDICES ADICIONALES PARA AUDITORÍA
-- =============================================

CREATE INDEX `idx_activities_action_date` ON `activities` (`action`, `created_at`);
CREATE INDEX `idx_activities_module_date` ON `activities` (`module`, `created_at`);
CREATE INDEX `idx_activities_user_date` ON `activities` (`user_id`, `created_at`);

SELECT '✓ Índices de auditoría creados' as status;

-- =============================================
-- PASO 20: RESTAURAR CONFIGURACIÓN
-- =============================================

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- =============================================
-- RESUMEN FINAL
-- =============================================

SELECT '========================================' as '';
SELECT '✓ BASE DE DATOS CREADA EXITOSAMENTE' as status;
SELECT '========================================' as '';

SELECT 
    TABLE_NAME as 'Tabla',
    TABLE_ROWS as 'Filas',
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) as 'Tamaño (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'flexoapp_bd'
ORDER BY TABLE_NAME;

SELECT '========================================' as '';
SELECT 'Usuario admin creado: admin / admin123' as info;
SELECT 'Todos los permisos asignados al admin' as info;
SELECT '========================================' as '';

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
