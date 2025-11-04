using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Newtonsoft.Json;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous] // Temporal para pruebas
    public class MachinesController : ControllerBase
    {
        private readonly FlexoAPPDbContext _context;
        private readonly ILogger<MachinesController> _logger;

        public MachinesController(FlexoAPPDbContext context, ILogger<MachinesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/machines/programs
        [HttpGet("programs")]
        public async Task<ActionResult<object>> GetMachinePrograms()
        {
            try
            {
                _logger.LogInformation("🔄 Obteniendo programas de máquinas desde flexoapp_bd");

                var programs = await _context.MachinePrograms
                    .Include(p => p.CreatedByUser)
                    .Include(p => p.UpdatedByUser)
                    .OrderBy(p => p.MachineNumber)
                    .ThenBy(p => p.FechaInicio)
                    .ToListAsync();

                _logger.LogInformation($"✅ {programs.Count} programas encontrados");

                var result = programs.Select(p => new
                {
                    id = p.Id,
                    machineNumber = p.MachineNumber,
                    name = p.Name,
                    articulo = p.Articulo,
                    otSap = p.OtSap,
                    cliente = p.Cliente,
                    referencia = p.Referencia,
                    td = p.Td,
                    colores = p.Colores, // JSON field
                    sustrato = p.Sustrato,
                    kilos = p.Kilos,
                    estado = p.Estado,
                    fechaInicio = p.FechaInicio,
                    fechaFin = p.FechaFin,
                    progreso = p.Progreso,
                    observaciones = p.Observaciones,
                    lastActionBy = p.LastActionBy,
                    lastActionAt = p.LastActionAt,
                    lastAction = p.LastAction,
                    operatorName = p.OperatorName,
                    createdAt = p.CreatedAt,
                    updatedAt = p.UpdatedAt,
                    createdByUser = p.CreatedByUser != null ? new
                    {
                        id = p.CreatedByUser.Id,
                        firstName = p.CreatedByUser.FirstName,
                        lastName = p.CreatedByUser.LastName,
                        userCode = p.CreatedByUser.UserCode
                    } : null,
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
                    message = $"{programs.Count} programas de máquinas obtenidos exitosamente",
                    data = result,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error obteniendo programas de máquinas");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error interno del servidor al obtener programas",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        // GET: api/machines/programs/machine/{machineNumber}
        [HttpGet("programs/machine/{machineNumber}")]
        public async Task<ActionResult<object>> GetMachineProgramsByMachine(int machineNumber)
        {
            try
            {
                _logger.LogInformation($"🔄 Obteniendo programas para máquina {machineNumber}");

                var programs = await _context.MachinePrograms
                    .Include(p => p.CreatedByUser)
                    .Include(p => p.UpdatedByUser)
                    .Where(p => p.MachineNumber == machineNumber)
                    .OrderBy(p => p.FechaInicio)
                    .ToListAsync();

                _logger.LogInformation($"✅ {programs.Count} programas encontrados para máquina {machineNumber}");

                var result = programs.Select(p => new
                {
                    id = p.Id,
                    machineNumber = p.MachineNumber,
                    name = p.Name,
                    articulo = p.Articulo,
                    otSap = p.OtSap,
                    cliente = p.Cliente,
                    referencia = p.Referencia,
                    td = p.Td,
                    colores = p.Colores,
                    sustrato = p.Sustrato,
                    kilos = p.Kilos,
                    estado = p.Estado,
                    fechaInicio = p.FechaInicio,
                    fechaFin = p.FechaFin,
                    progreso = p.Progreso,
                    observaciones = p.Observaciones,
                    lastActionBy = p.LastActionBy,
                    lastActionAt = p.LastActionAt,
                    lastAction = p.LastAction,
                    operatorName = p.OperatorName,
                    createdAt = p.CreatedAt,
                    updatedAt = p.UpdatedAt,
                    createdByUser = p.CreatedByUser != null ? new
                    {
                        id = p.CreatedByUser.Id,
                        firstName = p.CreatedByUser.FirstName,
                        lastName = p.CreatedByUser.LastName,
                        userCode = p.CreatedByUser.UserCode
                    } : null,
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
                    message = $"{programs.Count} programas obtenidos para máquina {machineNumber}",
                    data = result,
                    machineNumber = machineNumber,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error obteniendo programas para máquina {machineNumber}");
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error interno del servidor al obtener programas para máquina {machineNumber}",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        // POST: api/machines/programs
        [HttpPost("programs")]
        public async Task<ActionResult<object>> CreateMachineProgram([FromBody] CreateMachineProgramRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                _logger.LogInformation($"🔄 Creando nuevo programa de máquina por usuario {userId}");

                // Validar datos requeridos
                if (string.IsNullOrWhiteSpace(request.Articulo) || 
                    string.IsNullOrWhiteSpace(request.OtSap) ||
                    request.MachineNumber <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Datos requeridos faltantes: Articulo, OtSap y MachineNumber son obligatorios",
                        timestamp = DateTime.UtcNow
                    });
                }

                // Verificar que no exista un programa con la misma OT SAP
                var existingProgram = await _context.MachinePrograms
                    .FirstOrDefaultAsync(p => p.OtSap == request.OtSap);

                if (existingProgram != null)
                {
                    return Conflict(new
                    {
                        success = false,
                        message = $"Ya existe un programa con OT SAP: {request.OtSap}",
                        timestamp = DateTime.UtcNow
                    });
                }

                var program = new MachineProgram
                {
                    MachineNumber = request.MachineNumber,
                    Name = request.Name ?? $"Programa {request.Articulo}",
                    Articulo = request.Articulo,
                    OtSap = request.OtSap,
                    Cliente = request.Cliente ?? "",
                    Referencia = request.Referencia,
                    Td = request.Td,
                    Colores = request.Colores ?? "[]",
                    Sustrato = request.Sustrato,
                    Kilos = request.Kilos,
                    Estado = request.Estado ?? "LISTO",
                    FechaInicio = request.FechaInicio ?? DateTime.Now,
                    FechaFin = request.FechaFin,
                    Progreso = request.Progreso ?? 0,
                    Observaciones = request.Observaciones,
                    LastActionBy = GetCurrentUserName(),
                    LastActionAt = DateTime.Now,
                    LastAction = "Programa creado",
                    OperatorName = request.OperatorName,
                    CreatedBy = userId,
                    UpdatedBy = userId,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                _context.MachinePrograms.Add(program);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ Programa creado exitosamente con ID: {program.Id}");

                return CreatedAtAction(nameof(GetMachineProgramById), new { id = program.Id }, new
                {
                    success = true,
                    message = "Programa de máquina creado exitosamente",
                    data = new
                    {
                        id = program.Id,
                        machineNumber = program.MachineNumber,
                        name = program.Name,
                        articulo = program.Articulo,
                        otSap = program.OtSap,
                        cliente = program.Cliente,
                        estado = program.Estado,
                        createdAt = program.CreatedAt
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error creando programa de máquina");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error interno del servidor al crear programa",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        // GET: api/machines/programs/{id}
        [HttpGet("programs/{id}")]
        public async Task<ActionResult<object>> GetMachineProgramById(int id)
        {
            try
            {
                var program = await _context.MachinePrograms
                    .Include(p => p.CreatedByUser)
                    .Include(p => p.UpdatedByUser)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (program == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = $"Programa con ID {id} no encontrado",
                        timestamp = DateTime.UtcNow
                    });
                }

                var result = new
                {
                    id = program.Id,
                    machineNumber = program.MachineNumber,
                    name = program.Name,
                    articulo = program.Articulo,
                    otSap = program.OtSap,
                    cliente = program.Cliente,
                    referencia = program.Referencia,
                    td = program.Td,
                    colores = program.Colores,
                    sustrato = program.Sustrato,
                    kilos = program.Kilos,
                    estado = program.Estado,
                    fechaInicio = program.FechaInicio,
                    fechaFin = program.FechaFin,
                    progreso = program.Progreso,
                    observaciones = program.Observaciones,
                    lastActionBy = program.LastActionBy,
                    lastActionAt = program.LastActionAt,
                    lastAction = program.LastAction,
                    operatorName = program.OperatorName,
                    createdAt = program.CreatedAt,
                    updatedAt = program.UpdatedAt,
                    createdByUser = program.CreatedByUser != null ? new
                    {
                        id = program.CreatedByUser.Id,
                        firstName = program.CreatedByUser.FirstName,
                        lastName = program.CreatedByUser.LastName,
                        userCode = program.CreatedByUser.UserCode
                    } : null,
                    updatedByUser = program.UpdatedByUser != null ? new
                    {
                        id = program.UpdatedByUser.Id,
                        firstName = program.UpdatedByUser.FirstName,
                        lastName = program.UpdatedByUser.LastName,
                        userCode = program.UpdatedByUser.UserCode
                    } : null
                };

                return Ok(new
                {
                    success = true,
                    message = "Programa obtenido exitosamente",
                    data = result,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error obteniendo programa {id}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error interno del servidor al obtener programa",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        // PUT: api/machines/programs/{id}
        [HttpPut("programs/{id}")]
        public async Task<ActionResult<object>> UpdateMachineProgram(int id, [FromBody] UpdateMachineProgramRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userName = GetCurrentUserName();
                
                _logger.LogInformation($"🔄 Actualizando programa {id} por usuario {userId}");

                var program = await _context.MachinePrograms.FindAsync(id);
                if (program == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = $"Programa con ID {id} no encontrado",
                        timestamp = DateTime.UtcNow
                    });
                }

                // Actualizar campos si se proporcionan
                if (!string.IsNullOrWhiteSpace(request.Name))
                    program.Name = request.Name;
                
                if (!string.IsNullOrWhiteSpace(request.Articulo))
                    program.Articulo = request.Articulo;
                
                if (!string.IsNullOrWhiteSpace(request.Cliente))
                    program.Cliente = request.Cliente;
                
                if (request.Referencia != null)
                    program.Referencia = request.Referencia;
                
                if (request.Td != null)
                    program.Td = request.Td;
                
                if (request.Colores != null)
                    program.Colores = request.Colores;
                
                if (request.Sustrato != null)
                    program.Sustrato = request.Sustrato;
                
                if (request.Kilos.HasValue)
                    program.Kilos = request.Kilos.Value;
                
                if (!string.IsNullOrWhiteSpace(request.Estado))
                    program.Estado = request.Estado;
                
                if (request.FechaInicio.HasValue)
                    program.FechaInicio = request.FechaInicio.Value;
                
                if (request.FechaFin.HasValue)
                    program.FechaFin = request.FechaFin.Value;
                
                if (request.Progreso.HasValue)
                    program.Progreso = request.Progreso.Value;
                
                if (request.Observaciones != null)
                    program.Observaciones = request.Observaciones;
                
                if (request.OperatorName != null)
                    program.OperatorName = request.OperatorName;

                // Actualizar metadatos
                program.UpdatedBy = userId;
                program.UpdatedAt = DateTime.Now;
                program.LastActionBy = userName;
                program.LastActionAt = DateTime.Now;
                program.LastAction = request.LastAction ?? "Programa actualizado";

                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ Programa {id} actualizado exitosamente");

                return Ok(new
                {
                    success = true,
                    message = "Programa actualizado exitosamente",
                    data = new
                    {
                        id = program.Id,
                        machineNumber = program.MachineNumber,
                        name = program.Name,
                        articulo = program.Articulo,
                        estado = program.Estado,
                        updatedAt = program.UpdatedAt,
                        lastActionBy = program.LastActionBy
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error actualizando programa {id}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error interno del servidor al actualizar programa",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        // DELETE: api/machines/programs/{id}
        [HttpDelete("programs/{id}")]
        public async Task<ActionResult<object>> DeleteMachineProgram(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                _logger.LogInformation($"🔄 Eliminando programa {id} por usuario {userId}");

                var program = await _context.MachinePrograms.FindAsync(id);
                if (program == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = $"Programa con ID {id} no encontrado",
                        timestamp = DateTime.UtcNow
                    });
                }

                _context.MachinePrograms.Remove(program);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ Programa {id} eliminado exitosamente");

                return Ok(new
                {
                    success = true,
                    message = "Programa eliminado exitosamente",
                    data = new
                    {
                        id = program.Id,
                        articulo = program.Articulo,
                        otSap = program.OtSap
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error eliminando programa {id}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error interno del servidor al eliminar programa",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        // POST: api/machines/programs/clear-all
        [HttpPost("programs/clear-all")]
        public async Task<ActionResult<object>> ClearAllPrograms()
        {
            try
            {
                var userId = GetCurrentUserId();
                _logger.LogInformation($"🔄 Limpiando todos los programas por usuario {userId}");

                var programCount = await _context.MachinePrograms.CountAsync();
                
                if (programCount == 0)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "No hay programas para eliminar",
                        deletedCount = 0,
                        timestamp = DateTime.UtcNow
                    });
                }

                _context.MachinePrograms.RemoveRange(_context.MachinePrograms);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ {programCount} programas eliminados exitosamente");

                return Ok(new
                {
                    success = true,
                    message = $"{programCount} programas eliminados exitosamente",
                    deletedCount = programCount,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error limpiando todos los programas");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error interno del servidor al limpiar programas",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        // Métodos auxiliares
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        private string GetCurrentUserName()
        {
            var firstName = User.FindFirst("FirstName")?.Value ?? "";
            var lastName = User.FindFirst("LastName")?.Value ?? "";
            return $"{firstName} {lastName}".Trim();
        }
    }

    // DTOs para requests
    public class CreateMachineProgramRequest
    {
        public int MachineNumber { get; set; }
        public string? Name { get; set; }
        public string Articulo { get; set; } = "";
        public string OtSap { get; set; } = "";
        public string? Cliente { get; set; }
        public string? Referencia { get; set; }
        public string? Td { get; set; }
        public string? Colores { get; set; }
        public string? Sustrato { get; set; }
        public decimal Kilos { get; set; }
        public string? Estado { get; set; }
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public int? Progreso { get; set; }
        public string? Observaciones { get; set; }
        public string? OperatorName { get; set; }
    }

    public class UpdateMachineProgramRequest
    {
        public string? Name { get; set; }
        public string? Articulo { get; set; }
        public string? Cliente { get; set; }
        public string? Referencia { get; set; }
        public string? Td { get; set; }
        public string? Colores { get; set; }
        public string? Sustrato { get; set; }
        public decimal? Kilos { get; set; }
        public string? Estado { get; set; }
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public int? Progreso { get; set; }
        public string? Observaciones { get; set; }
        public string? OperatorName { get; set; }
        public string? LastAction { get; set; }
    }
}