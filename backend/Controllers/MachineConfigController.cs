using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MachineConfigController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<MachineConfigController> _logger;

        public MachineConfigController(IConfiguration configuration, ILogger<MachineConfigController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                _logger.LogDebug("📋 Obteniendo todas las configuraciones de máquinas");

                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();

                using var command = new MySqlCommand("SELECT * FROM machine_config ORDER BY numero_maquina", connection);
                using var reader = await command.ExecuteReaderAsync();

                var configs = new List<object>();
                while (await reader.ReadAsync())
                {
                    configs.Add(new
                    {
                        id = reader.GetInt32("id"),
                        numero_maquina = reader.GetInt32("numero_maquina"),
                        carga_muestra = reader.IsDBNull(reader.GetOrdinal("carga_muestra"))
                            ? (decimal?)null
                            : reader.GetDecimal("carga_muestra")
                    });
                }

                _logger.LogDebug("✅ {Count} configuraciones encontradas", configs.Count);
                return Ok(configs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al obtener configuraciones de máquinas");
                return StatusCode(500, new { message = "Error al obtener configuraciones", error = ex.Message });
            }
        }


        [HttpGet("{numeroMaquina}")]
        public async Task<IActionResult> GetByMachine(int numeroMaquina)
        {
            try
            {
                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();

                using var command = new MySqlCommand(
                    "SELECT * FROM machine_config WHERE numero_maquina = @NumeroMaquina",
                    connection);
                command.Parameters.AddWithValue("@NumeroMaquina", numeroMaquina);

                using var reader = await command.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    return Ok(new
                    {
                        id = reader.GetInt32("id"),
                        numero_maquina = reader.GetInt32("numero_maquina"),
                        carga_muestra = reader.IsDBNull(reader.GetOrdinal("carga_muestra"))
                            ? (decimal?)null
                            : reader.GetDecimal("carga_muestra")
                    });
                }

                return NotFound(new { message = $"Configuración para máquina {numeroMaquina} no encontrada" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener configuración de máquina {NumeroMaquina}", numeroMaquina);
                return StatusCode(500, new { message = "Error al obtener configuración", error = ex.Message });
            }
        }


        [HttpPut("{numeroMaquina}/carga-muestra")]
        public async Task<IActionResult> UpdateCargaMuestra(int numeroMaquina, [FromBody] UpdateCargaMuestraDto dto)
        {
            try
            {
                _logger.LogDebug("🔵 ===== INICIO ACTUALIZACIÓN CARGA MUESTRA =====");
                _logger.LogDebug("📝 Máquina: {NumeroMaquina}", numeroMaquina);
                _logger.LogDebug("📝 Valor recibido: {CargaMuestra}", dto.CargaMuestra);
                _logger.LogDebug("📝 DTO completo: {@Dto}", dto);

                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();


                using var checkCommand = new MySqlCommand(
                    "SELECT id FROM machine_config WHERE numero_maquina = @NumeroMaquina",
                    connection);
                checkCommand.Parameters.AddWithValue("@NumeroMaquina", numeroMaquina);

                var existingId = await checkCommand.ExecuteScalarAsync();

                _logger.LogDebug("🔍 Verificando si existe configuración: {ExistingId}", existingId);

                if (existingId != null)
                {

                    _logger.LogDebug("🔄 Actualizando configuración existente ID: {Id}", existingId);
                    using var updateCommand = new MySqlCommand(
                        "UPDATE machine_config SET carga_muestra = @CargaMuestra WHERE numero_maquina = @NumeroMaquina",
                        connection);
                    updateCommand.Parameters.AddWithValue("@NumeroMaquina", numeroMaquina);
                    updateCommand.Parameters.AddWithValue("@CargaMuestra", (object?)dto.CargaMuestra ?? DBNull.Value);

                    var rowsAffected = await updateCommand.ExecuteNonQueryAsync();
                    _logger.LogDebug("✅ {RowsAffected} fila(s) actualizada(s)", rowsAffected);
                }
                else
                {

                    _logger.LogDebug("➕ Creando nueva configuración para máquina {NumeroMaquina}", numeroMaquina);
                    using var insertCommand = new MySqlCommand(
                        "INSERT INTO machine_config (numero_maquina, carga_muestra) VALUES (@NumeroMaquina, @CargaMuestra)",
                        connection);
                    insertCommand.Parameters.AddWithValue("@NumeroMaquina", numeroMaquina);
                    insertCommand.Parameters.AddWithValue("@CargaMuestra", (object?)dto.CargaMuestra ?? DBNull.Value);

                    await insertCommand.ExecuteNonQueryAsync();
                    _logger.LogDebug("✅ Nueva configuración creada");
                }

                _logger.LogDebug("✅ Carga muestra actualizada exitosamente para máquina {NumeroMaquina}", numeroMaquina);
                _logger.LogDebug("🔵 ===== FIN ACTUALIZACIÓN CARGA MUESTRA =====");

                return Ok(new
                {
                    numero_maquina = numeroMaquina,
                    carga_muestra = dto.CargaMuestra,
                    message = "Carga muestra actualizada exitosamente"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al actualizar carga muestra para máquina {NumeroMaquina}", numeroMaquina);
                return StatusCode(500, new { message = "Error al actualizar carga muestra", error = ex.Message });
            }
        }


        [HttpPost("setup")]
        public async Task<IActionResult> SetupMachineConfig()
        {
            try
            {
                _logger.LogDebug("🔧 Iniciando setup de machine_config");

                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();


                using var checkTableCommand = new MySqlCommand(
                    @"SELECT COUNT(*)
                      FROM information_schema.tables
                      WHERE table_schema = DATABASE()
                      AND table_name = 'machine_config'",
                    connection);

                var tableExists = Convert.ToInt32(await checkTableCommand.ExecuteScalarAsync()) > 0;
                _logger.LogDebug("📊 Tabla machine_config existe: {TableExists}", tableExists);

                if (!tableExists)
                {

                    _logger.LogDebug("➕ Creando tabla machine_config");
                    using var createTableCommand = new MySqlCommand(
                        @"CREATE TABLE `machine_config` (
                            `id` INT AUTO_INCREMENT PRIMARY KEY,
                            `numero_maquina` INT NOT NULL UNIQUE,
                            `carga_muestra` DECIMAL(10, 2) NULL,
                            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            INDEX `idx_numero_maquina` (`numero_maquina`)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
                        connection);
                    await createTableCommand.ExecuteNonQueryAsync();
                    _logger.LogDebug("✅ Tabla machine_config creada");
                }


                using var countCommand = new MySqlCommand("SELECT COUNT(*) FROM machine_config", connection);
                var recordCount = Convert.ToInt32(await countCommand.ExecuteScalarAsync());
                _logger.LogDebug("📊 Registros actuales en machine_config: {RecordCount}", recordCount);


                var machinesInserted = 0;
                for (int machineNumber = 11; machineNumber <= 21; machineNumber++)
                {
                    using var insertCommand = new MySqlCommand(
                        "INSERT IGNORE INTO machine_config (numero_maquina, carga_muestra) VALUES (@NumeroMaquina, NULL)",
                        connection);
                    insertCommand.Parameters.AddWithValue("@NumeroMaquina", machineNumber);
                    var inserted = await insertCommand.ExecuteNonQueryAsync();
                    if (inserted > 0)
                    {
                        machinesInserted++;
                        _logger.LogDebug("➕ Máquina {MachineNumber} insertada", machineNumber);
                    }
                }

                _logger.LogDebug("✅ Setup completado. {MachinesInserted} máquinas insertadas", machinesInserted);


                using var finalCommand = new MySqlCommand("SELECT * FROM machine_config ORDER BY numero_maquina", connection);
                using var reader = await finalCommand.ExecuteReaderAsync();

                var configs = new List<object>();
                while (await reader.ReadAsync())
                {
                    configs.Add(new
                    {
                        id = reader.GetInt32("id"),
                        numero_maquina = reader.GetInt32("numero_maquina"),
                        carga_muestra = reader.IsDBNull(reader.GetOrdinal("carga_muestra"))
                            ? (decimal?)null
                            : reader.GetDecimal("carga_muestra")
                    });
                }

                return Ok(new
                {
                    message = "Setup completado exitosamente",
                    tableExists = tableExists,
                    machinesInserted = machinesInserted,
                    totalRecords = configs.Count,
                    configs = configs
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error en setup de machine_config");
                return StatusCode(500, new { message = "Error en setup", error = ex.Message });
            }
        }
    }

    public class UpdateCargaMuestraDto
    {
        public decimal? CargaMuestra { get; set; }
    }
}
