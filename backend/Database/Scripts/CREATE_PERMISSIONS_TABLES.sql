-- =====================================================
-- Script de Migración: Sistema de Permisos
-- Fecha: 2026-02-15
-- Descripción: Crea las tablas de permisos y las puebla
--              con los permisos iniciales del sistema
-- =====================================================

USE flexoapp_bd;

-- =====================================================
-- 1. CREAR TABLA DE PERMISOS
-- =====================================================

CREATE TABLE IF NOT EXISTS `permissions` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Código único del permiso (ej: users.view)',
    `name` VARCHAR(200) NOT NULL COMMENT 'Nombre descriptivo del permiso',
    `category` VARCHAR(50) NOT NULL COMMENT 'Categoría del permiso (users, system, modules, actions)',
    `description` VARCHAR(500) NULL COMMENT 'Descripción detallada del permiso',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Si el permiso está activo en el sistema',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_category` (`category`),
    INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla de permisos del sistema';

-- =====================================================
-- 2. CREAR TABLA DE PERMISOS DE USUARIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS `user_permissions` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL COMMENT 'ID del usuario (FK a users)',
    `permission_code` VARCHAR(100) NOT NULL COMMENT 'Código del permiso',
    `is_granted` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Si el permiso está concedido',
    `granted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha en que se concedió',
    `granted_by` INT NULL COMMENT 'ID del usuario que concedió el permiso',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`Id`) ON DELETE CASCADE,
    FOREIGN KEY (`granted_by`) REFERENCES `users`(`Id`) ON DELETE SET NULL,
    UNIQUE KEY `unique_user_permission` (`user_id`, `permission_code`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_permission_code` (`permission_code`),
    INDEX `idx_is_granted` (`is_granted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla de permisos asignados a usuarios';

-- =====================================================
-- 3. POBLAR TABLA DE PERMISOS
-- =====================================================

-- Limpiar permisos existentes (solo si es necesario)
-- DELETE FROM `permissions`;

-- CATEGORÍA: GESTIÓN DE USUARIOS
INSERT INTO `permissions` (`code`, `name`, `category`, `description`, `is_active`) VALUES
('users.view', 'Ver usuarios', 'users', 'Permite ver la lista de usuarios del sistema', TRUE),
('users.create', 'Crear usuarios', 'users', 'Permite crear nuevos usuarios', TRUE),
('users.edit', 'Editar usuarios', 'users', 'Permite modificar información de usuarios existentes', TRUE),
('users.delete', 'Eliminar usuarios', 'users', 'Permite eliminar usuarios del sistema', TRUE)
ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `description` = VALUES(`description`),
    `updated_at` = CURRENT_TIMESTAMP;

-- CATEGORÍA: CONFIGURACIÓN DEL SISTEMA
INSERT INTO `permissions` (`code`, `name`, `category`, `description`, `is_active`) VALUES
('system.configure', 'Configurar sistema', 'system', 'Permite modificar configuraciones generales del sistema', TRUE),
('permissions.manage', 'Gestión de permisos', 'system', 'Permite administrar permisos de usuarios', TRUE),
('settings.change', 'Cambiar ajustes', 'system', 'Permite modificar ajustes de la aplicación', TRUE)
ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `description` = VALUES(`description`),
    `updated_at` = CURRENT_TIMESTAMP;

-- CATEGORÍA: ACCESO A MÓDULOS
INSERT INTO `permissions` (`code`, `name`, `category`, `description`, `is_active`) VALUES
('module.settings', 'Módulo de configuraciones', 'modules', 'Acceso al módulo de configuraciones', TRUE),
('module.reports', 'Módulo de reportes', 'modules', 'Acceso al módulo de reportes', TRUE),
('module.machines', 'Módulo de máquinas', 'modules', 'Acceso al módulo de máquinas', TRUE),
('module.design', 'Módulo de diseño', 'modules', 'Acceso al módulo de diseño', TRUE),
('module.documents', 'Módulo de documentos', 'modules', 'Acceso al módulo de documentos', TRUE),
('module.information', 'Módulo de información', 'modules', 'Acceso al módulo de información', TRUE),
('module.unique_condition', 'Módulo de condición única', 'modules', 'Acceso al módulo de condición única', TRUE),
('module.order_query', 'Módulo de consulta de pedido', 'modules', 'Acceso al módulo de consulta de pedido', TRUE)
ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `description` = VALUES(`description`),
    `updated_at` = CURRENT_TIMESTAMP;

-- CATEGORÍA: ACCIONES ESPECÍFICAS
INSERT INTO `permissions` (`code`, `name`, `category`, `description`, `is_active`) VALUES
('action.export', 'Botón de exportar', 'actions', 'Permite usar la función de exportar datos', TRUE),
('action.import', 'Botón de importar', 'actions', 'Permite usar la función de importar datos', TRUE),
('action.add_programming', 'Botón de agregar programación', 'actions', 'Permite agregar nuevas programaciones', TRUE),
('action.create', 'Botón de crear', 'actions', 'Permite usar botones de creación', TRUE),
('reports.view', 'Ver reportes', 'actions', 'Permite visualizar reportes del sistema', TRUE)
ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `description` = VALUES(`description`),
    `updated_at` = CURRENT_TIMESTAMP;

-- CATEGORÍA: ACCIONES DEL MÓDULO DE MÁQUINAS
INSERT INTO `permissions` (`code`, `name`, `category`, `description`, `is_active`) VALUES
('machines.status.prealistando', 'Cambiar estado a Prealistando', 'machines_actions', 'Permite cambiar el estado de una orden a Prealistando', TRUE),
('machines.status.listo', 'Cambiar estado a Listo', 'machines_actions', 'Permite cambiar el estado de una orden a Listo', TRUE),
('machines.status.corriendo', 'Cambiar estado a Corriendo', 'machines_actions', 'Permite cambiar el estado de una orden a Corriendo', TRUE),
('machines.status.terminado', 'Cambiar estado a Terminado', 'machines_actions', 'Permite cambiar el estado de una orden a Terminado', TRUE),
('machines.status.suspendido', 'Cambiar estado a Suspendido', 'machines_actions', 'Permite cambiar el estado de una orden a Suspendido', TRUE),
('machines.send_message', 'Enviar mensaje', 'machines_actions', 'Permite enviar mensajes en el módulo de máquinas', TRUE),
('machines.print', 'Imprimir', 'machines_actions', 'Permite imprimir órdenes de trabajo', TRUE)
ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `description` = VALUES(`description`),
    `updated_at` = CURRENT_TIMESTAMP;

-- =====================================================
-- 4. CONCEDER TODOS LOS PERMISOS AL ADMIN
-- =====================================================

-- Obtener el ID del primer usuario admin
SET @admin_user_id = (SELECT Id FROM users WHERE Role = 'Admin' LIMIT 1);

-- Si existe un admin, concederle todos los permisos
INSERT INTO `user_permissions` (`user_id`, `permission_code`, `is_granted`, `granted_by`)
SELECT 
    @admin_user_id,
    `code`,
    TRUE,
    @admin_user_id
FROM `permissions`
WHERE @admin_user_id IS NOT NULL
ON DUPLICATE KEY UPDATE
    `is_granted` = TRUE,
    `granted_at` = CURRENT_TIMESTAMP,
    `updated_at` = CURRENT_TIMESTAMP;

-- =====================================================
-- 5. VERIFICACIÓN
-- =====================================================

-- Mostrar todos los permisos creados
SELECT 
    '✅ PERMISOS CREADOS' as 'RESULTADO',
    COUNT(*) as 'Total de Permisos'
FROM `permissions`;

-- Mostrar permisos por categoría
SELECT 
    category as 'Categoría',
    COUNT(*) as 'Cantidad de Permisos'
FROM `permissions`
GROUP BY category
ORDER BY category;

-- Mostrar permisos del admin (si existe)
SELECT 
    '✅ PERMISOS DEL ADMIN' as 'RESULTADO',
    COUNT(*) as 'Permisos Concedidos'
FROM `user_permissions`
WHERE user_id = @admin_user_id AND is_granted = TRUE;

-- Mostrar detalle de las tablas creadas
SHOW CREATE TABLE `permissions`;
SHOW CREATE TABLE `user_permissions`;

SELECT '✅ Migración de permisos completada exitosamente' as 'ESTADO';
