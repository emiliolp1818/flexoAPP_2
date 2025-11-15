-- =====================================================
-- SCRIPT: Crear tabla MAQUINAS desde cero
-- Base de datos: flexoapp_bd
-- Descripción: Tabla principal para el módulo de máquinas flexográficas
-- Versión: 1.0.0
-- Fecha: 2025-11-14
-- =====================================================

USE flexoapp_bd;

-- ===== ELIMINAR TABLA SI EXISTE =====
-- Eliminar la tabla maquinas si ya existe para empezar desde cero
DROP TABLE IF EXISTS `maquinas`;

-- ===== CREAR TABLA MAQUINAS =====
-- Tabla principal para almacenar programación de máquinas flexográficas (11-21)
-- CLAVE PRIMARIA: articulo (código único del artículo)
-- SIN campo id auto-incremental - articulo es suficiente como identificador
CREATE TABLE `maquinas` (
    -- ===== CLAVE PRIMARIA =====
    -- Código único del artículo que identifica el programa de máquina
    -- Este campo se usará para cargar información desde otra base de datos
    `articulo` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'Código único del artículo (PRIMARY KEY)',
    
    -- ===== CAMPOS PRINCIPALES =====
    -- Número de la máquina flexográfica (rango válido: 11-21)
    `numero_maquina` INT NOT NULL COMMENT 'Número de máquina (11-21)',
    
    -- Número de orden de trabajo del sistema SAP
    `ot_sap` VARCHAR(50) NOT NULL COMMENT 'Orden de trabajo SAP',
    
    -- Nombre completo del cliente
    `cliente` VARCHAR(200) NOT NULL COMMENT 'Nombre del cliente',
    
    -- Referencia interna del producto
    `referencia` VARCHAR(100) NULL COMMENT 'Referencia del producto',
    
    -- Código TD (Tipo de Diseño)
    `td` VARCHAR(10) NULL COMMENT 'Código TD (Tipo de Diseño)',
    
    -- Cantidad total de colores (1-10)
    `numero_colores` INT NOT NULL DEFAULT 0 COMMENT 'Cantidad de colores (1-10)',
    
    -- Array JSON de nombres de colores
    -- Ejemplo: ["CYAN", "MAGENTA", "AMARILLO", "NEGRO"]
    `colores` JSON NOT NULL COMMENT 'Array JSON de colores',
    
    -- Cantidad en kilogramos del material a producir
    `kilos` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Cantidad en kilogramos',
    
    -- Fecha y hora cuando se aplicó la tinta en la máquina (inicio del trabajo)
    `fecha_tinta_en_maquina` DATETIME NOT NULL COMMENT 'Fecha y hora de aplicación de tinta',
    
    -- Tipo de material base sobre el que se imprime
    -- Ejemplos: BOPP, PE, PET, PP
    `sustrato` VARCHAR(100) NOT NULL COMMENT 'Tipo de material base',
    
    -- Estado actual del programa de máquina
    -- Valores válidos: PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO
    -- Este campo controla el color de la fila en el frontend
    `estado` VARCHAR(20) NOT NULL DEFAULT 'LISTO' COMMENT 'Estado actual (PREPARANDO/LISTO/CORRIENDO/SUSPENDIDO/TERMINADO)',
    
    -- Notas u observaciones adicionales
    `observaciones` VARCHAR(1000) NULL COMMENT 'Observaciones adicionales',
    
    -- ===== CAMPOS DE AUDITORÍA =====
    -- Nombre del usuario que realizó la última acción
    `last_action_by` VARCHAR(100) NULL COMMENT 'Usuario que realizó la última acción',
    
    -- Fecha y hora de la última acción
    `last_action_at` DATETIME NULL COMMENT 'Fecha de la última acción',
    
    -- ID del usuario que creó el registro (FK a tabla users)
    `created_by` INT NULL COMMENT 'ID del usuario creador',
    
    -- ID del usuario que actualizó el registro (FK a tabla users)
    `updated_by` INT NULL COMMENT 'ID del usuario actualizador',
    
    -- Timestamp de creación del registro (automático)
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    
    -- Timestamp de última actualización (automático)
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    -- ===== ÍNDICES PARA OPTIMIZACIÓN =====
    -- Índice en numero_maquina para consultas por máquina
    INDEX `idx_numero_maquina` (`numero_maquina`),
    
    -- Índice en estado para filtrar por estado
    INDEX `idx_estado` (`estado`),
    
    -- Índice en fecha_tinta_en_maquina para ordenamiento
    INDEX `idx_fecha_tinta` (`fecha_tinta_en_maquina`),
    
    -- Índice compuesto para consultas combinadas
    INDEX `idx_maquina_estado` (`numero_maquina`, `estado`),
    
    -- Índice en ot_sap para búsquedas por orden SAP
    INDEX `idx_ot_sap` (`ot_sap`),
    
    -- Índice en cliente para búsquedas por cliente
    INDEX `idx_cliente` (`cliente`),
    
    -- ===== CLAVES FORÁNEAS =====
    -- Relación con tabla users (usuario creador)
    CONSTRAINT `fk_maquinas_created_by` 
        FOREIGN KEY (`created_by`) 
        REFERENCES `users`(`id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    
    -- Relación con tabla users (usuario actualizador)
    CONSTRAINT `fk_maquinas_updated_by` 
        FOREIGN KEY (`updated_by`) 
        REFERENCES `users`(`id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de programación de máquinas flexográficas';

-- ===== VERIFICACIÓN =====
-- Mostrar la estructura de la tabla creada
DESCRIBE `maquinas`;

-- ===== MENSAJE DE CONFIRMACIÓN =====
SELECT '✅ Tabla maquinas creada exitosamente' AS resultado;
