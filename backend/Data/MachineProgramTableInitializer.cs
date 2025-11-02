using FlexoAPP.API.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace FlexoAPP.API.Data
{
    public static class MachineProgramTableInitializer
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<FlexoAPPDbContext>();

            try
            {
                Console.WriteLine("🔄 Verificando tabla machine_programs...");

                // Verificar si la tabla existe usando Entity Framework
                bool tableExists = false;
                try
                {
                    await context.MachinePrograms.CountAsync();
                    tableExists = true;
                    Console.WriteLine("📊 Tabla machine_programs ya existe");
                }
                catch (Exception)
                {
                    tableExists = false;
                    Console.WriteLine("📊 Tabla machine_programs no existe, creándola...");
                }

                if (!tableExists)
                {
                    Console.WriteLine("📊 Creando tabla machine_programs...");

                    // Crear la tabla
                    await context.Database.ExecuteSqlRawAsync(@"
                        CREATE TABLE `machine_programs` (
                            `Id` int NOT NULL AUTO_INCREMENT,
                            `MachineNumber` int NOT NULL,
                            `Name` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
                            `Articulo` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
                            `OtSap` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
                            `Cliente` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
                            `Referencia` varchar(500) CHARACTER SET utf8mb4 DEFAULT '',
                            `Td` varchar(3) CHARACTER SET utf8mb4 DEFAULT '',
                            `Colores` JSON NOT NULL,
                            `Sustrato` varchar(200) CHARACTER SET utf8mb4 DEFAULT '',
                            `Kilos` DECIMAL(10,2) NOT NULL,
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
                            CONSTRAINT `PK_machine_programs` PRIMARY KEY (`Id`),
                            CONSTRAINT `FK_machine_programs_users_CreatedBy` FOREIGN KEY (`CreatedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
                            CONSTRAINT `FK_machine_programs_users_UpdatedBy` FOREIGN KEY (`UpdatedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
                        ) CHARACTER SET=utf8mb4
                    ");

                    // Crear índices
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

                // Verificar si hay datos (solo si la tabla existe)
                if (tableExists)
                {
                    var count = await context.MachinePrograms.CountAsync();
                    if (count > 0)
                    {
                        Console.WriteLine($"📊 La tabla machine_programs ya tiene {count} registros");
                        return;
                    }
                }

                // Insertar datos si la tabla está vacía o recién creada
                try
                {
                    Console.WriteLine("🔄 Insertando datos de ejemplo...");

                    // Insertar datos de ejemplo
                    await context.Database.ExecuteSqlRawAsync(@"
                        INSERT INTO `machine_programs` (
                            `MachineNumber`, `Name`, `Articulo`, `OtSap`, `Cliente`, `Referencia`, `Td`, `Colores`, 
                            `Sustrato`, `Kilos`, `Estado`, `FechaInicio`, `Progreso`, `Observaciones`, `CreatedAt`, `UpdatedAt`
                        ) VALUES 
                        (11, 'Programa Coca-Cola 500ml', 'CC500ML001', 'OT2024001', 'Coca-Cola Company', 'Etiqueta Coca-Cola Original 500ml', 'ETQ', 
                         JSON_ARRAY('Rojo Coca-Cola', 'Blanco', 'Negro', 'Dorado'), 'Papel Couché 80g', 150.50, 'LISTO', NOW(), 0, 'Programa listo para iniciar producción', NOW(), NOW()),

                        (11, 'Programa Pepsi 350ml', 'PP350ML002', 'OT2024002', 'PepsiCo', 'Etiqueta Pepsi Original 350ml', 'ETQ',
                         JSON_ARRAY('Azul Pepsi', 'Rojo', 'Blanco', 'Plateado'), 'Papel Couché 90g', 200.75, 'CORRIENDO', DATE_SUB(NOW(), INTERVAL 4 HOUR), 35, 'Producción en curso, sin incidencias', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 30 MINUTE)),

                        (12, 'Programa Fanta Naranja 1L', 'FN1L003', 'OT2024003', 'Coca-Cola Company', 'Etiqueta Fanta Naranja 1 Litro', 'ETQ',
                         JSON_ARRAY('Naranja Fanta', 'Blanco', 'Verde', 'Negro'), 'Papel Couché 85g', 180.25, 'SUSPENDIDO', DATE_SUB(NOW(), INTERVAL 6 HOUR), 15, 'Suspendido por cambio de rodillo', DATE_SUB(NOW(), INTERVAL 7 HOUR), DATE_SUB(NOW(), INTERVAL 45 MINUTE)),

                        (12, 'Programa Sprite 600ml', 'SP600ML004', 'OT2024004', 'Coca-Cola Company', 'Etiqueta Sprite Original 600ml', 'ETQ',
                         JSON_ARRAY('Verde Sprite', 'Amarillo', 'Blanco', 'Azul'), 'Papel Couché 80g', 120.00, 'TERMINADO', DATE_SUB(NOW(), INTERVAL 1 DAY), 100, 'Programa completado exitosamente', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 8 HOUR)),

                        (13, 'Programa Cerveza Águila 330ml', 'AG330ML005', 'OT2024005', 'Bavaria S.A.', 'Etiqueta Cerveza Águila 330ml', 'ETQ',
                         JSON_ARRAY('Dorado Águila', 'Rojo', 'Negro', 'Blanco', 'Azul'), 'Papel Metalizado', 300.50, 'LISTO', DATE_ADD(NOW(), INTERVAL 2 HOUR), 0, 'Programado para iniciar en 2 horas', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),

                        (14, 'Programa Leche Alpina 1L', 'AL1L006', 'OT2024006', 'Alpina Productos Alimenticios', 'Etiqueta Leche Entera Alpina 1L', 'ETQ',
                         JSON_ARRAY('Azul Alpina', 'Blanco', 'Rojo', 'Verde'), 'Papel Couché 90g', 250.75, 'CORRIENDO', DATE_SUB(NOW(), INTERVAL 3 HOUR), 60, 'Producción avanzada, buen ritmo', DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 15 MINUTE)),

                        (15, 'Programa Yogurt Alpina 150g', 'YA150G007', 'OT2024007', 'Alpina Productos Alimenticios', 'Etiqueta Yogurt Griego Alpina 150g', 'ETQ',
                         JSON_ARRAY('Azul Alpina', 'Blanco', 'Dorado', 'Rosa'), 'Papel Couché 75g', 80.25, 'LISTO', DATE_ADD(NOW(), INTERVAL 1 HOUR), 0, 'Esperando inicio de turno', DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 30 MINUTE)),

                        (16, 'Programa Aceite Gourmet 500ml', 'GO500ML008', 'OT2024008', 'Grasas S.A.', 'Etiqueta Aceite Gourmet 500ml', 'ETQ',
                         JSON_ARRAY('Verde Oliva', 'Dorado', 'Negro', 'Blanco'), 'Papel Couché 85g', 160.00, 'SUSPENDIDO', DATE_SUB(NOW(), INTERVAL 1 HOUR), 25, 'Suspendido por falta de material', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 20 MINUTE))
                    ");

                    Console.WriteLine("✅ Datos de ejemplo insertados exitosamente");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error insertando datos de ejemplo: {ex.Message}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error inicializando tabla machine_programs: {ex.Message}");
            }
        }
    }
}