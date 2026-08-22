-- =====================================================
-- Script: 15_CREATE_PERMISSIONS_TABLES.sql
-- Descripción: Crear tablas permissions y user_permissions
-- Compatible con el modelo de Entity Framework
-- Fecha: 2026-03-28
-- =====================================================
-- IDEMPOTENTE: puede ejecutarse múltiples veces
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Seleccionar la base de datos
USE flexoapp_bd;

-- =====================================================
-- TABLA: permissions
-- =====================================================

CREATE TABLE IF NOT EXISTS `permissions` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Código único del permiso',
    `name` VARCHAR(200) NOT NULL COMMENT 'Nombre legible del permiso',
    `category` VARCHAR(50) NOT NULL COMMENT 'Categoría del permiso',
    `description` VARCHAR(500) NULL COMMENT 'Descripción del permiso',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Si el permiso está activo',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_permissions_code` (`code`),
    INDEX `idx_permissions_category` (`category`),
    INDEX `idx_permissions_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de permisos del sistema';

SELECT '✓ Tabla permissions creada/verificada' AS status;

-- =====================================================
-- TABLA: user_permissions
-- =====================================================

CREATE TABLE IF NOT EXISTS `user_permissions` (
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
    INDEX `idx_user_permissions_granted` (`is_granted`),
    CONSTRAINT `fk_user_permissions_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`Id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_permissions_granted_by` FOREIGN KEY (`granted_by`) REFERENCES `users`(`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Permisos asignados a cada usuario';

SELECT '✓ Tabla user_permissions creada/verificada' AS status;

-- =====================================================
-- INSERTAR PERMISOS PREDETERMINADOS (si no existen)
-- =====================================================

INSERT IGNORE INTO `permissions` (`code`, `name`, `category`, `description`, `is_active`) VALUES
-- Usuarios
('users.view',              'Ver usuarios',                    'users',    'Permite ver la lista de usuarios del sistema', 1),
('users.create',            'Crear usuarios',                  'users',    'Permite crear nuevos usuarios', 1),
('users.edit',              'Editar usuarios',                 'users',    'Permite modificar información de usuarios existentes', 1),
('users.delete',            'Eliminar usuarios',               'users',    'Permite eliminar usuarios del sistema', 1),

-- Sistema
('system.configure',        'Configurar sistema',              'system',   'Permite modificar configuraciones generales del sistema', 1),
('permissions.manage',      'Gestión de permisos',             'system',   'Permite administrar permisos de usuarios', 1),
('settings.change',         'Cambiar ajustes',                 'system',   'Permite modificar ajustes de la aplicación', 1),

-- Módulos
('module.settings',         'Módulo de configuraciones',       'modules',  'Acceso al módulo de configuraciones', 1),
('module.reports',          'Módulo de reportes',              'modules',  'Acceso al módulo de reportes', 1),
('module.machines',         'Módulo de máquinas',              'modules',  'Acceso al módulo de máquinas', 1),
('module.design',           'Módulo de diseño',                'modules',  'Acceso al módulo de diseño', 1),
('module.documents',        'Módulo de documentos',            'modules',  'Acceso al módulo de documentos', 1),
('module.information',      'Módulo de información',           'modules',  'Acceso al módulo de información', 1),
('module.unique_condition', 'Módulo de condición única',       'modules',  'Acceso al módulo de condición única', 1),
('module.order_query',      'Módulo de consulta de pedido',    'modules',  'Acceso al módulo de consulta de pedido', 1),

-- Acciones
('action.export',           'Exportar datos',                  'actions',  'Permite exportar datos del sistema', 1),
('action.import',           'Importar Excel',                  'actions',  'Permite importar archivos Excel', 1),
('action.add_programming',  'Agregar programación',            'actions',  'Permite agregar programación manual', 1),
('action.create',           'Crear registros',                 'actions',  'Permite crear nuevos registros', 1),
('reports.view',            'Ver reportes',                    'actions',  'Permite ver reportes del sistema', 1),

-- Máquinas - Estados
('machines.status.prealistando', 'Cambiar a Prealistando',     'machines', 'Permite cambiar estado a Prealistando', 1),
('machines.status.listo',        'Cambiar a Listo',            'machines', 'Permite cambiar estado a Listo', 1),
('machines.status.corriendo',    'Cambiar a Corriendo',        'machines', 'Permite cambiar estado a Corriendo', 1),
('machines.status.terminado',    'Cambiar a Terminado',        'machines', 'Permite cambiar estado a Terminado', 1),
('machines.status.suspendido',   'Cambiar a Suspendido',       'machines', 'Permite cambiar estado a Suspendido', 1),
('machines.send_message',        'Enviar mensajes',            'machines', 'Permite enviar mensajes a programas', 1),
('machines.print',               'Imprimir formatos',          'machines', 'Permite imprimir formatos FF459', 1),

-- Diseño
('design.create',                'Crear diseños',              'design',   'Permite crear nuevos diseños', 1),
('design.edit',                  'Editar diseños',             'design',   'Permite editar diseños existentes', 1),
('design.delete',                'Eliminar diseños',           'design',   'Permite eliminar diseños', 1),
('design.import',                'Importar diseños',           'design',   'Permite importar diseños desde Excel', 1),
('design.export',                'Exportar diseños',           'design',   'Permite exportar diseños a Excel', 1);

SELECT '✓ Permisos predeterminados insertados' AS status;

-- =====================================================
-- ASIGNAR TODOS LOS PERMISOS AL ADMIN (usuario ID 1)
-- =====================================================

INSERT IGNORE INTO `user_permissions` (`user_id`, `permission_code`, `is_granted`, `granted_by`)
SELECT 1, `code`, 1, 1
FROM `permissions`
WHERE `is_active` = 1;

SELECT '✓ Todos los permisos asignados al usuario admin' AS status;

-- =====================================================
SET FOREIGN_KEY_CHECKS = 1;

SELECT '========================================' AS '';
SELECT '✓ TABLAS DE PERMISOS LISTAS' AS status;
SELECT '========================================' AS '';
