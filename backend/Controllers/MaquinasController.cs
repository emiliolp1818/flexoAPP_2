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
    /// <summary>
    /// Controlador específico para el módulo de máquinas
    /// Maneja los datos de la tabla maquinas
    /// Implementa todas las funcionalidades solicitadas para el módulo de máquinas
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Requiere autenticación para registrar actividades
    public class MaquinasController : ControllerBase
    {
        private readonly FlexoAPPDbContext _context;
        private readonly ILogger<MaquinasController> _logger;
        private readonly IMaquinaService _maquinaService;
        private readonly IActivityLoggerService _activityLogger;

        public MaquinasController(
            FlexoAPPDbContext context, 
            ILogger<MaquinasController> logger,
            IMaquinaService maquinaService,
            IActivityLoggerService activityLogger)
        {
            _context = context;
            _logger = logger;
            _maquinaService = maquinaService;
            _activityLogger = activityLogger;
        }

        /// <summary>
        /// GET: api/maquinas
        /// Obtiene todos los registros de máquinas ordenados por fecha de tinta más reciente (descendente)
        /// Muestra los campos solicitados: numeroMaquina, articulo, otSap, cliente, referencia, td, 
        /// numeroColores, colores, kilos, fechaTintaEnMaquina, sustrato
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<object>> GetMaquinas([FromQuery] string? orderBy = "fechaTintaEnMaquina", [FromQuery] string? order = "desc")
        {
            try
            {
                // ===== LOG DE INICIO DE CONSULTA =====
                _logger.LogInformation("🔄 Obteniendo datos de máquinas usando RAW SQL");

                // ===== USAR RAW SQL TEMPORALMENTE PARA EVITAR PROBLEMAS CON EF =====
                var connectionString = _context.Database.GetConnectionString();
                using var connection = new MySqlConnector.MySqlConnection(connectionString);
                await connection.OpenAsync();
                
                // Construir ORDER BY dinámico
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
                        articulo, numero_maquina, ot_sap, cliente, referencia, td,
                        numero_colores, colores, kilos, fecha_tinta_en_maquina, sustrato,
                        estado, observaciones, last_action_by, last_action_at,
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
                        numeroColores = reader.GetInt32("numero_colores"),
                        colores = ParseColores(reader.GetString("colores")),
                        kilos = reader.GetDecimal("kilos"),
                        fechaTintaEnMaquina = reader.GetDateTime("fecha_tinta_en_maquina"),
                        sustrato = reader.GetString("sustrato"),
                        estado = reader.IsDBNull(reader.GetOrdinal("estado")) ? null : reader.GetString("estado"),
                        observaciones = reader.IsDBNull(reader.GetOrdinal("observaciones")) ? null : reader.GetString("observaciones"),
                        lastActionBy = reader.IsDBNull(reader.GetOrdinal("last_action_by")) ? null : reader.GetString("last_action_by"),
                        lastActionAt = reader.IsDBNull(reader.GetOrdinal("last_action_at")) ? (DateTime?)null : reader.GetDateTime("last_action_at"),
                        createdBy = reader.IsDBNull(reader.GetOrdinal("created_by")) ? (int?)null : reader.GetInt32("created_by"),
                        updatedBy = reader.IsDBNull(reader.GetOrdinal("updated_by")) ? (int?)null : reader.GetInt32("updated_by"),
                        createdAt = reader.GetDateTime("created_at"),
                        updatedAt = reader.GetDateTime("updated_at")
                    });
                }

                // ===== LOG DE RESULTADOS OBTENIDOS =====
                _logger.LogInformation($"✅ {maquinas.Count} registros de máquinas encontrados");

                // ✅ Registrar actividad de consulta de máquinas
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

        /// <summary>
        /// PATCH: api/maquinas/{otSap}/status
        /// Actualiza el estado de un programa de máquina y cambia el color de toda la línea en el frontend
        /// Guarda la acción en la base de datos con información del usuario que realizó el cambio
        /// Estados válidos: PREPARANDO, LISTO (verde), CORRIENDO (amarillo), SUSPENDIDO (rojo), TERMINADO (gris)
        /// </summary>
        /// <param name="otSap">OT SAP (identificador único) de la máquina a actualizar</param>
        /// <param name="request">Objeto con el nuevo estado y observaciones opcionales</param>
        /// <returns>Respuesta JSON con el resultado de la operación</returns>
        [HttpPatch("{otSap}/status")] // Ruta: PATCH /api/maquinas/12345/status
        public async Task<ActionResult<object>> UpdateMachineStatus(string otSap, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                // ===== LOG DE ENTRADA =====
                _logger.LogInformation($"🎯 PATCH /api/maquinas/{otSap}/status - Estado: {request?.Estado}, Observaciones: {request?.Observaciones}");
                _logger.LogInformation($"🔐 Usuario autenticado: {User?.Identity?.IsAuthenticated ?? false}");
                
                // ===== VALIDAR REQUEST =====
                if (request == null)
                {
                    return BadRequest(new { success = false, message = "Request body es requerido" });
                }
                
                if (string.IsNullOrWhiteSpace(request.Estado))
                {
                    return BadRequest(new { success = false, message = "El campo 'estado' es requerido" });
                }
                
                // ===== OBTENER INFORMACIÓN DEL USUARIO AUTENTICADO =====
                int userId = 1; 
                string userName = "Sistema";
                try
                {
                    userId = GetCurrentUserId();
                    userName = GetCurrentUserName();
                    if (userId == 0) { userId = 1; userName = !string.IsNullOrEmpty(userName) ? userName : "Sistema"; }
                }
                catch (Exception) { userId = 1; userName = "Sistema"; }
                
                var result = await _maquinaService.UpdateMachineStatusAsync(otSap, request.Estado, request.Observaciones, userId, userName);

                // ===== RETORNAR RESPUESTA EXITOSA =====
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

        /// <summary>
        /// GET: api/maquinas/test-raw
        /// ENDPOINT DE PRUEBA - Consulta directa a MySQL sin Entity Framework
        /// </summary>
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

        /// <summary>
        /// POST: api/maquinas/maintenance/fix-schema
        /// Repara el esquema de la base de datos (elimina duplicados, establece PK correcta)
        /// </summary>
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

        /// <summary>
        /// POST: api/maquinas/maintenance/update-kilos-precision
        /// Actualiza la precisión decimal de la columna kilos de DECIMAL(10,2) a DECIMAL(10,3)
        /// para permitir guardar valores con 3 decimales (ej: 2.234 kilos)
        /// </summary>
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

        /// <summary>
        /// POST: api/maquinas/seed-data
        /// ENDPOINT TEMPORAL - Crear múltiples registros de prueba
        /// </summary>
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

                // Configurar colores para cada programa
                testPrograms[0].SetColoresArray(new[] { "CYAN", "MAGENTA", "AMARILLO", "NEGRO" });
                testPrograms[1].SetColoresArray(new[] { "CYAN", "MAGENTA", "AMARILLO" });
                testPrograms[2].SetColoresArray(new[] { "CYAN", "MAGENTA", "AMARILLO", "NEGRO", "PANTONE 186C" });
                testPrograms[3].SetColoresArray(new[] { "CYAN", "NEGRO" });
                testPrograms[4].SetColoresArray(new[] { "CYAN", "MAGENTA", "AMARILLO", "NEGRO", "PANTONE 186C", "PANTONE 287C" });

                // Agregar todos los programas
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

        /// <summary>
        /// GET: api/maquinas/machine/{numeroMaquina}
        /// Obtiene todos los programas de una máquina específica ordenados por fecha más reciente
        /// Útil para ver el historial de trabajos de una máquina particular (ej: máquina 15)
        /// </summary>
        /// <param name="numeroMaquina">Número de la máquina (11-21)</param>
        /// <returns>Lista de programas de la máquina especificada</returns>
        [HttpGet("machine/{numeroMaquina}")] // Ruta: GET /api/maquinas/machine/15
        public async Task<ActionResult<object>> GetProgramasPorMaquina(int numeroMaquina)
        {
            try
            {
                // ===== LOG DE INICIO DE CONSULTA =====
                // Registrar en el log que se está consultando una máquina específica
                _logger.LogInformation($"🔄 Obteniendo programas para máquina {numeroMaquina}");

                // ===== CONSULTA A LA BASE DE DATOS =====
                // Construir y ejecutar consulta LINQ para obtener todos los programas de la máquina especificada
                var programs = await _context.Maquinas // Acceder al DbSet de Maquinas
                    // NOTA: Include comentado - no hay propiedades de navegación
                    // .Include(p => p.CreatedByUser) // LEFT JOIN con tabla users para obtener datos del usuario creador
                    // .Include(p => p.UpdatedByUser) // LEFT JOIN con tabla users para obtener datos del usuario actualizador
                    .Where(p => p.NumeroMaquina == numeroMaquina) // Filtrar por número de máquina específico (WHERE numero_maquina = 15)
                    .OrderByDescending(p => p.FechaTintaEnMaquina) // Ordenar por fecha de tinta descendente (más reciente primero)
                    .ToListAsync(); // Ejecutar consulta asíncrona y convertir a lista

                // ===== LOG DE RESULTADOS =====
                // Registrar en el log la cantidad de programas encontrados
                _logger.LogInformation($"✅ {programs.Count} programas encontrados para máquina {numeroMaquina}");

                // ===== TRANSFORMACIÓN DE DATOS =====
                // Convertir cada programa a un objeto anónimo para serialización JSON
                var result = programs.Select(p => new // p = cada programa de la máquina
                {
                    id = p.Articulo, // ID para compatibilidad con frontend (usa articulo como ID)
                    articulo = p.Articulo, // Código del artículo (clave primaria)
                    numeroMaquina = p.NumeroMaquina, // Número de máquina (11-21)
                    otSap = p.OtSap, // Orden de trabajo SAP
                    cliente = p.Cliente, // Nombre del cliente
                    referencia = p.Referencia, // Referencia del producto
                    td = p.Td, // Código TD (Tipo de Diseño)
                    numeroColores = p.NumeroColores, // Cantidad de colores
                    colores = ParseColores(p.Colores), // Array de colores parseado desde JSON
                    kilos = p.Kilos, // Cantidad en kilogramos
                    fechaTintaEnMaquina = p.FechaTintaEnMaquina, // Fecha de aplicación de tinta
                    sustrato = p.Sustrato, // Tipo de material base
                    estado = p.Estado, // Estado actual del programa
                    observaciones = p.Observaciones, // Observaciones adicionales
                    lastActionBy = p.LastActionBy, // Usuario que realizó la última acción
                    lastActionAt = p.LastActionAt, // Timestamp de la última acción
                    updatedAt = p.UpdatedAt // Timestamp de última actualización
                }).ToList(); // Convertir proyección a lista en memoria

                // ===== RETORNAR RESPUESTA EXITOSA =====
                // Retornar HTTP 200 OK con los programas encontrados
                return Ok(new
                {
                    success = true, // Indicador de operación exitosa
                    message = $"{programs.Count} programas obtenidos para máquina {numeroMaquina}", // Mensaje descriptivo
                    data = result, // Array con los programas de la máquina
                    numeroMaquina = numeroMaquina, // Número de máquina consultado (para referencia)
                    timestamp = DateTime.UtcNow // Timestamp UTC de la respuesta
                });
            }
            catch (Exception ex) // Capturar cualquier excepción no controlada
            {
                // ===== LOG DE ERROR =====
                // Registrar el error en el log con stack trace completo
                _logger.LogError(ex, $"❌ Error obteniendo programas para máquina {numeroMaquina}");
                
                // ===== RETORNAR RESPUESTA DE ERROR =====
                // Retornar HTTP 500 Internal Server Error con detalles del error
                return StatusCode(500, new
                {
                    success = false, // Indicador de operación fallida
                    message = $"Error interno del servidor al obtener programas para máquina {numeroMaquina}", // Mensaje descriptivo
                    error = ex.Message, // Mensaje específico de la excepción
                    timestamp = DateTime.UtcNow // Timestamp UTC de la respuesta
                });
            }
        }

        /// <summary>
        /// Método auxiliar para parsear colores desde JSON string a array
        /// Maneja errores de parsing y retorna array vacío en caso de error
        /// </summary>
        /// <param name="coloresJson">String JSON con los colores almacenados en MySQL</param>
        /// <returns>Array de strings con los nombres de los colores</returns>
        private string[] ParseColores(string coloresJson)
        {
            try
            {
                // ===== VALIDACIÓN DE ENTRADA =====
                // Verificar si el string JSON está vacío o es null
                if (string.IsNullOrWhiteSpace(coloresJson)) // Si coloresJson es null, vacío o solo espacios en blanco
                    return new string[0]; // Retornar array vacío (sin colores)

                // ===== PARSEO DE FORMATO JSON ARRAY =====
                // Verificar si el string comienza con "[" indicando que es un array JSON válido
                if (coloresJson.StartsWith("[")) // Ejemplo: ["CYAN","MAGENTA","AMARILLO"]
                {
                    // Deserializar el JSON a un array de strings usando Newtonsoft.Json
                    return JsonConvert.DeserializeObject<string[]>(coloresJson) ?? new string[0]; // Si la deserialización falla, retornar array vacío
                }

                // ===== MANEJO DE STRING SIMPLE (NO JSON) =====
                // Si no es un array JSON, tratarlo como un string simple y convertirlo a array de un elemento
                return new string[] { coloresJson }; // Ejemplo: "CYAN" se convierte en ["CYAN"]
            }
            catch (Exception ex) // Capturar cualquier excepción durante el parseo
            {
                // ===== LOGGING DE ERROR =====
                // Registrar advertencia en el log con el contenido que causó el error
                _logger.LogWarning($"⚠️ Error parseando colores: {coloresJson}, Error: {ex.Message}");
                
                // Retornar array vacío para evitar que la aplicación falle
                return new string[0]; // Array vacío como fallback seguro
            }
        }

        /// <summary>
        /// Obtiene el ID del usuario actual desde los claims del JWT
        /// Extrae el identificador único del usuario autenticado del token JWT
        /// </summary>
        /// <returns>ID del usuario o 0 si no se encuentra o no es válido</returns>
        private int GetCurrentUserId()
        {
            // ===== EXTRACCIÓN DEL CLAIM DE USUARIO =====
            // Buscar el claim NameIdentifier en el token JWT del usuario autenticado
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Obtener el valor del claim o null si no existe
            
            // ===== CONVERSIÓN Y VALIDACIÓN =====
            // Intentar convertir el string del claim a entero
            return int.TryParse(userIdClaim, out var userId) ? userId : 0; // Si la conversión es exitosa retornar userId, sino retornar 0
        }

        /// <summary>
        /// POST: api/maquinas/upload
        /// Cargar programación desde archivo Excel
        /// </summary>
        [HttpPost("upload")]
        public async Task<ActionResult<object>> UploadProgramming(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Archivo requerido",
                        message = "Debe seleccionar un archivo Excel válido",
                        timestamp = DateTime.UtcNow
                    });
                }

                // Validar tipo de archivo - Solo Excel
                var allowedExtensions = new[] { ".xlsx", ".xls" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Tipo de archivo no válido",
                        message = "Solo se permiten archivos Excel (.xlsx, .xls)",
                        timestamp = DateTime.UtcNow
                    });
                }

                // Validar tamaño del archivo (máximo 10MB)
                if (file.Length > 10 * 1024 * 1024)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Archivo demasiado grande",
                        message = "El archivo no debe exceder 10MB",
                        timestamp = DateTime.UtcNow
                    });
                }

                // Obtener el ID del usuario actual
                var userId = GetCurrentUserId();
                if (userId == 0) userId = 1; // Usuario por defecto si no hay autenticación

                _logger.LogInformation("📁 Procesando archivo Excel: {FileName} ({FileSize} bytes)", file.FileName, file.Length);

                // Procesar el archivo Excel usando el servicio
                var result = await _maquinaService.ProcessExcelFileAsync(file, userId);

                if (result.Success)
                {
                    return Ok(new
                    {
                        success = true,
                        data = result.Programs,
                        message = $"✅ Archivo procesado exitosamente. {result.ProcessedCount} programas cargados.",
                        summary = new
                        {
                            totalPrograms = result.ProcessedCount,
                            readyPrograms = result.Programs?.Count(p => p.Estado == "LISTO" || p.Estado == "PREPARANDO") ?? 0,
                            machinesWithPrograms = result.Programs?.Select(p => p.NumeroMaquina).Distinct().Count() ?? 0,
                            fileName = file.FileName,
                            processedAt = DateTime.UtcNow
                        },
                        timestamp = DateTime.UtcNow
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Error procesando archivo",
                        message = result.ErrorMessage,
                        details = result.ValidationErrors,
                        timestamp = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error procesando archivo Excel: {FileName}", file?.FileName);
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = "Error al procesar el archivo Excel",
                    details = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// DELETE: api/maquinas/clear-all
        /// Limpiar toda la programación de máquinas
        /// </summary>
        [HttpDelete("clear-all")]
        public async Task<ActionResult<object>> ClearAllProgramming()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0) userId = 1; // Usuario por defecto

                _logger.LogWarning("🗑️ Limpiando toda la programación de máquinas - Usuario: {UserId}", userId);

                var deletedCount = await _maquinaService.ClearAllProgrammingAsync(userId);

                return Ok(new
                {
                    success = true,
                    message = $"Programación limpiada exitosamente. {deletedCount} programas eliminados.",
                    deletedCount = deletedCount,
                    clearedAt = DateTime.UtcNow,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error limpiando programación de máquinas");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// GET: api/maquinas/design-info/{articulo}
        /// Obtiene información completa del diseño desde la tabla designs usando el artículo F
        /// Retorna: cliente, referencia, colores y sustrato
        /// </summary>
        [HttpGet("design-info/{articulo}")]
        public async Task<ActionResult<object>> GetDesignInfo(string articulo)
        {
            try
            {
                _logger.LogInformation("📋 Obteniendo información de diseño para artículo: {Articulo}", articulo);

                // Buscar el diseño por artículo F
                var design = await _context.Designs
                    .Where(d => d.ArticleF == articulo)
                    .FirstOrDefaultAsync();

                if (design == null)
                {
                    _logger.LogWarning("⚠️ No se encontró diseño para artículo: {Articulo}", articulo);
                    return Ok(new
                    {
                        success = true,
                        found = false,
                        data = (object?)null,
                        message = "No se encontró diseño para este artículo",
                        timestamp = DateTime.UtcNow
                    });
                }

                // Construir lista de colores desde las columnas Color1 a Color10
                var colors = new List<string>();
                if (!string.IsNullOrWhiteSpace(design.Color1)) colors.Add(design.Color1);
                if (!string.IsNullOrWhiteSpace(design.Color2)) colors.Add(design.Color2);
                if (!string.IsNullOrWhiteSpace(design.Color3)) colors.Add(design.Color3);
                if (!string.IsNullOrWhiteSpace(design.Color4)) colors.Add(design.Color4);
                if (!string.IsNullOrWhiteSpace(design.Color5)) colors.Add(design.Color5);
                if (!string.IsNullOrWhiteSpace(design.Color6)) colors.Add(design.Color6);
                if (!string.IsNullOrWhiteSpace(design.Color7)) colors.Add(design.Color7);
                if (!string.IsNullOrWhiteSpace(design.Color8)) colors.Add(design.Color8);
                if (!string.IsNullOrWhiteSpace(design.Color9)) colors.Add(design.Color9);
                if (!string.IsNullOrWhiteSpace(design.Color10)) colors.Add(design.Color10);

                _logger.LogInformation("✅ Información de diseño encontrada para artículo {Articulo}", articulo);

                return Ok(new
                {
                    success = true,
                    found = true,
                    data = new
                    {
                        articulo = articulo,
                        cliente = design.Client ?? "",
                        descripcion = design.Description ?? "", // ✅ Cambiado de "referencia" a "descripcion" para condición única
                        referencia = design.Description ?? "", // ✅ Mantener "referencia" para compatibilidad con máquinas
                        sustrato = design.Substrate ?? "",
                        numeroColores = colors.Count,
                        colores = colors // ✅ Agregamos la lista de colores
                    },
                    timestamp = DateTime.UtcNow
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

        /// <summary>
        /// GET: api/maquinas/colors/{articulo}
        /// Obtiene los colores de un diseño específico desde la tabla designs usando el artículo F
        /// (Mantenido para compatibilidad)
        /// </summary>
        [HttpGet("colors/{articulo}")]
        public async Task<ActionResult<object>> GetColorsByArticulo(string articulo)
        {
            // Redirigir al nuevo endpoint
            return await GetDesignInfo(articulo);
        }



        /// <summary>
        /// Obtiene el nombre completo del usuario actual desde los claims del JWT
        /// Combina el nombre y apellido del usuario autenticado
        /// </summary>
        /// <returns>Nombre completo del usuario (FirstName + LastName)</returns>
        private string GetCurrentUserName()
        {
            try
            {
                // ===== INTENTAR OBTENER DisplayName PRIMERO =====
                // Este claim contiene el nombre completo del usuario (FirstName + LastName)
                var displayName = User.FindFirst("DisplayName")?.Value;
                if (!string.IsNullOrWhiteSpace(displayName))
                {
                    _logger.LogInformation($"✅ Nombre obtenido de DisplayName: {displayName}");
                    return displayName;
                }
                
                // ===== INTENTAR OBTENER DE ClaimTypes.Name =====
                var name = User.FindFirst(ClaimTypes.Name)?.Value;
                if (!string.IsNullOrWhiteSpace(name))
                {
                    _logger.LogInformation($"✅ Nombre obtenido de ClaimTypes.Name: {name}");
                    return name;
                }
                
                // ===== INTENTAR OBTENER DE Identity.Name =====
                if (!string.IsNullOrWhiteSpace(User.Identity?.Name))
                {
                    _logger.LogInformation($"✅ Nombre obtenido de Identity.Name: {User.Identity.Name}");
                    return User.Identity.Name;
                }
                
                // ===== LOG DE CLAIMS DISPONIBLES PARA DEBUGGING =====
                _logger.LogWarning("⚠️ No se encontró nombre del usuario. Claims disponibles:");
                foreach (var claim in User.Claims)
                {
                    _logger.LogWarning($"   - {claim.Type}: {claim.Value}");
                }
                
                // ===== FALLBACK A "Usuario" =====
                _logger.LogWarning("⚠️ Usando nombre por defecto: Usuario");
                return "Usuario";
            }
            catch (Exception ex)
            {
                // Capturar cualquier excepción al obtener el nombre del usuario
                _logger.LogError(ex, "❌ Error obteniendo nombre del usuario");
                // Retornar "Usuario" como valor por defecto en caso de error
                return "Usuario";
            }
        }

        /// <summary>
        /// GET: api/maquinas/test-design/{articulo}
        /// ENDPOINT DE PRUEBA - Verificar si un artículo existe en la tabla designs
        /// Este endpoint permite probar si la consulta a la tabla de diseño funciona correctamente
        /// </summary>
        /// <param name="articulo">Código del artículo a buscar (ej: F204567)</param>
        /// <returns>Información del diseño si existe, o lista de ejemplos si no existe</returns>
        [HttpGet("test-design/{articulo}")]
        public async Task<ActionResult<object>> TestDesignLookup(string articulo)
        {
            try
            {
                // Log de inicio de la prueba con el artículo que se está buscando
                _logger.LogInformation("🧪 TEST: Buscando artículo '{Articulo}' en tabla designs", articulo);
                
                // Contar el total de diseños en la tabla para verificar que hay datos
                var totalDesigns = await _context.Designs.CountAsync();
                // Registrar en el log cuántos diseños hay en total
                _logger.LogInformation("📊 Total de diseños en tabla: {Total}", totalDesigns);
                
                // Buscar el diseño específico en la tabla designs usando el código de artículo
                var design = await _context.Designs
                    .Where(d => d.ArticleF == articulo) // Filtrar por código de artículo
                    .FirstOrDefaultAsync(); // Obtener el primer resultado o null
                
                // Verificar si se encontró el diseño
                if (design != null)
                {
                    // Si se encontró, registrar en el log el ID del diseño
                    _logger.LogInformation("✅ Diseño encontrado: ID={Id}", design.Id);
                    
                    // Extraer los colores del diseño en una lista
                    var colores = new List<string>();
                    // Agregar cada color solo si no es null o vacío
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
                    
                    // Retornar respuesta exitosa con toda la información del diseño
                    return Ok(new
                    {
                        success = true, // Indicador de operación exitosa
                        found = true, // Indicador de que el artículo fue encontrado
                        message = $"Artículo '{articulo}' encontrado en tabla designs", // Mensaje descriptivo
                        totalDesignsInTable = totalDesigns, // Total de diseños en la tabla
                        design = new // Información completa del diseño encontrado
                        {
                            id = design.Id, // ID del diseño
                            articleF = design.ArticleF, // Código del artículo
                            client = design.Client, // Cliente
                            description = design.Description, // Descripción
                            substrate = design.Substrate, // Sustrato
                            type = design.Type, // Tipo
                            printType = design.PrintType, // Tipo de impresión
                            colorCount = design.ColorCount, // Cantidad de colores
                            colores = colores, // Lista de colores
                            status = design.Status // Estado
                        },
                        timestamp = DateTime.UtcNow // Timestamp de la respuesta
                    });
                }
                else
                {
                    // Si NO se encontró el diseño, registrar advertencia en el log
                    _logger.LogWarning("⚠️ Diseño NO encontrado");
                    
                    // Obtener algunos ejemplos de artículos de la tabla para ayudar al usuario
                    var ejemplos = await _context.Designs
                        .Select(d => d.ArticleF) // Seleccionar solo el código de artículo
                        .Take(10) // Tomar los primeros 10
                        .ToListAsync(); // Convertir a lista
                    
                    // Retornar respuesta indicando que no se encontró el artículo
                    return Ok(new
                    {
                        success = true, // Operación exitosa (aunque no se encontró el artículo)
                        found = false, // Indicador de que el artículo NO fue encontrado
                        message = $"Artículo '{articulo}' NO encontrado en tabla designs", // Mensaje descriptivo
                        totalDesignsInTable = totalDesigns, // Total de diseños en la tabla
                        ejemplosArticulos = ejemplos, // Lista de ejemplos de artículos
                        sugerencia = "Verifica que el código de artículo sea exacto (mayúsculas/minúsculas y espacios)", // Sugerencia para el usuario
                        timestamp = DateTime.UtcNow // Timestamp de la respuesta
                    });
                }
            }
            catch (Exception ex)
            {
                // Capturar cualquier excepción durante la búsqueda
                _logger.LogError(ex, "❌ Error en test de búsqueda de diseño");
                // Retornar respuesta de error con detalles
                return StatusCode(500, new
                {
                    success = false, // Indicador de operación fallida
                    error = ex.Message, // Mensaje de error
                    innerError = ex.InnerException?.Message, // Error interno si existe
                    stackTrace = ex.StackTrace, // Stack trace para debugging
                    timestamp = DateTime.UtcNow // Timestamp de la respuesta
                });
            }
        } // Fin del método TestDesignLookup

        /// <summary>
        /// POST: api/maquinas/{articulo}/generate-ff459
        /// Genera el formato FF459 para una máquina específica
        /// Registra la fecha y hora de impresión en la tabla Activities
        /// </summary>
        /// <param name="articulo">Código del artículo de la máquina</param>
        /// <returns>Datos del formato FF459 en formato JSON</returns>
        [HttpPost("{articulo}/generate-ff459")]
        public async Task<ActionResult<object>> GenerateFF459Format(string articulo)
        {
            try
            {
                _logger.LogInformation($"📄 Generando formato FF459 para artículo: {articulo}");

                // Obtener información del usuario
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

                // Buscar la máquina en la base de datos
                var connectionString = _context.Database.GetConnectionString();
                using var connection = new MySqlConnector.MySqlConnection(connectionString);
                await connection.OpenAsync();

                using var command = connection.CreateCommand();
                command.CommandText = @"
                    SELECT 
                        articulo, numero_maquina, ot_sap, cliente, referencia, td,
                        numero_colores, colores, kilos, fecha_tinta_en_maquina, sustrato,
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

                // Construir el objeto FF459
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
                    fechaTintaEnMaquina = reader.GetDateTime("fecha_tinta_en_maquina"),
                    sustrato = reader.GetString("sustrato"),
                    estado = reader.IsDBNull(reader.GetOrdinal("estado")) ? null : reader.GetString("estado"),
                    observaciones = reader.IsDBNull(reader.GetOrdinal("observaciones")) ? null : reader.GetString("observaciones"),
                    fechaImpresion = DateTime.Now,
                    usuarioImpresion = userName,
                    formatoVersion = "FF459-v1.0"
                };

                await reader.CloseAsync();

                // ✅ Registrar actividad de impresión del formato FF459
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

        /// <summary>
        /// GET: api/maquinas/ff459-history
        /// Obtiene el historial de impresiones del formato FF459
        /// </summary>
        /// <param name="articulo">Filtrar por artículo específico (opcional)</param>
        /// <param name="startDate">Fecha de inicio (opcional)</param>
        /// <param name="endDate">Fecha de fin (opcional)</param>
        /// <returns>Lista de impresiones del formato FF459</returns>
        [HttpGet("ff459-history")]
        public async Task<ActionResult<object>> GetFF459History(
            [FromQuery] string? articulo = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                _logger.LogInformation("📊 Consultando historial de impresiones FF459");

                // Construir consulta SQL con filtros opcionales
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

    } // Fin de la clase MaquinasController

    /// <summary>
    /// DTO para actualizar el estado de un programa de máquina
    /// Contiene los campos necesarios para cambiar el estado de un programa
    /// </summary>
    public class UpdateStatusRequest
    {
        // Estado nuevo del programa (PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO)
        public string Estado { get; set; } = "";
        // Observaciones opcionales sobre el cambio de estado
        public string? Observaciones { get; set; }
    }
} // Fin del namespace