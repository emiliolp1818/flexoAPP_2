-- ============================================================================
-- CREAR TABLA DE ACTIVIDADES DE USUARIO - MySQL
-- ============================================================================
-- Esta tabla almacena todas las actividades realizadas por los usuarios
-- en el sistema para auditoría y generación de reportes
-- IMPORTANTE: El backend usa el nombre "Activities" (no "UserActivities")

USE FlexoAPP;

-- Verificar si la tabla ya existe
SELECT 'Verificando si la tabla Activities existe...' AS Mensaje;

-- Crear tabla de actividades si no existe
CREATE TABLE IF NOT EXISTS Activities (
    -- Identificador único de la actividad
    Id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Información de la actividad
    Action VARCHAR(200) NOT NULL,
    Description VARCHAR(500) NOT NULL,
    Module VARCHAR(100) NOT NULL,
    
    -- Detalles adicionales (JSON o texto)
    Details VARCHAR(1000) NULL,
    
    -- Fecha y hora
    Timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Información del usuario
    UserId INT NOT NULL,
    UserCode VARCHAR(50) NULL,
    
    -- Dirección IP
    IpAddress VARCHAR(45) NULL,
    
    -- Índices para mejorar rendimiento
    INDEX IX_Activities_UserId (UserId),
    INDEX IX_Activities_UserCode (UserCode),
    INDEX IX_Activities_Module (Module),
    INDEX IX_Activities_Timestamp (Timestamp),
    INDEX IX_Activities_UserCode_Timestamp (UserCode, Timestamp),
    
    -- Clave foránea a la tabla Users
    CONSTRAINT FK_Activities_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabla Activities creada o verificada exitosamente' AS Mensaje;
