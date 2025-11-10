using FlexoAPP.API.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace FlexoAPP.API.Data
{
    /// <summary>
    /// Inicializador de la tabla de programas de máquinas flexográficas - PostgreSQL Edition
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
                    Console.WriteLine("📊 Creando tabla machine_programs con PostgreSQL...");

                    // Crear la tabla con sintaxis PostgreSQL
                    await context.Database.ExecuteSqlRawAsync(@"
                        CREATE TABLE IF NOT EXISTS machine_programs (
                            ""Id"" SERIAL PRIMARY KEY,
                            ""MachineNumber"" INTEGER NOT NULL,
                            ""Name"" VARCHAR(200) NOT NULL,
                            ""Articulo"" VARCHAR(50) NOT NULL,
                            ""OtSap"" VARCHAR(50) NOT NULL UNIQUE,
                            ""Cliente"" VARCHAR(200) NOT NULL,
                            ""Referencia"" VARCHAR(500) DEFAULT '',
                            ""Td"" VARCHAR(3) DEFAULT '',
                            ""Colores"" JSONB NOT NULL,
                            ""Sustrato"" VARCHAR(200) DEFAULT '',
                            ""Kilos"" DECIMAL(10,2) NOT NULL,
                            ""Estado"" VARCHAR(20) NOT NULL DEFAULT 'LISTO',
                            ""FechaInicio"" TIMESTAMP NOT NULL,
                            ""FechaFin"" TIMESTAMP NULL,
                            ""Progreso"" INTEGER NOT NULL DEFAULT 0,
                            ""Observaciones"" VARCHAR(1000) NULL,
                            ""LastActionBy"" VARCHAR(100) NULL,
                            ""LastActionAt"" TIMESTAMP NULL,
                            ""LastAction"" VARCHAR(200) NULL,
                            ""OperatorName"" VARCHAR(100) NULL,
                            ""CreatedBy"" INTEGER NULL,
                            ""UpdatedBy"" INTEGER NULL,
                            ""CreatedAt"" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            ""UpdatedAt"" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT ""FK_machine_programs_users_CreatedBy"" FOREIGN KEY (""CreatedBy"") REFERENCES ""Users""(""Id"") ON DELETE SET NULL,
                            CONSTRAINT ""FK_machine_programs_users_UpdatedBy"" FOREIGN KEY (""UpdatedBy"") REFERENCES ""Users""(""Id"") ON DELETE SET NULL
                        )
                    ");

                    // Crear índices para optimizar consultas
                    await context.Database.ExecuteSqlRawAsync(@"
                        CREATE INDEX IF NOT EXISTS ""IX_machine_programs_MachineNumber"" ON machine_programs (""MachineNumber"")
                    ");
                    
                    await context.Database.ExecuteSqlRawAsync(@"
                        CREATE INDEX IF NOT EXISTS ""IX_machine_programs_Estado"" ON machine_programs (""Estado"")
                    ");
                    
                    await context.Database.ExecuteSqlRawAsync(@"
                        CREATE INDEX IF NOT EXISTS ""IX_machine_programs_FechaInicio"" ON machine_programs (""FechaInicio"")
                    ");
                    
                    await context.Database.ExecuteSqlRawAsync(@"
                        CREATE INDEX IF NOT EXISTS ""IX_machine_programs_MachineNumber_Estado"" ON machine_programs (""MachineNumber"", ""Estado"")
                    ");

                    // Crear trigger para actualización automática de UpdatedAt
                    await context.Database.ExecuteSqlRawAsync(@"
                        CREATE OR REPLACE FUNCTION update_machine_programs_updated_at()
                        RETURNS TRIGGER AS $$
                        BEGIN
                            NEW.""UpdatedAt"" = CURRENT_TIMESTAMP;
                            RETURN NEW;
                        END;
                        $$ language 'plpgsql';
                    ");

                    await context.Database.ExecuteSqlRawAsync(@"
                        DROP TRIGGER IF EXISTS update_machine_programs_updated_at_trigger ON machine_programs;
                        CREATE TRIGGER update_machine_programs_updated_at_trigger
                        BEFORE UPDATE ON machine_programs
                        FOR EACH ROW EXECUTE FUNCTION update_machine_programs_updated_at();
                    ");

                    Console.WriteLine("✅ Tabla machine_programs creada exitosamente con PostgreSQL");
                }

                // Verificar si hay datos existentes
                if (tableExists)
                {
                    var count = await context.MachinePrograms.CountAsync();
                    if (count > 0)
                    {
                        Console.WriteLine($"📊 La tabla machine_programs ya tiene {count} registros");
                        return;
                    }
                }

                Console.WriteLine("✅ Tabla machine_programs lista para uso en producción");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error inicializando tabla machine_programs: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
            }
        }
    }
}
