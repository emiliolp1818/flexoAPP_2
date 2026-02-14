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

        // GET: api/maquinasbackup/search
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
                _logger.LogInformation("🔍 Buscando en backup - Artículo: {Articulo}, OT: {OT}, Cliente: {Cliente}, Máquina: {Maquina}",
                    articulo, otSap, cliente, numeroMaquina);

                using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();

                // Construir query dinámico
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

                // Contar total de registros
                command.CommandText = $"SELECT COUNT(*) FROM maquinas_backup {whereClause}";
                var totalRecords = Convert.ToInt32(await command.ExecuteScalarAsync());

                // Obtener registros paginados
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

                _logger.LogInformation("✅ Encontrados {Count} registros de backup", backups.Count);

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

        // POST: api/maquinasbackup/create
        [HttpPost("create")]
        public async Task<IActionResult> CreateBackup([FromBody] CreateBackupRequest request)
        {
            try
            {
                _logger.LogInformation("💾 Creando backup - OT: {OT}, Razón: {Reason}", request.OtSap, request.Reason);

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
                    _logger.LogInformation("✅ Backup creado - {Rows} fila(s)", rowsBackedUp);

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

        // POST: api/maquinasbackup/create-by-estado
        [HttpPost("create-by-estado")]
        public async Task<IActionResult> CreateBackupByEstado([FromBody] CreateBackupByEstadoRequest request)
        {
            try
            {
                _logger.LogInformation("💾 Creando backup masivo - Estado: {Estado}", request.Estado);

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

                    _logger.LogInformation("✅ Backup masivo creado - {Rows} fila(s) con estado {Estado}", rowsBackedUp, estado);

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

        // GET: api/maquinasbackup/stats
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
}
