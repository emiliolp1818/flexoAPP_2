-- ===== SCRIPT DE DIAGNÓSTICO PARA TABLA machine_programs =====
-- Este script diagnostica problemas comunes con la tabla machine_programs
-- Base de datos: flexoapp_bd (MySQL)

USE flexoapp_bd;

-- ===== 1. VERIFICAR SI LA BASE DE DATOS EXISTE =====
SELECT 
    SCHEMA_NAME AS nombre_base_datos,
    DEFAULT_CHARACTER_SET_NAME AS charset,
    DEFAULT_COLLATION_NAME AS collation
FROM 
    information_schema.SCHEMATA
WHERE 
    SCHEMA_NAME = 'flexoapp_bd';

-- ===== 2. LISTAR TODAS LAS TABLAS EN LA BASE DE DATOS =====
SELECT 
    TABLE_NAME AS nombre_tabla,
    TABLE_ROWS AS filas_aproximadas,
    CREATE_TIME AS fecha_creacion,
    UPDATE_TIME AS fecha_actualizacion,
    TABLE_COLLATION AS collation
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'flexoapp_bd'
ORDER BY 
    TABLE_NAME;

-- ===== 3. VERIFICAR SI LA TABLA machine_programs EXISTE =====
SELECT 
    COUNT(*) AS tabla_existe
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'flexoapp_bd' 
    AND TABLE_NAME = 'machine_programs';

-- ===== 4. SI LA TABLA NO EXISTE, CREARLA =====
CREATE TABLE IF NOT EXISTS machine_programs (
    -- Clave primaria
    Id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del programa de máquina',
    
    -- Campos principales del programa
    MachineNumber INT NOT NULL COMMENT 'Número de la máquina (11-21)',
    Name VARCHAR(200) NOT NULL COMMENT 'Nombre del programa',
    Articulo VARCHAR(50) NOT NULL COMMENT 'Código del artículo',
    OtSap VARCHAR(50) NOT NULL UNIQUE COMMENT 'Orden de trabajo SAP',
    Cliente VARCHAR(200) NOT NULL COMMENT 'Nombre del cliente',
    Referencia VARCHAR(500) NULL COMMENT 'Referencia del producto',
    Td VARCHAR(3) NULL COMMENT 'Código TD (Tipo de Diseño)',
    
    -- Campos de colores
    NumeroColores INT NOT NULL DEFAULT 0 COMMENT 'Número total de colores',
    Colores JSON NOT NULL COMMENT 'Array de colores en formato JSON',
    
    -- Campos de producción
    Sustrato VARCHAR(200) NULL COMMENT 'Tipo de material base',
    Kilos DECIMAL(10,2) NOT NULL COMMENT 'Cantidad en kilogramos',
    Estado VARCHAR(20) NOT NULL DEFAULT 'LISTO' COMMENT 'Estado del programa (LISTO, CORRIENDO, SUSPENDIDO, TERMINADO)',
    FechaInicio DATETIME NOT NULL COMMENT 'Fecha de inicio del programa',
    FechaTintaEnMaquina DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha cuando se aplicó la tinta',
    FechaFin DATETIME NULL COMMENT 'Fecha de finalización del programa',
    Progreso INT NOT NULL DEFAULT 0 COMMENT 'Porcentaje de progreso (0-100)',
    
    -- Campos de observaciones y acciones
    Observaciones VARCHAR(1000) NULL COMMENT 'Observaciones adicionales',
    LastActionBy VARCHAR(100) NULL COMMENT 'Usuario que realizó la última acción',
    LastAction VARCHAR(200) NULL COMMENT 'Descripción de la última acción',
    LastActionAt DATETIME NULL COMMENT 'Fecha de la última acción',
    OperatorName VARCHAR(100) NULL COMMENT 'Nombre del operador asignado',
    
    -- Campos de auditoría
    CreatedBy INT NULL COMMENT 'ID del usuario que creó el registro',
    UpdatedBy INT NULL COMMENT 'ID del usuario que actualizó el registro',
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    -- Índices para mejorar el rendimiento
    INDEX idx_machine_number (MachineNumber),
    INDEX idx_estado (Estado),
    INDEX idx_fecha_inicio (FechaInicio),
    INDEX idx_fecha_tinta (FechaTintaEnMaquina),
    INDEX idx_machine_estado (MachineNumber, Estado),
    
    -- Clave foránea para CreatedBy (opcional, comentada por si no existe la tabla users)
    -- FOREIGN KEY (CreatedBy) REFERENCES users(Id) ON DELETE SET NULL,
    -- FOREIGN KEY (UpdatedBy) REFERENCES users(Id) ON DELETE SET NULL,
    
    -- Configuración de la tabla
    ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) COMMENT='Tabla de programas de máquinas flexográficas';

-- ===== 5. VERIFICAR ESTRUCTURA DE LA TABLA =====
DESCRIBE machine_programs;

-- ===== 6. VERIFICAR ÍNDICES DE LA TABLA =====
SHOW INDEX FROM machine_programs;

-- ===== 7. CONTAR REGISTROS EN LA TABLA =====
SELECT COUNT(*) AS total_registros FROM machine_programs;

-- ===== 8. MOSTRAR PRIMEROS 5 REGISTROS =====
SELECT * FROM machine_programs LIMIT 5;

-- ===== 9. VERIFICAR COLUMNAS FALTANTES Y AGREGARLAS SI ES NECESARIO =====

-- Verificar si existe la columna FechaTintaEnMaquina
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'flexoapp_bd' 
    AND TABLE_NAME = 'machine_programs' 
    AND COLUMN_NAME = 'FechaTintaEnMaquina'
);

-- Si no existe, agregarla
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE machine_programs ADD COLUMN FechaTintaEnMaquina DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT "Fecha cuando se aplicó la tinta" AFTER FechaInicio',
    'SELECT "La columna FechaTintaEnMaquina ya existe" AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar si existe la columna NumeroColores
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'flexoapp_bd' 
    AND TABLE_NAME = 'machine_programs' 
    AND COLUMN_NAME = 'NumeroColores'
);

-- Si no existe, agregarla
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE machine_programs ADD COLUMN NumeroColores INT NOT NULL DEFAULT 0 COMMENT "Número total de colores" AFTER Td',
    'SELECT "La columna NumeroColores ya existe" AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===== 10. VERIFICAR ESTRUCTURA FINAL =====
SELECT 
    COLUMN_NAME AS columna,
    COLUMN_TYPE AS tipo,
    IS_NULLABLE AS permite_null,
    COLUMN_DEFAULT AS valor_default,
    COLUMN_KEY AS clave,
    EXTRA AS extra,
    COLUMN_COMMENT AS comentario
FROM 
    information_schema.COLUMNS
WHERE 
    TABLE_SCHEMA = 'flexoapp_bd' 
    AND TABLE_NAME = 'machine_programs'
ORDER BY 
    ORDINAL_POSITION;

-- ===== 11. VERIFICAR PERMISOS DEL USUARIO =====
SHOW GRANTS FOR CURRENT_USER();

-- ===== FIN DEL DIAGNÓSTICO =====
SELECT '✅ Diagnóstico completado. Revisa los resultados anteriores.' AS mensaje;
