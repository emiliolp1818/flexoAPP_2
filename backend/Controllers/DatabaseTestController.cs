using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/database-test")]
    public class DatabaseTestController : ControllerBase
    {
        private readonly FlexoAPPDbContext _context;
        private readonly ILogger<DatabaseTestController> _logger;

        public DatabaseTestController(FlexoAPPDbContext context, ILogger<DatabaseTestController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("connection")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                // Verificar conexión a la base de datos
                var canConnect = await _context.Database.CanConnectAsync();
                
                if (!canConnect)
                {
                    return StatusCode(500, new
                    {
                        success = false,
                        error = "No se puede conectar a la base de datos",
                        message = "Verifica la cadena de conexión y que el servidor MySQL esté ejecutándose"
                    });
                }

                // Obtener información de la base de datos
                var connectionString = _context.Database.GetConnectionString();
                var databaseName = _context.Database.GetDbConnection().Database;

                return Ok(new
                {
                    success = true,
                    message = "Conexión exitosa a la base de datos",
                    database = databaseName,
                    connectionString = connectionString?.Replace("Pwd=12345", "Pwd=***"),
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error probando conexión a la base de datos");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error de conexión",
                    message = ex.Message,
                    innerException = ex.InnerException?.Message
                });
            }
        }

        [HttpGet("machine-programs-table")]
        public async Task<IActionResult> TestMachineProgramsTable()
        {
            try
            {
                // Verificar si la tabla existe y obtener información
                var tableExists = await _context.Database.ExecuteSqlRawAsync(
                    "SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'machine_programs'"
                ) >= 0;

                // Contar registros
                var count = await _context.MachinePrograms.CountAsync();

                // Obtener algunos registros de ejemplo
                var samplePrograms = await _context.MachinePrograms
                    .Take(3)
                    .Select(p => new
                    {
                        p.Id,
                        p.MachineNumber,
                        p.Articulo,
                        p.Cliente,
                        p.Estado,
                        p.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    message = "Tabla machine_programs verificada exitosamente",
                    tableExists = true,
                    totalRecords = count,
                    sampleRecords = samplePrograms,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verificando tabla machine_programs");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error verificando tabla",
                    message = ex.Message,
                    suggestion = "Ejecuta las migraciones: dotnet ef database update"
                });
            }
        }

        [HttpGet("migrations")]
        public async Task<IActionResult> TestMigrations()
        {
            try
            {
                // Verificar migraciones aplicadas
                var appliedMigrations = await _context.Database.GetAppliedMigrationsAsync();
                var pendingMigrations = await _context.Database.GetPendingMigrationsAsync();

                return Ok(new
                {
                    success = true,
                    message = "Estado de migraciones",
                    appliedMigrations = appliedMigrations.ToList(),
                    pendingMigrations = pendingMigrations.ToList(),
                    hasPendingMigrations = pendingMigrations.Any(),
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verificando migraciones");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error verificando migraciones",
                    message = ex.Message
                });
            }
        }

        [HttpPost("create-sample-data")]
        public async Task<IActionResult> CreateSampleData()
        {
            try
            {
                // Verificar si ya hay datos
                var existingCount = await _context.MachinePrograms.CountAsync();
                
                if (existingCount > 0)
                {
                    return Ok(new
                    {
                        success = true,
                        message = $"Ya existen {existingCount} programas en la base de datos",
                        action = "No se crearon datos adicionales"
                    });
                }

                // Crear datos de ejemplo
                var samplePrograms = new List<MachineProgram>
                {
                    new MachineProgram
                    {
                        MachineNumber = 1,
                        Name = "Programa de Prueba 1",
                        Articulo = "TEST001",
                        OtSap = "OT001",
                        Cliente = "Cliente de Prueba",
                        Referencia = "REF001",
                        Td = "TD1",
                        Colores = "[\"Azul\", \"Rojo\", \"Verde\"]",
                        Sustrato = "Papel",
                        Kilos = 1000,
                        Estado = "LISTO",
                        FechaInicio = DateTime.UtcNow,
                        Progreso = 0
                    },
                    new MachineProgram
                    {
                        MachineNumber = 2,
                        Name = "Programa de Prueba 2",
                        Articulo = "TEST002",
                        OtSap = "OT002",
                        Cliente = "Cliente de Prueba 2",
                        Referencia = "REF002",
                        Td = "TD2",
                        Colores = "[\"Negro\", \"Blanco\"]",
                        Sustrato = "Plástico",
                        Kilos = 1500,
                        Estado = "LISTO",
                        FechaInicio = DateTime.UtcNow,
                        Progreso = 0
                    }
                };

                _context.MachinePrograms.AddRange(samplePrograms);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Datos de ejemplo creados exitosamente",
                    createdPrograms = samplePrograms.Count,
                    programs = samplePrograms.Select(p => new
                    {
                        p.Id,
                        p.MachineNumber,
                        p.Articulo,
                        p.Cliente,
                        p.Estado
                    })
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando datos de ejemplo");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error creando datos de ejemplo",
                    message = ex.Message
                });
            }
        }

        [HttpGet("full-diagnostic")]
        public async Task<IActionResult> FullDiagnostic()
        {
            try
            {
                // Test connection
                var canConnect = await _context.Database.CanConnectAsync();
                var connectionString = _context.Database.GetConnectionString();
                var databaseName = _context.Database.GetDbConnection().Database;

                var connectionInfo = new
                {
                    canConnect,
                    database = databaseName,
                    connectionString = connectionString?.Replace("Pwd=12345", "Pwd=***")
                };

                if (!canConnect)
                {
                    return StatusCode(500, new
                    {
                        success = false,
                        error = "No se puede conectar a la base de datos",
                        connection = connectionInfo
                    });
                }

                // Test migrations
                var appliedMigrations = await _context.Database.GetAppliedMigrationsAsync();
                var pendingMigrations = await _context.Database.GetPendingMigrationsAsync();

                var migrationsInfo = new
                {
                    applied = appliedMigrations.ToList(),
                    pending = pendingMigrations.ToList(),
                    hasPending = pendingMigrations.Any()
                };

                // Test table and data
                var programCount = await _context.MachinePrograms.CountAsync();
                var samplePrograms = await _context.MachinePrograms
                    .Take(3)
                    .Select(p => new { p.Id, p.MachineNumber, p.Articulo, p.Estado })
                    .ToListAsync();

                var dataInfo = new
                {
                    totalPrograms = programCount,
                    samplePrograms
                };

                var diagnostic = new
                {
                    timestamp = DateTime.UtcNow,
                    connection = connectionInfo,
                    migrations = migrationsInfo,
                    data = dataInfo
                };

                return Ok(new
                {
                    success = true,
                    message = "Diagnóstico completo exitoso",
                    diagnostic
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en diagnóstico completo");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error en diagnóstico",
                    message = ex.Message
                });
            }
        }
    }
}