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
                _logger.LogInformation("🔄 Obteniendo datos de máquinas desde tabla machine_programs");

                var query = _context.MachinePrograms
                    .Include(p => p.CreatedByUser)
                    .Include(p => p.UpdatedByUser)
                    .AsQueryable();

                // Aplicar ordenamiento según parámetros - Por defecto fecha de tinta descendente
                if (orderBy?.ToLower() == "fechatintaenmaquina" || orderBy?.ToLower() == "fechatinta" || string.IsNullOrEmpty(orderBy))
                {
                    query = order?.ToLower() == "asc" 
                        ? query.OrderBy(p => p.FechaTintaEnMaquina).ThenBy(p => p.MachineNumber)
                        : query.OrderByDescending(p => p.FechaTintaEnMaquina).ThenBy(p => p.MachineNumber);
                }
                else if (orderBy?.ToLower() == "numeromaquina" || orderBy?.ToLower() == "machinenumber")
                {
                    query = order?.ToLower() == "desc" 
                        ? query.OrderByDescending(p => p.MachineNumber).ThenByDescending(p => p.FechaTintaEnMaquina)
                        : query.OrderBy(p => p.MachineNumber).ThenByDescending(p => p.FechaTintaEnMaquina);
                }

                var programs = await query.ToListAsync();

                _logger.LogInformation($"✅ {programs.Count} registros de máquinas encontrados");

                // Mapear datos según los campos solicitados para el módulo de máquinas
                var result = programs.Select(p => new
                {
                    id = p.Id,
                    // Campos principales solicitados para el módulo de máquinas
                    numeroMaquina = p.MachineNumber, // Número de máquina (11-21)
                    articulo = p.Articulo, // Código del artículo
                    otSap = p.OtSap, // Orden de trabajo SAP
                    cliente = p.Cliente, // Nombre del cliente
                    referencia = p.Referencia, // Referencia del producto
                    td = p.Td, // Código TD (Tipo de Diseño)
                    numeroColores = p.NumeroColores, // Número total de colores
                    colores = ParseColores(p.Colores), // Array de colores parseado
                    kilos = p.Kilos, // Cantidad en kilogramos
                    fechaTintaEnMaquina = p.FechaTintaEnMaquina, // Fecha y hora de tinta en máquina (formato dd/mm/aaaa: hora)
                    sustrato = p.Sustrato, // Tipo de material base
                    estado = p.Estado, // Estado actual del programa para acciones
                    observaciones = p.Observaciones, // Observaciones adicionales
                    // Campos adicionales para funcionalidad completa
                    lastActionBy = p.LastActionBy,
                    lastActionAt = p.LastActionAt,
                    createdAt = p.CreatedAt,
                    updatedAt = p.UpdatedAt,
                    // Información del usuario para auditoría
                    updatedByUser = p.UpdatedByUser != null ? new
                    {
                        id = p.UpdatedByUser.Id,
                        firstName = p.UpdatedByUser.FirstName,
                        lastName = p.UpdatedByUser.LastName,
                        userCode = p.UpdatedByUser.UserCode
                    } : null
                }).ToList();

                return Ok(new
                {
                    success = true,
                    message = $"{programs.Count} registros de máquinas obtenidos exitosamente",
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
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// PATCH: api/maquinas/{id}/status
        /// Actualiza el estado de un programa de máquina y cambia el color de toda la línea
        /// Guarda la acción en la base de datos con información del usuario
        /// </summary>
        [HttpPatch("{id}/status")]
        public async Task<ActionResult<object>> UpdateMachineStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userName = GetCurrentUserName();
                
                _logger.LogInformation($"🔄 Actualizando estado de máquina {id} a {request.Estado} por usuario {userId}");

                var program = await _context.MachinePrograms.FindAsync(id);
                if (program == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = $"Registro de máquina con ID {id} no encontrado",
                        timestamp = DateTime.UtcNow
                    });
                }

                // Guardar estado anterior para auditoría
                var estadoAnterior = program.Estado;

                // Actualizar estado y metadatos
                program.Estado = request.Estado;
                program.Observaciones = request.Observaciones ?? program.Observaciones;
                program.UpdatedBy = userId;
                program.UpdatedAt = DateTime.UtcNow;
                program.LastActionBy = userName;
                program.LastActionAt = DateTime.UtcNow;
                program.LastAction = $"Estado cambiado de {estadoAnterior} a {request.Estado}";

                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ Estado de máquina {id} actualizado exitosamente de {estadoAnterior} a {request.Estado}");

                return Ok(new
                {
                    success = true,
                    message = $"Estado actualizado exitosamente a {request.Estado}",
                    data = new
                    {
                        id = program.Id,
                        numeroMaquina = program.MachineNumber,
                        articulo = program.Articulo,
                        estadoAnterior = estadoAnterior,
                        estadoNuevo = program.Estado,
                        lastActionBy = program.LastActionBy,
                        lastActionAt = program.LastActionAt,
                        observaciones = program.Observaciones
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error actualizando estado de máquina {id}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error interno del servidor al actualizar estado",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// GET: api/maquinas/machine/{numeroMaquina}
        /// Obtiene todos los programas de una máquina específica ordenados por fecha más reciente
        /// </summary>
        [HttpGet("machine/{numeroMaquina}")]
        public async Task<ActionResult<object>> GetProgramasPorMaquina(int numeroMaquina)
        {
            try
            {
                _logger.LogInformation($"🔄 Obteniendo programas para máquina {numeroMaquina}");

                var programs = await _context.MachinePrograms
                    .Include(p => p.CreatedByUser)
                    .Include(p => p.UpdatedByUser)
                    .Where(p => p.MachineNumber == numeroMaquina)
                    .OrderByDescending(p => p.FechaTintaEnMaquina)
                    .ToListAsync();

                _logger.LogInformation($"✅ {programs.Count} programas encontrados para máquina {numeroMaquina}");

                var result = programs.Select(p => new
                {
                    id = p.Id,
                    numeroMaquina = p.MachineNumber,
                    articulo = p.Articulo,
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

        /// <summary>
        /// Método auxiliar para parsear colores desde JSON string a array
        /// Maneja errores de parsing y retorna array vacío en caso de error
        /// </summary>
        private string[] ParseColores(string coloresJson)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(coloresJson))
                    return new string[0];

                // Si ya es un array, parsearlo
                if (coloresJson.StartsWith("["))
                {
                    return JsonConvert.DeserializeObject<string[]>(coloresJson) ?? new string[0];
                }

                // Si es un string simple, convertirlo a array
                return new string[] { coloresJson };
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"⚠️ Error parseando colores: {coloresJson}, Error: {ex.Message}");
                return new string[0];
            }
        }

        /// <summary>
        /// Obtiene el ID del usuario actual desde los claims del JWT
        /// </summary>
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        /// <summary>
        /// Obtiene el nombre completo del usuario actual desde los claims del JWT
        /// </summary>
        private string GetCurrentUserName()
        {
            var firstName = User.FindFirst("FirstName")?.Value ?? "";
            var lastName = User.FindFirst("LastName")?.Value ?? "";
            return $"{firstName} {lastName}".Trim();
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