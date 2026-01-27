-- ============================================================================
-- MIGRACIÓN: Agregar columnas de auditoría detallada a la tabla Activities
-- ============================================================================
-- Fecha: 2026-01-27
-- Descripción: Agrega columnas adicionales para auditoría completa del sistema
-- Incluye: tipo de entidad, ID de entidad, nombre, duración, valores antiguos/nuevos

-- Agregar columna EntityType (tipo de entidad afectada)
ALTER TABLE Activities 
ADD COLUMN EntityType VARCHAR(100) NULL;

-- Agregar columna EntityId (ID de la entidad afectada)
ALTER TABLE Activities 
ADD COLUMN EntityId INT NULL;

-- Agregar columna EntityName (nombre o código de la entidad)
ALTER TABLE Activities 
ADD COLUMN EntityName VARCHAR(200) NULL;

-- Agregar columna Duration (duración de la operación en formato TimeSpan)
ALTER TABLE Activities 
ADD COLUMN Duration BIGINT NULL COMMENT 'Duración en ticks (TimeSpan)';

-- Agregar columna OldValues (valores anteriores en formato JSON)
ALTER TABLE Activities 
ADD COLUMN OldValues VARCHAR(2000) NULL;

-- Agregar columna NewValues (valores nuevos en formato JSON)
ALTER TABLE Activities 
ADD COLUMN NewValues VARCHAR(2000) NULL;

-- Crear índices para mejorar el rendimiento de consultas
CREATE INDEX idx_activities_entity ON Activities(EntityType, EntityId);
CREATE INDEX idx_activities_module_timestamp ON Activities(Module, Timestamp DESC);
CREATE INDEX idx_activities_user_timestamp ON Activities(UserId, Timestamp DESC);

-- Verificar la estructura actualizada
DESCRIBE Activities;

-- ============================================================================
-- NOTAS:
-- - EntityType: Tipo de entidad (User, Maquina, Design, Report, Config, etc.)
-- - EntityId: ID de la entidad afectada
-- - EntityName: Nombre descriptivo de la entidad (código, nombre, etc.)
-- - Duration: Duración en ticks para operaciones de máquinas (TimeSpan)
-- - OldValues: Valores anteriores en formato JSON para auditoría
-- - NewValues: Valores nuevos en formato JSON para auditoría
-- ============================================================================
