using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Newtonsoft.Json;

namespace backend.Controllers
{
    /// <summary>
    /// Controlador específico para el módulo de máquinas
    /// Maneja los datos de la tabla machine_programs con alias "maquinas"
    /// Implementa todas las funcionalidades solicitadas para el módulo de máquinas
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous] // Temporal para pruebas
    public class MaquinasController : ControllerBase
    {
        private readonly FlexoAPPDbContext _context;
        private readonly ILogger<MaquinasController> _logger;

        public MaquinasController(FlexoAPPDbContext context, ILogger<MaquinasController> logger)
        {
            _context = context;
            _logger = logger;
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
                // Registrar en el log que se está iniciando la consulta a la tabla maquinas de MySQL
                _logger.LogInformation("🔄 Obteniendo datos de máquinas desde tabla 'maquinas' de la base de datos flexoapp_bd");

                // ===== CONSTRUCCIÓN DE LA CONSULTA BASE =====
                // Crear consulta LINQ para obtener datos de la tabla 'maquinas' de MySQL
                // DbSet Maquinas: representa la tabla 'maquinas' en la base de datos flexoapp_bd
                var query = _context.Maquinas // Acceder al DbSet Maquinas del contexto de Entity Framework
                    .Include(p => p.CreatedByUser) // Incluir relación con usuario creador (JOIN con tabla users usando created_by)
                    .Include(p => p.UpdatedByUser) // Incluir relación con usuario actualizador (JOIN con tabla users usando updated_by)
                    .AsQueryable(); // Convertir a IQueryable para permitir composición dinámica de consultas

                // ===== APLICAR ORDENAMIENTO DINÁMICO =====
                // Ordenar los resultados según los parámetros recibidos del frontend
                // Por defecto: ordenar por fecha_tinta_en_maquina descendente (más reciente primero)
                if (orderBy?.ToLower() == "fechatintaenmaquina" || orderBy?.ToLower() == "fechatinta" || string.IsNullOrEmpty(orderBy))
                {
                    // Ordenamiento por fecha de tinta en máquina (columna fecha_tinta_en_maquina)
                    query = order?.ToLower() == "asc" 
                        ? query.OrderBy(p => p.FechaTintaEnMaquina).ThenBy(p => p.NumeroMaquina) // Ascendente: más antiguo primero
                        : query.OrderByDescending(p => p.FechaTintaEnMaquina).ThenBy(p => p.NumeroMaquina); // Descendente: más reciente primero
                }
                else if (orderBy?.ToLower() == "numeromaquina" || orderBy?.ToLower() == "machinenumber")
                {
                    // Ordenamiento por número de máquina (columna numero_maquina: 11-21)
                    query = order?.ToLower() == "desc" 
                        ? query.OrderByDescending(p => p.NumeroMaquina).ThenByDescending(p => p.FechaTintaEnMaquina) // Descendente: 21 a 11
                        : query.OrderBy(p => p.NumeroMaquina).ThenByDescending(p => p.FechaTintaEnMaquina); // Ascendente: 11 a 21
                }

                // ===== EJECUTAR CONSULTA EN LA BASE DE DATOS =====
                // Ejecutar la consulta SQL generada por Entity Framework en la base de datos MySQL flexoapp_bd
                // ToListAsync: ejecuta SELECT * FROM maquinas con los JOINs y ORDER BY configurados de forma asíncrona
                var maquinas = await query.ToListAsync(); // Consulta asíncrona: SELECT id, numero_maquina, articulo, ot_sap, cliente, referencia, td, numero_colores, colores, kilos, fecha_tinta_en_maquina, sustrato, estado, observaciones, last_action_by, last_action_at, created_at, updated_at, created_by, updated_by FROM maquinas LEFT JOIN users...

                // ===== LOG DE RESULTADOS OBTENIDOS =====
                // Registrar en el log la cantidad de registros obtenidos de la tabla maquinas
                _logger.LogInformation($"✅ {maquinas.Count} registros de máquinas encontrados en la tabla 'maquinas' de flexoapp_bd");

                // ===== MAPEO DE DATOS PARA EL FRONTEND =====
                // Transformar los objetos Maquina de Entity Framework a objetos anónimos para serialización JSON
                // Este mapeo convierte los nombres de columnas de MySQL (snake_case) a formato camelCase para JavaScript
                // ===== TRANSFORMACIÓN DE DATOS PARA EL FRONTEND =====
                // Convertir cada objeto Maquina de Entity Framework a un objeto anónimo JSON-friendly
                var result = maquinas.Select(m => new // m = cada registro individual de la tabla maquinas obtenido de MySQL
                {
                    // ===== CAMPO ID (PARA COMPATIBILIDAD CON FRONTEND) =====
                    // El frontend espera un campo 'id' para identificar cada registro
                    // Usamos el valor de 'articulo' como ID ya que es la clave primaria
                    id = m.Articulo, // Usar articulo como ID para compatibilidad con frontend
                    
                    // ===== CAMPO ARTICULO (CLAVE PRIMARIA) =====
                    // Código único del artículo que identifica el programa de máquina
                    // Este campo es la PRIMARY KEY de la tabla (no hay campo 'id' auto-incremental)
                    articulo = m.Articulo, // Ejemplo: "F204567", "F204568" | Columna MySQL: articulo VARCHAR(50) PRIMARY KEY
                    
                    // ===== CAMPOS PRINCIPALES DE LA TABLA MAQUINAS =====
                    // Número de la máquina flexográfica donde se ejecutará el programa
                    numeroMaquina = m.NumeroMaquina, // Rango válido: 11-21 | Columna MySQL: numero_maquina INT NOT NULL
                    
                    // Número de orden de trabajo del sistema SAP
                    otSap = m.OtSap, // Ejemplo: "OT123456" | Columna MySQL: ot_sap VARCHAR(50) NOT NULL
                    
                    // Nombre completo del cliente que solicita la producción
                    cliente = m.Cliente, // Ejemplo: "ABSORBENTES DE COLOMBIA S.A" | Columna MySQL: cliente VARCHAR(200) NOT NULL
                    
                    // Referencia interna del producto a fabricar
                    referencia = m.Referencia, // Ejemplo: "REF-001" | Columna MySQL: referencia VARCHAR(100) NULL
                    
                    // Código TD (Tipo de Diseño) asociado al trabajo
                    td = m.Td, // Ejemplo: "TD-ABC" | Columna MySQL: td VARCHAR(10) NULL
                    
                    // Cantidad total de colores que se utilizarán en la impresión flexográfica
                    numeroColores = m.NumeroColores, // Rango válido: 1-10 | Columna MySQL: numero_colores INT NOT NULL
                    
                    // Array de nombres de colores parseado desde formato JSON almacenado en MySQL
                    colores = ParseColores(m.Colores), // Ejemplo: ["CYAN","MAGENTA","AMARILLO","NEGRO"] | Columna MySQL: colores JSON NOT NULL
                    
                    // Cantidad en kilogramos del material a producir
                    kilos = m.Kilos, // Ejemplo: 1500.50 | Columna MySQL: kilos DECIMAL(10,2) NOT NULL
                    
                    // Fecha y hora exacta cuando se aplicó la tinta en la máquina (inicio del trabajo)
                    fechaTintaEnMaquina = m.FechaTintaEnMaquina, // Formato: DateTime | Columna MySQL: fecha_tinta_en_maquina DATETIME NOT NULL
                    
                    // Tipo de material base sobre el que se imprimirá
                    sustrato = m.Sustrato, // Ejemplo: "BOPP", "PE", "PET" | Columna MySQL: sustrato VARCHAR(100) NOT NULL
                    
                    // Estado actual del programa de máquina (controla el color de la fila en el frontend)
                    estado = m.Estado, // Valores válidos: "LISTO", "CORRIENDO", "SUSPENDIDO", "TERMINADO" | Columna MySQL: estado VARCHAR(20) NOT NULL DEFAULT 'LISTO'
                    
                    // Notas u observaciones adicionales sobre el programa de máquina
                    observaciones = m.Observaciones, // Texto libre hasta 1000 caracteres | Columna MySQL: observaciones VARCHAR(1000) NULL
                    
                    // ===== CAMPOS DE AUDITORÍA Y TRACKING =====
                    // Nombre del usuario que realizó la última acción sobre este registro
                    lastActionBy = m.LastActionBy, // Ejemplo: "Juan Pérez" | Columna MySQL: last_action_by VARCHAR(100) NULL
                    
                    // Fecha y hora de la última acción realizada sobre este registro
                    lastActionAt = m.LastActionAt, // Formato: DateTime | Columna MySQL: last_action_at DATETIME NULL
                    
                    // Fecha y hora de creación del registro (timestamp automático de MySQL)
                    createdAt = m.CreatedAt, // Formato: DateTime | Columna MySQL: created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    
                    // Fecha y hora de la última actualización del registro (timestamp automático de MySQL)
                    updatedAt = m.UpdatedAt, // Formato: DateTime | Columna MySQL: updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    
                    // ===== ALIAS PARA COMPATIBILIDAD CON FRONTEND =====
                    // Campo duplicado para mantener compatibilidad con código legacy del frontend Angular
                    machineNumber = m.NumeroMaquina, // Alias de numeroMaquina | Mismo valor que numeroMaquina
                    
                    // ===== INFORMACIÓN DEL USUARIO QUE ACTUALIZÓ (JOIN CON TABLA USERS) =====
                    // Objeto anidado con información del usuario que realizó la última actualización
                    // Datos obtenidos mediante LEFT JOIN con la tabla 'users' usando la columna 'updated_by'
                    updatedByUser = m.UpdatedByUser != null ? new // Verificar si existe relación con usuario (puede ser null)
                    {
                        id = m.UpdatedByUser.Id, // ID único del usuario en la tabla users
                        firstName = m.UpdatedByUser.FirstName, // Nombre del usuario
                        lastName = m.UpdatedByUser.LastName, // Apellido del usuario
                        userCode = m.UpdatedByUser.UserCode // Código de usuario único
                    } : null // Si no hay usuario relacionado, retornar null
                }).ToList(); // Ejecutar la proyección y convertir a lista en memoria

                return Ok(new
                {
                    success = true,
                    message = $"{maquinas.Count} registros de máquinas obtenidos exitosamente",
                    data = result,
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
        /// Estados válidos: LISTO (verde), CORRIENDO (amarillo), SUSPENDIDO (rojo), TERMINADO (gris)
        /// </summary>
        /// <param name="articulo">Código del artículo (clave primaria) de la máquina a actualizar</param>
        /// <param name="request">Objeto con el nuevo estado y observaciones opcionales</param>
        /// <returns>Respuesta JSON con el resultado de la operación</returns>
        [HttpPatch("{articulo}/status")] // Ruta: PATCH /api/maquinas/F204567/status
        public async Task<ActionResult<object>> UpdateMachineStatus(string articulo, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                // ===== OBTENER INFORMACIÓN DEL USUARIO AUTENTICADO =====
                // Extraer ID y nombre del usuario desde el token JWT
                var userId = GetCurrentUserId(); // ID numérico del usuario (ej: 123)
                var userName = GetCurrentUserName(); // Nombre completo del usuario (ej: "Juan Pérez")
                
                // Si no hay usuario autenticado, usar valores por defecto
                if (userId == 0)
                {
                    userId = 1; // Usuario por defecto (admin)
                    userName = string.IsNullOrEmpty(userName) ? "Sistema" : userName;
                    _logger.LogWarning("⚠️ No se encontró usuario autenticado, usando usuario por defecto");
                }
                
                // ===== LOG DE INICIO DE OPERACIÓN =====
                // Registrar en el log que se está iniciando la actualización de estado
                _logger.LogInformation($"🔄 Actualizando estado de máquina {articulo} a {request.Estado} por usuario {userId} ({userName})");

                // ===== VALIDAR ESTADO =====
                // Verificar que el estado sea válido
                var estadosValidos = new[] { "PREPARANDO", "LISTO", "CORRIENDO", "SUSPENDIDO", "TERMINADO" };
                if (!estadosValidos.Contains(request.Estado?.ToUpper()))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = $"Estado inválido: {request.Estado}. Estados válidos: {string.Join(", ", estadosValidos)}",
                        timestamp = DateTime.UtcNow
                    });
                }

                // ===== BUSCAR LA MÁQUINA EN LA BASE DE DATOS =====
                // Buscar el registro de máquina por su clave primaria (articulo)
                var maquina = await _context.Maquinas.FindAsync(articulo); // Ejecuta: SELECT * FROM maquinas WHERE articulo = 'F204567'
                
                // ===== VALIDAR EXISTENCIA DEL REGISTRO =====
                // Verificar si se encontró la máquina en la base de datos
                if (maquina == null) // Si no existe el registro
                {
                    // Retornar respuesta HTTP 404 Not Found con mensaje descriptivo
                    return NotFound(new
                    {
                        success = false, // Indicador de operación fallida
                        message = $"Registro de máquina con artículo {articulo} no encontrado", // Mensaje de error
                        timestamp = DateTime.UtcNow // Timestamp UTC de la respuesta
                    });
                }

                // ===== GUARDAR ESTADO ANTERIOR PARA AUDITORÍA =====
                // Almacenar el estado actual antes de modificarlo (para logging y respuesta)
                var estadoAnterior = maquina.Estado; // Ejemplo: "LISTO"

                // ===== ACTUALIZAR CAMPOS DEL REGISTRO =====
                // Actualizar el estado de la máquina con el nuevo valor recibido
                maquina.Estado = request.Estado; // Nuevo estado: "CORRIENDO", "SUSPENDIDO", etc.
                
                // Actualizar observaciones solo si se proporcionaron nuevas, sino mantener las existentes
                maquina.Observaciones = request.Observaciones ?? maquina.Observaciones; // Operador ?? mantiene valor actual si request.Observaciones es null
                
                // Registrar el ID del usuario que realizó la actualización
                maquina.UpdatedBy = userId; // ID del usuario para relación con tabla users
                
                // Actualizar timestamp de última modificación
                maquina.UpdatedAt = DateTime.UtcNow; // Fecha y hora actual en UTC
                
                // Registrar el nombre del usuario que realizó la última acción
                maquina.LastActionBy = userName; // Nombre completo del usuario
                
                // Actualizar timestamp de última acción
                maquina.LastActionAt = DateTime.UtcNow; // Fecha y hora actual en UTC

                // ===== GUARDAR CAMBIOS EN LA BASE DE DATOS =====
                // Ejecutar UPDATE en MySQL para persistir los cambios
                await _context.SaveChangesAsync(); // Ejecuta: UPDATE maquinas SET estado=..., observaciones=..., updated_by=..., updated_at=..., last_action_by=..., last_action_at=... WHERE articulo='F204567'

                // ===== LOG DE OPERACIÓN EXITOSA =====
                // Registrar en el log que la actualización fue exitosa
                _logger.LogInformation($"✅ Estado de máquina {articulo} actualizado exitosamente de {estadoAnterior} a {request.Estado}");

                // ===== RETORNAR RESPUESTA EXITOSA =====
                // Retornar HTTP 200 OK con los datos actualizados
                return Ok(new
                {
                    success = true, // Indicador de operación exitosa
                    message = $"Estado actualizado exitosamente a {request.Estado}", // Mensaje de confirmación
                    data = new // Objeto con los datos actualizados
                    {
                        id = maquina.Articulo, // ID para compatibilidad con frontend (usa articulo como ID)
                        articulo = maquina.Articulo, // Código del artículo (clave primaria)
                        numeroMaquina = maquina.NumeroMaquina, // Número de máquina (11-21)
                        estadoAnterior = estadoAnterior, // Estado previo al cambio
                        estadoNuevo = maquina.Estado, // Estado después del cambio
                        lastActionBy = maquina.LastActionBy, // Usuario que realizó el cambio
                        lastActionAt = maquina.LastActionAt, // Timestamp del cambio
                        observaciones = maquina.Observaciones // Observaciones actualizadas
                    },
                    timestamp = DateTime.UtcNow // Timestamp UTC de la respuesta
                });
            }
            catch (Exception ex) // Capturar cualquier excepción no controlada
            {
                // ===== LOG DE ERROR =====
                // Registrar el error en el log con stack trace completo
                _logger.LogError(ex, $"❌ Error actualizando estado de máquina {articulo}");
                
                // ===== RETORNAR RESPUESTA DE ERROR =====
                // Retornar HTTP 500 Internal Server Error con detalles del error
                return StatusCode(500, new
                {
                    success = false, // Indicador de operación fallida
                    message = "Error interno del servidor al actualizar estado", // Mensaje genérico
                    error = ex.Message, // Mensaje específico de la excepción
                    timestamp = DateTime.UtcNow // Timestamp UTC de la respuesta
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
                    .Include(p => p.CreatedByUser) // LEFT JOIN con tabla users para obtener datos del usuario creador
                    .Include(p => p.UpdatedByUser) // LEFT JOIN con tabla users para obtener datos del usuario actualizador
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
        /// Obtiene el nombre completo del usuario actual desde los claims del JWT
        /// Combina el nombre y apellido del usuario autenticado
        /// </summary>
        /// <returns>Nombre completo del usuario (FirstName + LastName)</returns>
        private string GetCurrentUserName()
        {
            // ===== EXTRACCIÓN DE CLAIMS DE NOMBRE =====
            // Buscar el claim "FirstName" en el token JWT
            var firstName = User.FindFirst("FirstName")?.Value ?? ""; // Obtener nombre o string vacío si no existe
            
            // Buscar el claim "LastName" en el token JWT
            var lastName = User.FindFirst("LastName")?.Value ?? ""; // Obtener apellido o string vacío si no existe
            
            // ===== CONCATENACIÓN Y LIMPIEZA =====
            // Combinar nombre y apellido con un espacio y eliminar espacios extras al inicio/final
            return $"{firstName} {lastName}".Trim(); // Ejemplo: "Juan Pérez" o "Juan" si no hay apellido
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