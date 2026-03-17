using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FlexoAPP.API.Services;
using FlexoAPP.API.Models.DTOs;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/machine-backup")]
    [Authorize]
    public class MachineBackupController : ControllerBase
    {
        private readonly IMachineBackupService _backupService;
        private readonly ILogger<MachineBackupController> _logger;

        public MachineBackupController(
            IMachineBackupService backupService,
            ILogger<MachineBackupController> logger)
        {
            _backupService = backupService;
            _logger = logger;
        }




        [HttpPost("create")]
        public async Task<IActionResult> CreateBackup([FromBody] MachineBackupRequestDto request)
        {
            try
            {
                _logger.LogInformation("🔄 Iniciando creación de backup de máquinas");

                var result = await _backupService.CreateBackupAsync(request);

                if (result.Success)
                {
                    return Ok(new
                    {
                        success = true,
                        data = result,
                        message = "Backup creado exitosamente"
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Error creando backup",
                        message = result.Message
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando backup de máquinas");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }




        [HttpGet("list")]
        public async Task<IActionResult> GetBackupsList()
        {
            try
            {
                var backups = await _backupService.GetBackupsListAsync();

                return Ok(new
                {
                    success = true,
                    data = backups,
                    message = $"Se encontraron {backups.Count} backups"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo lista de backups");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }




        [HttpPost("restore/{backupId}")]
        public async Task<IActionResult> RestoreBackup(string backupId, [FromBody] RestoreBackupRequestDto? request = null)
        {
            try
            {
                _logger.LogInformation($"🔄 Iniciando restauración de backup: {backupId}");


                if (request?.CreateBackupBeforeRestore == true)
                {
                    var preRestoreBackup = await _backupService.CreateBackupAsync(new MachineBackupRequestDto
                    {
                        Description = $"Backup automático antes de restaurar {backupId}",
                        IncludeAllMachines = true
                    });

                    if (!preRestoreBackup.Success)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            error = "Error creando backup de seguridad",
                            message = preRestoreBackup.Message
                        });
                    }
                }

                var success = await _backupService.RestoreBackupAsync(backupId);

                if (success)
                {
                    return Ok(new
                    {
                        success = true,
                        message = $"Backup {backupId} restaurado exitosamente"
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Error restaurando backup",
                        message = $"No se pudo restaurar el backup {backupId}"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error restaurando backup {backupId}");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }




        [HttpDelete("{backupId}")]
        public async Task<IActionResult> DeleteBackup(string backupId)
        {
            try
            {
                var success = await _backupService.DeleteBackupAsync(backupId);

                if (success)
                {
                    return Ok(new
                    {
                        success = true,
                        message = $"Backup {backupId} eliminado exitosamente"
                    });
                }
                else
                {
                    return NotFound(new
                    {
                        success = false,
                        error = "Backup no encontrado",
                        message = $"El backup {backupId} no existe"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error eliminando backup {backupId}");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }




        [HttpGet("{backupId}/data")]
        public async Task<IActionResult> GetBackupDataForReports(string backupId)
        {
            try
            {
                var data = await _backupService.GetBackupDataForReportsAsync(backupId);

                return Ok(new
                {
                    success = true,
                    data = data,
                    message = $"Datos del backup {backupId} obtenidos exitosamente"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo datos del backup {backupId}");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }




        [HttpPost("daily")]
        public async Task<IActionResult> CreateDailyBackup()
        {
            try
            {
                var result = await _backupService.CreateDailyBackupAsync();

                if (result.Success)
                {
                    return Ok(new
                    {
                        success = true,
                        data = result,
                        message = "Backup diario creado exitosamente"
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Error creando backup diario",
                        message = result.Message
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando backup diario");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }




        [HttpGet("{backupId}/verify")]
        public async Task<IActionResult> VerifyBackupIntegrity(string backupId)
        {
            try
            {
                var isValid = await _backupService.VerifyBackupIntegrityAsync(backupId);

                return Ok(new
                {
                    success = true,
                    data = new { backupId, isValid },
                    message = isValid ? "Backup válido" : "Backup corrupto o inválido"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error verificando integridad del backup {backupId}");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }




        [HttpGet("{backupId}/export")]
        public async Task<IActionResult> ExportBackup(string backupId, [FromQuery] string format = "zip")
        {
            try
            {
                var fileData = await _backupService.ExportBackupToFileAsync(backupId, format);

                var fileName = format.ToLower() switch
                {
                    "zip" => $"backup_{backupId}.zip",
                    "json" => $"backup_{backupId}.json",
                    _ => $"backup_{backupId}.{format}"
                };

                var contentType = format.ToLower() switch
                {
                    "zip" => "application/zip",
                    "json" => "application/json",
                    _ => "application/octet-stream"
                };

                return File(fileData, contentType, fileName);
            }
            catch (FileNotFoundException)
            {
                return NotFound(new
                {
                    success = false,
                    error = "Backup no encontrado",
                    message = $"El backup {backupId} no existe"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    error = "Formato no válido",
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error exportando backup {backupId}");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }




        [HttpPost("import")]
        public async Task<IActionResult> ImportBackup(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Archivo requerido",
                        message = "Debe proporcionar un archivo de backup"
                    });
                }

                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                var fileData = memoryStream.ToArray();

                var result = await _backupService.ImportBackupFromFileAsync(fileData, file.FileName);

                if (result.Success)
                {
                    return Ok(new
                    {
                        success = true,
                        data = result,
                        message = "Backup importado exitosamente"
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Error importando backup",
                        message = result.Message
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importando backup");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }




        [HttpGet("{backupId}/stats")]
        public async Task<IActionResult> GetBackupStats(string backupId)
        {
            try
            {
                var stats = await _backupService.GetBackupStatsAsync(backupId);

                return Ok(new
                {
                    success = true,
                    data = stats,
                    message = "Estadísticas obtenidas exitosamente"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo estadísticas del backup {backupId}");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }
    }
}