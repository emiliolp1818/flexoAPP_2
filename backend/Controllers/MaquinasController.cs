using FlexoAPP.API.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Newtonsoft.Json;
using flexoAPP.Services;
using OfficeOpenXml;
using FlexoAPP.API.Services;

namespace backend.Controllers
{





    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MaquinasController : ControllerBase
    {
        private readonly FlexoAPPDbContext _context;
        private readonly ILogger<MaquinasController> _logger;
        private readonly IMaquinaService _maquinaService;
        private readonly IActivityLoggerService _activityLogger;
        private readonly ISignalRNotificationService _signalRService;

        public MaquinasController(
            FlexoAPPDbContext context,
            ILogger<MaquinasController> logger,
            IMaquinaService maquinaService,
            IActivityLoggerService activityLogger,
            ISignalRNotificationService signalRService)
        {
            _context = context;
            _logger = logger;
            _maquinaService = maquinaService;
            _activityLogger = activityLogger;
            _signalRService = signalRService;
        }







        private static bool? _hasOrdenExcelColumn;

        [HttpGet]
        public async Task<ActionResult<object>> GetMaquinas([FromQuery] string? orderBy = "fechaTintaEnMaquina", [FromQuery] string? order = "desc")
        {
            try
            {
                _logger.LogDebug("🔄 Obteniendo datos de máquinas usando RAW SQL");

                var connectionString = _context.Database.GetConnectionString();
                using var connection = new MySqlConnector.MySqlConnection(connectionString);
                await connection.OpenAsync();

                // Cachear detección de columna (evita INFORMATION_SCHEMA en cada request)
                if (_hasOrdenExcelColumn == null)
                {
                    using var checkCmd = connection.CreateCommand();
                    checkCmd.CommandText = @"
                        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas' AND COLUMN_NAME = 'orden_excel'";
                    _hasOrdenExcelColumn = Convert.ToInt32(await checkCmd.ExecuteScalarAsync()) > 0;
                }

                var hasOrdenExcel = _hasOrdenExcelColumn.Value;
                var orderClause = hasOrdenExcel
                    ? "numero_maquina ASC, orden_excel ASC"
                    : "numero_maquina ASC, fecha_tinta_en_maquina DESC";

                // LEFT JOIN a designs solo para Substrate (fallback cuando maquinas.sustrato está vacío)
                using var command = connection.CreateCommand();
                command.CommandText = $@"
                    SELECT
                        m.articulo, m.numero_maquina, m.ot_sap, m.cliente, m.referencia, m.td, m.tipo_impresion,
                        m.numero_colores, m.colores, m.kilos, m.metros, m.fecha_tinta_en_maquina, m.sustrato,
                        m.estado, m.observaciones, m.last_action_by, m.last_action_at, m.preparando_started_at,
                        m.created_by, m.updated_by, m.created_at, m.updated_at{(hasOrdenExcel ? ", m.orden_excel" : "")},
                        d.Substrate as design_sustrato,
                        d.ancho_mm as design_ancho_mm,
                        d.`color 1` as design_color1, d.`color 2` as design_color2, d.`color 3` as design_color3,
                        d.`color 4` as design_color4, d.`color 5` as design_color5, d.`color 6` as design_color6,
                        d.`color 7` as design_color7, d.`color 8` as design_color8, d.`color 9` as design_color9,
                        d.`color 10` as design_color10, d.ColorCount as design_color_count
                    FROM maquinas m
                    LEFT JOIN designs d ON d.ArticleF = m.articulo
                    ORDER BY {orderClause}";

                var maquinas = new List<object>();
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var coloresFinales = ParseColores(reader.IsDBNull(reader.GetOrdinal("colores")) ? "[]" : reader.GetString("colores"));
                    var numColores = reader.GetInt32("numero_colores");
                    if (numColores <= 0 && coloresFinales.Length > 0)
                        numColores = coloresFinales.Length;

                    // Fallback: si no hay colores en maquinas, obtenerlos de designs
                    if (numColores <= 0 && coloresFinales.Length == 0)
                    {
                        var designColores = new List<string>();
                        for (int i = 1; i <= 10; i++)
                        {
                            var colName = $"design_color{i}";
                            if (!reader.IsDBNull(reader.GetOrdinal(colName)))
                            {
                                var colorVal = reader.GetString(colName);
                                if (!string.IsNullOrWhiteSpace(colorVal))
                                    designColores.Add(colorVal);
                            }
                        }
                        if (designColores.Count > 0)
                        {
                            coloresFinales = designColores.ToArray();
                            numColores = designColores.Count;
                        }
                        else
                        {
                            // Usar ColorCount del diseño como último recurso
                            var designColorCount = reader.IsDBNull(reader.GetOrdinal("design_color_count")) ? 0 : reader.GetInt32("design_color_count");
                            if (designColorCount > 0)
                                numColores = designColorCount;
                        }
                    }

                    var sustratoMaquina = reader.IsDBNull(reader.GetOrdinal("sustrato")) ? "" : reader.GetString("sustrato");
                    var sustratoDesign = reader.IsDBNull(reader.GetOrdinal("design_sustrato")) ? "" : reader.GetString("design_sustrato");
                    var sustratoFinal = !string.IsNullOrWhiteSpace(sustratoMaquina) ? sustratoMaquina : sustratoDesign;

                    maquinas.Add(new
                    {
                        articulo = reader.GetString("articulo"),
                        numeroMaquina = reader.GetInt32("numero_maquina"),
                        machineNumber = reader.GetInt32("numero_maquina"),
                        otSap = reader.GetString("ot_sap"),
                        cliente = reader.GetString("cliente"),
                        referencia = reader.IsDBNull(reader.GetOrdinal("referencia")) ? null : reader.GetString("referencia"),
                        td = reader.IsDBNull(reader.GetOrdinal("td")) ? null : reader.GetString("td"),
                        tipoImpresion = reader.IsDBNull(reader.GetOrdinal("tipo_impresion")) ? null : reader.GetString("tipo_impresion"),
                        numeroColores = numColores,
                        colores = coloresFinales,
                        kilos = reader.GetDecimal("kilos"),
                        metros = reader.IsDBNull(reader.GetOrdinal("metros")) ? (decimal?)null : reader.GetDecimal("metros"),
                        fechaTintaEnMaquina = reader.GetDateTime("fecha_tinta_en_maquina"),
                        sustrato = sustratoFinal,
                        anchoMm = reader.IsDBNull(reader.GetOrdinal("design_ancho_mm")) ? (int?)null : reader.GetInt32("design_ancho_mm"),
                        estado = reader.IsDBNull(reader.GetOrdinal("estado")) ? null : reader.GetString("estado"),
                        observaciones = reader.IsDBNull(reader.GetOrdinal("observaciones")) ? null : reader.GetString("observaciones"),
                        lastActionBy = reader.IsDBNull(reader.GetOrdinal("last_action_by")) ? null : reader.GetString("last_action_by"),
                        lastActionAt = reader.IsDBNull(reader.GetOrdinal("last_action_at")) ? (DateTime?)null : reader.GetDateTime("last_action_at"),
                        preparandoStartedAt = reader.IsDBNull(reader.GetOrdinal("preparando_started_at")) ? (DateTime?)null : reader.GetDateTime("preparando_started_at"),
                        createdBy = reader.IsDBNull(reader.GetOrdinal("created_by")) ? (int?)null : reader.GetInt32("created_by"),
                        updatedBy = reader.IsDBNull(reader.GetOrdinal("updated_by")) ? (int?)null : reader.GetInt32("updated_by"),
                        createdAt = reader.GetDateTime("created_at"),
                        updatedAt = reader.GetDateTime("updated_at"),
                        ordenExcel = hasOrdenExcel ? reader.GetInt32("orden_excel") : 0
                    });
                }

                _logger.LogDebug($"✅ {maquinas.Count} registros de máquinas encontrados");

                return Ok(new
                {
                    success = true,
                    message = $"{maquinas.Count} registros de máquinas obtenidos exitosamente",
                    data = maquinas,
                    orderBy = orderBy ?? "fechaTintaEnMaquina",
                    order = order ?? "desc",
                    timestamp = DateTimeHelper.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error obteniendo datos de máquinas");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error interno del servidor al obtener datos de máquinas",
                    error = ex.Message,
                    details = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace,
                    timestamp = DateTimeHelper.Now
                });
            }
        }










        [HttpPatch("{otSap}/status")]
        public async Task<ActionResult<object>> UpdateMachineStatus(string otSap, [FromBody] UpdateStatusRequest request)
        {
            try
            {

                _logger.LogDebug($"🎯 PATCH /api/maquinas/{otSap}/status - Estado: {request?.Estado}, Observaciones: {request?.Observaciones}");
                _logger.LogDebug($"🔐 Usuario autenticado: {User?.Identity?.IsAuthenticated ?? false}");


                if (request == null)
                {
                    return BadRequest(new { success = false, message = "Request body es requerido" });
                }

                if (string.IsNullOrWhiteSpace(request.Estado))
                {
                    return BadRequest(new { success = false, message = "El campo 'estado' es requerido" });
                }


                int userId = 1;
                string userName = "Sistema";
                try
                {
                    userId = GetCurrentUserId();
                    userName = GetCurrentUserName();
                    if (userId == 0) { userId = 1; userName = !string.IsNullOrEmpty(userName) ? userName : "Sistema"; }
                }
                catch (Exception) { userId = 1; userName = "Sistema"; }


                string? permissionNeeded = request.Estado.ToUpper() switch
                {
                    "PREPARANDO" => FlexoAPP.API.Models.PermissionCodes.MACHINES_STATUS_PREALISTANDO,
                    "LISTO" => FlexoAPP.API.Models.PermissionCodes.MACHINES_STATUS_LISTO,
                    "CORRIENDO" => FlexoAPP.API.Models.PermissionCodes.MACHINES_STATUS_CORRIENDO,
                    "TERMINADO" => FlexoAPP.API.Models.PermissionCodes.MACHINES_STATUS_TERMINADO,
                    "SUSPENDIDO" => FlexoAPP.API.Models.PermissionCodes.MACHINES_STATUS_SUSPENDIDO,
                    _ => null
                };

                if (permissionNeeded != null && !await HasPermissionAsync(userId, permissionNeeded))
                {
                    _logger.LogWarning($"🚫 Usuario {userId} ({userName}) intentó cambiar estado a {request.Estado} sin permiso {permissionNeeded}");
                    return Forbid();
                }

                var result = await _maquinaService.UpdateMachineStatusAsync(otSap, request.Estado, request.Observaciones, userId, userName, request.ClientTimestamp, request.PantoneColors);


                return Ok(new
                {
                    success = true,
                    message = $"Estado actualizado exitosamente a {result.Estado}",
                    data = new
                    {
                        otSap = result.OtSap,
                        articulo = result.Articulo,
                        estadoNuevo = result.Estado,
                        lastActionBy = result.LastActionBy,
                        lastActionAt = result.LastActionAt,
                        preparandoStartedAt = result.PreparandoStartedAt,
                        observaciones = result.Observaciones
                    },
                    timestamp = DateTimeHelper.Now
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error actualizando estado de máquina {otSap}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error interno del servidor al actualizar estado",
                    error = ex.Message
                });
            }
        }





