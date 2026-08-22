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

        private string GetCleanConnectionString()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Connection string not found");
            }

            // Remover parámetros no soportados por MySqlConnector
            connectionString = System.Text.RegularExpressions.Regex.Replace(
                connectionString,
                @"ConnectionIdleTimeout=\d+;?",
                "",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);

            return connectionString;
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


        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var aniloxList = new List<object>();
                using var connection = new MySqlConnection(GetCleanConnectionString());
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


        [HttpGet("machine/{machineNumber}")]
        public async Task<IActionResult> GetByMachine(int machineNumber)
        {
            try
            {
                var aniloxList = new List<object>();
                using var connection = new MySqlConnection(GetCleanConnectionString());
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


        [HttpGet("lineaturas")]
        public async Task<IActionResult> GetUniqueLineaturas()
        {
            try
            {
                var lineaturas = new List<int>();
                using var connection = new MySqlConnection(GetCleanConnectionString());
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


        [HttpGet("lineatura/{lineatura}")]
        public async Task<IActionResult> GetByLineatura(int lineatura)
        {
            try
            {
                var aniloxList = new List<object>();
                using var connection = new MySqlConnection(GetCleanConnectionString());
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


        [HttpGet("bcm/{bcm}")]
        public async Task<IActionResult> GetByBCM(int bcm)
        {
            try
            {
                var aniloxList = new List<object>();
                using var connection = new MySqlConnection(GetCleanConnectionString());
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


        [HttpGet("lineatura/{lineatura}/machine/{machineNumber}")]
        public async Task<IActionResult> GetByLineaturaAndMachine(int lineatura, int machineNumber)
        {
            try
            {
                var aniloxList = new List<object>();
                using var connection = new MySqlConnection(GetCleanConnectionString());
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


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAniloxDto dto)
        {
            try
            {
                _logger.LogDebug($"📝 Creando anilox: {dto.Codigo}");

                using var connection = new MySqlConnection(GetCleanConnectionString());
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

                _logger.LogDebug($"✅ Anilox {dto.Codigo} creado con ID: {newId}");


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
                _logger.LogError(ex, $"❌ Error al crear anilox {dto.Codigo}");
                return StatusCode(500, new {
                    message = "Error al crear anilox",
                    error = ex.Message,
                    stackTrace = ex.StackTrace,
                    innerError = ex.InnerException?.Message
                });
            }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAniloxDto dto)
        {
            try
            {
                _logger.LogDebug("🔵 ===== INICIO ACTUALIZACIÓN ANILOX =====");
                _logger.LogDebug("📝 ID: {Id}", id);
                _logger.LogDebug("📝 DTO recibido: {@Dto}", dto);

                using var connection = new MySqlConnection(GetCleanConnectionString());
                await connection.OpenAsync();

                var updates = new List<string>();
                var command = new MySqlCommand();
                command.Connection = connection;

                if (!string.IsNullOrEmpty(dto.Codigo))
                {
                    updates.Add("codigo = @Codigo");
                    command.Parameters.AddWithValue("@Codigo", dto.Codigo);
                    _logger.LogDebug("📝 Actualizando codigo: {Codigo}", dto.Codigo);
                }
                if (dto.Maquina.HasValue)
                {
                    updates.Add("maquina = @Maquina");
                    command.Parameters.AddWithValue("@Maquina", dto.Maquina.Value);
                    _logger.LogDebug("📝 Actualizando maquina: {Maquina}", dto.Maquina.Value);
                }
                if (dto.BCM.HasValue)
                {
                    updates.Add("bcm = @BCM");
                    command.Parameters.AddWithValue("@BCM", dto.BCM.Value);
                    _logger.LogDebug("📝 Actualizando BCM: {BCM}", dto.BCM.Value);
                }
                if (dto.Lineatura.HasValue)
                {
                    updates.Add("lineatura = @Lineatura");
                    command.Parameters.AddWithValue("@Lineatura", dto.Lineatura.Value);
                    _logger.LogDebug("📝 Actualizando lineatura: {Lineatura}", dto.Lineatura.Value);
                }
                if (!string.IsNullOrEmpty(dto.Marca))
                {
                    updates.Add("marca = @Marca");
                    command.Parameters.AddWithValue("@Marca", dto.Marca);
                    _logger.LogDebug("📝 Actualizando marca: {Marca}", dto.Marca);
                }
                if (dto.VolumenReal.HasValue)
                {
                    updates.Add("volumen_real = @VolumenReal");
                    command.Parameters.AddWithValue("@VolumenReal", dto.VolumenReal.Value);
                    _logger.LogDebug("📝 Actualizando volumen_real: {VolumenReal}", dto.VolumenReal.Value);
                }
                if (dto.FactorEficiencia.HasValue)
                {
                    updates.Add("factor_eficiencia = @FactorEficiencia");
                    command.Parameters.AddWithValue("@FactorEficiencia", dto.FactorEficiencia.Value);
                    _logger.LogDebug("📝 Actualizando factor_eficiencia: {FactorEficiencia}", dto.FactorEficiencia.Value);
                }
                if (dto.Densidad.HasValue)
                {
                    updates.Add("densidad = @Densidad");
                    command.Parameters.AddWithValue("@Densidad", dto.Densidad.Value);
                    _logger.LogDebug("📝 Actualizando densidad: {Densidad}", dto.Densidad.Value);
                }

                if (updates.Count == 0)
                {
                    _logger.LogWarning("⚠️ No hay campos para actualizar");
                    return BadRequest(new { message = "No hay campos para actualizar" });
                }

                command.CommandText = $"UPDATE anilox SET {string.Join(", ", updates)} WHERE id = @Id";
                command.Parameters.AddWithValue("@Id", id);

                _logger.LogDebug("📝 SQL: {SQL}", command.CommandText);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                _logger.LogDebug("✅ {RowsAffected} fila(s) actualizada(s)", rowsAffected);


                using var selectCommand = new MySqlCommand("SELECT * FROM anilox WHERE id = @Id", connection);
                selectCommand.Parameters.AddWithValue("@Id", id);

                using var reader = (MySqlDataReader)await selectCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var result = ReadAniloxFromReader(reader);
                    _logger.LogDebug("✅ Anilox actualizado: {@Result}", result);
                    _logger.LogDebug("🔵 ===== FIN ACTUALIZACIÓN ANILOX =====");
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


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                using var connection = new MySqlConnection(GetCleanConnectionString());
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


        [HttpPost("import")]
        public async Task<IActionResult> ImportFromExcel([FromBody] List<ImportAniloxFromExcelDto> aniloxList)
        {
            try
            {
                _logger.LogDebug($"📥 Iniciando importación de {aniloxList.Count} anilox desde Excel");
                _logger.LogDebug($"🔄 Lógica: Si el código existe se SOBRESCRIBE toda la información, si no existe se CREA");

                int created = 0;
                int updated = 0;
                int errors = 0;
                var errorDetails = new List<string>();

                using var connection = new MySqlConnection(GetCleanConnectionString());
                await connection.OpenAsync();

                foreach (var item in aniloxList)
                {
                    try
                    {
                        _logger.LogDebug($"🔍 Procesando anilox código: {item.Codigo}");

                        // Verificar si el código ya existe
                        using var checkCommand = new MySqlCommand(
                            "SELECT id FROM anilox WHERE codigo = @Codigo",
                            connection);
                        checkCommand.Parameters.AddWithValue("@Codigo", item.Codigo);

                        var existingId = await checkCommand.ExecuteScalarAsync();

                        if (existingId != null)
                        {
                            // SOBRESCRIBIR: El código existe, actualizar TODA la información
                            _logger.LogDebug($"📝 Código {item.Codigo} existe (ID: {existingId}), SOBRESCRIBIENDO toda la información...");

                            using var updateCommand = new MySqlCommand(
                                @"UPDATE anilox SET
                                    maquina = @Maquina,
                                    bcm = @BCM,
                                    lineatura = @Lineatura,
                                    marca = @Marca,
                                    volumen_real = @VolumenReal,
                                    factor_eficiencia = @FactorEficiencia,
                                    densidad = @Densidad,
                                    updated_at = CURRENT_TIMESTAMP
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

                            var rowsAffected = await updateCommand.ExecuteNonQueryAsync();
                            
                            if (rowsAffected > 0)
                            {
                                updated++;
                                _logger.LogDebug($"✅ Anilox {item.Codigo} SOBRESCRITO exitosamente");
                            }
                            else
                            {
                                _logger.LogWarning($"⚠️ Anilox {item.Codigo} no se pudo actualizar");
                            }
                        }
                        else
                        {
                            // CREAR: El código no existe, insertar nuevo registro
                            _logger.LogDebug($"➕ Código {item.Codigo} NO existe, CREANDO nuevo registro...");

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
                            _logger.LogDebug($"✅ Anilox {item.Codigo} CREADO exitosamente");
                        }
                    }
                    catch (Exception ex)
                    {
                        var errorMsg = $"Código {item.Codigo}: {ex.Message}";
                        _logger.LogError(ex, $"❌ Error procesando anilox código {item.Codigo}");
                        errorDetails.Add(errorMsg);
                        errors++;
                    }
                }

                _logger.LogDebug($"🎉 Importación completada: {created} creados, {updated} sobrescritos, {errors} errores");

                return Ok(new {
                    created,
                    updated,
                    errors,
                    totalProcessed = created + updated,
                    errorDetails = errors > 0 ? errorDetails : null,
                    message = $"Importación exitosa: {created} anilox nuevos creados, {updated} anilox existentes sobrescritos"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error crítico al importar anilox");
                return StatusCode(500, new {
                    message = "Error al importar anilox",
                    error = ex.Message,
                    stackTrace = ex.StackTrace,
                    innerError = ex.InnerException?.Message
                });
            }
        }


        [HttpGet("check-table")]
                public async Task<IActionResult> CheckTableStructure()
                {
                    try
                    {
                        using var connection = new MySqlConnection(GetCleanConnectionString());
                        await connection.OpenAsync();

                        using var command = new MySqlCommand(@"
                            SELECT
                                COLUMN_NAME,
                                DATA_TYPE,
                                COLUMN_TYPE,
                                COLUMN_DEFAULT,
                                IS_NULLABLE,
                                COLUMN_COMMENT
                            FROM INFORMATION_SCHEMA.COLUMNS
                            WHERE TABLE_SCHEMA = DATABASE()
                            AND TABLE_NAME = 'anilox'
                            ORDER BY ORDINAL_POSITION", connection);

                        var columns = new List<object>();
                        using var reader = await command.ExecuteReaderAsync();

                        while (await reader.ReadAsync())
                        {
                            columns.Add(new
                            {
                                name = reader.GetString(0),
                                type = reader.GetString(1),
                                columnType = reader.GetString(2),
                                defaultValue = reader.IsDBNull(3) ? null : reader.GetString(3),
                                nullable = reader.GetString(4),
                                comment = reader.IsDBNull(5) ? null : reader.GetString(5)
                            });
                        }

                        var hasFactorEficiencia = columns.Any(c => ((dynamic)c).name == "factor_eficiencia");
                        var hasDensidad = columns.Any(c => ((dynamic)c).name == "densidad");
                        var bcmColumn = columns.FirstOrDefault(c => ((dynamic)c).name == "bcm");
                        var bcmType = bcmColumn != null ? ((dynamic)bcmColumn).columnType : "NOT FOUND";

                        return Ok(new
                        {
                            database = connection.Database,
                            table = "anilox",
                            columns,
                            hasFactorEficiencia,
                            hasDensidad,
                            bcmType,
                            bcmIsDecimal = bcmType.Contains("decimal"),
                            status = hasFactorEficiencia && hasDensidad && bcmType.Contains("decimal") ? "✅ Tabla actualizada correctamente" : "❌ Faltan columnas o BCM no es DECIMAL"
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error verificando estructura de tabla");
                        return StatusCode(500, new { message = "Error verificando tabla", error = ex.Message });
                    }
                }

        [HttpPost("force-migration")]
        public async Task<IActionResult> ForceMigration()
        {
            try
            {
                _logger.LogDebug("🔧 Forzando migración de BCM a DECIMAL");
                
                using var connection = new MySqlConnection(GetCleanConnectionString());
                await connection.OpenAsync();
                
                // Verificar tipo actual
                using var checkCmd = new MySqlCommand(
                    @"SELECT DATA_TYPE, COLUMN_TYPE 
                      FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = DATABASE() 
                      AND TABLE_NAME = 'anilox' 
                      AND COLUMN_NAME = 'bcm'", 
                    connection);
                
                using var reader = await checkCmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var dataType = reader.GetString(0);
                    var columnType = reader.GetString(1);
                    _logger.LogDebug($"📊 Columna bcm actual: {dataType} ({columnType})");
                    
                    if (dataType == "int")
                    {
                        await reader.CloseAsync();
                        _logger.LogDebug("🔄 Convirtiendo bcm de INT a DECIMAL(5,2)...");
                        
                        using var alterCmd = new MySqlCommand(
                            "ALTER TABLE `anilox` MODIFY COLUMN `bcm` DECIMAL(5, 2) NOT NULL COMMENT 'BCM (Billion Cubic Microns) - soporta decimales como 8.3'",
                            connection);
                        
                        await alterCmd.ExecuteNonQueryAsync();
                        _logger.LogDebug("✅ Migración completada: bcm ahora es DECIMAL(5,2)");
                        
                        return Ok(new { 
                            message = "Migración completada exitosamente",
                            before = $"{dataType} ({columnType})",
                            after = "decimal(5,2)"
                        });
                    }
                    else
                    {
                        _logger.LogDebug("✅ Columna bcm ya es DECIMAL");
                        return Ok(new { 
                            message = "No se requiere migración, bcm ya es DECIMAL",
                            currentType = $"{dataType} ({columnType})"
                        });
                    }
                }
                
                return NotFound(new { message = "Columna bcm no encontrada" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error ejecutando migración forzada");
                return StatusCode(500, new { 
                    message = "Error ejecutando migración", 
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

    }


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
        public decimal AporteTeorico { get; set; }  // Cambiado de int a decimal para soportar valores como 8.3
        public string? Proveedor { get; set; }
        public decimal Aporte { get; set; }
        public decimal? FactorEficiencia { get; set; }
        public decimal? Densidad { get; set; }
    }
}
