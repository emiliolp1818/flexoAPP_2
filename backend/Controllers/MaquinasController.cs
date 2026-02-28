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







        [HttpGet]
        public async Task<ActionResult<object>> GetMaquinas([FromQuery] string? orderBy = "fechaTintaEnMaquina", [FromQuery] string? order = "desc")
        {
            try
            {

                _logger.LogInformation("🔄 Obteniendo datos de máquinas usando RAW SQL");


                var connectionString = _context.Database.GetConnectionString();
                using var connection = new MySqlConnector.MySqlConnection(connectionString);
                await connection.OpenAsync();


                var orderByClause = "fecha_tinta_en_maquina DESC, numero_maquina";
                if (orderBy?.ToLower() == "numeromaquina" || orderBy?.ToLower() == "machinenumber")
                {
                    orderByClause = order?.ToLower() == "desc"
                        ? "numero_maquina DESC, fecha_tinta_en_maquina DESC"
                        : "numero_maquina ASC, fecha_tinta_en_maquina DESC";
                }
                else if (orderBy?.ToLower() == "fechatintaenmaquina" || orderBy?.ToLower() == "fechatinta" || string.IsNullOrEmpty(orderBy))
                {
                    orderByClause = order?.ToLower() == "asc"
                        ? "fecha_tinta_en_maquina ASC, numero_maquina"
                        : "fecha_tinta_en_maquina DESC, numero_maquina";
                }

                using var command = connection.CreateCommand();
                command.CommandText = $@"
                    SELECT
                        articulo, numero_maquina, ot_sap, cliente, referencia, td, tipo_impresion,
                        numero_colores, colores, kilos, metros, fecha_tinta_en_maquina, sustrato,
                        estado, observaciones, last_action_by, last_action_at, preparando_started_at,
                        created_by, updated_by, created_at, updated_at
                    FROM maquinas
                    ORDER BY {orderByClause}";

                var maquinas = new List<object>();
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
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
                        numeroColores = reader.GetInt32("numero_colores"),
                        colores = ParseColores(reader.GetString("colores")),
                        kilos = reader.GetDecimal("kilos"),
                        metros = reader.IsDBNull(reader.GetOrdinal("metros")) ? (decimal?)null : reader.GetDecimal("metros"),
                        fechaTintaEnMaquina = reader.GetDateTime("fecha_tinta_en_maquina"),
                        sustrato = reader.GetString("sustrato"),
                        estado = reader.IsDBNull(reader.GetOrdinal("estado")) ? null : reader.GetString("estado"),
                        observaciones = reader.IsDBNull(reader.GetOrdinal("observaciones")) ? null : reader.GetString("observaciones"),
                        lastActionBy = reader.IsDBNull(reader.GetOrdinal("last_action_by")) ? null : reader.GetString("last_action_by"),
                        lastActionAt = reader.IsDBNull(reader.GetOrdinal("last_action_at")) ? (DateTime?)null : reader.GetDateTime("last_action_at"),
                        preparandoStartedAt = reader.IsDBNull(reader.GetOrdinal("preparando_started_at")) ? (DateTime?)null : reader.GetDateTime("preparando_started_at"),
                        createdBy = reader.IsDBNull(reader.GetOrdinal("created_by")) ? (int?)null : reader.GetInt32("created_by"),
                        updatedBy = reader.IsDBNull(reader.GetOrdinal("updated_by")) ? (int?)null : reader.GetInt32("updated_by"),
                        createdAt = reader.GetDateTime("created_at"),
                        updatedAt = reader.GetDateTime("updated_at")
                    });
                }


                _logger.LogInformation($"✅ {maquinas.Count} registros de máquinas encontrados");


                try
                {
                    await _activityLogger.LogActivityAsync(
                        "VIEW_MACHINES",
                        "Consulta de lista de máquinas",
                        "MACHINES",
                        $"{{\"count\":{maquinas.Count},\"orderBy\":\"{orderBy ?? "fechaTintaEnMaquina"}\",\"order\":\"{order ?? "desc"}\"}}"
                    );
                }
                catch (Exception logEx)
                {
                    _logger.LogWarning(logEx, "Error registrando actividad de consulta de máquinas");
                }

                return Ok(new
                {
                    success = true,
                    message = $"{maquinas.Count} registros de máquinas obtenidos exitosamente",
                    data = maquinas,
                    orderBy = orderBy ?? "fechaTintaEnMaquina",
                    order = order ?? "desc",
                    timestamp = DateTime.UtcNow
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
                    timestamp = DateTime.UtcNow
                });
            }
        }










        [HttpPatch("{otSap}/status")]
        public async Task<ActionResult<object>> UpdateMachineStatus(string otSap, [FromBody] UpdateStatusRequest request)
        {
            try
            {

                _logger.LogInformation($"🎯 PATCH /api/maquinas/{otSap}/status - Estado: {request?.Estado}, Observaciones: {request?.Observaciones}");
                _logger.LogInformation($"🔐 Usuario autenticado: {User?.Identity?.IsAuthenticated ?? false}");


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

                var result = await _maquinaService.UpdateMachineStatusAsync(otSap, request.Estado, request.Observaciones, userId, userName);


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
                    timestamp = DateTime.UtcNow
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
                _logger.LogInformation("🛠️ Iniciando reparación de esquema de base de datos...");
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
                _logger.LogInformation("🛠️ Iniciando actualización de precisión decimal para kilos...");
                var result = await _maquinaService.UpdateKilosDecimalPrecisionAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error en actualización de precisión decimal");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }





        [HttpPost("seed-data")]
        public async Task<ActionResult<object>> SeedTestData()
        {
            try
            {
                _logger.LogInformation("🌱 Creando datos de prueba múltiples...");

                var testPrograms = new List<Maquina>
                {
                    new Maquina
                    {
                        Articulo = "F204567",
                        NumeroMaquina = 11,
                        OtSap = "OT123456",
                        Cliente = "ABSORBENTES DE COLOMBIA S.A",
                        Referencia = "REF-001",
                        Td = "TD1",
                        NumeroColores = 4,
                        Kilos = 1500.00m,
                        FechaTintaEnMaquina = DateTime.Now.AddHours(-2),
                        Sustrato = "BOPP",
                        Estado = "LISTO",
                        Observaciones = "Programa preparado para producción",
                        LastActionBy = "Juan Pérez",
                        LastActionAt = DateTime.Now,
                        CreatedBy = 1,
                        UpdatedBy = 1,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Maquina
                    {
                        Articulo = "F204568",
                        NumeroMaquina = 11,
                        OtSap = "OT123457",
                        Cliente = "PRODUCTOS FAMILIA S.A",
                        Referencia = "REF-002",
                        Td = "TD2",
                        NumeroColores = 3,
                        Kilos = 2000.00m,
                        FechaTintaEnMaquina = DateTime.Now.AddHours(-1),
                        Sustrato = "PE",
                        Estado = "PREPARANDO",
                        Observaciones = "En proceso de preparación",
                        LastActionBy = "María García",
                        LastActionAt = DateTime.Now,
                        CreatedBy = 1,
                        UpdatedBy = 1,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Maquina
                    {
                        Articulo = "F204569",
                        NumeroMaquina = 12,
                        OtSap = "OT123458",
                        Cliente = "EMPAQUES DEL VALLE LTDA",
                        Referencia = "REF-003",
                        Td = "TD3",
                        NumeroColores = 5,
                        Kilos = 1200.00m,
                        FechaTintaEnMaquina = DateTime.Now,
                        Sustrato = "PET",
                        Estado = "CORRIENDO",
                        Observaciones = "Producción en curso",
                        LastActionBy = "Carlos López",
                        LastActionAt = DateTime.Now,
                        CreatedBy = 1,
                        UpdatedBy = 1,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Maquina
                    {
                        Articulo = "F204570",
                        NumeroMaquina = 12,
                        OtSap = "OT123459",
                        Cliente = "INDUSTRIAS ALIMENTARIAS S.A",
                        Referencia = "REF-004",
                        Td = "TD4",
                        NumeroColores = 2,
                        Kilos = 800.00m,
                        FechaTintaEnMaquina = DateTime.Now.AddHours(1),
                        Sustrato = "BOPP",
                        Estado = "SUSPENDIDO",
                        Observaciones = "Falta material",
                        LastActionBy = "Ana Rodríguez",
                        LastActionAt = DateTime.Now,
                        CreatedBy = 1,
                        UpdatedBy = 1,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Maquina
                    {
                        Articulo = "F204571",
                        NumeroMaquina = 13,
                        OtSap = "OT123460",
                        Cliente = "FLEXIBLES MODERNOS S.A",
                        Referencia = "REF-005",
                        Td = "TD5",
                        NumeroColores = 6,
                        Kilos = 2500.00m,
                        FechaTintaEnMaquina = DateTime.Now.AddHours(2),
                        Sustrato = "CPP",
                        Estado = "TERMINADO",
                        Observaciones = "Producción completada",
                        LastActionBy = "Luis Martínez",
                        LastActionAt = DateTime.Now,
                        CreatedBy = 1,
                        UpdatedBy = 1,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                };


                testPrograms[0].SetColoresArray(new[] { "CYAN", "MAGENTA", "AMARILLO", "NEGRO" });
                testPrograms[1].SetColoresArray(new[] { "CYAN", "MAGENTA", "AMARILLO" });
                testPrograms[2].SetColoresArray(new[] { "CYAN", "MAGENTA", "AMARILLO", "NEGRO", "PANTONE 186C" });
                testPrograms[3].SetColoresArray(new[] { "CYAN", "NEGRO" });
                testPrograms[4].SetColoresArray(new[] { "CYAN", "MAGENTA", "AMARILLO", "NEGRO", "PANTONE 186C", "PANTONE 287C" });


                _context.Maquinas.AddRange(testPrograms);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ {testPrograms.Count} programas de prueba creados exitosamente");

                return Ok(new
                {
                    success = true,
                    message = $"{testPrograms.Count} programas de prueba creados exitosamente",
                    data = testPrograms.Select(p => new
                    {
                        otSap = p.OtSap,
                        articulo = p.Articulo,
                        numeroMaquina = p.NumeroMaquina,
                        cliente = p.Cliente,
                        estado = p.Estado,
                        colores = p.GetColoresArray()
                    }),
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error creando datos de prueba múltiples");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error creando datos de prueba",
                    error = ex.Message,
                    details = ex.InnerException?.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }








        [HttpGet("machine/{numeroMaquina}")]
        public async Task<ActionResult<object>> GetProgramasPorMaquina(int numeroMaquina)
        {
            try
            {


                _logger.LogInformation($"🔄 Obteniendo programas para máquina {numeroMaquina}");



                var programs = await _context.Maquinas



                    .Where(p => p.NumeroMaquina == numeroMaquina)
                    .OrderByDescending(p => p.FechaTintaEnMaquina)
                    .ToListAsync();



                _logger.LogInformation($"✅ {programs.Count} programas encontrados para máquina {numeroMaquina}");



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
                    timestamp = DateTime.UtcNow
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
                    timestamp = DateTime.UtcNow
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
                _logger.LogInformation("📋 Obteniendo información de diseño para artículo: {Articulo}", articulo);


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
                        timestamp = DateTime.Now
                    });
                }

                _logger.LogInformation("✅ Información de diseño encontrada para artículo {Articulo}", articulo);




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
                    timestamp = DateTime.Now
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
                    timestamp = DateTime.UtcNow
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
                    _logger.LogInformation($"✅ Nombre obtenido de DisplayName: {displayName}");
                    return displayName;
                }


                var name = User.FindFirst(ClaimTypes.Name)?.Value;
                if (!string.IsNullOrWhiteSpace(name))
                {
                    _logger.LogInformation($"✅ Nombre obtenido de ClaimTypes.Name: {name}");
                    return name;
                }


                if (!string.IsNullOrWhiteSpace(User.Identity?.Name))
                {
                    _logger.LogInformation($"✅ Nombre obtenido de Identity.Name: {User.Identity.Name}");
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

                _logger.LogInformation("🧪 TEST: Buscando artículo '{Articulo}' en tabla designs", articulo);


                var totalDesigns = await _context.Designs.CountAsync();

                _logger.LogInformation("📊 Total de diseños en tabla: {Total}", totalDesigns);


                var design = await _context.Designs
                    .Where(d => d.ArticleF == articulo)
                    .FirstOrDefaultAsync();


                if (design != null)
                {

                    _logger.LogInformation("✅ Diseño encontrado: ID={Id}", design.Id);


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
                        timestamp = DateTime.UtcNow
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
                        timestamp = DateTime.UtcNow
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
                    timestamp = DateTime.UtcNow
                });
            }
        }








        [HttpPost("{articulo}/generate-ff459")]
        public async Task<ActionResult<object>> GenerateFF459Format(string articulo)
        {
            try
            {
                _logger.LogInformation($"📄 Generando formato FF459 para artículo: {articulo}");


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
                        timestamp = DateTime.UtcNow
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
                    fechaImpresion = DateTime.Now,
                    usuarioImpresion = userName,
                    formatoVersion = "FF459-v1.0"
                };

                await reader.CloseAsync();


                try
                {
                    var timestamp = DateTime.Now;
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

                    _logger.LogInformation($"✅ Actividad de impresión FF459 registrada para artículo {articulo}");
                }
                catch (Exception logEx)
                {
                    _logger.LogWarning(logEx, "Error registrando actividad de impresión FF459");
                }

                _logger.LogInformation($"✅ Formato FF459 generado exitosamente para artículo {articulo}");

                return Ok(new
                {
                    success = true,
                    message = "Formato FF459 generado exitosamente",
                    data = ff459Data,
                    timestamp = DateTime.UtcNow
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
                    timestamp = DateTime.UtcNow
                });
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

                _logger.LogInformation("📊 Consultando historial de impresiones FF459");


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

                _logger.LogInformation($"✅ Se encontraron {history.Count} registros de impresión FF459");

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
                    timestamp = DateTime.UtcNow
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
                    timestamp = DateTime.UtcNow
                });
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

                if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { message = "El archivo debe ser formato .xlsx" });
                }

                _logger.LogInformation($"📥 Iniciando importación masiva desde Excel: {file.FileName}");


                int userId = GetCurrentUserId();
                if (userId == 0) userId = 1;

                if (!await HasPermissionAsync(userId, FlexoAPP.API.Models.PermissionCodes.ACTION_IMPORT) &&
                    !await HasPermissionAsync(userId, FlexoAPP.API.Models.PermissionCodes.ACTION_ADD_PROGRAMMING))
                {
                    _logger.LogWarning($"🚫 Usuario {userId} intentó importar Excel sin permisos");
                    return Forbid();
                }


                var countTerminados = await _context.Maquinas
                    .Where(m => m.Estado == "TERMINADO")
                    .ExecuteDeleteAsync();

                if (countTerminados > 0)
                {
                    _logger.LogInformation($"🗑️ {countTerminados} programas TERMINADOS eliminados antes de importar");
                }
                else
                {
                    _logger.LogInformation("ℹ️ No hay programas TERMINADOS para eliminar");
                }

                // Eliminar programas SIN ASIGNAR (estado NULL o vacío)
                var countSinAsignar = await _context.Maquinas
                    .Where(m => m.Estado == null || m.Estado == "")
                    .ExecuteDeleteAsync();

                if (countSinAsignar > 0)
                {
                    _logger.LogInformation($"🗑️ {countSinAsignar} programas SIN ASIGNAR eliminados antes de importar");
                }
                else
                {
                    _logger.LogInformation("ℹ️ No hay programas SIN ASIGNAR para eliminar");
                }


                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                var importResults = new Dictionary<int, ImportSheetResult>();
                var totalCreated = 0;
                var totalErrors = 0;
                var sheetsProcessed = 0;

                using (var stream = file.OpenReadStream())
                {
                    using (var package = new ExcelPackage(stream))
                    {
                        _logger.LogInformation($"📊 Excel contiene {package.Workbook.Worksheets.Count} hojas");

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

                        _logger.LogInformation($"✅ Hoja 'PROGRAMA CC' encontrada, procesando...");

                        using var designConn = new MySqlConnector.MySqlConnection(_context.Database.GetConnectionString());
                        await designConn.OpenAsync();

                        // Procesar la hoja PROGRAMA CC
                        var result = await ProcessProgramaCCWorksheet(programaCCSheet, designConn);
                        
                        totalCreated = result.Created;
                        totalErrors = result.Errors;
                        sheetsProcessed = 1;

                        _logger.LogInformation($"📊 PROGRAMA CC: {result.Created} creados, {result.Updated} actualizados, {result.Errors} errores");

                        if (result.Created == 0)
                        {
                            _logger.LogWarning($"⚠️ PROGRAMA CC: NO se crearon registros. Errores: {result.Errors}");
                            if (result.ErrorDetails.Any())
                            {
                                _logger.LogWarning($"   Detalles de errores: {string.Join(", ", result.ErrorDetails.Take(5))}");
                            }
                        }
                    }
                }

                _logger.LogInformation($"✅ Importación completada: {totalCreated} registros creados, {totalErrors} errores");

                // Notificar a todos los clientes sobre la importación
                var userName = User.Identity?.Name ?? "Sistema";
                await _signalRService.NotifyExcelImported(
                    0, // No hay número de máquina específico
                    totalCreated, 
                    0, // No hay actualizaciones en esta versión
                    userName
                );

                return Ok(new
                {
                    message = "Importación completada",
                    sheetsProcessed,
                    totalCreated,
                    totalUpdated = 0,
                    totalErrors,
                    errorDetails = totalErrors > 0 ? "Revise los logs para más detalles" : null
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

            _logger.LogInformation($"📊 Procesando máquina {machineNumber}: Hoja tiene {rowCount} filas");


            for (int row = 3; row <= rowCount; row++)
            {
                try
                {

                    var otSap = GetCellValue(worksheet, row, "T")?.Trim();
                    var articulo = GetCellValue(worksheet, row, "C")?.Trim();
                    var cliente = GetCellValue(worksheet, row, "D")?.Trim();


                    if (row == 3)
                    {
                        _logger.LogDebug($"🔍 Máquina {machineNumber}, Primera fila de datos: OT={otSap}, Articulo={articulo}, Cliente={cliente}");
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
                            _logger.LogInformation($"🔍 Fila {row}: Kilos original del Excel: '{kilosStr}'");

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
                                    _logger.LogInformation($"✅ Fila {row}: Kilos parseados exitosamente: '{kilosStr}' → {kilos}");
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
                            _logger.LogInformation($"🔍 Fila {row}: Metros original del Excel: '{metrosStr}'");

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
                                    _logger.LogInformation($"✅ Fila {row}: Metros parseados exitosamente (solo enteros): '{metrosStr}' → {metros}");
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


                    DateTime fechaTinta = DateTime.Now;
                    if (!string.IsNullOrEmpty(fechaTintaStr))
                    {

                        if (double.TryParse(fechaTintaStr, out double oaDate))
                        {
                            try
                            {
                                fechaTinta = DateTime.FromOADate(oaDate);
                                _logger.LogDebug($"📅 Fila {row}: Fecha parseada desde OADate: {fechaTinta:dd/MM/yyyy HH:mm}");
                            }
                            catch
                            {
                                _logger.LogWarning($"⚠️ Fila {row}: OADate inválido '{fechaTintaStr}', intentando otros formatos");
                            }
                        }


                        if (fechaTinta == DateTime.Now && !DateTime.TryParse(fechaTintaStr, out fechaTinta))
                        {

                            var formats = new[] {
                                "dd/MM/yyyy HH:mm",
                                "dd/MM/yyyy H:mm",
                                "d/M/yyyy HH:mm",
                                "d/M/yyyy H:mm",
                                "dd/MM/yyyy",
                                "d/M/yyyy",
                                "M/d/yyyy HH:mm",
                                "M/d/yyyy H:mm",
                                "M/d/yyyy"
                            };

                            if (!DateTime.TryParseExact(fechaTintaStr, formats,
                                System.Globalization.CultureInfo.InvariantCulture,
                                System.Globalization.DateTimeStyles.None, out fechaTinta))
                            {
                                _logger.LogWarning($"⚠️ Fila {row}: fecha inválida '{fechaTintaStr}', usando fecha actual");
                                fechaTinta = DateTime.Now;
                            }
                        }
                    }
                    else
                    {
                        _logger.LogDebug($"📅 Fila {row}: Fecha vacía, usando fecha actual");
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




                    var protectedStates = new[] { "PREPARANDO", "LISTO", "CORRIENDO", "SUSPENDIDO" };


                    if (isUpdate && existingMachine != null && !string.IsNullOrEmpty(existingMachine.Estado)
                        && protectedStates.Contains(existingMachine.Estado.ToUpper()))
                    {

                        maquina.Estado = existingMachine.Estado;



                        maquina.Observaciones = existingMachine.Observaciones;


                        maquina.LastActionBy = existingMachine.LastActionBy;
                        maquina.LastActionAt = existingMachine.LastActionAt;


                        maquina.PreparandoStartedAt = existingMachine.PreparandoStartedAt;

                        _logger.LogDebug($"🛡️ OT {otSap} mantiene estado protegido: {maquina.Estado} con observaciones: {maquina.Observaciones}");
                    }
                    else
                    {

                        maquina.Estado = null;

                        maquina.Observaciones = isUpdate
                            ? $"Actualizado desde Excel - Hoja MAQ {machineNumber}"
                            : $"Importado desde Excel - Hoja MAQ {machineNumber}";

                        _logger.LogDebug($"🆕 OT {otSap} cargada como 'Sin asignar'");
                    }

                    if (!isUpdate) {
                        maquina.CreatedAt = DateTime.Now;
                    }
                    maquina.UpdatedAt = DateTime.Now;


                    if (isUpdate) {
                        _context.Maquinas.Update(maquina);
                        result.Updated++;
                    } else {
                        _context.Maquinas.Add(maquina);
                        result.Created++;
                    }

                    await _context.SaveChangesAsync();


                    _context.ChangeTracker.Clear();

                    _logger.LogDebug($"✅ Fila {row}: Registro {(isUpdate ? "actualizado" : "creado")} - OT {otSap}");
                }
                catch (Exception ex)
                {
                    result.Errors++;
                    var errorMsg = $"Fila {row}: {ex.Message}";
                    result.ErrorDetails.Add(errorMsg);
                    _logger.LogError(ex, $"❌ Error procesando fila {row}");



                    _context.ChangeTracker.Clear();
                }
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
        private async Task<ImportSheetResult> ProcessProgramaCCWorksheet(ExcelWorksheet worksheet, MySqlConnector.MySqlConnection designConn)
        {
            var result = new ImportSheetResult();
            var rowCount = worksheet.Dimension?.Rows ?? 0;
            var processedOts = new HashSet<string>();

            _logger.LogInformation($"📊 Procesando hoja PROGRAMA CC: {rowCount} filas totales");
            _logger.LogInformation($"📋 Mapeo: B=MQ, C=ARTICULO, D=OT_SAP, E=CLIENTE, F=REFERENCIA, G=TD, H=T_IMP, I=NUM_COLORES, J=KILOS, K=METROS, L=FECHA_TINTA_EN_MAQUINA, M=SUSTRATO, N=COLORES");

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
                    var fechaTintaStr = GetCellValue(worksheet, row, "L")?.Trim(); // Fecha en que deben estar colores en máquina
                    var sustrato = GetCellValue(worksheet, row, "M")?.Trim();
                    var colores = GetCellValue(worksheet, row, "N")?.Trim();

                    if (row == 6)
                    {
                        _logger.LogDebug($"🔍 Primera fila: MQ={mq}, OT={otSap}, Articulo={articulo}, Cliente={cliente}, FechaTinta={fechaTintaStr}");
                    }

                    if (string.IsNullOrEmpty(otSap) || string.IsNullOrEmpty(articulo) || string.IsNullOrEmpty(cliente))
                    {
                        _logger.LogDebug($"⚠️ Fila {row} ignorada: faltan datos obligatorios");
                        continue;
                    }

                    if (processedOts.Contains(otSap))
                    {
                        _logger.LogDebug($"⚠️ Fila {row} ignorada: OT {otSap} duplicada");
                        result.Errors++;
                        result.ErrorDetails.Add($"Fila {row}: OT {otSap} duplicada");
                        continue;
                    }

                    processedOts.Add(otSap);

                    int numeroMaquina = 11; // Valor por defecto
                    if (!string.IsNullOrEmpty(mq) && int.TryParse(mq, out int mqNum))
                    {
                        if (mqNum >= 11 && mqNum <= 21)
                        {
                            numeroMaquina = mqNum;
                        }
                        else
                        {
                            _logger.LogWarning($"⚠️ Fila {row}: Número de máquina {mqNum} fuera de rango (11-21), usando 11");
                        }
                    }
                    else
                    {
                        _logger.LogDebug($"⚠️ Fila {row}: Número de máquina vacío o inválido, usando 11");
                    }

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
                        }
                    }

                    decimal kilos = 0.001m;
                    if (!string.IsNullOrEmpty(kilosStr))
                    {
                        try
                        {
                            var kiloClean = kilosStr.Trim();
                            if (kiloClean.Contains(".") && kiloClean.Contains(","))
                            {
                                kiloClean = kiloClean.Replace(".", "").Replace(",", ".");
                            }
                            else if (kiloClean.Contains(","))
                            {
                                kiloClean = kiloClean.Replace(",", ".");
                            }

                            if (decimal.TryParse(kiloClean, System.Globalization.NumberStyles.Any,
                                System.Globalization.CultureInfo.InvariantCulture, out decimal kValue) && kValue > 0)
                            {
                                kilos = kValue > 9999999.999m ? 9999999.999m : kValue;
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"❌ Fila {row}: Error parseando kilos: {ex.Message}");
                        }
                    }

                    decimal? metros = null;
                    if (!string.IsNullOrEmpty(metrosStr))
                    {
                        try
                        {
                            var metroClean = metrosStr.Trim();
                            if (metroClean.Contains(","))
                            {
                                metroClean = metroClean.Split(',')[0];
                            }
                            else if (metroClean.Contains("."))
                            {
                                var dotCount = metroClean.Count(c => c == '.');
                                if (dotCount > 1)
                                {
                                    metroClean = metroClean.Replace(".", "");
                                }
                                else
                                {
                                    metroClean = metroClean.Split('.')[0];
                                }
                            }
                            
                            metroClean = metroClean.Replace(".", "");

                            if (decimal.TryParse(metroClean, System.Globalization.NumberStyles.Any,
                                System.Globalization.CultureInfo.InvariantCulture, out decimal mValue) && mValue >= 0)
                            {
                                metros = mValue > 99999999m ? 99999999m : mValue;
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"❌ Fila {row}: Error parseando metros: {ex.Message}");
                        }
                    }

                    // Parsear fecha de tinta en máquina (columna L)
                    DateTime fechaTinta = DateTime.Now;
                    if (!string.IsNullOrEmpty(fechaTintaStr))
                    {
                        try
                        {
                            // Intentar parsear como número de serie de Excel (OADate)
                            if (double.TryParse(fechaTintaStr, System.Globalization.NumberStyles.Any,
                                System.Globalization.CultureInfo.InvariantCulture, out double oaDate))
                            {
                                try
                                {
                                    fechaTinta = DateTime.FromOADate(oaDate);
                                    _logger.LogDebug($"📅 Fila {row}: Fecha parseada desde OADate: {fechaTinta:dd/MM/yyyy HH:mm}");
                                }
                                catch
                                {
                                    _logger.LogWarning($"⚠️ Fila {row}: OADate inválido '{fechaTintaStr}', intentando otros formatos");
                                }
                            }

                            // Si no funcionó OADate, intentar parsear como texto
                            if (fechaTinta == DateTime.Now)
                            {
                                var formats = new[] {
                                    "dd/MM/yyyy HH:mm",
                                    "dd/MM/yyyy H:mm",
                                    "d/M/yyyy HH:mm",
                                    "d/M/yyyy H:mm",
                                    "dd/MM/yyyy",
                                    "d/M/yyyy",
                                    "M/d/yyyy HH:mm",
                                    "M/d/yyyy H:mm",
                                    "M/d/yyyy",
                                    "yyyy-MM-dd HH:mm:ss",
                                    "yyyy-MM-dd HH:mm",
                                    "yyyy-MM-dd"
                                };

                                if (DateTime.TryParseExact(fechaTintaStr, formats,
                                    System.Globalization.CultureInfo.InvariantCulture,
                                    System.Globalization.DateTimeStyles.None, out DateTime parsedDate))
                                {
                                    fechaTinta = parsedDate;
                                    _logger.LogDebug($"📅 Fila {row}: Fecha parseada desde texto: {fechaTinta:dd/MM/yyyy HH:mm}");
                                }
                                else if (DateTime.TryParse(fechaTintaStr, out parsedDate))
                                {
                                    fechaTinta = parsedDate;
                                    _logger.LogDebug($"📅 Fila {row}: Fecha parseada con TryParse: {fechaTinta:dd/MM/yyyy HH:mm}");
                                }
                                else
                                {
                                    _logger.LogWarning($"⚠️ Fila {row}: No se pudo parsear fecha '{fechaTintaStr}', usando fecha actual");
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"❌ Fila {row}: Error parseando fecha '{fechaTintaStr}': {ex.Message}, usando fecha actual");
                        }
                    }
                    else
                    {
                        _logger.LogDebug($"📅 Fila {row}: Fecha vacía, usando fecha actual");
                    }

                    var maquina = new Maquina
                    {
                        NumeroMaquina = numeroMaquina,
                        OtSap = otSap,
                        Articulo = articulo,
                        Cliente = cliente,
                        Referencia = referencia ?? string.Empty,
                        Td = td ?? string.Empty,
                        TipoImpresion = tipoImpresion,
                        NumeroColores = numeroColores,
                        Kilos = kilos,
                        Metros = metros,
                        Sustrato = sustrato ?? string.Empty,
                        FechaTintaEnMaquina = fechaTinta, // Usar la fecha del Excel
                        Estado = null,
                        Observaciones = "Importado desde Excel - Hoja PROGRAMA CC",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        CreatedBy = 1,
                        UpdatedBy = 1
                    };

                    // Convertir colores de texto plano a JSON array
                    if (!string.IsNullOrEmpty(colores))
                    {
                        var coloresArray = colores.Split(',')
                            .Select(c => c.Trim())
                            .Where(c => !string.IsNullOrEmpty(c))
                            .ToArray();
                        maquina.SetColoresArray(coloresArray);
                    }
                    else
                    {
                        maquina.SetColoresArray(new string[0]);
                    }

                    _context.Maquinas.Add(maquina);
                    await _context.SaveChangesAsync();
                    _context.ChangeTracker.Clear();
                    
                    result.Created++;
                    _logger.LogDebug($"✅ Fila {row}: Registro creado - OT {otSap}");
                }
                catch (Exception ex)
                {
                    result.Errors++;
                    result.ErrorDetails.Add($"Fila {row}: {ex.Message}");
                    _logger.LogError($"❌ Fila {row}: {ex.Message}");
                    _context.ChangeTracker.Clear();
                }
            }

            _logger.LogInformation($"📊 Completado: {result.Created} creados, {result.Errors} errores");
            return result;
        }

    }





    public class UpdateStatusRequest
    {

        public string Estado { get; set; } = "";

        public string? Observaciones { get; set; }
    }
}
