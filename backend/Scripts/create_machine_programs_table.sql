-- Script para crear la tabla machine_programs en MySQL
-- Ejecutar este script si la tabla no existe

USE flexoapp_bd;

-- Crear tabla machine_programs si no existe
CREATE TABLE IF NOT EXISTS `machine_programs` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `MachineNumber` int NOT NULL,
    `Name` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
    `Articulo` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `OtSap` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `Cliente` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
    `Referencia` varchar(500) CHARACTER SET utf8mb4 NULL,
    `Td` varchar(3) CHARACTER SET utf8mb4 NULL,
    `Colores` JSON NOT NULL,
    `Sustrato` varchar(200) CHARACTER SET utf8mb4 NULL,
    `Kilos` decimal(10,2) NOT NULL,
    `Estado` varchar(20) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'LISTO',
    `FechaInicio` datetime(6) NOT NULL,
    `FechaFin` datetime(6) NULL,
    `Progreso` int NOT NULL DEFAULT 0,
    `Observaciones` varchar(1000) CHARACTER SET utf8mb4 NULL,
    `LastActionBy` varchar(100) CHARACTER SET utf8mb4 NULL,
    `LastActionAt` datetime(6) NULL,
    `LastAction` varchar(200) CHARACTER SET utf8mb4 NULL,
    `OperatorName` varchar(100) CHARACTER SET utf8mb4 NULL,
    `CreatedBy` int NULL,
    `UpdatedBy` int NULL,
    `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT `PK_machine_programs` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS `IX_machine_programs_MachineNumber` ON `machine_programs` (`MachineNumber`);
CREATE INDEX IF NOT EXISTS `IX_machine_programs_Estado` ON `machine_programs` (`Estado`);
CREATE INDEX IF NOT EXISTS `IX_machine_programs_FechaInicio` ON `machine_programs` (`FechaInicio`);
CREATE INDEX IF NOT EXISTS `IX_machine_programs_MachineNumber_Estado` ON `machine_programs` (`MachineNumber`, `Estado`);
CREATE UNIQUE INDEX IF NOT EXISTS `IX_machine_programs_OtSap` ON `machine_programs` (`OtSap`);

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla machine_programs creada exitosamente' as resultado;
DESCRIBE machine_programs;