-- =====================================================
-- SCRIPT: CREAR TABLA PEDIDOS
-- Propósito: Crear tabla de pedidos de producción
-- Base de datos: MySQL (Railway/Render)
-- Tabla: Pedidos
-- =====================================================

-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS `Pedidos` (
    -- Clave primaria autoincremental
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Número de máquina asignada
    `MachineNumber` INT NOT NULL,
    
    -- Número único del pedido
    `NumeroPedido` VARCHAR(50) NOT NULL UNIQUE,
    
    -- Código del artículo
    `Articulo` VARCHAR(50) NOT NULL,
    
    -- Cliente del pedido
    `Cliente` VARCHAR(200) NOT NULL,
    
    -- Descripción del pedido
    `Descripcion` VARCHAR(500) NULL,
    
    -- Cantidad solicitada
    `Cantidad` DECIMAL(10,2) NOT NULL,
    
    -- Unidad de medida (kg, unidades, etc.)
    `Unidad` VARCHAR(50) NOT NULL DEFAULT 'kg',
    
    -- Estado del pedido
    `Estado` VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    
    -- Fechas importantes
    `FechaPedido` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `FechaEntrega` DATETIME(6) NULL,
    
    -- Prioridad del pedido
    `Prioridad` VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    
    -- Observaciones adicionales
    `Observaciones` VARCHAR(1000) NULL,
    
    -- Asignación
    `AsignadoA` VARCHAR(100) NULL,
    `FechaAsignacion` DATETIME(6) NULL,
    
    -- Auditoría
    `CreatedBy` INT NULL,
    `UpdatedBy` INT NULL,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    -- Índices para optimizar consultas
    INDEX `idx_pedidos_numero` (`NumeroPedido`),
    INDEX `idx_pedidos_machine` (`MachineNumber`),
    INDEX `idx_pedidos_articulo` (`Articulo`),
    INDEX `idx_pedidos_cliente` (`Cliente`),
    INDEX `idx_pedidos_estado` (`Estado`),
    INDEX `idx_pedidos_prioridad` (`Prioridad`),
    INDEX `idx_pedidos_fecha_pedido` (`FechaPedido`),
    INDEX `idx_pedidos_fecha_entrega` (`FechaEntrega`),
    INDEX `idx_pedidos_asignado` (`AsignadoA`),
    
    -- Claves foráneas hacia la tabla users
    CONSTRAINT `fk_pedidos_created_by` 
        FOREIGN KEY (`CreatedBy`) 
        REFERENCES `users`(`Id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
        
    CONSTRAINT `fk_pedidos_updated_by` 
        FOREIGN KEY (`UpdatedBy`) 
        REFERENCES `users`(`Id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
        
    -- Restricciones de validación
    CONSTRAINT `chk_pedidos_cantidad_positiva` 
        CHECK (`Cantidad` > 0),
        
    CONSTRAINT `chk_pedidos_machine_valida` 
        CHECK (`MachineNumber` BETWEEN 11 AND 21),
        
    CONSTRAINT `chk_pedidos_estado_valido` 
        CHECK (`Estado` IN ('PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO')),
        
    CONSTRAINT `chk_pedidos_prioridad_valida` 
        CHECK (`Prioridad` IN ('BAJA', 'NORMAL', 'ALTA', 'URGENTE'))
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar creación
SELECT 'Tabla Pedidos creada exitosamente' as resultado;