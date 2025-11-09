using FlexoAPP.API.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace FlexoAPP.API.Data
{
    /// <summary>
    /// Inicializador de la tabla de programas de máquinas flexográficas
    /// Se encarga de crear la tabla y sus índices si no existen en la base de datos
    /// </summary>
    public static class MachineProgramTableInitializer
    {
        /// <summary>
        /// Inicializa la tabla machine_programs con su estructura y índices necesarios
        /// </summary>
        /// <param name="serviceProvider">Proveedor de servicios para acceso al contexto de base de datos</param>
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            // Crear scope para acceso a servicios con inyección de dependencias
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<FlexoAPPDbContext>();

            try
            {
                Console.WriteLine("🔄 Verificando tabla machine_programs...");

                // Verificar si la tabla existe usando Entity Framework
                bool tableExists = false;
                try
                {
                    // Intentar contar registros para verificar existencia de tabla
                    await context.MachinePrograms.CountAsync();
                    tableExists = true;
                    Console.WriteLine("📊 Tabla machine_programs ya existe");
                }
                catch (Exception)
                {
                    // Si falla el conteo, la tabla no existe
                    tableExists = false;
                    Console.WriteLine("📊 Tabla machine_programs no existe, creándola...");
                }

                if (!tableExists)
                {
                    Console.WriteLine("📊 Creando tabla machine_programs...");

                    // Crear la tabla con estructura completa para programas de máquinas flexográficas
                    await context.Database.ExecuteSqlRawAsync(@"
                        CREATE TABLE `machine_programs` (
                            `Id` int NOT NULL AUTO_INCREMENT,                                    -- Identificador único del programa
                            `MachineNumber` int NOT NULL,                                        -- Número de máquina flexográfica
                            `Name` varchar(200) CHARACTER SET utf8mb4 NOT NULL,                 -- Nombre descriptivo del programa
                            `Articulo` varchar(50) CHARACTER SET utf8mb4 NOT NULL,              -- Código del artículo a producir
                            `OtSap` varchar(50) CHARACTER SET utf8mb4 NOT NULL,                 -- Orden de trabajo SAP
                            `Cliente` varchar(200) CHARACTER SET utf8mb4 NOT NULL,              -- Nombre del cliente
                            `Referencia` varchar(500) CHARACTER SET utf8mb4 DEFAULT '',         -- Referencia del producto
                            `Td` varchar(3) CHARACTER SET utf8mb4 DEFAULT '',                   -- Tipo de documento (ETQ, BOL, etc.)
                            `Colores` JSON NOT NULL,                                            -- Array JSON con colores utilizados
                            `Sustrato` varchar(200) CHARACTER SET utf8mb4 DEFAULT '',           -- Material del sustrato
                            `Kilos` DECIMAL(10,2) NOT NULL,                                     -- Cantidad en kilogramos
                            `Estado` varchar(20) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'LISTO', -- Estado del programa (LISTO, CORRIENDO, etc.)
                            `FechaInicio` datetime(6) NOT NULL,                                  -- Fecha y hora de inicio programada
                            `FechaFin` datetime(6) NULL,                                         -- Fecha y hora de finalización (opcional)
                            `Progreso` int NOT NULL DEFAULT 0,                                   -- Porcentaje de progreso (0-100)
                            `Observaciones` varchar(1000) CHARACTER SET utf8mb4 NULL,           -- Observaciones adicionales
                            `LastActionBy` varchar(100) CHARACTER SET utf8mb4 NULL,             -- Usuario que realizó la última acción
                            `LastActionAt` datetime(6) NULL,                                     -- Fecha de la última acción
                            `LastAction` varchar(200) CHARACTER SET utf8mb4 NULL,               -- Descripción de la última acción
                            `OperatorName` varchar(100) CHARACTER SET utf8mb4 NULL,             -- Nombre del operario asignado
                            `CreatedBy` int NULL,                                                -- ID del usuario que creó el registro
                            `UpdatedBy` int NULL,                                                -- ID del usuario que actualizó el registro
                            `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),      -- Fecha de creación automática
                            `UpdatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), -- Fecha de actualización automática
                            CONSTRAINT `PK_machine_programs` PRIMARY KEY (`Id`),                -- Clave primaria
                            CONSTRAINT `FK_machine_programs_users_CreatedBy` FOREIGN KEY (`CreatedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL, -- Relación con usuario creador
                            CONSTRAINT `FK_machine_programs_users_UpdatedBy` FOREIGN KEY (`UpdatedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL  -- Relación con usuario actualizador
                        ) CHARACTER SET=utf8mb4
                    ");

                    // Crear índices para optimizar consultas frecuentes
                    await context.Database.ExecuteSqlRawAsync(@"
                        CREATE INDEX `IX_machine_programs_MachineNumber` ON `machine_programs` (`MachineNumber`)
                    ");
                    
                    await context.Database.ExecuteSqlRawAsync(@"
                        CREATE INDEX `IX_machine_programs_Estado` ON `machine_programs` (`Estado`)
                    ");
                    
                    await context.Database.ExecuteSqlRawAsync(@"
                        CREATE INDEX `IX_machine_programs_FechaInicio` ON `machine_programs` (`FechaInicio`)
                    ");
                    
                    await context.Database.ExecuteSqlRawAsync(@"
                        CREATE INDEX `IX_machine_programs_MachineNumber_Estado` ON `machine_programs` (`MachineNumber`, `Estado`)
                    ");

                    Console.WriteLine("✅ Tabla machine_programs creada exitosamente");
                }

                // Verificar si hay datos existentes (solo si la tabla existe)
                if (tableExists)
                {
                    var count = await context.MachinePrograms.CountAsync();
                    if (count > 0)
                    {
                        Console.WriteLine($"📊 La tabla machine_programs ya tiene {count} registros");
                        return;
                    }
                }

                // La tabla está lista para uso en producción - sin datos demo
                Console.WriteLine("✅ Tabla machine_programs lista para uso en producción");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error inicializando tabla machine_programs: {ex.Message}");
            }
        }
    }
}