        [HttpGet("test-raw")]
        public async Task<ActionResult<object>> GetMaquinasRaw()
        {
            try
            {
                var connectionString = _context.Database.GetConnectionString();
                using var connection = new MySqlConnector.MySqlConnection(connectionString);
                await connection.OpenAsync();

                using var command = connection.CreateCommand();
                command.CommandText = "SELECT articulo, numero_maquina, cliente, estado FROM maquinas LIMIT 5";

                var results = new List<object>();
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    results.Add(new
                    {
                        articulo = reader.GetString(0),
                        numeroMaquina = reader.GetInt32(1),
                        cliente = reader.GetString(2),
                        estado = reader.GetString(3)
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = $"{results.Count} registros obtenidos con consulta RAW SQL",
                    data = results
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }





        [HttpPost("maintenance/fix-schema")]
        public async Task<ActionResult<object>> FixDatabaseSchema()
        {
            try
            {
                _logger.LogDebug("🛠️ Iniciando reparación de esquema de base de datos...");
                var result = await _maquinaService.FixDatabaseSchemaAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error en reparación de esquema");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }






        [HttpPost("maintenance/update-kilos-precision")]
        public async Task<ActionResult<object>> UpdateKilosDecimalPrecision()
        {
            try
            {
                _logger.LogDebug("🛠️ Iniciando actualización de precisión decimal para kilos...");
                var result = await _maquinaService.UpdateKilosDecimalPrecisionAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error en actualización de precisión decimal");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }





        /// <summary>
        /// Eliminar datos de prueba de la base de datos
        /// </summary>
        [HttpDelete("clean-test-data")]
        public async Task<ActionResult<object>> CleanTestData()
        {
            try
            {
                _logger.LogDebug("🧹 Eliminando datos de prueba...");

                // OTs de prueba conocidos (creados por seed-data)
                var testOtSaps = new[] { "OT123456", "OT123457", "OT123458", "OT123459", "OT123460" };
                // Artículos de prueba
                var testArticulos = new[] { "F204567", "F204568", "F204569", "F204570", "F204571" };

                var testRecords = _context.Maquinas
                    .Where(m => testOtSaps.Contains(m.OtSap) || testArticulos.Contains(m.Articulo))
                    .ToList();

                if (testRecords.Count == 0)
                {
                    return Ok(new { success = true, message = "No se encontraron datos de prueba para eliminar", count = 0 });
                }

                _context.Maquinas.RemoveRange(testRecords);
                await _context.SaveChangesAsync();

                _logger.LogDebug($"✅ {testRecords.Count} registros de prueba eliminados");

                return Ok(new
                {
                    success = true,
                    message = $"{testRecords.Count} registros de prueba eliminados exitosamente",
                    count = testRecords.Count,
                    deleted = testRecords.Select(r => new { r.OtSap, r.Articulo, r.NumeroMaquina }),
                    timestamp = DateTimeHelper.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error eliminando datos de prueba");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error eliminando datos de prueba",
                    error = ex.Message
                });
            }
        }








        [HttpGet("machine/{numeroMaquina}")]
        public async Task<ActionResult<object>> GetProgramasPorMaquina(int numeroMaquina)
        {
            try
            {


                _logger.LogDebug($"🔄 Obteniendo programas para máquina {numeroMaquina}");



                var programs = await _context.Maquinas



                    .Where(p => p.NumeroMaquina == numeroMaquina)
                    .OrderByDescending(p => p.FechaTintaEnMaquina)
                    .ToListAsync();



                _logger.LogDebug($"✅ {programs.Count} programas encontrados para máquina {numeroMaquina}");



                var result = programs.Select(p => new
                {
                    id = p.Articulo,
                    articulo = p.Articulo,
                    numeroMaquina = p.NumeroMaquina,
                    otSap = p.OtSap,
                    cliente = p.Cliente,
                    referencia = p.Referencia,
                    td = p.Td,
                    numeroColores = p.NumeroColores,
                    colores = ParseColores(p.Colores),
                    kilos = p.Kilos,
                    fechaTintaEnMaquina = p.FechaTintaEnMaquina,
                    sustrato = p.Sustrato,
                    estado = p.Estado,
                    observaciones = p.Observaciones,
                    lastActionBy = p.LastActionBy,
                    lastActionAt = p.LastActionAt,
                    updatedAt = p.UpdatedAt
                }).ToList();



                return Ok(new
                {
                    success = true,
                    message = $"{programs.Count} programas obtenidos para máquina {numeroMaquina}",
                    data = result,
                    numeroMaquina = numeroMaquina,
                    timestamp = DateTimeHelper.Now
                });
            }
            catch (Exception ex)
            {


                _logger.LogError(ex, $"❌ Error obteniendo programas para máquina {numeroMaquina}");



                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error interno del servidor al obtener programas para máquina {numeroMaquina}",
                    error = ex.Message,
                    timestamp = DateTimeHelper.Now
                });
            }
        }







        private string[] ParseColores(string coloresJson)
        {
            try
            {


                if (string.IsNullOrWhiteSpace(coloresJson))
                    return new string[0];



                if (coloresJson.StartsWith("["))
                {

                    return JsonConvert.DeserializeObject<string[]>(coloresJson) ?? new string[0];
                }



                return new string[] { coloresJson };
            }
            catch (Exception ex)
            {


                _logger.LogWarning($"⚠️ Error parseando colores: {coloresJson}, Error: {ex.Message}");


                return new string[0];
            }
        }






        private int GetCurrentUserId()
        {


            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;



            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }







        private async Task<bool> HasPermissionAsync(int userId, string permissionCode)
        {
            if (userId == 0) return false;


            if (userId == 1) return true;


            return await _context.UserPermissions.AnyAsync(up =>
                up.UserId == userId &&
                up.PermissionCode == permissionCode &&
                up.IsGranted);
        }









        [HttpGet("design-info/{articulo}")]
        public async Task<ActionResult<object>> GetDesignInfo(string articulo)
        {
            try
            {
                _logger.LogDebug("📋 Obteniendo información de diseño para artículo: {Articulo}", articulo);


                Design? design = null;
                var colors = new List<string>();
                int? colorCountFromDb = null;

                using (var conn = new MySqlConnector.MySqlConnection(_context.Database.GetConnectionString()))
                {
                    await conn.OpenAsync();
                    using var cmd = conn.CreateCommand();
                    cmd.CommandText = @"
                        SELECT client, description, substrate, type, ancho_mm, printType, status,
                               `color 1`, `color 2`, `color 3`, `color 4`, `color 5`,
                               `color 6`, `color 7`, `color 8`, `color 9`, `color 10`,
                               ColorCount
                        FROM designs
                        WHERE ArticleF = @art
                        LIMIT 1";
                    cmd.Parameters.AddWithValue("@art", articulo);

                    using var reader = await cmd.ExecuteReaderAsync();
                    if (await reader.ReadAsync())
                    {
                        design = new Design
                        {
                            ArticleF = articulo,
                            Client = reader.IsDBNull(0) ? null : reader.GetString(0),
                            Description = reader.IsDBNull(1) ? null : reader.GetString(1),
                            Substrate = reader.IsDBNull(2) ? null : reader.GetString(2),
                            Type = reader.IsDBNull(3) ? null : reader.GetString(3),
                            AnchoMm = reader.IsDBNull(4) ? (int?)null : reader.GetInt32(4),
                            PrintType = reader.IsDBNull(5) ? null : reader.GetString(5),
                            Status = reader.IsDBNull(6) ? null : reader.GetString(6)
                        };


                        for (int i = 7; i <= 16; i++)
                        {
                            if (!reader.IsDBNull(i))
                            {
                                var colorName = reader.GetString(i);
                                if (!string.IsNullOrWhiteSpace(colorName))
                                {
                                    colors.Add(colorName);
                                }
                            }
                        }


                        if (!reader.IsDBNull(17))
                        {
                            colorCountFromDb = reader.GetInt32(17);
                        }
                    }
                }

                if (design == null)
                {
                    _logger.LogWarning("⚠️ No se encontró diseño para artículo: {Articulo}", articulo);
                    return Ok(new
                    {
                        success = true,
                        found = false,
                        data = (object?)null,
                        message = "No se encontró diseño para este artículo",
                        timestamp = DateTimeHelper.Now
                    });
                }

                _logger.LogDebug("✅ Información de diseño encontrada para artículo {Articulo}", articulo);




                int finalColorCount = colors.Count > 0 ? colors.Count : (colorCountFromDb ?? 0);

                return Ok(new
                {
                    success = true,
                    found = true,
                    data = new
                    {
                        articulo = articulo,
                        cliente = design.Client ?? "",
                        descripcion = design.Description ?? "",
                        referencia = design.Description ?? "",
                        sustrato = design.Substrate ?? "",
                        anchoMm = design.AnchoMm ?? 0,
                        numeroColores = finalColorCount,
                        colores = colors
                    },
                    timestamp = DateTimeHelper.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error obteniendo información de diseño para artículo: {Articulo}", articulo);
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message,
                    timestamp = DateTimeHelper.Now
                });
            }
        }






        [HttpGet("colors/{articulo}")]
        public async Task<ActionResult<object>> GetColorsByArticulo(string articulo)
        {

            return await GetDesignInfo(articulo);
        }








        private string GetCurrentUserName()
        {
            try
            {


                var displayName = User.FindFirst("DisplayName")?.Value;
                if (!string.IsNullOrWhiteSpace(displayName))
                {
                    _logger.LogDebug($"✅ Nombre obtenido de DisplayName: {displayName}");
                    return displayName;
                }


                var name = User.FindFirst(ClaimTypes.Name)?.Value;
                if (!string.IsNullOrWhiteSpace(name))
                {
                    _logger.LogDebug($"✅ Nombre obtenido de ClaimTypes.Name: {name}");
                    return name;
                }


                if (!string.IsNullOrWhiteSpace(User.Identity?.Name))
                {
                    _logger.LogDebug($"✅ Nombre obtenido de Identity.Name: {User.Identity.Name}");
                    return User.Identity.Name;
                }


                _logger.LogWarning("⚠️ No se encontró nombre del usuario. Claims disponibles:");
                foreach (var claim in User.Claims)
                {
                    _logger.LogWarning($"   - {claim.Type}: {claim.Value}");
                }


                _logger.LogWarning("⚠️ Usando nombre por defecto: Usuario");
                return "Usuario";
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, "❌ Error obteniendo nombre del usuario");

                return "Usuario";
            }
        }








        [HttpGet("test-design/{articulo}")]
        public async Task<ActionResult<object>> TestDesignLookup(string articulo)
        {
            try
            {

                _logger.LogDebug("🧪 TEST: Buscando artículo '{Articulo}' en tabla designs", articulo);


                var totalDesigns = await _context.Designs.CountAsync();

                _logger.LogDebug("📊 Total de diseños en tabla: {Total}", totalDesigns);


                var design = await _context.Designs
                    .Where(d => d.ArticleF == articulo)
                    .FirstOrDefaultAsync();


                if (design != null)
                {

                    _logger.LogDebug("✅ Diseño encontrado: ID={Id}", design.Id);


                    var colores = new List<string>();

                    if (!string.IsNullOrWhiteSpace(design.Color1)) colores.Add(design.Color1);
                    if (!string.IsNullOrWhiteSpace(design.Color2)) colores.Add(design.Color2);
                    if (!string.IsNullOrWhiteSpace(design.Color3)) colores.Add(design.Color3);
                    if (!string.IsNullOrWhiteSpace(design.Color4)) colores.Add(design.Color4);
                    if (!string.IsNullOrWhiteSpace(design.Color5)) colores.Add(design.Color5);
                    if (!string.IsNullOrWhiteSpace(design.Color6)) colores.Add(design.Color6);
                    if (!string.IsNullOrWhiteSpace(design.Color7)) colores.Add(design.Color7);
                    if (!string.IsNullOrWhiteSpace(design.Color8)) colores.Add(design.Color8);
                    if (!string.IsNullOrWhiteSpace(design.Color9)) colores.Add(design.Color9);
                    if (!string.IsNullOrWhiteSpace(design.Color10)) colores.Add(design.Color10);


                    return Ok(new
                    {
                        success = true,
                        found = true,
                        message = $"Artículo '{articulo}' encontrado en tabla designs",
                        totalDesignsInTable = totalDesigns,
                        design = new
                        {
                            id = design.Id,
                            articleF = design.ArticleF,
                            client = design.Client,
                            description = design.Description,
                            substrate = design.Substrate,
                            type = design.Type,
                            printType = design.PrintType,
                            colorCount = design.ColorCount,
                            colores = colores,
                            status = design.Status
                        },
                        timestamp = DateTimeHelper.Now
                    });
                }
                else
                {

                    _logger.LogWarning("⚠️ Diseño NO encontrado");


                    var ejemplos = await _context.Designs
                        .Select(d => d.ArticleF)
                        .Take(10)
                        .ToListAsync();


                    return Ok(new
                    {
                        success = true,
                        found = false,
                        message = $"Artículo '{articulo}' NO encontrado en tabla designs",
                        totalDesignsInTable = totalDesigns,
                        ejemplosArticulos = ejemplos,
                        sugerencia = "Verifica que el código de artículo sea exacto (mayúsculas/minúsculas y espacios)",
                        timestamp = DateTimeHelper.Now
                    });
                }
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, "❌ Error en test de búsqueda de diseño");

                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace,
                    timestamp = DateTimeHelper.Now
                });
            }
        }








        [HttpPost("{articulo}/generate-ff459")]
        public async Task<ActionResult<object>> GenerateFF459Format(string articulo)
        {
            try
            {
                _logger.LogDebug($"📄 Generando formato FF459 para artículo: {articulo}");


                int userId = 1;
                string userName = "Sistema";
                try
                {
                    userId = GetCurrentUserId();
                    userName = GetCurrentUserName();
                    if (userId == 0)
                    {
                        userId = 1;
                        userName = string.IsNullOrEmpty(userName) ? "Sistema" : userName;
                    }
                }
                catch (Exception userEx)
                {
                    _logger.LogWarning(userEx, "⚠️ Error obteniendo información del usuario");
                }


                if (!await HasPermissionAsync(userId, FlexoAPP.API.Models.PermissionCodes.MACHINES_PRINT))
                {
                    _logger.LogWarning($"🚫 Usuario {userId} ({userName}) intentó generar FF459 sin permiso");
                    return Forbid();
                }


                var connectionString = _context.Database.GetConnectionString();
                using var connection = new MySqlConnector.MySqlConnection(connectionString);
                await connection.OpenAsync();

                using var command = connection.CreateCommand();
                command.CommandText = @"
                    SELECT
                        articulo, numero_maquina, ot_sap, cliente, referencia, td,
                        numero_colores, colores, kilos, metros, fecha_tinta_en_maquina, sustrato,
                        estado, observaciones
                    FROM maquinas
                    WHERE articulo = @articulo";
                command.Parameters.AddWithValue("@articulo", articulo);

                using var reader = await command.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                {
                    return NotFound(new
                    {
                        success = false,
                        message = $"Máquina con artículo {articulo} no encontrada",
                        timestamp = DateTimeHelper.Now
                    });
                }


                var ff459Data = new
                {
                    articulo = reader.GetString("articulo"),
                    numeroMaquina = reader.GetInt32("numero_maquina"),
                    otSap = reader.GetString("ot_sap"),
                    cliente = reader.GetString("cliente"),
                    referencia = reader.IsDBNull(reader.GetOrdinal("referencia")) ? null : reader.GetString("referencia"),
                    td = reader.IsDBNull(reader.GetOrdinal("td")) ? null : reader.GetString("td"),
                    numeroColores = reader.GetInt32("numero_colores"),
                    colores = ParseColores(reader.GetString("colores")),
                    kilos = reader.GetDecimal("kilos"),
                    metros = reader.IsDBNull(reader.GetOrdinal("metros")) ? 0 : reader.GetDecimal("metros"),
                    fechaTintaEnMaquina = reader.GetDateTime("fecha_tinta_en_maquina"),
                    sustrato = reader.GetString("sustrato"),
                    estado = reader.IsDBNull(reader.GetOrdinal("estado")) ? null : reader.GetString("estado"),
                    observaciones = reader.IsDBNull(reader.GetOrdinal("observaciones")) ? null : reader.GetString("observaciones"),
                    fechaImpresion = DateTimeHelper.Now,
                    usuarioImpresion = userName,
                    formatoVersion = "FF459-v1.0"
                };

                await reader.CloseAsync();


                try
                {
                    var timestamp = DateTimeHelper.Now;
                    var detailsJson = $"{{" +
                        $"\"articulo\":\"{articulo}\"," +
                        $"\"numeroMaquina\":{ff459Data.numeroMaquina}," +
                        $"\"cliente\":\"{ff459Data.cliente}\"," +
                        $"\"otSap\":\"{ff459Data.otSap}\"," +
                        $"\"fechaHoraImpresion\":\"{timestamp:yyyy-MM-dd HH:mm:ss}\"," +
                        $"\"usuario\":\"{userName}\"," +
                        $"\"formato\":\"FF459\"" +
                        $"}}";

                    await _activityLogger.LogActivityAsync(
                        "PRINT_FF459_FORMAT",
                        $"Impresión de formato FF459 para máquina {articulo} a las {timestamp:HH:mm:ss}",
                        "MACHINES",
                        detailsJson
                    );

                    _logger.LogDebug($"✅ Actividad de impresión FF459 registrada para artículo {articulo}");
                }
                catch (Exception logEx)
                {
                    _logger.LogWarning(logEx, "Error registrando actividad de impresión FF459");
                }

                _logger.LogDebug($"✅ Formato FF459 generado exitosamente para artículo {articulo}");

                return Ok(new
                {
                    success = true,
                    message = "Formato FF459 generado exitosamente",
                    data = ff459Data,
                    timestamp = DateTimeHelper.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error generando formato FF459 para artículo {articulo}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error interno del servidor al generar formato FF459",
                    error = ex.Message,
                    timestamp = DateTimeHelper.Now
                });
            }
        }









        [HttpGet("last-upload")]
        public async Task<ActionResult<object>> GetLastUploadTimestamp()
        {
            try
            {
                using var conn = new MySqlConnector.MySqlConnection(_context.Database.GetConnectionString());
                await conn.OpenAsync();
                using var cmd = conn.CreateCommand();
                cmd.CommandText = "SELECT `value` FROM system_configs WHERE id = 'last_excel_upload' LIMIT 1";
                var result = await cmd.ExecuteScalarAsync();
                _logger.LogDebug($"📅 last-upload: {result ?? "null"}");
                return Ok(new { timestamp = result?.ToString() });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error en last-upload");
                return Ok(new { timestamp = (string?)null });
            }
        }


        [HttpGet("ff459-history")]
        public async Task<ActionResult<object>> GetFF459History(
            [FromQuery] string? articulo = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {

                int userId = GetCurrentUserId();
                if (!await HasPermissionAsync(userId, FlexoAPP.API.Models.PermissionCodes.MACHINES_PRINT))
                {
                    _logger.LogWarning($"🚫 Usuario {userId} intentó consultar historial FF459 sin permiso");
                    return Forbid();
                }

                _logger.LogDebug("📊 Consultando historial de impresiones FF459");


                var connectionString = _context.Database.GetConnectionString();
                using var connection = new MySqlConnector.MySqlConnection(connectionString);
                await connection.OpenAsync();

                var query = @"
                    SELECT
                        a.Id,
                        a.UserId,
                        a.UserCode,
                        a.Action,
                        a.Description,
                        a.Module,
                        a.Details,
                        a.Timestamp,
                        a.IpAddress
                    FROM Activities a
                    WHERE a.Action = 'PRINT_FF459_FORMAT'";

                var parameters = new List<MySqlConnector.MySqlParameter>();

                if (!string.IsNullOrEmpty(articulo))
                {
                    query += " AND a.Details LIKE @articulo";
                    parameters.Add(new MySqlConnector.MySqlParameter("@articulo", $"%\"articulo\":\"{articulo}\"%"));
                }

                if (startDate.HasValue)
                {
                    query += " AND a.Timestamp >= @startDate";
                    parameters.Add(new MySqlConnector.MySqlParameter("@startDate", startDate.Value));
                }

                if (endDate.HasValue)
                {
                    query += " AND a.Timestamp <= @endDate";
                    parameters.Add(new MySqlConnector.MySqlParameter("@endDate", endDate.Value));
                }

                query += " ORDER BY a.Timestamp DESC LIMIT 100";

                using var command = connection.CreateCommand();
                command.CommandText = query;
                command.Parameters.AddRange(parameters.ToArray());

                var history = new List<object>();
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    history.Add(new
                    {
                        id = reader.GetInt32("Id"),
                        userId = reader.GetInt32("UserId"),
                        userCode = reader.IsDBNull(reader.GetOrdinal("UserCode")) ? null : reader.GetString("UserCode"),
                        action = reader.GetString("Action"),
                        description = reader.GetString("Description"),
                        module = reader.GetString("Module"),
                        details = reader.IsDBNull(reader.GetOrdinal("Details")) ? null : reader.GetString("Details"),
                        timestamp = reader.GetDateTime("Timestamp"),
                        ipAddress = reader.IsDBNull(reader.GetOrdinal("IpAddress")) ? null : reader.GetString("IpAddress")
                    });
                }

                _logger.LogDebug($"✅ Se encontraron {history.Count} registros de impresión FF459");

                return Ok(new
                {
                    success = true,
                    message = $"Se encontraron {history.Count} registros de impresión FF459",
                    data = history,
                    filters = new
                    {
                        articulo = articulo,
                        startDate = startDate,
                        endDate = endDate
                    },
                    timestamp = DateTimeHelper.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error consultando historial de impresiones FF459");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error interno del servidor al consultar historial",
                    error = ex.Message,
                    timestamp = DateTimeHelper.Now
                });
            }
        }










