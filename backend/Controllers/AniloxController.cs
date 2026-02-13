using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MySql.Data.MySqlClient;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AniloxController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<AniloxController> _logger;

        public AniloxController(IConfiguration configuration, ILogger<AniloxController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private object ReadAniloxFromReader(MySqlDataReader reader)
        {
            return new
            {
                id = reader.GetInt32(reader.GetOrdinal("id")),
                codigo = reader.GetString(reader.GetOrdinal("codigo")),
                maquina = reader.GetInt32(reader.GetOrdinal("maquina")),
                bcm = reader.GetInt32(reader.GetOrdinal("bcm")),
                lineatura = reader.GetInt32(reader.GetOrdinal("lineatura")),
                marca = reader.GetString(reader.GetOrdinal("marca")),
                volumen_real = reader.GetDecimal(reader.GetOrdinal("volumen_real")),
                factor_eficiencia = reader.IsDBNull(reader.GetOrdinal("factor_eficiencia")) 
                    ? (decimal?)null 
                    : reader.GetDecimal(reader.GetOrdinal("factor_eficiencia")),
                densidad = reader.IsDBNull(reader.GetOrdinal("densidad")) 
                    ? (decimal?)null 
                    : reader.GetDecimal(reader.GetOrdinal("densidad"))
            };
        }

        // GET: api/anilox
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var aniloxList = new List<object>();
                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();
                
                using var command = new MySqlCommand("SELECT * FROM anilox ORDER BY lineatura, volumen_real", connection);
                using var reader = (MySqlDataReader)await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    aniloxList.Add(ReadAniloxFromReader(reader));
                }
                
                return Ok(aniloxList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener anilox");
                return StatusCode(500, new { message = "Error al obtener anilox", error = ex.Message });
            }
        }

        // GET: api/anilox/machine/{machineNumber}
        [HttpGet("machine/{machineNumber}")]
        public async Task<IActionResult> GetByMachine(int machineNumber)
        {
            try
            {
                var aniloxList = new List<object>();
                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();
                
                using var command = new MySqlCommand(
                    "SELECT * FROM anilox WHERE maquina = @MachineNumber ORDER BY lineatura, volumen_real", 
                    connection);
                command.Parameters.AddWithValue("@MachineNumber", machineNumber);
                
                using var reader = (MySqlDataReader)await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    aniloxList.Add(ReadAniloxFromReader(reader));
                }
                
                return Ok(aniloxList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener anilox por máquina");
                return StatusCode(500, new { message = "Error al obtener anilox", error = ex.Message });
            }
        }

        // GET: api/anilox/lineaturas
        [HttpGet("lineaturas")]
        public async Task<IActionResult> GetUniqueLineaturas()
        {
            try
            {
                var lineaturas = new List<int>();
                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();
                
                using var command = new MySqlCommand("SELECT DISTINCT lineatura FROM anilox ORDER BY lineatura", connection);
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    lineaturas.Add(reader.GetInt32(0));
                }
                
                return Ok(lineaturas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener lineaturas");
                return StatusCode(500, new { message = "Error al obtener lineaturas", error = ex.Message });
            }
        }

        // GET: api/anilox/lineatura/{lineatura}
        [HttpGet("lineatura/{lineatura}")]
        public async Task<IActionResult> GetByLineatura(int lineatura)
        {
            try
            {
                var aniloxList = new List<object>();
                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();
                
                using var command = new MySqlCommand(
                    "SELECT * FROM anilox WHERE lineatura = @Lineatura ORDER BY volumen_real", 
                    connection);
                command.Parameters.AddWithValue("@Lineatura", lineatura);
                
                using var reader = (MySqlDataReader)await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    aniloxList.Add(ReadAniloxFromReader(reader));
                }
                
                return Ok(aniloxList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener anilox por lineatura");
                return StatusCode(500, new { message = "Error al obtener anilox", error = ex.Message });
            }
        }

        // GET: api/anilox/bcm/{bcm}
        [HttpGet("bcm/{bcm}")]
        public async Task<IActionResult> GetByBCM(int bcm)
        {
            try
            {
                var aniloxList = new List<object>();
                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();
                
                using var command = new MySqlCommand(
                    "SELECT * FROM anilox WHERE bcm = @BCM ORDER BY volumen_real", 
                    connection);
                command.Parameters.AddWithValue("@BCM", bcm);
                
                using var reader = (MySqlDataReader)await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    aniloxList.Add(ReadAniloxFromReader(reader));
                }
                
                return Ok(aniloxList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener anilox por BCM");
                return StatusCode(500, new { message = "Error al obtener anilox", error = ex.Message });
            }
        }

        // GET: api/anilox/lineatura/{lineatura}/machine/{machineNumber}
        [HttpGet("lineatura/{lineatura}/machine/{machineNumber}")]
        public async Task<IActionResult> GetByLineaturaAndMachine(int lineatura, int machineNumber)
        {
            try
            {
                var aniloxList = new List<object>();
                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();
                
                using var command = new MySqlCommand(
                    @"SELECT * FROM anilox 
                      WHERE lineatura = @Lineatura AND maquina = @MachineNumber 
                      ORDER BY volumen_real", 
                    connection);
                command.Parameters.AddWithValue("@Lineatura", lineatura);
                command.Parameters.AddWithValue("@MachineNumber", machineNumber);
                
                using var reader = (MySqlDataReader)await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    aniloxList.Add(ReadAniloxFromReader(reader));
                }
                
                return Ok(aniloxList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener anilox por lineatura y máquina");
                return StatusCode(500, new { message = "Error al obtener anilox", error = ex.Message });
            }
        }

        // POST: api/anilox
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAniloxDto dto)
        {
            try
            {
                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();
                
                using var command = new MySqlCommand(
                    @"INSERT INTO anilox (codigo, maquina, bcm, lineatura, marca, volumen_real, factor_eficiencia, densidad) 
                      VALUES (@Codigo, @Maquina, @BCM, @Lineatura, @Marca, @VolumenReal, @FactorEficiencia, @Densidad);
                      SELECT LAST_INSERT_ID();", 
                    connection);
                
                command.Parameters.AddWithValue("@Codigo", dto.Codigo);
                command.Parameters.AddWithValue("@Maquina", dto.Maquina);
                command.Parameters.AddWithValue("@BCM", dto.BCM);
                command.Parameters.AddWithValue("@Lineatura", dto.Lineatura);
                command.Parameters.AddWithValue("@Marca", dto.Marca);
                command.Parameters.AddWithValue("@VolumenReal", dto.VolumenReal);
                command.Parameters.AddWithValue("@FactorEficiencia", dto.FactorEficiencia ?? 35.00m);
                command.Parameters.AddWithValue("@Densidad", dto.Densidad ?? 0.885m);
                
                var newId = Convert.ToInt32(await command.ExecuteScalarAsync());
                
                // Obtener el anilox recién creado
                using var selectCommand = new MySqlCommand("SELECT * FROM anilox WHERE id = @Id", connection);
                selectCommand.Parameters.AddWithValue("@Id", newId);
                
                using var reader = (MySqlDataReader)await selectCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    return Ok(ReadAniloxFromReader(reader));
                }
                
                return StatusCode(500, new { message = "Error al recuperar el anilox creado" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear anilox");
                return StatusCode(500, new { message = "Error al crear anilox", error = ex.Message });
            }
        }

        // PUT: api/anilox/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAniloxDto dto)
        {
            try
            {
                _logger.LogInformation("🔵 ===== INICIO ACTUALIZACIÓN ANILOX =====");
                _logger.LogInformation("📝 ID: {Id}", id);
                _logger.LogInformation("📝 DTO recibido: {@Dto}", dto);
                
                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();
                
                var updates = new List<string>();
                var command = new MySqlCommand();
                command.Connection = connection;
                
                if (!string.IsNullOrEmpty(dto.Codigo))
                {
                    updates.Add("codigo = @Codigo");
                    command.Parameters.AddWithValue("@Codigo", dto.Codigo);
                    _logger.LogInformation("📝 Actualizando codigo: {Codigo}", dto.Codigo);
                }
                if (dto.Maquina.HasValue)
                {
                    updates.Add("maquina = @Maquina");
                    command.Parameters.AddWithValue("@Maquina", dto.Maquina.Value);
                    _logger.LogInformation("📝 Actualizando maquina: {Maquina}", dto.Maquina.Value);
                }
                if (dto.BCM.HasValue)
                {
                    updates.Add("bcm = @BCM");
                    command.Parameters.AddWithValue("@BCM", dto.BCM.Value);
                    _logger.LogInformation("📝 Actualizando BCM: {BCM}", dto.BCM.Value);
                }
                if (dto.Lineatura.HasValue)
                {
                    updates.Add("lineatura = @Lineatura");
                    command.Parameters.AddWithValue("@Lineatura", dto.Lineatura.Value);
                    _logger.LogInformation("📝 Actualizando lineatura: {Lineatura}", dto.Lineatura.Value);
                }
                if (!string.IsNullOrEmpty(dto.Marca))
                {
                    updates.Add("marca = @Marca");
                    command.Parameters.AddWithValue("@Marca", dto.Marca);
                    _logger.LogInformation("📝 Actualizando marca: {Marca}", dto.Marca);
                }
                if (dto.VolumenReal.HasValue)
                {
                    updates.Add("volumen_real = @VolumenReal");
                    command.Parameters.AddWithValue("@VolumenReal", dto.VolumenReal.Value);
                    _logger.LogInformation("📝 Actualizando volumen_real: {VolumenReal}", dto.VolumenReal.Value);
                }
                if (dto.FactorEficiencia.HasValue)
                {
                    updates.Add("factor_eficiencia = @FactorEficiencia");
                    command.Parameters.AddWithValue("@FactorEficiencia", dto.FactorEficiencia.Value);
                    _logger.LogInformation("📝 Actualizando factor_eficiencia: {FactorEficiencia}", dto.FactorEficiencia.Value);
                }
                if (dto.Densidad.HasValue)
                {
                    updates.Add("densidad = @Densidad");
                    command.Parameters.AddWithValue("@Densidad", dto.Densidad.Value);
                    _logger.LogInformation("📝 Actualizando densidad: {Densidad}", dto.Densidad.Value);
                }
                
                if (updates.Count == 0)
                {
                    _logger.LogWarning("⚠️ No hay campos para actualizar");
                    return BadRequest(new { message = "No hay campos para actualizar" });
                }
                
                command.CommandText = $"UPDATE anilox SET {string.Join(", ", updates)} WHERE id = @Id";
                command.Parameters.AddWithValue("@Id", id);
                
                _logger.LogInformation("📝 SQL: {SQL}", command.CommandText);
                
                var rowsAffected = await command.ExecuteNonQueryAsync();
                _logger.LogInformation("✅ {RowsAffected} fila(s) actualizada(s)", rowsAffected);
                
                // Obtener el anilox actualizado
                using var selectCommand = new MySqlCommand("SELECT * FROM anilox WHERE id = @Id", connection);
                selectCommand.Parameters.AddWithValue("@Id", id);
                
                using var reader = (MySqlDataReader)await selectCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var result = ReadAniloxFromReader(reader);
                    _logger.LogInformation("✅ Anilox actualizado: {@Result}", result);
                    _logger.LogInformation("🔵 ===== FIN ACTUALIZACIÓN ANILOX =====");
                    return Ok(result);
                }
                
                _logger.LogWarning("⚠️ Anilox no encontrado después de actualizar");
                return NotFound(new { message = "Anilox no encontrado" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al actualizar anilox");
                return StatusCode(500, new { message = "Error al actualizar anilox", error = ex.Message });
            }
        }

        // DELETE: api/anilox/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();
                
                using var command = new MySqlCommand("DELETE FROM anilox WHERE id = @Id", connection);
                command.Parameters.AddWithValue("@Id", id);
                
                var rowsAffected = await command.ExecuteNonQueryAsync();
                
                if (rowsAffected > 0)
                {
                    return Ok(new { message = "Anilox eliminado exitosamente" });
                }
                
                return NotFound(new { message = "Anilox no encontrado" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar anilox");
                return StatusCode(500, new { message = "Error al eliminar anilox", error = ex.Message });
            }
        }

        // POST: api/anilox/import
        [HttpPost("import")]
        public async Task<IActionResult> ImportFromExcel([FromBody] List<ImportAniloxFromExcelDto> aniloxList)
        {
            try
            {
                int created = 0;
                int updated = 0;
                int errors = 0;

                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();

                foreach (var item in aniloxList)
                {
                    try
                    {
                        // Verificar si el anilox ya existe por código
                        using var checkCommand = new MySqlCommand(
                            "SELECT id FROM anilox WHERE codigo = @Codigo",
                            connection);
                        checkCommand.Parameters.AddWithValue("@Codigo", item.Codigo);
                        
                        var existingId = await checkCommand.ExecuteScalarAsync();

                        if (existingId != null)
                        {
                            // Actualizar existente
                            using var updateCommand = new MySqlCommand(
                                @"UPDATE anilox SET 
                                    maquina = @Maquina,
                                    bcm = @BCM,
                                    lineatura = @Lineatura,
                                    marca = @Marca,
                                    volumen_real = @VolumenReal,
                                    factor_eficiencia = @FactorEficiencia,
                                    densidad = @Densidad
                                  WHERE codigo = @Codigo",
                                connection);
                            
                            updateCommand.Parameters.AddWithValue("@Codigo", item.Codigo);
                            updateCommand.Parameters.AddWithValue("@Maquina", item.Maquina);
                            updateCommand.Parameters.AddWithValue("@BCM", item.AporteTeorico);
                            updateCommand.Parameters.AddWithValue("@Lineatura", item.Lineatura);
                            updateCommand.Parameters.AddWithValue("@Marca", item.Proveedor ?? "APEX");
                            updateCommand.Parameters.AddWithValue("@VolumenReal", item.Aporte);
                            updateCommand.Parameters.AddWithValue("@FactorEficiencia", item.FactorEficiencia ?? 35.00m);
                            updateCommand.Parameters.AddWithValue("@Densidad", item.Densidad ?? 0.885m);
                            
                            await updateCommand.ExecuteNonQueryAsync();
                            updated++;
                        }
                        else
                        {
                            // Crear nuevo
                            using var insertCommand = new MySqlCommand(
                                @"INSERT INTO anilox 
                                    (codigo, maquina, bcm, lineatura, marca, volumen_real, factor_eficiencia, densidad) 
                                  VALUES 
                                    (@Codigo, @Maquina, @BCM, @Lineatura, @Marca, @VolumenReal, @FactorEficiencia, @Densidad)",
                                connection);
                            
                            insertCommand.Parameters.AddWithValue("@Codigo", item.Codigo);
                            insertCommand.Parameters.AddWithValue("@Maquina", item.Maquina);
                            insertCommand.Parameters.AddWithValue("@BCM", item.AporteTeorico);
                            insertCommand.Parameters.AddWithValue("@Lineatura", item.Lineatura);
                            insertCommand.Parameters.AddWithValue("@Marca", item.Proveedor ?? "APEX");
                            insertCommand.Parameters.AddWithValue("@VolumenReal", item.Aporte);
                            insertCommand.Parameters.AddWithValue("@FactorEficiencia", item.FactorEficiencia ?? 35.00m);
                            insertCommand.Parameters.AddWithValue("@Densidad", item.Densidad ?? 0.885m);
                            
                            await insertCommand.ExecuteNonQueryAsync();
                            created++;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error procesando anilox {item.Codigo}");
                        errors++;
                    }
                }

                return Ok(new { created, updated, errors });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al importar anilox");
                return StatusCode(500, new { message = "Error al importar anilox", error = ex.Message });
            }
        }
    }

    // DTOs
    public class CreateAniloxDto
    {
        public string Codigo { get; set; } = string.Empty;
        public int Maquina { get; set; }
        public int BCM { get; set; }
        public int Lineatura { get; set; }
        public string Marca { get; set; } = string.Empty;
        public decimal VolumenReal { get; set; }
        public decimal? FactorEficiencia { get; set; }
        public decimal? Densidad { get; set; }
    }

    public class UpdateAniloxDto
    {
        public string? Codigo { get; set; }
        public int? Maquina { get; set; }
        public int? BCM { get; set; }
        public int? Lineatura { get; set; }
        public string? Marca { get; set; }
        public decimal? VolumenReal { get; set; }
        public decimal? FactorEficiencia { get; set; }
        public decimal? Densidad { get; set; }
    }

    public class ImportAniloxFromExcelDto
    {
        public string Codigo { get; set; } = string.Empty;
        public int Maquina { get; set; }
        public int Lineatura { get; set; }
        public int AporteTeorico { get; set; }
        public string? Proveedor { get; set; }
        public decimal Aporte { get; set; }
        public decimal? FactorEficiencia { get; set; }
        public decimal? Densidad { get; set; }
    }
}
