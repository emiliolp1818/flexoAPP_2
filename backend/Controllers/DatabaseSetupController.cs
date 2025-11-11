using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;

namespace backend.Controllers
{
    /// <summary>
    /// Controlador temporal para configurar la base de datos
    /// SOLO PARA DESARROLLO - Eliminar en producción
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseSetupController : ControllerBase
    {
        private readonly FlexoAPPDbContext _context;
        private readonly ILogger<DatabaseSetupController> _logger;

        public DatabaseSetupController(FlexoAPPDbContext context, ILogger<DatabaseSetupController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// GET: api/databasesetup/check-table
        /// Verifica la estructura de la tabla maquinas
        /// </summary>
        [HttpGet("check-table")]
        public async Task<ActionResult<object>> CheckTableStructure()
        {
            try
            {
                var sql = "DESCRIBE maquinas";
                var connection = _context.Database.GetDbConnection();
                await connection.OpenAsync();
                
                var command = connection.CreateCommand();
                command.CommandText = sql;
                
                var reader = await command.ExecuteReaderAsync();
                var columns = new List<object>();
                
                while (await reader.ReadAsync())
                {
                    columns.Add(new
                    {
                        Field = reader["Field"],
                        Type = reader["Type"],
                        Null = reader["Null"],
                        Key = reader["Key"]
                    });
                }
                
                await reader.CloseAsync();
                await connection.CloseAsync();
                
                return Ok(new
                {
                    success = true,
                    columns = columns,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// POST: api/databasesetup/drop-and-recreate
        /// Elimina y recrea la tabla maquinas
        /// </summary>
        [HttpPost("drop-and-recreate")]
        public async Task<ActionResult<object>> DropAndRecreateTable()
        {
            try
            {
                _logger.LogInformation("🗑️ Eliminando tabla maquinas...");
                
                await _context.Database.ExecuteSqlRawAsync("DROP TABLE IF EXISTS maquinas");
                
                _logger.LogInformation("✅ Tabla eliminada, recreando...");
                
                return await CreateMaquinasTable();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error eliminando/recreando tabla");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error eliminando/recreando tabla",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// POST: api/databasesetup/create-maquinas-table
        /// Crea la tabla maquinas si no existe
        /// </summary>
        [HttpPost("create-maquinas-table")]
        public async Task<ActionResult<object>> CreateMaquinasTable()
        {
            try
            {
                _logger.LogInformation("🔧 Creando tabla maquinas...");

                // SQL para crear la tabla maquinas
                var createTableSql = @"
                    CREATE TABLE IF NOT EXISTS maquinas (
                        articulo VARCHAR(50) PRIMARY KEY COMMENT 'Código del artículo - CLAVE PRIMARIA',
                        numero_maquina INT NOT NULL COMMENT 'Número de máquina (11-21)',
                        ot_sap VARCHAR(50) NOT NULL COMMENT 'Orden de trabajo SAP',
                        cliente VARCHAR(200) NOT NULL COMMENT 'Nombre del cliente',
                        referencia VARCHAR(100) COMMENT 'Referencia del producto',
                        td VARCHAR(10) COMMENT 'Código TD',
                        numero_colores INT NOT NULL COMMENT 'Número de colores',
                        colores JSON NOT NULL COMMENT 'Array de colores en JSON',
                        kilos DECIMAL(10,2) NOT NULL COMMENT 'Cantidad en kilogramos',
                        fecha_tinta_en_maquina DATETIME NOT NULL COMMENT 'Fecha de tinta',
                        sustrato VARCHAR(100) NOT NULL COMMENT 'Tipo de material',
                        estado VARCHAR(20) NOT NULL DEFAULT 'LISTO' COMMENT 'Estado actual',
                        observaciones VARCHAR(1000) COMMENT 'Observaciones',
                        last_action_by VARCHAR(100) COMMENT 'Usuario última acción',
                        last_action_at DATETIME COMMENT 'Fecha última acción',
                        created_by INT COMMENT 'ID usuario creador',
                        updated_by INT COMMENT 'ID usuario actualizador',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_numero_maquina (numero_maquina),
                        INDEX idx_estado (estado),
                        INDEX idx_fecha_tinta (fecha_tinta_en_maquina),
                        INDEX idx_maquina_estado (numero_maquina, estado),
                        INDEX idx_ot_sap (ot_sap),
                        INDEX idx_cliente (cliente),
                        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ";

                await _context.Database.ExecuteSqlRawAsync(createTableSql);

                _logger.LogInformation("✅ Tabla maquinas creada exitosamente");

                // Insertar datos de prueba usando Entity Framework
                _logger.LogInformation("📝 Insertando datos de prueba...");
                
                var maquinas = new List<Maquina>
                {
                    new Maquina
                    {
                        Articulo = "F204567",
                        NumeroMaquina = 11,
                        OtSap = "OT123456",
                        Cliente = "ABSORBENTES DE COLOMBIA S.A",
                        Referencia = "REF-ABS-001",
                        Td = "TD1",
                        NumeroColores = 4,
                        Colores = "[\"CYAN\",\"MAGENTA\",\"AMARILLO\",\"NEGRO\"]",
                        Kilos = 1500.00m,
                        FechaTintaEnMaquina = DateTime.Now,
                        Sustrato = "BOPP",
                        Estado = "LISTO",
                        Observaciones = "Programa listo",
                        LastActionBy = "Sistema",
                        LastActionAt = DateTime.Now,
                        CreatedBy = 1,
                        UpdatedBy = 1
                    },
                    new Maquina
                    {
                        Articulo = "F204568",
                        NumeroMaquina = 11,
                        OtSap = "OT123457",
                        Cliente = "PRODUCTOS FAMILIA S.A",
                        Referencia = "REF-FAM-002",
                        Td = "TD2",
                        NumeroColores = 3,
                        Colores = "[\"CYAN\",\"MAGENTA\",\"AMARILLO\"]",
                        Kilos = 2000.00m,
                        FechaTintaEnMaquina = DateTime.Now,
                        Sustrato = "PE",
                        Estado = "LISTO",
                        Observaciones = "Programa listo",
                        LastActionBy = "Sistema",
                        LastActionAt = DateTime.Now,
                        CreatedBy = 1,
                        UpdatedBy = 1
                    },
                    new Maquina
                    {
                        Articulo = "F204569",
                        NumeroMaquina = 12,
                        OtSap = "OT123458",
                        Cliente = "COLOMBINA S.A",
                        Referencia = "REF-COL-003",
                        Td = "TD3",
                        NumeroColores = 5,
                        Colores = "[\"CYAN\",\"MAGENTA\",\"AMARILLO\",\"NEGRO\",\"BLANCO\"]",
                        Kilos = 1800.00m,
                        FechaTintaEnMaquina = DateTime.Now,
                        Sustrato = "PET",
                        Estado = "CORRIENDO",
                        Observaciones = "En producción",
                        LastActionBy = "Sistema",
                        LastActionAt = DateTime.Now,
                        CreatedBy = 1,
                        UpdatedBy = 1
                    }
                };

                // Agregar todas las máquinas sin verificar duplicados
                _context.Maquinas.AddRange(maquinas);
                
                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"⚠️ Algunos registros ya existen: {ex.Message}");
                }

                _logger.LogInformation("✅ Datos de prueba insertados");

                return Ok(new
                {
                    success = true,
                    message = "Tabla maquinas creada y poblada exitosamente",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error creando tabla maquinas");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error creando tabla maquinas",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }
    }
}