        [HttpPost("import/formato2")]
        [RequestSizeLimit(524_288_000)]
        [RequestFormLimits(MultipartBodyLengthLimit = 524_288_000)]
        public async Task<IActionResult> ImportFormato2(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "No se proporcionó ningún archivo" });

                if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase) &&
                    !file.FileName.EndsWith(".xls", StringComparison.OrdinalIgnoreCase) &&
                    !file.FileName.EndsWith(".xlsm", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { message = "El archivo debe ser formato Excel (.xlsx, .xls, .xlsm)" });

                var connString = _context.Database.GetConnectionString()!;

                // ===== BACKUP AUTOMÁTICO ANTES DE IMPORTAR (igual que importación normal) =====
                try
                {
                    using var backupConn = new MySqlConnector.MySqlConnection(connString);
                    await backupConn.OpenAsync();

                    using var backupCmd = backupConn.CreateCommand();
                    backupCmd.CommandText = @"
                        INSERT INTO maquinas_backup (original_id, machine_number, ot_sap, articulo, descripcion, estado, kilos, metros, tipo_impresion, backup_reason)
                        SELECT 0, numero_maquina, ot_sap, articulo, referencia, estado, kilos, COALESCE(metros, 0), tipo_impresion, 'IMPORT_FORMATO2'
                        FROM maquinas WHERE ot_sap IS NOT NULL AND ot_sap != '' AND numero_maquina BETWEEN 11 AND 21";
                    var backupCount = await backupCmd.ExecuteNonQueryAsync();
                    _logger.LogDebug($"💾 Backup formato 2 creado: {backupCount} programas respaldados");

                    // Limpiar backups mayores a 3 meses
                    using var cleanBackupCmd = backupConn.CreateCommand();
                    cleanBackupCmd.CommandText = "DELETE FROM maquinas_backup WHERE backup_date < DATE_SUB(NOW(), INTERVAL 3 MONTH)";
                    await cleanBackupCmd.ExecuteNonQueryAsync();
                }
                catch (Exception backupEx)
                {
                    _logger.LogWarning("⚠️ Error creando backup formato 2: {Error}", backupEx.Message);
                    // No bloquear la importación si falla el backup
                }

                // ===== IMPORTAR CON PROTECCIONES =====
                var service = new FlexoAPP.API.Services.Implementations.Formato2ImportService(_logger);
                using var stream = file.OpenReadStream();
                var result = await service.ImportAsync(stream, connString);

                if (!string.IsNullOrEmpty(result.Error))
                    return BadRequest(new { message = result.Error });

                // ===== GUARDAR TIMESTAMP DE ÚLTIMA CARGA =====
                try
                {
                    var uploadTimestamp = DateTimeHelper.Now.ToString("yyyy-MM-ddTHH:mm:ss") + "Z";
                    using var cfgConn = new MySqlConnector.MySqlConnection(connString);
                    await cfgConn.OpenAsync();
                    using var cfgCmd = cfgConn.CreateCommand();
                    cfgCmd.CommandText = @"
                        INSERT INTO system_configs (id, name, description, `value`, type, category)
                        VALUES ('last_excel_upload', 'Última carga', 'Fecha de última importación Excel', @val, 'string', 'System')
                        ON DUPLICATE KEY UPDATE `value` = @val, updated_at = CURRENT_TIMESTAMP";
                    cfgCmd.Parameters.AddWithValue("@val", uploadTimestamp);
                    await cfgCmd.ExecuteNonQueryAsync();
                }
                catch (Exception cfgEx)
                {
                    _logger.LogWarning("⚠️ No se pudo guardar fecha de última carga formato 2: {Error}", cfgEx.Message);
                }

                // ===== NOTIFICAR VIA SIGNALR =====
                try
                {
                    var userName = User.Identity?.Name ?? "Sistema";
                    await _signalRService.NotifyExcelImported(0, result.TotalCreated, result.TotalUpdated, userName);
                }
                catch (Exception srEx)
                {
                    _logger.LogWarning("⚠️ Error notificando via SignalR formato 2: {Error}", srEx.Message);
                }

                return Ok(new
                {
                    message = "Importación formato 2 completada",
                    totalRead = result.TotalRead,
                    totalCreated = result.TotalCreated,
                    totalUpdated = result.TotalUpdated,
                    totalErrors = result.TotalErrors,
                    machinesProcessed = result.MachinesProcessed,
                    errorDetails = result.TotalErrors > 0 ? string.Join(" | ", result.ErrorDetails.Take(3)) : null,
                    lastUploadTimestamp = DateTimeHelper.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importando formato 2");
                return StatusCode(500, new { message = "Error procesando el archivo", error = ex.Message });
            }
        }


        [HttpPost("import/excel-multisheet")]
        [RequestSizeLimit(524_288_000)]
        [RequestFormLimits(MultipartBodyLengthLimit = 524_288_000)]
        public async Task<IActionResult> ImportFromExcelMultiSheet(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No se proporcionó ningún archivo" });
                }

                if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase) &&
                    !file.FileName.EndsWith(".xls", StringComparison.OrdinalIgnoreCase) &&
                    !file.FileName.EndsWith(".xlsm", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { message = "El archivo debe ser formato Excel (.xlsx, .xls, .xlsm)" });
                }

                _logger.LogDebug($"📥 Iniciando importación masiva desde Excel: {file.FileName}");


                int userId = GetCurrentUserId();
                if (userId == 0) userId = 1;

                if (!await HasPermissionAsync(userId, FlexoAPP.API.Models.PermissionCodes.ACTION_IMPORT) &&
                    !await HasPermissionAsync(userId, FlexoAPP.API.Models.PermissionCodes.ACTION_ADD_PROGRAMMING))
                {
                    _logger.LogWarning($"🚫 Usuario {userId} intentó importar Excel sin permisos");
                    return Forbid();
                }

                // ===== ASEGURAR COLUMNA orden_excel =====
                try
                {
                    using var connCheck = new MySqlConnector.MySqlConnection(_context.Database.GetConnectionString());
                    await connCheck.OpenAsync();
                    using var cmdCheck = connCheck.CreateCommand();
                    cmdCheck.CommandText = @"
                        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas' AND COLUMN_NAME = 'orden_excel'";
                    var exists = Convert.ToInt32(await cmdCheck.ExecuteScalarAsync()) > 0;
                    if (!exists)
                    {
                        using var cmdAdd = connCheck.CreateCommand();
                        cmdAdd.CommandText = "ALTER TABLE maquinas ADD COLUMN orden_excel INT NOT NULL DEFAULT 0";
                        await cmdAdd.ExecuteNonQueryAsync();
                        _logger.LogDebug("✅ Columna orden_excel creada en la tabla maquinas");
                    }
                }
                catch (Exception colEx)
                {
                    _logger.LogWarning("⚠️ Error verificando/creando columna orden_excel: {Error}", colEx.Message);
                }

                // ===== BACKUP AUTOMÁTICO ANTES DE IMPORTAR =====
                try
                {
                    using var backupConn = new MySqlConnector.MySqlConnection(_context.Database.GetConnectionString());
                    await backupConn.OpenAsync();

                    // Insertar backup de todos los programas actuales
                    using var backupCmd = backupConn.CreateCommand();
                    backupCmd.CommandText = @"
                        INSERT INTO maquinas_backup (original_id, machine_number, ot_sap, articulo, descripcion, estado, kilos, metros, tipo_impresion, backup_reason)
                        SELECT 0, numero_maquina, ot_sap, articulo, referencia, estado, kilos, COALESCE(metros, 0), tipo_impresion, 'IMPORT_EXCEL'
                        FROM maquinas WHERE ot_sap IS NOT NULL AND ot_sap != ''";
                    var backupCount = await backupCmd.ExecuteNonQueryAsync();
                    _logger.LogDebug($"💾 Backup creado: {backupCount} programas respaldados");

                    // Limpiar backups mayores a 3 meses
                    using var cleanBackupCmd = backupConn.CreateCommand();
                    cleanBackupCmd.CommandText = "DELETE FROM maquinas_backup WHERE backup_date < DATE_SUB(NOW(), INTERVAL 3 MONTH)";
                    var deletedBackups = await cleanBackupCmd.ExecuteNonQueryAsync();
                    if (deletedBackups > 0)
                    {
                        _logger.LogDebug($"🗑️ {deletedBackups} backups antiguos (>3 meses) eliminados");
                    }
                }
                catch (Exception backupEx)
                {
                    _logger.LogWarning("⚠️ Error creando backup: {Error}", backupEx.Message);
                    // No bloquear la importación si falla el backup
                }

                // ===== LIMPIEZA PREVIA con RAW SQL (evita problemas de EF NoTracking) =====
                _logger.LogDebug("🧹 Iniciando limpieza de programas TERMINADOS y SIN ASIGNAR...");
                {
                    using var cleanConn = new MySqlConnector.MySqlConnection(_context.Database.GetConnectionString());
                    await cleanConn.OpenAsync();

                    // Eliminar TERMINADOS
                    using var delTermCmd = cleanConn.CreateCommand();
                    delTermCmd.CommandText = "DELETE FROM maquinas WHERE estado = 'TERMINADO'";
                    var countTerminados = await delTermCmd.ExecuteNonQueryAsync();
                    _logger.LogDebug($"🗑️ {countTerminados} programas TERMINADOS eliminados");

                    // Eliminar SIN ASIGNAR (NULL o vacío)
                    using var delSinCmd = cleanConn.CreateCommand();
                    delSinCmd.CommandText = "DELETE FROM maquinas WHERE estado IS NULL OR estado = '' OR estado = 'SIN_ASIGNAR'";
                    var countSinAsignar = await delSinCmd.ExecuteNonQueryAsync();
                    _logger.LogDebug($"🗑️ {countSinAsignar} programas SIN ASIGNAR eliminados");

                    _logger.LogDebug($"✅ Limpieza completada. Total eliminados: {countTerminados + countSinAsignar}");

                    // Resetear orden_excel de protegidos a 0
                    try
                    {
                        using var resetCmd = cleanConn.CreateCommand();
                        resetCmd.CommandText = @"SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas' AND COLUMN_NAME = 'orden_excel'";
                        if (Convert.ToInt32(await resetCmd.ExecuteScalarAsync()) > 0)
                        {
                            using var updateCmd = cleanConn.CreateCommand();
                            updateCmd.CommandText = "UPDATE maquinas SET orden_excel = 0 WHERE estado IN ('PREPARANDO','LISTO','CORRIENDO','SUSPENDIDO')";
                            await updateCmd.ExecuteNonQueryAsync();
                            _logger.LogDebug("🔄 Orden de programas protegidos reseteado a 0");
                        }
                    }
                    catch (Exception resetEx)
                    {
                        _logger.LogWarning("⚠️ No se pudo resetear orden_excel: {Error}", resetEx.Message);
                    }
                }

                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                var importResults = new Dictionary<int, ImportSheetResult>();
                var totalCreated = 0;
                var totalErrors = 0;
                var sheetsProcessed = 0;
                ImportSheetResult result = new ImportSheetResult();

                using (var stream = file.OpenReadStream())
                {
                    using (var package = new ExcelPackage(stream))
                    {
                        _logger.LogDebug($"📊 Excel contiene {package.Workbook.Worksheets.Count} hojas");

                        // Buscar específicamente la hoja "PROGRAMA CC"
                        var programaCCSheet = package.Workbook.Worksheets
                            .FirstOrDefault(ws => ws.Name.Trim().Equals("PROGRAMA CC", StringComparison.OrdinalIgnoreCase));

                        if (programaCCSheet == null)
                        {
                            _logger.LogError("❌ No se encontró la hoja 'PROGRAMA CC' en el archivo Excel");
                            return BadRequest(new
                            {
                                message = "No se encontró la hoja 'PROGRAMA CC' en el archivo Excel",
                                error = "La hoja requerida no existe. Verifique que el archivo tenga una hoja llamada 'PROGRAMA CC'"
                            });
                        }

                        _logger.LogDebug($"✅ Hoja 'PROGRAMA CC' encontrada, procesando...");

                        using var designConn = new MySqlConnector.MySqlConnection(_context.Database.GetConnectionString());
                        await designConn.OpenAsync();

                        // Procesar la hoja PROGRAMA CC
                        result = await ProcessProgramaCCWorksheet(programaCCSheet, designConn);
                        
                        totalCreated = result.Created;
                        totalErrors = result.Errors;
                        sheetsProcessed = 1;

                        _logger.LogDebug($"📊 PROGRAMA CC: {result.Created} creados, {result.Updated} actualizados, {result.Errors} errores");

                        if (result.Created == 0 && result.Errors > 0)
                        {
                            _logger.LogWarning($"⚠️ PROGRAMA CC: NO se crearon registros. Errores: {result.Errors}");
                            if (result.ErrorDetails.Any())
                            {
                                _logger.LogWarning($"   Detalles de errores: {string.Join(", ", result.ErrorDetails.Take(5))}");
                            }
                        }
                    }
                }

                _logger.LogDebug($"✅ Importación completada: {totalCreated} registros creados, {totalErrors} errores");

                // Notificar a todos los clientes sobre la importación
                var userName = User.Identity?.Name ?? "Sistema";
                await _signalRService.NotifyExcelImported(
                    0,
                    totalCreated, 
                    0,
                    userName
                );

                // Si hubo errores graves (nada se guardó), devolver error
                if (totalCreated == 0 && totalErrors > 0)
                {
                    return BadRequest(new
                    {
                        message = "Error al guardar la programación",
                        totalCreated,
                        totalErrors,
                        errorDetails = result.ErrorDetails.Take(3).ToList()
                    });
                }

                // Guardar fecha/hora de última carga de programación
                try
                {
                    var uploadTimestamp = DateTimeHelper.Now.ToString("yyyy-MM-ddTHH:mm:ss") + "Z";
                    _logger.LogDebug($"📅 Guardando fecha de carga: {uploadTimestamp}");
                    using var cfgConn = new MySqlConnector.MySqlConnection(_context.Database.GetConnectionString());
                    await cfgConn.OpenAsync();
                    using var cfgCmd = cfgConn.CreateCommand();
                    cfgCmd.CommandText = @"
                        INSERT INTO system_configs (id, name, description, `value`, type, category)
                        VALUES ('last_excel_upload', 'Última carga', 'Fecha de última importación Excel', @val, 'string', 'System')
                        ON DUPLICATE KEY UPDATE `value` = @val, updated_at = CURRENT_TIMESTAMP";
                    cfgCmd.Parameters.AddWithValue("@val", uploadTimestamp);
                    var rows = await cfgCmd.ExecuteNonQueryAsync();
                    _logger.LogDebug($"📅 Fecha guardada OK, rows affected: {rows}");
                }
                catch (Exception cfgEx)
                {
                    _logger.LogWarning(cfgEx, "⚠️ No se pudo guardar fecha de última carga: {Error}", cfgEx.Message);
                }

                return Ok(new
                {
                    message = "Importación completada",
                    sheetsProcessed,
                    totalCreated,
                    totalUpdated = 0,
                    totalErrors,
                    errorDetails = totalErrors > 0 ? string.Join(" | ", result.ErrorDetails.Take(3)) : null,
                    lastUploadTimestamp = DateTimeHelper.Now
                });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error crítico al importar Excel PROGRAMA CC");
                return StatusCode(500, new
                {
                    message = "Error al importar Excel",
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }





        private int? ExtractMachineNumber(string sheetName)
        {

            var match = System.Text.RegularExpressions.Regex.Match(sheetName, @"\d+");
            if (match.Success && int.TryParse(match.Value, out int number))
            {
                return number;
            }
            return null;
        }




        private async Task<ImportSheetResult> ProcessWorksheet(ExcelWorksheet worksheet, int machineNumber, MySqlConnector.MySqlConnection designConn)
        {
            var result = new ImportSheetResult();
            var rowCount = worksheet.Dimension?.Rows ?? 0;
            var processedOts = new HashSet<string>();
            var maquinasToAdd = new List<Maquina>();
            var maquinasToUpdate = new List<Maquina>();

            _logger.LogDebug($"📊 Procesando máquina {machineNumber}: Hoja tiene {rowCount} filas");


            for (int row = 6; row <= rowCount; row++)
            {
                try
                {

                    var otSap = GetCellValue(worksheet, row, "T")?.Trim();
                    var articulo = GetCellValue(worksheet, row, "C")?.Trim();
                    var cliente = GetCellValue(worksheet, row, "D")?.Trim();


                    if (row == 6)
                    {
                        _logger.LogDebug($"🔍 Máquina {machineNumber}, Primera fila de datos (fila 6): OT={otSap}, Articulo={articulo}, Cliente={cliente}");
                    }


                    if (string.IsNullOrEmpty(otSap) || string.IsNullOrEmpty(articulo) || string.IsNullOrEmpty(cliente))
                    {
                        _logger.LogDebug($"⚠️ Fila {row} ignorada: faltan datos obligatorios (OT SAP, Artículo o Cliente)");
                        continue;
                    }


                    if (processedOts.Contains(otSap))
                    {
                        _logger.LogDebug($"⚠️ Fila {row} ignorada: OT {otSap} duplicada en el mismo archivo");
                        result.Errors++;
                        result.ErrorDetails.Add($"Fila {row}: OT {otSap} duplicada en el archivo");
                        continue;
                    }


                    var existingMachine = await _context.Maquinas
                        .FirstOrDefaultAsync(m => m.OtSap == otSap);

                    bool isUpdate = existingMachine != null;


                    processedOts.Add(otSap);

                    var referencia = GetCellValue(worksheet, row, "E")?.Trim();
                    var td = GetCellValue(worksheet, row, "F")?.Trim();
                    var tipoImpresion = GetCellValue(worksheet, row, "G")?.Trim();
                    var numeroColoresStr = GetCellValue(worksheet, row, "K")?.Trim();
                    var kilosStr = GetCellValue(worksheet, row, "O")?.Trim();
                    var sustrato = GetCellValue(worksheet, row, "S")?.Trim();
                    var fechaTintaStr = GetCellValue(worksheet, row, "W")?.Trim();
                    var metrosStr = GetCellValue(worksheet, row, "AG")?.Trim();


                    int numeroColores = 1;
                    if (!string.IsNullOrEmpty(numeroColoresStr))
                    {

                        if (int.TryParse(numeroColoresStr, out int coloresInt))
                        {
                            numeroColores = coloresInt;
                        }

                        else if (decimal.TryParse(numeroColoresStr, out decimal coloresDecimal))
                        {
                            numeroColores = (int)coloresDecimal;
                            _logger.LogDebug($"📊 Fila {row}: Número de colores convertido de decimal {coloresDecimal} a {numeroColores}");
                        }
                        else
                        {
                            _logger.LogWarning($"⚠️ Fila {row}: número de colores inválido '{numeroColoresStr}', usando default 1");
                        }
                    }
                    else
                    {
                        _logger.LogDebug($"📊 Fila {row}: Número de colores vacío, usando default 1");
                    }


                    decimal kilos = 0.001m; // Valor mínimo por defecto para cumplir validación
                    if (!string.IsNullOrEmpty(kilosStr))
                    {
                        try {
                            // Log del valor original
                            _logger.LogDebug($"🔍 Fila {row}: Kilos original del Excel: '{kilosStr}'");

                            // Limpiar el string: remover espacios y caracteres no numéricos excepto . y ,
                            var kiloClean = kilosStr.Trim();
                            
                            // Detectar formato: si tiene punto como separador de miles y coma como decimal (formato español)
                            // Ejemplo: "1.234,56" → "1234.56"
                            if (kiloClean.Contains(".") && kiloClean.Contains(","))
                            {
                                // Formato español: punto = miles, coma = decimal
                                kiloClean = kiloClean.Replace(".", "");
                                kiloClean = kiloClean.Replace(",", ".");
                                _logger.LogDebug($"📊 Fila {row}: Formato español detectado: '{kilosStr}' → '{kiloClean}'");
                            }
                            else if (kiloClean.Contains(",") && !kiloClean.Contains("."))
                            {
                                // Solo coma: formato español sin miles
                                kiloClean = kiloClean.Replace(",", ".");
                                _logger.LogDebug($"📊 Fila {row}: Formato español simple: '{kilosStr}' → '{kiloClean}'");
                            }
                            // Si solo tiene punto, asumimos formato inglés (ya está correcto)

                            if (decimal.TryParse(kiloClean, System.Globalization.NumberStyles.Any,
                                System.Globalization.CultureInfo.InvariantCulture, out decimal kValue))
                            {
                                if (kValue > 0)
                                {
                                    kilos = kValue;
                                    if (kilos > 9999999.999m) kilos = 9999999.999m;
                                    _logger.LogDebug($"✅ Fila {row}: Kilos parseados exitosamente: '{kilosStr}' → {kilos}");
                                }
                                else
                                {
                                    _logger.LogWarning($"⚠️ Fila {row}: Kilos es 0 o negativo '{kilosStr}', usando mínimo 0.001");
                                    kilos = 0.001m;
                                }
                            }
                            else
                            {
                                _logger.LogError($"❌ Fila {row}: No se pudo parsear kilos '{kilosStr}' después de limpiar a '{kiloClean}', usando mínimo 0.001");
                                kilos = 0.001m;
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"❌ Fila {row}: Error parseando kilos '{kilosStr}': {ex.Message}, usando mínimo 0.001");
                            kilos = 0.001m;
                        }
                    }
                    else
                    {
                        _logger.LogWarning($"⚠️ Fila {row}: Kilos vacío, usando mínimo 0.001");
                        kilos = 0.001m;
                    }


                    decimal? metros = null;
                    if (!string.IsNullOrEmpty(metrosStr))
                    {
                        try {
                            // Log del valor original
                            _logger.LogDebug($"🔍 Fila {row}: Metros original del Excel: '{metrosStr}'");

                            // Limpiar el string
                            var metroClean = metrosStr.Trim();
                            
                            // Detectar si tiene coma (formato español)
                            if (metroClean.Contains(","))
                            {
                                // Tomar solo la parte entera (antes de la coma)
                                var metroParts = metroClean.Split(',');
                                metroClean = metroParts[0];
                                _logger.LogDebug($"📏 Fila {row}: Tomando parte entera: '{metrosStr}' → '{metroClean}'");
                            }
                            else if (metroClean.Contains("."))
                            {
                                // Puede ser formato inglés con punto decimal, o español con punto como miles
                                // Si tiene más de un punto, es separador de miles
                                var dotCount = metroClean.Count(c => c == '.');
                                if (dotCount > 1)
                                {
                                    // Múltiples puntos = separador de miles español
                                    metroClean = metroClean.Replace(".", "");
                                    _logger.LogDebug($"📏 Fila {row}: Removiendo separadores de miles: '{metrosStr}' → '{metroClean}'");
                                }
                                else
                                {
                                    // Un solo punto = puede ser decimal inglés, tomar parte entera
                                    var metroParts = metroClean.Split('.');
                                    metroClean = metroParts[0];
                                    _logger.LogDebug($"📏 Fila {row}: Tomando parte entera (formato inglés): '{metrosStr}' → '{metroClean}'");
                                }
                            }
                            
                            // Remover cualquier punto restante (separador de miles)
                            metroClean = metroClean.Replace(".", "");

                            if (decimal.TryParse(metroClean, System.Globalization.NumberStyles.Any,
                                System.Globalization.CultureInfo.InvariantCulture, out decimal mValue))
                            {
                                if (mValue > 99999999m)
                                {
                                    metros = 99999999m;
                                    _logger.LogWarning($"⚠️ Fila {row}: Metros excede máximo, limitando a 99999999");
                                }
                                else if (mValue < 0)
                                {
                                    metros = null;
                                    _logger.LogWarning($"⚠️ Fila {row}: Metros negativo, estableciendo a NULL");
                                }
                                else
                                {
                                    metros = mValue;
                                    _logger.LogDebug($"✅ Fila {row}: Metros parseados exitosamente (solo enteros): '{metrosStr}' → {metros}");
                                }
                            }
                            else
                            {
                                _logger.LogError($"❌ Fila {row}: No se pudo parsear metros '{metrosStr}' después de limpiar a '{metroClean}'");
                                metros = null;
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"❌ Fila {row}: Error parseando metros '{metrosStr}': {ex.Message}");
                            metros = null;
                        }
                    }
                    else
                    {
                        _logger.LogDebug($"📏 Fila {row}: Metros vacío, estableciendo a NULL");
                    }


                    DateTime fechaTinta = DateTimeHelper.Now;
                    if (!string.IsNullOrEmpty(fechaTintaStr))
                    {
                        if (double.TryParse(fechaTintaStr, out double oaDate))
                        {
                            try { fechaTinta = DateTime.FromOADate(oaDate); }
                            catch { }
                        }
                        else if (!DateTime.TryParse(fechaTintaStr, out fechaTinta))
                        {
                            var formats = new[] {
                                "dd/MM/yyyy HH:mm", "dd/MM/yyyy H:mm", "d/M/yyyy HH:mm", "d/M/yyyy H:mm",
                                "dd/MM/yyyy", "d/M/yyyy", "M/d/yyyy HH:mm", "M/d/yyyy H:mm", "M/d/yyyy"
                            };
                            if (!DateTime.TryParseExact(fechaTintaStr, formats,
                                System.Globalization.CultureInfo.InvariantCulture,
                                System.Globalization.DateTimeStyles.None, out fechaTinta))
                            {
                                fechaTinta = DateTimeHelper.Now;
                            }
                        }
                    }





                    Design? design = null;
                    try
                    {
                        using var designCmd = designConn.CreateCommand();
                        designCmd.CommandText = @"
                            SELECT client, description, substrate, type, ancho_mm, printType, status,
                                   `color 1`, `color 2`, `color 3`, `color 4`, `color 5`,
                                   `color 6`, `color 7`, `color 8`, `color 9`, `color 10`,
                                   ColorCount
                            FROM designs
                            WHERE ArticleF = @art
                            LIMIT 1";
                        designCmd.Parameters.AddWithValue("@art", articulo);

                        using var designReader = await designCmd.ExecuteReaderAsync();
                        if (await designReader.ReadAsync())
                        {
                            design = new Design
                            {
                                ArticleF = articulo,
                                Client = designReader.IsDBNull(0) ? null : designReader.GetString(0),
                                Description = designReader.IsDBNull(1) ? null : designReader.GetString(1),
                                Substrate = designReader.IsDBNull(2) ? null : designReader.GetString(2),
                                Type = designReader.IsDBNull(3) ? null : designReader.GetString(3),
                                AnchoMm = designReader.IsDBNull(4) ? (int?)null : designReader.GetInt32(4),
                                PrintType = designReader.IsDBNull(5) ? null : designReader.GetString(5),
                                Status = designReader.IsDBNull(6) ? null : designReader.GetString(6),
                                Color1 = designReader.IsDBNull(7) ? null : designReader.GetString(7),
                                Color2 = designReader.IsDBNull(8) ? null : designReader.GetString(8),
                                Color3 = designReader.IsDBNull(9) ? null : designReader.GetString(9),
                                Color4 = designReader.IsDBNull(10) ? null : designReader.GetString(10),
                                Color5 = designReader.IsDBNull(11) ? null : designReader.GetString(11),
                                Color6 = designReader.IsDBNull(12) ? null : designReader.GetString(12),
                                Color7 = designReader.IsDBNull(13) ? null : designReader.GetString(13),
                                Color8 = designReader.IsDBNull(14) ? null : designReader.GetString(14),
                                Color9 = designReader.IsDBNull(15) ? null : designReader.GetString(15),
                                Color10 = designReader.IsDBNull(16) ? null : designReader.GetString(16),
                                ColorCount = designReader.IsDBNull(17) ? 0 : designReader.GetInt32(17)
                            };
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning($"⚠️ Error al buscar diseño para {articulo}: {ex.Message}");
                    }

                    var coloresArray = new List<string>();
                    if (design != null)
                    {

                        if (!string.IsNullOrWhiteSpace(design.Color1)) coloresArray.Add(design.Color1);
                        if (!string.IsNullOrWhiteSpace(design.Color2)) coloresArray.Add(design.Color2);
                        if (!string.IsNullOrWhiteSpace(design.Color3)) coloresArray.Add(design.Color3);
                        if (!string.IsNullOrWhiteSpace(design.Color4)) coloresArray.Add(design.Color4);
                        if (!string.IsNullOrWhiteSpace(design.Color5)) coloresArray.Add(design.Color5);
                        if (!string.IsNullOrWhiteSpace(design.Color6)) coloresArray.Add(design.Color6);
                        if (!string.IsNullOrWhiteSpace(design.Color7)) coloresArray.Add(design.Color7);
                        if (!string.IsNullOrWhiteSpace(design.Color8)) coloresArray.Add(design.Color8);
                        if (!string.IsNullOrWhiteSpace(design.Color9)) coloresArray.Add(design.Color9);
                        if (!string.IsNullOrWhiteSpace(design.Color10)) coloresArray.Add(design.Color10);

                        _logger.LogDebug($"🎨 Fila {row}: {coloresArray.Count} colores cargados desde diseño para artículo {articulo}");
                    }
                    else
                    {
                        _logger.LogDebug($"⚠️ Fila {row}: No se encontró diseño para artículo {articulo}");
                    }


                    if (coloresArray.Count == 0)
                    {

                        int fallbackCount = (design != null && design.ColorCount > 0) ? (int)design.ColorCount : numeroColores;

                        if (fallbackCount > 0)
                        {
                            _logger.LogDebug($"⚖️ Fila {row}: Usando {fallbackCount} colores como fallback (sin nombres de pantones)");
                            for (int i = 1; i <= fallbackCount; i++)
                            {

                                coloresArray.Add($"COLOR {i}");
                            }
                        }
                    }


                    var coloresJson = System.Text.Json.JsonSerializer.Serialize(coloresArray);


                    var maquina = existingMachine ?? new Maquina();

                    maquina.OtSap = otSap;
                    maquina.Articulo = articulo;
                    maquina.NumeroMaquina = machineNumber;
                    maquina.Cliente = cliente;
                    maquina.Referencia = referencia ?? string.Empty;
                    maquina.Td = td ?? string.Empty;
                    maquina.TipoImpresion = tipoImpresion;
                    maquina.NumeroColores = coloresArray.Count;
                    maquina.Colores = coloresJson;
                    maquina.Kilos = kilos;
                    maquina.Metros = metros;
                    maquina.FechaTintaEnMaquina = fechaTinta;
                    maquina.Sustrato = sustrato ?? "";




                    // ===== PRESERVAR ESTADOS PROTEGIDOS =====
                    var protectedStates = new[] { "PREPARANDO", "LISTO", "CORRIENDO", "SUSPENDIDO" };

                    if (isUpdate && existingMachine != null && !string.IsNullOrEmpty(existingMachine.Estado)
                        && protectedStates.Contains(existingMachine.Estado.ToUpper()))
                    {
                        // Mantener estado protegido y todos sus datos asociados
                        maquina.Estado = existingMachine.Estado;
                        maquina.Observaciones = existingMachine.Observaciones;
                        maquina.LastActionBy = existingMachine.LastActionBy;
                        maquina.LastActionAt = existingMachine.LastActionAt;
                        maquina.PreparandoStartedAt = existingMachine.PreparandoStartedAt;

                        _logger.LogDebug($"🛡️ OT {otSap}: Estado protegido '{maquina.Estado}' preservado. Observaciones: '{maquina.Observaciones}'");
                    }
                    else
                    {
                        // Programa nuevo o con estado no protegido
                        maquina.Estado = null;

                        // Si es actualización, preservar observaciones existentes; si es nuevo, dejar vacío
                        if (isUpdate && existingMachine != null)
                        {
                            maquina.Observaciones = existingMachine.Observaciones;
                            _logger.LogDebug($"🔄 OT {otSap}: Actualizado como 'Sin asignar', observaciones preservadas: '{maquina.Observaciones}'");
                        }
                        else
                        {
                            maquina.Observaciones = string.Empty;
                            _logger.LogDebug($"🆕 OT {otSap}: Nuevo programa cargado como 'Sin asignar'");
                        }
                    }

                    if (!isUpdate) {
                        maquina.CreatedAt = DateTimeHelper.Now;
                    }
                    maquina.UpdatedAt = DateTimeHelper.Now;


                    // Acumular en listas en lugar de guardar inmediatamente
                    if (isUpdate) {
                        maquinasToUpdate.Add(maquina);
                        result.Updated++;
                    } else {
                        maquinasToAdd.Add(maquina);
                        result.Created++;
                    }

                    _logger.LogDebug($"✅ Fila {row}: Registro {(isUpdate ? "preparado para actualizar" : "preparado para crear")} - OT {otSap}");
                }
                catch (Exception ex)
                {
                    result.Errors++;
                    var errorMsg = $"Fila {row}: {ex.Message}";
                    result.ErrorDetails.Add(errorMsg);
                    _logger.LogError(ex, $"❌ Error procesando fila {row}");
                }
            }

            // Guardar todos los registros en el orden correcto
            try
            {
                _logger.LogDebug($"💾 Guardando {maquinasToAdd.Count} nuevos registros y {maquinasToUpdate.Count} actualizaciones en orden...");
                
                // Primero agregar los nuevos en el orden del Excel
                if (maquinasToAdd.Any())
                {
                    await _context.Maquinas.AddRangeAsync(maquinasToAdd);
                }
                
                // Luego actualizar los existentes
                if (maquinasToUpdate.Any())
                {
                    _context.Maquinas.UpdateRange(maquinasToUpdate);
                }
                
                // Guardar todo en una sola transacción
                await _context.SaveChangesAsync();
                _logger.LogDebug($"✅ Guardado exitoso: {maquinasToAdd.Count} creados, {maquinasToUpdate.Count} actualizados");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error guardando registros en la base de datos");
                result.Errors++;
                result.ErrorDetails.Add($"Error al guardar: {ex.Message}");
            }
            finally
            {
                _context.ChangeTracker.Clear();
            }

            return result;
        }




        private string? GetCellValue(ExcelWorksheet worksheet, int row, string columnLetter)
        {
            try
            {
                var cell = worksheet.Cells[$"{columnLetter}{row}"];
                return cell.Value?.ToString();
            }
            catch
            {
                return null;
            }
        }




        private class ImportSheetResult
        {
            public int Created { get; set; } = 0;
            public int Updated { get; set; } = 0;
            public int Errors { get; set; } = 0;
            public List<string> ErrorDetails { get; set; } = new List<string>();
        }

        // Nuevo método para procesar la hoja PROGRAMA CC con el mapeo específico
        // USA RAW SQL para evitar problemas con EF NoTracking
        private async Task<ImportSheetResult> ProcessProgramaCCWorksheet(ExcelWorksheet worksheet, MySqlConnector.MySqlConnection designConn)
        {
            var result = new ImportSheetResult();
            var rowCount = worksheet.Dimension?.Rows ?? 0;
            var processedOts = new HashSet<string>();
            var skippedRows = 0;
            var ordenExcel = 1; // Contador para mantener el orden del Excel

            _logger.LogDebug($"📊 Procesando hoja PROGRAMA CC: {rowCount} filas totales");
            _logger.LogDebug($"📋 Mapeo: B=MQ, C=ARTICULO, D=OT_SAP, E=CLIENTE, F=REFERENCIA, G=TD, H=T_IMP, I=NUM_COLORES, J=KILOS, K=METROS, L=FECHA_TINTA_EN_MAQUINA, M=SUSTRATO, N=COLORES");

            // Usar conexión RAW SQL directa (evita problemas con EF NoTracking)
            using var conn = new MySqlConnector.MySqlConnection(_context.Database.GetConnectionString());
            await conn.OpenAsync();

            // Verificar si existe columna orden_excel
            using var checkColCmd = conn.CreateCommand();
            checkColCmd.CommandText = @"SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas' AND COLUMN_NAME = 'orden_excel'";
            var hasOrdenExcel = Convert.ToInt32(await checkColCmd.ExecuteScalarAsync()) > 0;

            // Cargar OTs existentes con estados protegidos para preservarlos
            var protectedPrograms = new Dictionary<string, (string estado, string? observaciones, string? lastActionBy, DateTime? lastActionAt, DateTime? preparandoStartedAt)>();
            {
                using var loadCmd = conn.CreateCommand();
                loadCmd.CommandText = "SELECT ot_sap, estado, observaciones, last_action_by, last_action_at, preparando_started_at FROM maquinas WHERE estado IN ('PREPARANDO','LISTO','CORRIENDO','SUSPENDIDO')";
                using var loadReader = await loadCmd.ExecuteReaderAsync();
                while (await loadReader.ReadAsync())
                {
                    var ot = loadReader.GetString("ot_sap");
                    protectedPrograms[ot] = (
                        loadReader.GetString("estado"),
                        loadReader.IsDBNull(loadReader.GetOrdinal("observaciones")) ? null : loadReader.GetString("observaciones"),
                        loadReader.IsDBNull(loadReader.GetOrdinal("last_action_by")) ? null : loadReader.GetString("last_action_by"),
                        loadReader.IsDBNull(loadReader.GetOrdinal("last_action_at")) ? (DateTime?)null : loadReader.GetDateTime("last_action_at"),
                        loadReader.IsDBNull(loadReader.GetOrdinal("preparando_started_at")) ? (DateTime?)null : loadReader.GetDateTime("preparando_started_at")
                    );
                }
            }
            _logger.LogDebug($"🛡️ {protectedPrograms.Count} programas con estados protegidos encontrados");

            // Cargar todas las OTs existentes para saber si es INSERT o UPDATE
            var existingOts = new HashSet<string>();
            {
                using var existCmd = conn.CreateCommand();
                existCmd.CommandText = "SELECT ot_sap FROM maquinas";
                using var existReader = await existCmd.ExecuteReaderAsync();
                while (await existReader.ReadAsync())
                {
                    existingOts.Add(existReader.GetString("ot_sap"));
                }
            }

            // Usar transacción para todo el batch
            using var transaction = await conn.BeginTransactionAsync();

            try
            {
                // Los datos empiezan en la fila 6 (filas 1-5 son encabezados)
                for (int row = 6; row <= rowCount; row++)
                {
                    try
                    {
                        var mq = GetCellValue(worksheet, row, "B")?.Trim();
                        var articulo = GetCellValue(worksheet, row, "C")?.Trim();
                        var otSap = GetCellValue(worksheet, row, "D")?.Trim();
                        var cliente = GetCellValue(worksheet, row, "E")?.Trim();
                        var referencia = GetCellValue(worksheet, row, "F")?.Trim();
                        var td = GetCellValue(worksheet, row, "G")?.Trim();
                        var tipoImpresion = GetCellValue(worksheet, row, "H")?.Trim();
                        var numeroColoresStr = GetCellValue(worksheet, row, "I")?.Trim();
                        var kilosStr = GetCellValue(worksheet, row, "J")?.Trim();
                        var metrosStr = GetCellValue(worksheet, row, "K")?.Trim();
                        var fechaTintaStr = GetCellValue(worksheet, row, "L")?.Trim();
                        var sustrato = GetCellValue(worksheet, row, "M")?.Trim();
                        var colores = GetCellValue(worksheet, row, "N")?.Trim();

                        if (row == 6)
                        {
                            _logger.LogWarning($"🔍 DIAGNÓSTICO FILA 6: B='{mq}', C='{articulo}', D='{otSap}', E='{cliente}'");
                        }

                        // Detectar si la fila está completamente vacía (ignorar)
                        bool isCompletelyEmpty = string.IsNullOrEmpty(mq) && string.IsNullOrEmpty(articulo) 
                            && string.IsNullOrEmpty(otSap) && string.IsNullOrEmpty(cliente)
                            && string.IsNullOrEmpty(referencia) && string.IsNullOrEmpty(kilosStr);
                        if (isCompletelyEmpty)
                        {
                            skippedRows++;
                            continue;
                        }

                        // Detectar filas informativas: tienen número de máquina pero pueden no tener OT/artículo/cliente normales
                        // Ejemplos: FIN DE SEMANA, LIMPIEZA Y DESINFECCION, perfilación, pruebas, etc.
                        bool isInformational = false;
                        
                        // Si no tiene OT_SAP, generar uno automático basado en la fila
                        if (string.IsNullOrEmpty(otSap))
                        {
                            // Solo generar si tiene al menos número de máquina o algún texto informativo
                            bool hasAnyContent = !string.IsNullOrEmpty(mq) || !string.IsNullOrEmpty(articulo) 
                                || !string.IsNullOrEmpty(cliente) || !string.IsNullOrEmpty(referencia);
                            if (!hasAnyContent)
                            {
                                skippedRows++;
                                continue;
                            }
                            otSap = $"INFO-R{row}-M{mq ?? "0"}-{DateTimeHelper.Now:HHmmss}";
                            isInformational = true;
                        }

                        // Si no tiene artículo, usar "0" o texto informativo
                        if (string.IsNullOrEmpty(articulo) || articulo == "0")
                        {
                            articulo = articulo ?? "0";
                            isInformational = true;
                        }

                        // Si no tiene cliente, buscar texto informativo en otras columnas
                        if (string.IsNullOrEmpty(cliente))
                        {
                            // Usar referencia, artículo o cualquier texto disponible como cliente
                            cliente = !string.IsNullOrEmpty(referencia) ? referencia 
                                : !string.IsNullOrEmpty(articulo) && articulo != "0" ? articulo 
                                : "INFORMATIVO";
                            isInformational = true;
                        }

                        if (isInformational && row <= 20)
                        {
                            _logger.LogDebug($"ℹ️ Fila {row}: Fila informativa detectada - MQ={mq}, Art={articulo}, OT={otSap}, Cli={cliente}");
                        }

                        if (processedOts.Contains(otSap))
                        {
                            skippedRows++;
                            result.Errors++;
                            result.ErrorDetails.Add($"Fila {row}: OT {otSap} duplicada");
                            continue;
                        }
                        processedOts.Add(otSap);

                        int numeroMaquina = 11;
                        if (!string.IsNullOrEmpty(mq) && int.TryParse(mq, out int mqNum) && mqNum >= 1)
                        {
                            numeroMaquina = mqNum;
                        }

                        int numeroColores = 0;
                        if (!string.IsNullOrEmpty(numeroColoresStr))
                        {
                            if (int.TryParse(numeroColoresStr, out int coloresInt)) numeroColores = coloresInt;
                            else if (decimal.TryParse(numeroColoresStr, out decimal coloresDecimal)) numeroColores = (int)coloresDecimal;
                        }

                        decimal kilos = 0m;
                        if (!string.IsNullOrEmpty(kilosStr))
                        {
                            var kiloClean = kilosStr.Trim();
                            if (kiloClean.Contains(".") && kiloClean.Contains(","))
                                kiloClean = kiloClean.Replace(".", "").Replace(",", ".");
                            else if (kiloClean.Contains(","))
                                kiloClean = kiloClean.Replace(",", ".");
                            if (decimal.TryParse(kiloClean, System.Globalization.NumberStyles.Any,
                                System.Globalization.CultureInfo.InvariantCulture, out decimal kValue) && kValue > 0)
                                kilos = Math.Min(kValue, 9999999.999m);
                        }

                        decimal? metros = null;
                        if (!string.IsNullOrEmpty(metrosStr))
                        {
                            try
                            {
                                var metroClean = metrosStr.Trim();
                                if (metroClean.Contains(","))
                                    metroClean = metroClean.Split(',')[0];
                                else if (metroClean.Contains("."))
                                {
                                    if (metroClean.Count(c => c == '.') > 1)
                                        metroClean = metroClean.Replace(".", "");
                                    else
                                        metroClean = metroClean.Split('.')[0];
                                }
                                metroClean = metroClean.Replace(".", "");
                                if (decimal.TryParse(metroClean, System.Globalization.NumberStyles.Any,
                                    System.Globalization.CultureInfo.InvariantCulture, out decimal mValue) && mValue >= 0)
                                    metros = Math.Min(mValue, 99999999m);
                            }
                            catch { }
                        }

                        // Parsear fecha
                        DateTime fechaTinta = DateTimeHelper.Now;
                        if (!string.IsNullOrEmpty(fechaTintaStr))
                        {
                            if (double.TryParse(fechaTintaStr, System.Globalization.NumberStyles.Any,
                                System.Globalization.CultureInfo.InvariantCulture, out double oaDate))
                            {
                                try { fechaTinta = DateTime.FromOADate(oaDate); } catch { }
                            }
                            else
                            {
                                var formats = new[] {
                                    "dd/MM/yyyy HH:mm", "dd/MM/yyyy H:mm", "d/M/yyyy HH:mm", "d/M/yyyy H:mm",
                                    "dd/MM/yyyy", "d/M/yyyy", "M/d/yyyy HH:mm", "M/d/yyyy",
                                    "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd HH:mm", "yyyy-MM-dd"
                                };
                                if (!DateTime.TryParseExact(fechaTintaStr, formats,
                                    System.Globalization.CultureInfo.InvariantCulture,
                                    System.Globalization.DateTimeStyles.None, out fechaTinta))
                                {
                                    DateTime.TryParse(fechaTintaStr, out fechaTinta);
                                }
                            }
                        }

                        // Convertir colores a JSON array
                        string coloresJson = "[]";
                        if (!string.IsNullOrEmpty(colores))
                        {
                            var coloresArray = colores.Split(',').Select(c => c.Trim()).Where(c => !string.IsNullOrEmpty(c)).ToArray();
                            coloresJson = System.Text.Json.JsonSerializer.Serialize(coloresArray);
                            if (coloresArray.Length > 0) numeroColores = coloresArray.Length;
                        }

                        bool isUpdate = existingOts.Contains(otSap);
                        bool isProtected = protectedPrograms.ContainsKey(otSap);
                        var currentOrden = ordenExcel++;

                        if (isUpdate)
                        {
                            // UPDATE con RAW SQL - preservar estados protegidos
                            using var updateCmd = conn.CreateCommand();
                            updateCmd.Transaction = transaction as MySqlConnector.MySqlTransaction;

                            if (isProtected)
                            {
                                // Solo actualizar datos del Excel, mantener estado y acciones
                                var ordenCol = hasOrdenExcel ? ", orden_excel = @orden" : "";
                                updateCmd.CommandText = $@"UPDATE maquinas SET 
                                    numero_maquina = @mq, articulo = @art, cliente = @cli, referencia = @ref, 
                                    td = @td, tipo_impresion = @tipoImp, numero_colores = @numCol, colores = @colores,
                                    kilos = @kilos, metros = @metros, fecha_tinta_en_maquina = @fecha, sustrato = @sust,
                                    updated_at = @updAt, updated_by = 1{ordenCol}
                                    WHERE ot_sap = @ot";
                            }
                            else
                            {
                                // Actualizar todo, resetear estado
                                var ordenCol = hasOrdenExcel ? ", orden_excel = @orden" : "";
                                updateCmd.CommandText = $@"UPDATE maquinas SET 
                                    numero_maquina = @mq, articulo = @art, cliente = @cli, referencia = @ref, 
                                    td = @td, tipo_impresion = @tipoImp, numero_colores = @numCol, colores = @colores,
                                    kilos = @kilos, metros = @metros, fecha_tinta_en_maquina = @fecha, sustrato = @sust,
                                    estado = NULL, updated_at = @updAt, updated_by = 1{ordenCol}
                                    WHERE ot_sap = @ot";
                            }

                            updateCmd.Parameters.AddWithValue("@ot", otSap);
                            updateCmd.Parameters.AddWithValue("@mq", numeroMaquina);
                            updateCmd.Parameters.AddWithValue("@art", articulo);
                            updateCmd.Parameters.AddWithValue("@cli", cliente);
                            updateCmd.Parameters.AddWithValue("@ref", referencia ?? "");
                            updateCmd.Parameters.AddWithValue("@td", td ?? "");
                            updateCmd.Parameters.AddWithValue("@tipoImp", (object?)tipoImpresion ?? DBNull.Value);
                            updateCmd.Parameters.AddWithValue("@numCol", numeroColores);
                            updateCmd.Parameters.AddWithValue("@colores", coloresJson);
                            updateCmd.Parameters.AddWithValue("@kilos", kilos);
                            updateCmd.Parameters.AddWithValue("@metros", (object?)metros ?? DBNull.Value);
                            updateCmd.Parameters.AddWithValue("@fecha", fechaTinta);
                            updateCmd.Parameters.AddWithValue("@sust", sustrato ?? "");
                            updateCmd.Parameters.AddWithValue("@updAt", DateTimeHelper.Now);
                            if (hasOrdenExcel) updateCmd.Parameters.AddWithValue("@orden", currentOrden);

                            await updateCmd.ExecuteNonQueryAsync();
                            result.Updated++;
                        }
                        else
                        {
                            // INSERT con RAW SQL
                            using var insertCmd = conn.CreateCommand();
                            insertCmd.Transaction = transaction as MySqlConnector.MySqlTransaction;

                            var ordenInsertCol = hasOrdenExcel ? ", orden_excel" : "";
                            var ordenInsertVal = hasOrdenExcel ? ", @orden" : "";
                            insertCmd.CommandText = $@"INSERT INTO maquinas 
                                (ot_sap, articulo, numero_maquina, cliente, referencia, td, tipo_impresion, 
                                 numero_colores, colores, kilos, metros, fecha_tinta_en_maquina, sustrato, 
                                 estado, observaciones, created_at, updated_at, created_by, updated_by{ordenInsertCol})
                                VALUES 
                                (@ot, @art, @mq, @cli, @ref, @td, @tipoImp, 
                                 @numCol, @colores, @kilos, @metros, @fecha, @sust, 
                                 NULL, '', @creAt, @updAt, 1, 1{ordenInsertVal})";

                            insertCmd.Parameters.AddWithValue("@ot", otSap);
                            insertCmd.Parameters.AddWithValue("@art", articulo);
                            insertCmd.Parameters.AddWithValue("@mq", numeroMaquina);
                            insertCmd.Parameters.AddWithValue("@cli", cliente);
                            insertCmd.Parameters.AddWithValue("@ref", referencia ?? "");
                            insertCmd.Parameters.AddWithValue("@td", td ?? "");
                            insertCmd.Parameters.AddWithValue("@tipoImp", (object?)tipoImpresion ?? DBNull.Value);
                            insertCmd.Parameters.AddWithValue("@numCol", numeroColores);
                            insertCmd.Parameters.AddWithValue("@colores", coloresJson);
                            insertCmd.Parameters.AddWithValue("@kilos", kilos);
                            insertCmd.Parameters.AddWithValue("@metros", (object?)metros ?? DBNull.Value);
                            insertCmd.Parameters.AddWithValue("@fecha", fechaTinta);
                            insertCmd.Parameters.AddWithValue("@sust", sustrato ?? "");
                            insertCmd.Parameters.AddWithValue("@creAt", DateTimeHelper.Now);
                            insertCmd.Parameters.AddWithValue("@updAt", DateTimeHelper.Now);
                            if (hasOrdenExcel) insertCmd.Parameters.AddWithValue("@orden", currentOrden);

                            await insertCmd.ExecuteNonQueryAsync();
                            result.Created++;
                        }
                    }
                    catch (Exception ex)
                    {
                        result.Errors++;
                        result.ErrorDetails.Add($"Fila {row}: {ex.Message}");
                        _logger.LogError($"❌ Fila {row}: {ex.Message}");
                    }
                }

                // Commit de la transacción
                await transaction.CommitAsync();
                _logger.LogDebug($"✅ Transacción completada: {result.Created} creados, {result.Updated} actualizados");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                var innerMsg = ex.InnerException?.Message ?? "sin detalle";
                _logger.LogError(ex, $"❌ FALLO TRANSACCIÓN: {ex.Message} | Inner: {innerMsg}");
                result.Created = 0;
                result.Updated = 0;
                result.Errors++;
                result.ErrorDetails.Add($"FALLO TOTAL: {ex.Message} | {innerMsg}");
            }

            _logger.LogDebug($"📊 Completado: {result.Created} creados, {result.Updated} actualizados, {result.Errors} errores, {skippedRows} ignoradas");
            return result;
        }

        /// <summary>
        /// Obtiene el historial de acciones para un programa específico
        /// </summary>
        [HttpGet("{otSap}/history")]
        public async Task<ActionResult<object>> GetProgramHistory(string otSap)
        {
            try
            {
                var normalizedOtSap = otSap.Trim();

                // Buscar actividades por OT SAP en Details o EntityName
                var activities = await _context.Activities
                    .Include(a => a.User)
                    .Where(a => a.Module == "MACHINES" && 
                               a.Action == "MACHINE_STATUS_CHANGED" &&
                               (a.Details.Contains(normalizedOtSap) || 
                                a.EntityName.Contains(normalizedOtSap)))
                    .OrderByDescending(a => a.Timestamp)
                    .Take(20)
                    .Select(a => new
                    {
                        user = a.User != null 
                            ? (a.User.FirstName + " " + a.User.LastName).Trim()
                            : (a.UserCode ?? "Sistema"),
                        action = a.Action,
                        description = a.Description,
                        timestamp = a.Timestamp,
                        duration = a.Duration
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = activities,
                    count = activities.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error obteniendo historial para OT SAP: {otSap}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error al obtener historial",
                    error = ex.Message
                });
            }
        }

    }





    public class UpdateStatusRequest
    {
        public string Estado { get; set; } = "";
        public string? Observaciones { get; set; }
        public DateTime? ClientTimestamp { get; set; }
        public List<string>? PantoneColors { get; set; }
    }
}

