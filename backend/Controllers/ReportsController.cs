using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FlexoAPP.API.Services;
using FlexoAPP.API.Models.DTOs;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class ReportsController : ControllerBase
    {
        private readonly IReportsService _reportsService;
        private readonly ILogger<ReportsController> _logger;
        private readonly IActivityLoggerService _activityLogger;

        public ReportsController(
            IReportsService reportsService,
            ILogger<ReportsController> logger,
            IActivityLoggerService activityLogger)
        {
            _reportsService = reportsService;
            _logger = logger;
            _activityLogger = activityLogger;
        }

        [HttpGet("summary")]
        public async Task<ActionResult<ReportSummaryDto>> GetReportSummary(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? machines = null,
            [FromQuery] string? status = null)
        {
            try
            {
                var filter = new ReportFilterDto
                {
                    StartDate = startDate ?? DateTime.Now.AddDays(-30),
                    EndDate = endDate ?? DateTime.Now,
                    MachineNumbers = machines?.Split(',').Select(int.Parse).ToList(),
                    Status = status?.Split(',').ToList()
                };

                var summary = await _reportsService.GetReportSummaryAsync(filter);


                try
                {
                    await _activityLogger.LogActivityAsync(
                        "VIEW_REPORT_SUMMARY",
                        "Consulta de resumen de reportes",
                        "REPORTS",
                        $"{{\"startDate\":\"{filter.StartDate:yyyy-MM-dd}\",\"endDate\":\"{filter.EndDate:yyyy-MM-dd}\"}}"
                    );
                }
                catch (Exception logEx)
                {
                    _logger.LogWarning(logEx, "Error registrando actividad de consulta de resumen");
                }

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting report summary");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("production")]
        public async Task<ActionResult<List<ProductionReportDto>>> GetProductionReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? machines = null,
            [FromQuery] string? status = null,
            [FromQuery] string? cliente = null,
            [FromQuery] string? articulo = null)
        {
            try
            {
                var filter = new ReportFilterDto
                {
                    StartDate = startDate ?? DateTime.Now.AddDays(-30),
                    EndDate = endDate ?? DateTime.Now,
                    MachineNumbers = machines?.Split(',').Select(int.Parse).ToList(),
                    Status = status?.Split(',').ToList(),
                    Cliente = cliente,
                    Articulo = articulo
                };

                var reports = await _reportsService.GetProductionReportAsync(filter);


                try
                {
                    await _activityLogger.LogActivityAsync(
                        "VIEW_PRODUCTION_REPORT",
                        "Consulta de reporte de producción",
                        "REPORTS",
                        $"{{\"startDate\":\"{filter.StartDate:yyyy-MM-dd}\",\"endDate\":\"{filter.EndDate:yyyy-MM-dd}\",\"count\":{reports.Count}}}"
                    );
                }
                catch (Exception logEx)
                {
                    _logger.LogWarning(logEx, "Error registrando actividad de consulta de reporte de producción");
                }

                return Ok(reports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting production report");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("machine-efficiency")]
        public async Task<ActionResult<List<MachineEfficiencyReportDto>>> GetMachineEfficiencyReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? machines = null)
        {
            try
            {
                var filter = new ReportFilterDto
                {
                    StartDate = startDate ?? DateTime.Now.AddDays(-30),
                    EndDate = endDate ?? DateTime.Now,
                    MachineNumbers = machines?.Split(',').Select(int.Parse).ToList()
                };

                var reports = await _reportsService.GetMachineEfficiencyReportAsync(filter);
                return Ok(reports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting machine efficiency report");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("clients")]
        public async Task<ActionResult<List<ClientReportDto>>> GetClientReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? cliente = null)
        {
            try
            {
                var filter = new ReportFilterDto
                {
                    StartDate = startDate ?? DateTime.Now.AddDays(-30),
                    EndDate = endDate ?? DateTime.Now,
                    Cliente = cliente
                };

                var reports = await _reportsService.GetClientReportAsync(filter);
                return Ok(reports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting client report");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("daily-production")]
        public async Task<ActionResult<List<DailyProductionReportDto>>> GetDailyProductionReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filter = new ReportFilterDto
                {
                    StartDate = startDate ?? DateTime.Now.AddDays(-30),
                    EndDate = endDate ?? DateTime.Now
                };

                var reports = await _reportsService.GetDailyProductionReportAsync(filter);
                return Ok(reports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily production report");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("clients/list")]
        public async Task<ActionResult<List<string>>> GetClientsList()
        {
            try
            {
                var clients = await _reportsService.GetClientsListAsync();
                return Ok(clients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting clients list");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("articulos/list")]
        public async Task<ActionResult<List<string>>> GetArticulosList()
        {
            try
            {
                var articulos = await _reportsService.GetArticulosListAsync();
                return Ok(articulos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting articulos list");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("export/excel")]
        public async Task<IActionResult> ExportToExcel(
            [FromQuery] string type,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? machines = null,
            [FromQuery] string? status = null,
            [FromQuery] string? cliente = null,
            [FromQuery] string? articulo = null)
        {
            try
            {
                var filter = new ReportFilterDto
                {
                    StartDate = startDate ?? DateTime.Now.AddDays(-30),
                    EndDate = endDate ?? DateTime.Now,
                    MachineNumbers = machines?.Split(',').Select(int.Parse).ToList(),
                    Status = status?.Split(',').ToList(),
                    Cliente = cliente,
                    Articulo = articulo
                };

                var fileBytes = await _reportsService.ExportToExcelAsync(type, filter);
                var fileName = $"reporte_{type}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";


                try
                {
                    await _activityLogger.LogActivityAsync(
                        "EXPORT_REPORT_EXCEL",
                        $"Exportación de reporte a Excel: {type}",
                        "REPORTS",
                        $"{{\"reportType\":\"{type}\",\"fileName\":\"{fileName}\"}}"
                    );
                }
                catch (Exception logEx)
                {
                    _logger.LogWarning(logEx, "Error registrando actividad de exportación a Excel");
                }

                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to Excel");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("export/pdf")]
        public async Task<IActionResult> ExportToPDF(
            [FromQuery] string type,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? machines = null,
            [FromQuery] string? status = null,
            [FromQuery] string? cliente = null,
            [FromQuery] string? articulo = null)
        {
            try
            {
                var filter = new ReportFilterDto
                {
                    StartDate = startDate ?? DateTime.Now.AddDays(-30),
                    EndDate = endDate ?? DateTime.Now,
                    MachineNumbers = machines?.Split(',').Select(int.Parse).ToList(),
                    Status = status?.Split(',').ToList(),
                    Cliente = cliente,
                    Articulo = articulo
                };

                var fileBytes = await _reportsService.ExportToPDFAsync(type, filter);
                var fileName = $"reporte_{type}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";


                try
                {
                    await _activityLogger.LogActivityAsync(
                        "EXPORT_REPORT_PDF",
                        $"Exportación de reporte a PDF: {type}",
                        "REPORTS",
                        $"{{\"reportType\":\"{type}\",\"fileName\":\"{fileName}\"}}"
                    );
                }
                catch (Exception logEx)
                {
                    _logger.LogWarning(logEx, "Error registrando actividad de exportación a PDF");
                }

                return File(fileBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to PDF");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }




        [HttpGet("user-activities/{userCode}")]
        public async Task<IActionResult> GetUserActivities(
            string userCode,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? module = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userCode))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Código de usuario requerido",
                        message = "Debe proporcionar un código de usuario válido"
                    });
                }

                var filter = new UserActivityFilterDto
                {
                    UserCode = userCode.Trim(),
                    StartDate = startDate ?? DateTime.Now.AddDays(-30),
                    EndDate = endDate ?? DateTime.Now,
                    Module = module
                };

                var activities = await _reportsService.GetUserActivitiesAsync(filter);


                try
                {
                    await _activityLogger.LogActivityAsync(
                        "VIEW_USER_ACTIVITIES_REPORT",
                        $"Consulta de actividades del usuario: {userCode}",
                        "REPORTS",
                        $"{{\"userCode\":\"{userCode}\",\"startDate\":\"{filter.StartDate:yyyy-MM-dd}\",\"endDate\":\"{filter.EndDate:yyyy-MM-dd}\",\"count\":{activities.Count}}}"
                    );
                }
                catch (Exception logEx)
                {
                    _logger.LogWarning(logEx, "Error registrando actividad de consulta de reporte");
                }

                return Ok(new
                {
                    success = true,
                    data = activities,
                    message = $"Se encontraron {activities.Count} actividades para el usuario {userCode}"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo actividades del usuario {UserCode}", userCode);
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }




        [HttpGet("machine-activities/{userCode}")]
        public async Task<IActionResult> GetMachineActivitiesByUser(
            string userCode,
            [FromQuery] DateTime? reportDate = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userCode))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Código de usuario requerido",
                        message = "Debe proporcionar un código de usuario válido"
                    });
                }

                var filter = new MachineActivityFilterDto
                {
                    UserCode = userCode.Trim(),
                    ReportDate = reportDate ?? DateTime.Now.Date
                };

                var report = await _reportsService.GetMachineActivitiesByUserAsync(filter);

                return Ok(new
                {
                    success = true,
                    data = report,
                    message = $"Reporte de máquinas generado para {userCode} - {filter.ReportDate:yyyy-MM-dd}"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo actividades de máquinas del usuario {UserCode}", userCode);
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }




        [HttpGet("machine-activities/backup/{backupId}")]
        public async Task<IActionResult> GetMachineActivitiesFromBackup(string backupId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(backupId))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "ID de backup requerido",
                        message = "Debe proporcionar un ID de backup válido"
                    });
                }

                var report = await _reportsService.GetMachineActivitiesFromBackupAsync(backupId);

                return Ok(new
                {
                    success = true,
                    data = report,
                    message = $"Reporte generado desde backup: {backupId}"
                });
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo actividades desde backup {BackupId}", backupId);
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }




        [HttpGet("users/list")]
        public async Task<IActionResult> GetUsersForReports()
        {
            try
            {
                var users = await _reportsService.GetUsersListAsync();

                return Ok(new
                {
                    success = true,
                    data = users,
                    message = $"Se encontraron {users.Count} usuarios"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo lista de usuarios");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }





        [HttpGet("test/recent-activities")]
        public async Task<IActionResult> GetRecentActivitiesTest()
        {
            try
            {
                _logger.LogInformation("🧪 TEST: Consultando actividades recientes");

                var activities = await _reportsService.GetRecentActivitiesTestAsync();

                return Ok(new
                {
                    success = true,
                    data = activities,
                    count = activities.Count,
                    message = $"Se encontraron {activities.Count} actividades recientes",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error en test de actividades recientes");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }




        [HttpGet("test/activities-stats")]
        public async Task<IActionResult> GetActivitiesStatsTest()
        {
            try
            {
                _logger.LogInformation("🧪 TEST: Consultando estadísticas de Activities");

                var stats = await _reportsService.GetActivitiesStatsTestAsync();

                return Ok(new
                {
                    success = true,
                    data = stats,
                    message = "Estadísticas de Activities obtenidas",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error en test de estadísticas");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }
}