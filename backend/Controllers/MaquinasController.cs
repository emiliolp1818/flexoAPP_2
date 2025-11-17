using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Newtonsoft.Json;
using flexoAPP.Services;

namespace backend.Controllers
{
    /// <summary>
    /// Controlador específico para el módulo de máquinas
    /// Maneja los datos de la tabla maquinas
    /// Implementa todas las funcionalidades solicitadas para el módulo de máquinas
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous] // Temporal para pruebas
    public class MaquinasController : ControllerBase
    {
        private readonly FlexoAPPDbContext _context;
        private readonly ILogger<MaquinasController> _logger;
        private readonly IMaquinaService _maquinaService;

        public MaquinasController(
            FlexoAPPDbContext context, 
            ILogger<MaquinasController> logger,
            IMaquinaService maquinaService)
        {
            _context = context;
            _logger = logger;
            _maquinaService = maquinaService;
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
                        id = reader.GetString("articulo"),
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
        /// PATCH: api/maquinas/{articulo}/status
        /// Actualiza el estado de un programa de máquina y cambia el color de toda la línea en el frontend
        /// Guarda la acción en la base de datos con información del usuario que realizó el cambio
        /// Estados válidos: PREPARANDO, LISTO (verde), CORRIENDO (amarillo), SUSPENDIDO (rojo), TERMINADO (gris)
        /// </summary>
        /// <param name="articulo">Código del artículo (clave primaria) de la máquina a actualizar</param>
        /// <param name="request">Objeto con el nuevo estado y observaciones opcionales</param>
        /// <returns>Respuesta JSON con el resultado de la operación</returns>
        [HttpPatch("{articulo}/status")] // Ruta: PATCH /api/maquinas/F204567/status
        public async Task<ActionResult<object>> UpdateMachineStatus(string articulo, [FromBody] UpdateStatusRequest request)
        {
            MySqlConnector.MySqlConnection? connection = null;
            try
            {
                // ===== LOG DE ENTRADA =====
                _logger.LogInformation($"🎯 PATCH /api/maquinas/{articulo}/status - Estado: {request?.Estado}, Observaciones: {request?.Observaciones}");
                _logger.LogInformation($"🔐 Usuario autenticado: {User?.Identity?.IsAuthenticated ?? false}");
                _logger.LogInformation($"🔐 Claims count: {User?.Claims?.Count() ?? 0}");
                
                // ===== VALIDAR REQUEST =====
                if (request == null)
                {
                    _logger.LogError("❌ Request es null");
                    return BadRequest(new
                    {
                        success = false,
                        message = "Request body es requerido",
                        timestamp = DateTime.UtcNow
                    });
                }
                
                if (string.IsNullOrWhiteSpace(request.Estado))
                {
                    _logger.LogError("❌ Estado es null o vacío");
                    return BadRequest(new
                    {
                        success = false,
                        message = "El campo 'estado' es requerido",
                        timestamp = DateTime.UtcNow
                    });
                }
                
                // ===== OBTENER INFORMACIÓN DEL USUARIO AUTENTICADO (CON MANEJO DE ERRORES) =====
                int userId = 1; // Usuario por defecto
                string userName = "Sistema"; // Nombre por defecto
                
                try
                {
                    userId = GetCurrentUserId();
                    userName = GetCurrentUserName();
                    
                    if (userId == 0)
                    {
                        userId = 1;
                        userName = string.IsNullOrEmpty(userName) ? "Sistema" : userName;
                        _logger.LogWarning("⚠️ No se encontró usuario autenticado, usando usuario por defecto");
                    }
                    else
                    {
                        _logger.LogInformation($"✅ Usuario autenticado: {userId} ({userName})");
                    }
                }
                catch (Exception userEx)
                {
                    _logger.LogWarning(userEx, "⚠️ Error obteniendo información del usuario, usando valores por defecto");
                    userId = 1;
                    userName = "Sistema";
                }
                
                // ===== LOG DE INICIO DE OPERACIÓN =====
                _logger.LogInformation($"🔄 Actualizando estado de máquina {articulo} a {request.Estado} por usuario {userId} ({userName})");

                // ===== VALIDAR ESTADO =====
                var estadosValidos = new[] { "PREPARANDO", "LISTO", "CORRIENDO", "SUSPENDIDO", "TERMINADO" };
                if (!estadosValidos.Contains(request.Estado?.ToUpper()))
                {
                    _logger.LogError($"❌ Estado inválido: {request.Estado}");
                    return BadRequest(new
                    {
                        success = false,
                        message = $"Estado inválido: {request.Estado}. Estados válidos: {string.Join(", ", estadosValidos)}",
                        timestamp = DateTime.UtcNow
                    });
                }

                // ===== BUSCAR LA MÁQUINA EN LA BASE DE DATOS USANDO RAW SQL =====
                _logger.LogInformation($"🔍 Buscando máquina con artículo: {articulo}");
                
                var connectionString = _context.Database.GetConnectionString();
                _logger.LogInformation($"🔗 Connection string obtenido");
                
                connection = new MySqlConnector.MySqlConnection(connectionString);
                await connection.OpenAsync();
                _logger.LogInformation($"✅ Conexión a base de datos abierta");
                
                // Primero verificar si existe
                using var checkCommand = connection.CreateCommand();
                checkCommand.CommandText = "SELECT COUNT(*) FROM maquinas WHERE articulo = @articulo";
                checkCommand.Parameters.AddWithValue("@articulo", articulo);
                var count = Convert.ToInt32(await checkCommand.ExecuteScalarAsync());
                _logger.LogInformation($"📊 Registros encontrados: {count}");
                
                if (count == 0)
                {
                    _logger.LogWarning($"⚠️ Máquina con artículo {articulo} no encontrada");
                    return NotFound(new
                    {
                        success = false,
                        message = $"Registro de máquina con artículo {articulo} no encontrado",
                        timestamp = DateTime.UtcNow
                    });
                }
                
                // Obtener el estado anterior
                using var getCommand = connection.CreateCommand();
                getCommand.CommandText = "SELECT estado FROM maquinas WHERE articulo = @articulo";
                getCommand.Parameters.AddWithValue("@articulo", articulo);
                var estadoAnterior = (await getCommand.ExecuteScalarAsync())?.ToString() ?? "DESCONOCIDO";
                
                _logger.LogInformation($"📊 Estado anterior: {estadoAnterior}, Estado nuevo: {request.Estado}");
                
                // Actualizar usando RAW SQL
                using var updateCommand = connection.CreateCommand();
                updateCommand.CommandText = @"
                    UPDATE maquinas 
                    SET estado = @estado,
                        observaciones = @observaciones,
                        updated_by = @updatedBy,
                        updated_at = @updatedAt,
                        last_action_by = @lastActionBy,
                        last_action_at = @lastActionAt
                    WHERE articulo = @articulo";
                
                updateCommand.Parameters.AddWithValue("@estado", request.Estado.ToUpper());
                updateCommand.Parameters.AddWithValue("@observaciones", request.Observaciones ?? (object)DBNull.Value);
                updateCommand.Parameters.AddWithValue("@updatedBy", userId);
                updateCommand.Parameters.AddWithValue("@updatedAt", DateTime.UtcNow);
                updateCommand.Parameters.AddWithValue("@lastActionBy", userName);
                updateCommand.Parameters.AddWithValue("@lastActionAt", DateTime.UtcNow);
                updateCommand.Parameters.AddWithValue("@articulo", articulo);
                
                _logger.LogInformation($"🔄 Ejecutando UPDATE...");
                var rowsAffected = await updateCommand.ExecuteNonQueryAsync();
                
                _logger.LogInformation($"✅ Filas afectadas: {rowsAffected}");

                // ===== LOG DE OPERACIÓN EXITOSA =====
                _logger.LogInformation($"✅ Estado de máquina {articulo} actualizado exitosamente de {estadoAnterior} a {request.Estado}");

                // ===== RETORNAR RESPUESTA EXITOSA =====
                return Ok(new
                {
                    success = true,
                    message = $"Estado actualizado exitosamente a {request.Estado}",
                    data = new
                    {
                        id = articulo,
                        articulo = articulo,
                        estadoAnterior = estadoAnterior,
                        estadoNuevo = request.Estado.ToUpper(),
                        lastActionBy = userName,
                        lastActionAt = DateTime.UtcNow,
                        observaciones = request.Observaciones
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                // ===== LOG DE ERROR DETALLADO =====
                _logger.LogError(ex, $"❌ Error actualizando estado de máquina {articulo}");
                _logger.LogError($"❌ Tipo de excepción: {ex.GetType().Name}");
                _logger.LogError($"❌ Mensaje: {ex.Message}");
                _logger.LogError($"❌ Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    _logger.LogError($"❌ Inner Exception: {ex.InnerException.Message}");
                    _logger.LogError($"❌ Inner Stack Trace: {ex.InnerException.StackTrace}");
                }
                
                // ===== RETORNAR RESPUESTA DE ERROR DETALLADA =====
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error interno del servidor al actualizar estado",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace,
                    timestamp = DateTime.UtcNow
                });
            }
            finally
            {
                // ===== CERRAR CONEXIÓN =====
                if (connection != null)
                {
                    await connection.DisposeAsync();
                    _logger.LogInformation("🔌 Conexión a base de datos cerrada");
                }
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
        /// GET: api/maquinas/test-update/{articulo}
        /// ENDPOINT DE PRUEBA - Verificar que se puede actualizar un registro
        /// </summary>
        [HttpGet("test-update/{articulo}")]
        public async Task<ActionResult<object>> TestUpdate(string articulo)
        {
            try
            {
                _logger.LogInformation($"🧪 TEST: Intentando actualizar artículo {articulo}");
                
                var connectionString = _context.Database.GetConnectionString();
                _logger.LogInformation($"🔗 Connection String: {connectionString}");
                
                using var connection = new MySqlConnector.MySqlConnection(connectionString);
                await connection.OpenAsync();
                _logger.LogInformation("✅ Conexión abierta exitosamente");
                
                // Verificar si existe
                using var checkCommand = connection.CreateCommand();
                checkCommand.CommandText = "SELECT COUNT(*) FROM maquinas WHERE articulo = @articulo";
                checkCommand.Parameters.AddWithValue("@articulo", articulo);
                var count = Convert.ToInt32(await checkCommand.ExecuteScalarAsync());
                _logger.LogInformation($"📊 Registros encontrados: {count}");
                
                if (count == 0)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = $"Artículo {articulo} no encontrado",
                        timestamp = DateTime.UtcNow
                    });
                }
                
                // Intentar actualizar
                using var updateCommand = connection.CreateCommand();
                updateCommand.CommandText = @"
                    UPDATE maquinas 
                    SET estado = 'LISTO',
                        updated_at = @updatedAt,
                        last_action_by = 'TEST',
                        last_action_at = @lastActionAt
                    WHERE articulo = @articulo";
                
                updateCommand.Parameters.AddWithValue("@updatedAt", DateTime.UtcNow);
                updateCommand.Parameters.AddWithValue("@lastActionAt", DateTime.UtcNow);
                updateCommand.Parameters.AddWithValue("@articulo", articulo);
                
                var rowsAffected = await updateCommand.ExecuteNonQueryAsync();
                _logger.LogInformation($"✅ Filas afectadas: {rowsAffected}");
                
                return Ok(new
                {
                    success = true,
                    message = $"Test exitoso. {rowsAffected} filas actualizadas",
                    articulo = articulo,
                    rowsAffected = rowsAffected,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error en test de actualización");
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

        /// <summary>
        /// POST: api/maquinas/test
        /// ENDPOINT TEMPORAL DE PRUEBA - Crea un registro de prueba en la tabla maquinas
        /// Útil para verificar que la tabla existe y funciona correctamente
        /// </summary>
        /// <returns>Resultado de la operación de inserción</returns>
        [HttpPost("test")] // Ruta: POST /api/maquinas/test
        public async Task<ActionResult<object>> CreateTestRecord()
        {
            try
            {
                // ===== LOG DE INICIO =====
                _logger.LogInformation("🧪 Creando registro de prueba en tabla maquinas");

                // ===== CREAR OBJETO DE PRUEBA =====
                // Generar un código de artículo único usando timestamp
                var timestamp = DateTime.Now.ToString("HHmmss"); // Ejemplo: 235959
                var articulo = $"TEST{timestamp}"; // Ejemplo: TEST235959

                // Crear nueva instancia de Maquina con datos de prueba
                var maquinaPrueba = new Maquina
                {
                    // ===== CLAVE PRIMARIA =====
                    Articulo = articulo, // Código único del artículo (PRIMARY KEY)
                    
                    // ===== DATOS PRINCIPALES =====
                    NumeroMaquina = 11, // Máquina 11 (rango válido: 11-21)
                    OtSap = $"OT{timestamp}", // Orden SAP única: OT235959
                    Cliente = "CLIENTE DE PRUEBA S.A", // Nombre del cliente
                    Referencia = "REF-TEST-001", // Referencia del producto
                    Td = "TD1", // Código TD (Tipo de Diseño)
                    NumeroColores = 4, // Cantidad de colores
                    Kilos = 1000.00m, // Cantidad en kilogramos (decimal)
                    FechaTintaEnMaquina = DateTime.Now, // Fecha y hora actual
                    Sustrato = "BOPP", // Tipo de material base
                    Estado = "LISTO", // Estado inicial
                    Observaciones = "Registro de prueba creado desde API", // Notas
                    
                    // ===== AUDITORÍA =====
                    LastActionBy = "Sistema Test", // Usuario que realizó la acción
                    LastActionAt = DateTime.Now, // Timestamp de la acción
                    CreatedBy = 1, // ID del usuario creador (admin)
                    UpdatedBy = 1, // ID del usuario actualizador (admin)
                    CreatedAt = DateTime.UtcNow, // Timestamp UTC de creación
                    UpdatedAt = DateTime.UtcNow // Timestamp UTC de actualización
                };

                // ===== CONFIGURAR COLORES EN FORMATO JSON =====
                // Usar el método SetColoresArray para convertir array a JSON
                maquinaPrueba.SetColoresArray(new[] { "CYAN", "MAGENTA", "AMARILLO", "NEGRO" });

                // ===== AGREGAR A LA BASE DE DATOS =====
                // Add: marca la entidad para inserción
                _context.Maquinas.Add(maquinaPrueba);
                
                // SaveChangesAsync: ejecuta el INSERT en MySQL
                await _context.SaveChangesAsync(); // Ejecuta: INSERT INTO maquinas (...) VALUES (...)

                // ===== LOG DE ÉXITO =====
                _logger.LogInformation($"✅ Registro de prueba creado exitosamente: {articulo}");

                // ===== RETORNAR RESPUESTA EXITOSA =====
                return Ok(new
                {
                    success = true, // Indicador de operación exitosa
                    message = "Registro de prueba creado exitosamente", // Mensaje de confirmación
                    data = new // Datos del registro creado
                    {
                        id = maquinaPrueba.Articulo, // ID para compatibilidad con frontend (usa articulo como ID)
                        articulo = maquinaPrueba.Articulo, // Código del artículo (PRIMARY KEY)
                        numeroMaquina = maquinaPrueba.NumeroMaquina, // Número de máquina
                        otSap = maquinaPrueba.OtSap, // Orden SAP
                        cliente = maquinaPrueba.Cliente, // Cliente
                        colores = maquinaPrueba.GetColoresArray(), // Array de colores
                        kilos = maquinaPrueba.Kilos, // Cantidad en kg
                        estado = maquinaPrueba.Estado, // Estado
                        fechaTintaEnMaquina = maquinaPrueba.FechaTintaEnMaquina // Fecha de tinta
                    },
                    timestamp = DateTime.UtcNow // Timestamp UTC de la respuesta
                });
            }
            catch (Exception ex) // Capturar cualquier excepción
            {
                // ===== LOG DE ERROR =====
                _logger.LogError(ex, "❌ Error creando registro de prueba en tabla maquinas");
                
                // ===== RETORNAR RESPUESTA DE ERROR =====
                return StatusCode(500, new
                {
                    success = false, // Indicador de operación fallida
                    message = "Error creando registro de prueba", // Mensaje genérico
                    error = ex.Message, // Mensaje específico de la excepción
                    details = ex.InnerException?.Message, // Detalles adicionales si existen
                    stackTrace = ex.StackTrace, // Stack trace completo para debugging
                    timestamp = DateTime.UtcNow // Timestamp UTC de la respuesta
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
        /// GET: api/maquinas/colors/{articulo}
        /// Obtiene los colores de un diseño específico desde la tabla designs usando el artículo F
        /// </summary>
        [HttpGet("colors/{articulo}")]
        public async Task<ActionResult<object>> GetColorsByArticulo(string articulo)
        {
            try
            {
                _logger.LogInformation("🎨 Obteniendo colores para artículo: {Articulo}", articulo);

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
                        data = new
                        {
                            articulo = articulo,
                            colorCount = 0,
                            colors = new List<string>()
                        },
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

                _logger.LogInformation("✅ Encontrados {Count} colores para artículo {Articulo}", colors.Count, articulo);

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        articulo = articulo,
                        client = design.Client,
                        description = design.Description,
                        substrate = design.Substrate,
                        printType = design.PrintType,
                        colorCount = colors.Count,
                        colors = colors
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error obteniendo colores para artículo: {Articulo}", articulo);
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
                _logger.LogError(ex, "❌ Error obteniendo nombre del usuario");
                return "Usuario";
            }
        }
    }

    /// <summary>
    /// DTO para actualizar el estado de un programa de máquina
    /// </summary>
    public class UpdateStatusRequest
    {
        public string Estado { get; set; } = "";
        public string? Observaciones { get; set; }
    }
}