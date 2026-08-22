using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MySqlConnector;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaquinasBackupController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<MaquinasBackupController> _logger;

        public MaquinasBackupController(IConfiguration configuration, ILogger<MaquinasBackupController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }


        [HttpGet("search")]
        public async Task<IActionResult> SearchBackup(
            [FromQuery] string? articulo = null,
            [FromQuery] string? otSap = null,
            [FromQuery] string? cliente = null,
            [FromQuery] int? numeroMaquina = null,
            [FromQuery] DateTime? fechaDesde = null,
            [FromQuery] DateTime? fechaHasta = null,
            [FromQuery] string? estado = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                _logger.LogDebug("🔍 Buscando en backup - Artículo: {Articulo}, OT: {OT}, Cliente: {Cliente}, Máquina: {Maquina}",
                    articulo, otSap, cliente, numeroMaquina);

                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();


                var whereClauses = new List<string>();
                var command = new MySqlCommand { Connection = connection };

                if (!string.IsNullOrWhiteSpace(articulo))
                {
                    whereClauses.Add("Articulo LIKE @Articulo");
                    command.Parameters.AddWithValue("@Articulo", $"%{articulo}%");
                }

                if (!string.IsNullOrWhiteSpace(otSap))
                {
                    whereClauses.Add("ot_sap LIKE @OtSap");
                    command.Parameters.AddWithValue("@OtSap", $"%{otSap}%");
                }

                if (!string.IsNullOrWhiteSpace(cliente))
                {
                    whereClauses.Add("Cliente LIKE @Cliente");
                    command.Parameters.AddWithValue("@Cliente", $"%{cliente}%");
                }

                if (numeroMaquina.HasValue)
                {
                    whereClauses.Add("NumeroMaquina = @NumeroMaquina");
                    command.Parameters.AddWithValue("@NumeroMaquina", numeroMaquina.Value);
                }

                if (fechaDesde.HasValue)
                {
                    whereClauses.Add("backup_date >= @FechaDesde");
                    command.Parameters.AddWithValue("@FechaDesde", fechaDesde.Value);
                }

                if (fechaHasta.HasValue)
                {
                    whereClauses.Add("backup_date <= @FechaHasta");
                    command.Parameters.AddWithValue("@FechaHasta", fechaHasta.Value.AddDays(1));
                }

                if (!string.IsNullOrWhiteSpace(estado))
                {
                    whereClauses.Add("Estado = @Estado");
                    command.Parameters.AddWithValue("@Estado", estado);
                }

                var whereClause = whereClauses.Count > 0 ? "WHERE " + string.Join(" AND ", whereClauses) : "";


                command.CommandText = $"SELECT COUNT(*) FROM maquinas_backup {whereClause}";
                var totalRecords = Convert.ToInt32(await command.ExecuteScalarAsync());


                var offset = (page - 1) * pageSize;
                command.CommandText = $@"
                    SELECT
                        backup_id, ot_sap, Articulo, NumeroMaquina, Cliente, Referencia, Td,
                        tipo_impresion, NumeroColores, Colores, Kilos, Metros,
                        FechaTintaEnMaquina, Sustrato, Estado, Observaciones,
                        LastActionBy, LastActionAt, preparando_started_at,
                        CreatedBy, UpdatedBy, CreatedAt, UpdatedAt,
                        backup_date, backup_reason, backup_user_id, backup_user_name
                    FROM maquinas_backup
                    {whereClause}
                    ORDER BY backup_date DESC
                    LIMIT @PageSize OFFSET @Offset";

                command.Parameters.AddWithValue("@PageSize", pageSize);
                command.Parameters.AddWithValue("@Offset", offset);

                var backups = new List<object>();
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    backups.Add(new
                    {
                        backupId = reader.GetInt32("backup_id"),
                        otSap = reader.GetString("ot_sap"),
                        articulo = reader.GetString("Articulo"),
                        numeroMaquina = reader.GetInt32("NumeroMaquina"),
                        cliente = reader.GetString("Cliente"),
                        referencia = reader.IsDBNull(reader.GetOrdinal("Referencia")) ? null : reader.GetString("Referencia"),
                        td = reader.IsDBNull(reader.GetOrdinal("Td")) ? null : reader.GetString("Td"),
                        tipoImpresion = reader.IsDBNull(reader.GetOrdinal("tipo_impresion")) ? null : reader.GetString("tipo_impresion"),
                        numeroColores = reader.GetInt32("NumeroColores"),
                        colores = reader.GetString("Colores"),
                        kilos = reader.GetDecimal("Kilos"),
                        metros = reader.IsDBNull(reader.GetOrdinal("Metros")) ? (decimal?)null : reader.GetDecimal("Metros"),
                        fechaTintaEnMaquina = reader.GetDateTime("FechaTintaEnMaquina"),
                        sustrato = reader.GetString("Sustrato"),
                        estado = reader.IsDBNull(reader.GetOrdinal("Estado")) ? null : reader.GetString("Estado"),
                        observaciones = reader.IsDBNull(reader.GetOrdinal("Observaciones")) ? null : reader.GetString("Observaciones"),
                        lastActionBy = reader.IsDBNull(reader.GetOrdinal("LastActionBy")) ? null : reader.GetString("LastActionBy"),
                        lastActionAt = reader.IsDBNull(reader.GetOrdinal("LastActionAt")) ? (DateTime?)null : reader.GetDateTime("LastActionAt"),
                        preparandoStartedAt = reader.IsDBNull(reader.GetOrdinal("preparando_started_at")) ? (DateTime?)null : reader.GetDateTime("preparando_started_at"),
                        createdBy = reader.IsDBNull(reader.GetOrdinal("CreatedBy")) ? (int?)null : reader.GetInt32("CreatedBy"),
                        updatedBy = reader.IsDBNull(reader.GetOrdinal("UpdatedBy")) ? (int?)null : reader.GetInt32("UpdatedBy"),
                        createdAt = reader.IsDBNull(reader.GetOrdinal("CreatedAt")) ? (DateTime?)null : reader.GetDateTime("CreatedAt"),
                        updatedAt = reader.IsDBNull(reader.GetOrdinal("UpdatedAt")) ? (DateTime?)null : reader.GetDateTime("UpdatedAt"),
                        backupDate = reader.GetDateTime("backup_date"),
                        backupReason = reader.GetString("backup_reason"),
                        backupUserId = reader.IsDBNull(reader.GetOrdinal("backup_user_id")) ? (int?)null : reader.GetInt32("backup_user_id"),
                        backupUserName = reader.IsDBNull(reader.GetOrdinal("backup_user_name")) ? null : reader.GetString("backup_user_name")
                    });
                }

                _logger.LogDebug("✅ Encontrados {Count} registros de backup", backups.Count);

                return Ok(new
                {
                    data = backups,
                    totalRecords = totalRecords,
                    page = page,
                    pageSize = pageSize,
                    totalPages = (int)Math.Ceiling((double)totalRecords / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error buscando en backup");
                return StatusCode(500, new { message = "Error al buscar en backup", error = ex.Message });
            }
        }


        [HttpPost("create")]
        public async Task<IActionResult> CreateBackup([FromBody] CreateBackupRequest request)
        {
            try
            {
                _logger.LogDebug("💾 Creando backup - OT: {OT}, Razón: {Reason}", request.OtSap, request.Reason);

                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();

                using var command = new MySqlCommand("CALL sp_backup_maquina(@OtSap, @Reason, @UserId, @UserName)", connection);
                command.Parameters.AddWithValue("@OtSap", request.OtSap);
                command.Parameters.AddWithValue("@Reason", request.Reason);
                command.Parameters.AddWithValue("@UserId", request.UserId ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@UserName", request.UserName ?? (object)DBNull.Value);

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var rowsBackedUp = reader.GetInt32("rows_backed_up");
                    _logger.LogDebug("✅ Backup creado - {Rows} fila(s)", rowsBackedUp);

                    return Ok(new
                    {
                        success = true,
                        message = $"Backup creado exitosamente",
                        rowsBackedUp = rowsBackedUp
                    });
                }

                return BadRequest(new { message = "No se pudo crear el backup" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error creando backup");
                return StatusCode(500, new { message = "Error al crear backup", error = ex.Message });
            }
        }


        [HttpPost("create-by-estado")]
        public async Task<IActionResult> CreateBackupByEstado([FromBody] CreateBackupByEstadoRequest request)
        {
            try
            {
                _logger.LogDebug("💾 Creando backup masivo - Estado: {Estado}", request.Estado);

                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();

                using var command = new MySqlCommand("CALL sp_backup_maquinas_by_estado(@Estado, @UserId, @UserName)", connection);
                command.Parameters.AddWithValue("@Estado", request.Estado);
                command.Parameters.AddWithValue("@UserId", request.UserId ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@UserName", request.UserName ?? (object)DBNull.Value);

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var rowsBackedUp = reader.GetInt32("rows_backed_up");
                    var estado = reader.GetString("estado");

                    _logger.LogDebug("✅ Backup masivo creado - {Rows} fila(s) con estado {Estado}", rowsBackedUp, estado);

                    return Ok(new
                    {
                        success = true,
                        message = $"Backup masivo creado exitosamente",
                        rowsBackedUp = rowsBackedUp,
                        estado = estado
                    });
                }

                return BadRequest(new { message = "No se pudo crear el backup masivo" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error creando backup masivo");
                return StatusCode(500, new { message = "Error al crear backup masivo", error = ex.Message });
            }
        }


        /// <summary>
        /// Obtener meses que tienen datos en el backup (LISTO/TERMINADO)
        /// </summary>
        [HttpGet("meses-disponibles")]
        public async Task<IActionResult> GetMesesDisponibles()
        {
            try
            {
                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();

                using var command = new MySqlCommand(@"
                    SELECT DISTINCT YEAR(backup_date) AS anio, MONTH(backup_date) AS mes
                    FROM maquinas_backup
                    WHERE Estado IN ('LISTO', 'TERMINADO', 'TERMINADA')
                    ORDER BY anio DESC, mes DESC", connection);

                var meses = new List<object>();
                using var reader = await command.ExecuteReaderAsync();
                var mesesNombres = new[] { "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" };

                while (await reader.ReadAsync())
                {
                    var anio = reader.GetInt32("anio");
                    var mesNum = reader.GetInt32("mes");
                    meses.Add(new { value = mesNum, year = anio, label = $"{mesesNombres[mesNum]} {anio}" });
                }

                return Ok(meses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo meses disponibles");
                return Ok(new List<object>());
            }
        }


        /// <summary>
        /// Pantones más usados en los últimos 3 meses (solo pedidos con estado LISTO o TERMINADO)
        /// </summary>
        [HttpGet("pantones-mes")]
        public async Task<IActionResult> GetPantonesMes(
            [FromQuery] int? mes = null,
            [FromQuery] DateTime? fechaDesde = null,
            [FromQuery] DateTime? fechaHasta = null,
            [FromQuery] string? lineaTinta = null)
        {
            try
            {
                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();

                // Por defecto: últimos 3 meses desde el inicio del mes actual - 2 meses
                var today = DateTime.Now;
                DateTime desde;
                DateTime hasta;

                if (fechaDesde.HasValue && fechaHasta.HasValue)
                {
                    // Filtro por rango de fechas (hasta incluye todo el día)
                    desde = fechaDesde.Value.Date;
                    hasta = fechaHasta.Value.Date.AddDays(1).AddSeconds(-1);
                }
                else if (fechaDesde.HasValue)
                {
                    // Solo fecha desde = buscar ese día específico
                    desde = fechaDesde.Value.Date;
                    hasta = fechaDesde.Value.Date.AddDays(1).AddSeconds(-1);
                }
                else if (fechaHasta.HasValue)
                {
                    // Solo fecha hasta = desde inicio del mes hasta esa fecha
                    desde = new DateTime(today.Year, today.Month, 1).AddMonths(-2);
                    hasta = fechaHasta.Value.Date.AddDays(1).AddSeconds(-1);
                }
                else if (mes.HasValue && mes.Value >= 1 && mes.Value <= 12)
                {
                    // Filtro por mes específico del año actual
                    desde = new DateTime(today.Year, mes.Value, 1);
                    hasta = desde.AddMonths(1).AddSeconds(-1);
                }
                else
                {
                    // Default: últimos 3 meses (incluir todo el día de hoy)
                    desde = new DateTime(today.Year, today.Month, 1).AddMonths(-2);
                    hasta = today.Date.AddDays(1).AddSeconds(-1);
                }

                // Si hay filtro de línea de tinta, obtener los artículos que pertenecen a esa línea
                var articulosFiltro = new HashSet<string>();
                bool filtrarPorLinea = !string.IsNullOrWhiteSpace(lineaTinta);
                if (filtrarPorLinea)
                {
                    using var lineaCmd = new MySqlCommand(@"
                        SELECT DISTINCT articulo FROM cod_tintas WHERE linea_tinta = @Linea", connection);
                    lineaCmd.Parameters.AddWithValue("@Linea", lineaTinta);
                    using var lineaReader = await lineaCmd.ExecuteReaderAsync();
                    while (await lineaReader.ReadAsync())
                    {
                        articulosFiltro.Add(lineaReader.GetString(0));
                    }
                    await lineaReader.CloseAsync();
                }

                var command = new MySqlCommand { Connection = connection };
                command.CommandText = @"
                    SELECT b.Articulo AS articulo, b.Colores AS colores, b.ot_sap, b.NumeroMaquina AS numero_maquina, 
                           b.Estado AS estado, b.Kilos AS kilos, COALESCE(b.Metros, 0) AS metros,
                           b.backup_date AS fecha, b.Referencia AS referencia
                    FROM maquinas_backup b
                    WHERE b.backup_date >= @Desde AND b.backup_date <= @Hasta
                      AND b.Estado IN ('LISTO', 'TERMINADO', 'TERMINADA')";
                command.Parameters.AddWithValue("@Desde", desde);
                command.Parameters.AddWithValue("@Hasta", hasta);

                var pantoneCount = new Dictionary<string, int>();
                var pantoneArticulos = new Dictionary<string, HashSet<string>>();
                var pantoneOTs = new Dictionary<string, HashSet<string>>();
                var pantoneMaquinas = new Dictionary<string, HashSet<int>>();
                var pantoneKilos = new Dictionary<string, decimal>();
                var pantoneMetros = new Dictionary<string, decimal>();
                var pantoneMeses = new Dictionary<string, HashSet<string>>();
                var pantoneFechas = new Dictionary<string, DateTime>();
                var pantoneEstados = new Dictionary<string, string>();
                var pantoneColoresCompletos = new Dictionary<string, List<string>>();
                var totalPedidosConAccion = 0;

                // Nombres a excluir: heptacromía y lacas
                var heptaNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                    "BLACK", "WHITE", "CYAN", "MAGENTA", "YELLOW", "GREEN", "ORANGE", "VIOLET",
                    "NEGRO", "BLANCO", "AMARILLO", "VERDE", "NARANJA", "VIOLETA"
                };
                var lacaKeywords = new[] { "LACA", "BARNIZ", "MATE", "BRILLO", "VARNISH", "LACQUER",
                    "PRIMER", "TERMO", "REGISTRO", "REG_", "_REG", "SELLADOR", "ADHESIVO", "PROTECTOR" };

                var mesesAbrev = new[] { "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" };

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var coloresStr = reader.IsDBNull(reader.GetOrdinal("colores")) ? "[]" : reader.GetString("colores");
                    var articulo = reader.GetString("articulo");
                    var otSap = reader.GetString("ot_sap");
                    var maquina = reader.GetInt32("numero_maquina");
                    var kilos = reader.GetDecimal("kilos");
                    var metros = reader.GetDecimal("metros");
                    var fecha = reader.GetDateTime("fecha");
                    var estado = reader.IsDBNull(reader.GetOrdinal("estado")) ? "" : reader.GetString("estado");
                    var mesLabel = $"{mesesAbrev[fecha.Month - 1]} {fecha.Year}";

                    // Filtrar por línea de tinta si aplica
                    if (filtrarPorLinea && !articulosFiltro.Contains(articulo)) continue;

                    totalPedidosConAccion++;

                    try
                    {
                        var colores = System.Text.Json.JsonSerializer.Deserialize<string[]>(coloresStr) ?? Array.Empty<string>();
                        foreach (var color in colores)
                        {
                            if (string.IsNullOrWhiteSpace(color)) continue;
                            var c = color.Trim();

                            if (c.Equals("#N/A", StringComparison.OrdinalIgnoreCase) || c.Equals("N/A", StringComparison.OrdinalIgnoreCase)) continue;
                            if (heptaNames.Contains(c)) continue;
                            var upper = c.ToUpper();
                            if (lacaKeywords.Any(k => upper.Contains(k))) continue;

                            if (!pantoneCount.ContainsKey(c)) pantoneCount[c] = 0;
                            pantoneCount[c]++;

                            if (!pantoneArticulos.ContainsKey(c)) pantoneArticulos[c] = new HashSet<string>();
                            pantoneArticulos[c].Add(articulo);

                            if (!pantoneOTs.ContainsKey(c)) pantoneOTs[c] = new HashSet<string>();
                            pantoneOTs[c].Add(otSap);

                            if (!pantoneMaquinas.ContainsKey(c)) pantoneMaquinas[c] = new HashSet<int>();
                            pantoneMaquinas[c].Add(maquina);

                            if (!pantoneKilos.ContainsKey(c)) pantoneKilos[c] = 0;
                            pantoneKilos[c] += kilos;

                            if (!pantoneMetros.ContainsKey(c)) pantoneMetros[c] = 0;
                            pantoneMetros[c] += metros;

                            if (!pantoneMeses.ContainsKey(c)) pantoneMeses[c] = new HashSet<string>();
                            pantoneMeses[c].Add(mesLabel);

                            // Guardar la fecha más reciente y estado
                            if (!pantoneFechas.ContainsKey(c) || fecha > pantoneFechas[c])
                            {
                                pantoneFechas[c] = fecha;
                                pantoneEstados[c] = estado;
                                pantoneColoresCompletos[c] = colores.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()).ToList();
                            }
                        }
                    }
                    catch { }
                }
                // Cerrar el reader antes de ejecutar otra query en la misma conexión
                await reader.CloseAsync();

                // Líneas de tinta - por ahora vacío, se llenará en el detalle
                var lineaTintaMap = new Dictionary<string, string>();

                var pantones = pantoneCount
                    .OrderByDescending(p => p.Value)
                    .Take(30)
                    .Select(p => new
                    {
                        color = p.Key,
                        cantidad = p.Value,
                        kilos = pantoneKilos.GetValueOrDefault(p.Key, 0),
                        metros = pantoneMetros.GetValueOrDefault(p.Key, 0),
                        fecha = pantoneFechas.ContainsKey(p.Key) ? pantoneFechas[p.Key].ToString("dd/MM/yyyy HH:mm") : "",
                        estado = pantoneEstados.GetValueOrDefault(p.Key, ""),
                        coloresCompletos = pantoneColoresCompletos.ContainsKey(p.Key) ? pantoneColoresCompletos[p.Key].ToArray() : Array.Empty<string>(),
                        lineaTinta = pantoneArticulos.ContainsKey(p.Key) ? 
                            pantoneArticulos[p.Key].Select(a => lineaTintaMap.GetValueOrDefault(a, "")).FirstOrDefault(l => !string.IsNullOrEmpty(l)) ?? "" : "",
                        articulos = pantoneArticulos.ContainsKey(p.Key) ? pantoneArticulos[p.Key].ToArray() : Array.Empty<string>(),
                        ots = pantoneOTs.ContainsKey(p.Key) ? pantoneOTs[p.Key].ToArray() : Array.Empty<string>(),
                        maquinas = pantoneMaquinas.ContainsKey(p.Key) ? pantoneMaquinas[p.Key].OrderBy(m => m).ToArray() : Array.Empty<int>(),
                        meses = pantoneMeses.ContainsKey(p.Key) ? pantoneMeses[p.Key].ToArray() : Array.Empty<string>()
                    });

                // Máquina con más pantones
                var maquinaPantones = new Dictionary<int, int>();
                foreach (var pm in pantoneMaquinas)
                {
                    foreach (var m in pm.Value)
                    {
                        if (!maquinaPantones.ContainsKey(m)) maquinaPantones[m] = 0;
                        maquinaPantones[m]++;
                    }
                }
                var topMaquina = maquinaPantones.OrderByDescending(m => m.Value).FirstOrDefault();

                return Ok(new
                {
                    desde,
                    hasta,
                    totalPedidosConAccion,
                    totalPantonesUnicos = pantoneCount.Count,
                    topMaquina = topMaquina.Key > 0 ? new { maquina = topMaquina.Key, pantones = topMaquina.Value } : null,
                    pantones
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo pantones del mes: {Message}", ex.Message);
                return StatusCode(500, new { message = "Error", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }


        /// <summary>
        /// Obtener pedidos del backup filtrados por pantone (solo LISTO/TERMINADO, últimos 3 meses)
        /// </summary>
        [HttpPost("pedidos-by-pantone")]
        public async Task<IActionResult> GetPedidosByPantone([FromBody] PedidosByPantoneRequest request)
        {
            try
            {
                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();

                var today = DateTime.Now;
                var desde = new DateTime(today.Year, today.Month, 1).AddMonths(-2);

                var command = new MySqlCommand { Connection = connection };
                command.CommandText = @"
                    SELECT b.backup_id, b.ot_sap, b.Articulo, b.NumeroMaquina, b.Cliente, b.Referencia,
                           b.Colores, b.Kilos, COALESCE(b.Metros, 0) AS Metros, b.Estado, b.backup_date
                    FROM maquinas_backup b
                    WHERE b.backup_date >= @Desde
                      AND b.Estado IN ('LISTO', 'TERMINADO', 'TERMINADA')
                      AND b.Colores LIKE @ColorPattern
                    ORDER BY b.backup_date DESC
                    LIMIT 100";
                command.Parameters.AddWithValue("@Desde", desde);
                command.Parameters.AddWithValue("@ColorPattern", $"%{request.Color}%");

                var pedidos = new List<object>();
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    pedidos.Add(new
                    {
                        otSap = reader.GetString("ot_sap"),
                        articulo = reader.GetString("Articulo"),
                        numeroMaquina = reader.GetInt32("NumeroMaquina"),
                        referencia = reader.IsDBNull(reader.GetOrdinal("Referencia")) ? null : reader.GetString("Referencia"),
                        colores = reader.GetString("Colores"),
                        kilos = reader.GetDecimal("Kilos"),
                        metros = reader.GetDecimal("Metros"),
                        estado = reader.IsDBNull(reader.GetOrdinal("Estado")) ? null : reader.GetString("Estado"),
                        backupDate = reader.GetDateTime("backup_date")
                    });
                }

                return Ok(new { data = pedidos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo pedidos por pantone");
                return StatusCode(500, new { message = "Error", error = ex.Message });
            }
        }


        [HttpGet("stats")]
        public async Task<IActionResult> GetBackupStats()
        {
            try
            {
                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();

                using var command = new MySqlCommand(@"
                    SELECT
                        COUNT(*) as total_backups,
                        COUNT(DISTINCT Articulo) as articulos_unicos,
                        COUNT(DISTINCT NumeroMaquina) as maquinas_usadas,
                        MIN(backup_date) as backup_mas_antiguo,
                        MAX(backup_date) as backup_mas_reciente,
                        backup_reason,
                        COUNT(*) as count_by_reason
                    FROM maquinas_backup
                    GROUP BY backup_reason WITH ROLLUP", connection);

                var stats = new List<object>();
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    stats.Add(new
                    {
                        totalBackups = reader.GetInt32("total_backups"),
                        articulosUnicos = reader.GetInt32("articulos_unicos"),
                        maquinasUsadas = reader.GetInt32("maquinas_usadas"),
                        backupMasAntiguo = reader.IsDBNull(reader.GetOrdinal("backup_mas_antiguo")) ? (DateTime?)null : reader.GetDateTime("backup_mas_antiguo"),
                        backupMasReciente = reader.IsDBNull(reader.GetOrdinal("backup_mas_reciente")) ? (DateTime?)null : reader.GetDateTime("backup_mas_reciente"),
                        backupReason = reader.IsDBNull(reader.GetOrdinal("backup_reason")) ? "TOTAL" : reader.GetString("backup_reason"),
                        countByReason = reader.GetInt32("count_by_reason")
                    });
                }

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error obteniendo estadísticas de backup");
                return StatusCode(500, new { message = "Error al obtener estadísticas", error = ex.Message });
            }
        }
    }

    public class CreateBackupRequest
    {
        public string OtSap { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public string? UserName { get; set; }
    }

    public class CreateBackupByEstadoRequest
    {
        public string Estado { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public string? UserName { get; set; }
    }

    public class PedidosByPantoneRequest
    {
        public string Color { get; set; } = string.Empty;
        public string[]? Ots { get; set; }
    }
}
