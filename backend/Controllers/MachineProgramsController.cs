using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FlexoAPP.API.Models.Entities;
using flexoAPP.Services;
using flexoAPP.Models.DTOs;
using System.Text.Json;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/machine-programs")]
    [Authorize]
    public class MachineProgramsController : ControllerBase
    {
        private readonly IMachineProgramService _machineProgramService;
        private readonly ILogger<MachineProgramsController> _logger;

        public MachineProgramsController(
            IMachineProgramService machineProgramService,
            ILogger<MachineProgramsController> logger)
        {
            _machineProgramService = machineProgramService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPrograms()
        {
            try
            {
                var programs = await _machineProgramService.GetAllAsync();

                return Ok(new
                {
                    success = true,
                    data = programs,
                    message = "Programas obtenidos exitosamente"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo todos los programas");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }

        [HttpGet("machine/{machineNumber}")]
        public async Task<IActionResult> GetProgramsByMachine(int machineNumber)
        {
            try
            {
                if (machineNumber < 11 || machineNumber > 21)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Número de máquina inválido",
                        message = "El número de máquina debe estar entre 11 y 21"
                    });
                }

                var programs = await _machineProgramService.GetByMachineNumberAsync(machineNumber);

                return Ok(new
                {
                    success = true,
                    data = programs,
                    message = $"Programas de la máquina {machineNumber} obtenidos exitosamente"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo programas de la máquina {MachineNumber}", machineNumber);
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProgramById(int id)
        {
            try
            {
                var program = await _machineProgramService.GetByIdAsync(id);
                if (program == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        error = "Programa no encontrado",
                        message = $"No se encontró el programa con ID {id}"
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = program,
                    message = "Programa obtenido exitosamente"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo programa con ID {Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateProgram([FromBody] CreateMachineProgramDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Datos inválidos",
                        message = "Los datos proporcionados no son válidos",
                        errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }

                // Obtener el ID del usuario actual
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = null; // Use null instead of default user ID
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var parsedUserId))
                {
                    userId = parsedUserId;
                }

                var createdProgram = await _machineProgramService.CreateAsync(createDto, userId);

                return CreatedAtAction(
                    nameof(GetProgramById),
                    new { id = createdProgram.Id },
                    new
                    {
                        success = true,
                        data = createdProgram,
                        message = "Programa creado exitosamente"
                    });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    success = false,
                    error = "Programa duplicado",
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando programa");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProgram(int id, [FromBody] UpdateMachineProgramDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Datos inválidos",
                        message = "Los datos proporcionados no son válidos",
                        errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }

                // Obtener el ID del usuario actual
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = null; // Use null instead of default user ID
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var parsedUserId))
                {
                    userId = parsedUserId;
                }

                var updatedProgram = await _machineProgramService.UpdateAsync(id, updateDto, userId);

                return Ok(new
                {
                    success = true,
                    data = updatedProgram,
                    message = "Programa actualizado exitosamente"
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    error = "Programa no encontrado",
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    success = false,
                    error = "Conflicto de datos",
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error actualizando programa con ID {Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeStatusDto changeStatusDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Datos inválidos",
                        message = "Los datos proporcionados no son válidos",
                        errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }

                // Obtener el ID del usuario actual
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = null; // Use null instead of default user ID
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var parsedUserId))
                {
                    userId = parsedUserId;
                }

                var updatedProgram = await _machineProgramService.ChangeStatusAsync(id, changeStatusDto, userId);

                return Ok(new
                {
                    success = true,
                    data = updatedProgram,
                    message = $"Estado cambiado a {changeStatusDto.Estado} exitosamente"
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    error = "Programa no encontrado",
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cambiando estado del programa con ID {Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProgram(int id)
        {
            try
            {
                var deleted = await _machineProgramService.DeleteAsync(id);
                if (!deleted)
                {
                    return NotFound(new
                    {
                        success = false,
                        error = "Programa no encontrado",
                        message = $"No se encontró el programa con ID {id}"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Programa eliminado exitosamente"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error eliminando programa con ID {Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var statistics = await _machineProgramService.GetStatisticsAsync();

                return Ok(new
                {
                    success = true,
                    data = statistics,
                    message = "Estadísticas obtenidas exitosamente"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo estadísticas");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }

        [HttpGet("status/{status}")]
        public async Task<IActionResult> GetProgramsByStatus(string status)
        {
            try
            {
                var validStatuses = new[] { "LISTO", "SUSPENDIDO", "CORRIENDO", "TERMINADO" };
                if (!validStatuses.Contains(status.ToUpper()))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Estado inválido",
                        message = "El estado debe ser uno de: LISTO, SUSPENDIDO, CORRIENDO, TERMINADO"
                    });
                }

                var programs = await _machineProgramService.GetByStatusAsync(status.ToUpper());

                return Ok(new
                {
                    success = true,
                    data = programs,
                    message = $"Programas con estado {status} obtenidos exitosamente"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo programas por estado {Status}", status);
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }

        /// <summary>
        /// Cargar programación desde archivo Excel
        /// </summary>
        [HttpPost("upload-programming")]
        public async Task<IActionResult> UploadProgramming(IFormFile file, [FromForm] string moduleType = "machines", [FromForm] string timestamp = "")
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Archivo requerido",
                        message = "Debe seleccionar un archivo Excel válido"
                    });
                }

                // Validar tipo de archivo
                var allowedExtensions = new[] { ".xlsx", ".xls", ".csv" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Tipo de archivo no válido",
                        message = "Solo se permiten archivos Excel (.xlsx, .xls) o CSV (.csv)"
                    });
                }

                // Validar tamaño del archivo (máximo 10MB)
                if (file.Length > 10 * 1024 * 1024)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Archivo demasiado grande",
                        message = "El archivo no debe exceder 10MB"
                    });
                }

                // Obtener el ID del usuario actual
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = null;
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var parsedUserId))
                {
                    userId = parsedUserId;
                }

                _logger.LogInformation("📁 Procesando archivo Excel: {FileName} ({FileSize} bytes)", file.FileName, file.Length);

                // Procesar el archivo Excel
                var result = await _machineProgramService.ProcessExcelFileAsync(file, userId);

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
                            readyPrograms = result.Programs?.Count(p => p.Estado == "LISTO") ?? 0,
                            machinesWithPrograms = result.Programs?.Select(p => p.MachineNumber).Distinct().Count() ?? 0,
                            fileName = file.FileName,
                            processedAt = DateTime.UtcNow
                        }
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Error procesando archivo",
                        message = result.ErrorMessage,
                        details = result.ValidationErrors
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
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Limpiar toda la programación de máquinas
        /// </summary>
        [HttpDelete("clear-programming")]
        public async Task<IActionResult> ClearAllProgramming()
        {
            try
            {
                // Obtener el ID del usuario actual
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = null;
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var parsedUserId))
                {
                    userId = parsedUserId;
                }

                _logger.LogWarning("🗑️ Limpiando toda la programación de máquinas - Usuario: {UserId}", userId);

                var deletedCount = await _machineProgramService.ClearAllProgrammingAsync(userId);

                return Ok(new
                {
                    success = true,
                    message = $"Programación limpiada exitosamente. {deletedCount} programas eliminados.",
                    deletedCount = deletedCount,
                    clearedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error limpiando programación de máquinas");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }

        /// <summary>
        /// Endpoint público para verificar el estado del servicio (sin autenticación)
        /// </summary>
        [HttpGet("health")]
        [AllowAnonymous]
        public async Task<IActionResult> GetHealthStatus()
        {
            try
            {
                // Obtener estadísticas básicas sin datos sensibles
                var totalPrograms = await _machineProgramService.GetTotalCountAsync();
                
                return Ok(new
                {
                    success = true,
                    message = "Servicio de máquinas operativo",
                    data = new
                    {
                        serviceStatus = "Operativo",
                        totalPrograms = totalPrograms,
                        availableMachines = Enumerable.Range(11, 11).ToArray(), // Máquinas 11-21
                        timestamp = DateTime.UtcNow,
                        version = "1.0.0"
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo estado del servicio");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = "El servicio no está disponible",
                    timestamp = DateTime.UtcNow
                });
            }
        }


    }
}