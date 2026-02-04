using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;
using FlexoAPP.API.Services;

namespace FlexoAPP.API.Controllers
{
    /// <summary>
    /// Controlador para consultar auditoría y reportes de actividades del sistema
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AuditController : ControllerBase
    {
        private readonly FlexoAPPDbContext _context;
        private readonly IActivityLoggerService _activityLogger;
        private readonly ILogger<AuditController> _logger;

        public AuditController(
            FlexoAPPDbContext context,
            IActivityLoggerService activityLogger,
            ILogger<AuditController> logger)
        {
            _context = context;
            _activityLogger = activityLogger;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene todas las actividades con filtros opcionales
        /// </summary>
        [HttpGet("activities")]
        public async Task<IActionResult> GetActivities(
            [FromQuery] int? userId = null,
            [FromQuery] string? module = null,
            [FromQuery] string? action = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                // Log de parámetros recibidos
                _logger.LogInformation($"🔍 GetActivities llamado con parámetros: userId={userId}, module={module}, action={action}, startDate={startDate}, endDate={endDate}");
                
                // Registrar consulta de auditoría
                await _activityLogger.LogActivityAsync(
                    "VIEW_AUDIT",
                    "Consulta de auditoría del sistema",
                    "REPORTS",
                    $"{{\"filters\":{{\"userId\":{userId},\"module\":\"{module}\",\"action\":\"{action}\"}}}}"
                );

                var query = _context.Activities
                    .Include(a => a.User)
                    .AsQueryable();

                // Aplicar filtros
                if (userId.HasValue)
                {
                    _logger.LogInformation($"✅ Aplicando filtro de userId: {userId.Value}");
                    query = query.Where(a => a.UserId == userId.Value);
                }

                if (!string.IsNullOrEmpty(module))
                {
                    _logger.LogInformation($"✅ Aplicando filtro de module: {module}");
                    query = query.Where(a => a.Module == module);
                }

                if (!string.IsNullOrEmpty(action))
                {
                    _logger.LogInformation($"✅ Aplicando filtro de action: {action}");
                    query = query.Where(a => a.Action == action);
                }

                if (startDate.HasValue)
                {
                    _logger.LogInformation($"✅ Aplicando filtro de startDate: {startDate.Value}");
                    query = query.Where(a => a.Timestamp >= startDate.Value);
                }

                if (endDate.HasValue)
                {
                    _logger.LogInformation($"✅ Aplicando filtro de endDate: {endDate.Value}");
                    query = query.Where(a => a.Timestamp <= endDate.Value);
                }

                // Ordenar por fecha descendente
                query = query.OrderByDescending(a => a.Timestamp);

                // Contar total de registros
                var totalRecords = await query.CountAsync();
                _logger.LogInformation($"📊 Total de registros después de filtros: {totalRecords}");

                // Aplicar paginación
                var activities = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(a => new
                    {
                        a.Id,
                        a.Action,
                        a.Description,
                        a.Timestamp,
                        a.Module,
                        a.Details,
                        a.UserId,
                        a.UserCode,
                        a.IpAddress,
                        a.EntityType,
                        a.EntityId,
                        a.EntityName,
                        a.Duration,
                        a.OldValues,
                        a.NewValues,
                        User = a.User != null ? new
                        {
                            a.User.Id,
                            a.User.UserCode,
                            a.User.FirstName,
                            a.User.LastName,
                            FullName = $"{a.User.FirstName} {a.User.LastName}"
                        } : null
                    })
                    .ToListAsync();

                _logger.LogInformation($"📤 Enviando {activities.Count} actividades al frontend");
                
                // Verificar si todas las actividades son del usuario correcto
                if (userId.HasValue && activities.Any())
                {
                    var wrongUserActivities = activities.Where(a => a.UserId != userId.Value).ToList();
                    if (wrongUserActivities.Any())
                    {
                        _logger.LogError($"❌ ERROR: Se encontraron {wrongUserActivities.Count} actividades de otros usuarios!");
                        foreach (var wrongActivity in wrongUserActivities.Take(3))
                        {
                            _logger.LogError($"   - Actividad ID: {wrongActivity.Id}, UserId: {wrongActivity.UserId}, UserCode: {wrongActivity.UserCode}");
                        }
                    }
                    else
                    {
                        _logger.LogInformation($"✅ Todas las actividades son del usuario {userId.Value}");
                    }
                }

                return Ok(new
                {
                    totalRecords,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize),
                    activities
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener actividades de auditoría");
                return StatusCode(500, new { message = "Error al obtener actividades", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene actividades de autenticación (login/logout)
        /// </summary>
        [HttpGet("auth-activities")]
        public async Task<IActionResult> GetAuthActivities(
            [FromQuery] int? userId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var query = _context.Activities
                    .Include(a => a.User)
                    .Where(a => a.Module == "AUTH")
                    .AsQueryable();

                if (userId.HasValue)
                    query = query.Where(a => a.UserId == userId.Value);

                if (startDate.HasValue)
                    query = query.Where(a => a.Timestamp >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(a => a.Timestamp <= endDate.Value);

                var activities = await query
                    .OrderByDescending(a => a.Timestamp)
                    .Select(a => new
                    {
                        a.Id,
                        a.Action,
                        a.Description,
                        a.Timestamp,
                        a.UserId,
                        a.UserCode,
                        a.IpAddress,
                        a.Details,
                        User = a.User != null ? new
                        {
                            a.User.UserCode,
                            FullName = $"{a.User.FirstName} {a.User.LastName}"
                        } : null
                    })
                    .ToListAsync();

                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener actividades de autenticación");
                return StatusCode(500, new { message = "Error al obtener actividades", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene actividades de perfil (cambios de foto, nombre, contraseña)
        /// </summary>
        [HttpGet("profile-activities")]
        public async Task<IActionResult> GetProfileActivities(
            [FromQuery] int? userId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var query = _context.Activities
                    .Include(a => a.User)
                    .Where(a => a.Module == "PROFILE")
                    .AsQueryable();

                if (userId.HasValue)
                    query = query.Where(a => a.UserId == userId.Value);

                if (startDate.HasValue)
                    query = query.Where(a => a.Timestamp >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(a => a.Timestamp <= endDate.Value);

                var activities = await query
                    .OrderByDescending(a => a.Timestamp)
                    .Select(a => new
                    {
                        a.Id,
                        a.Action,
                        a.Description,
                        a.Timestamp,
                        a.UserId,
                        a.UserCode,
                        a.Details,
                        a.OldValues,
                        a.NewValues,
                        User = a.User != null ? new
                        {
                            a.User.UserCode,
                            FullName = $"{a.User.FirstName} {a.User.LastName}"
                        } : null
                    })
                    .ToListAsync();

                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener actividades de perfil");
                return StatusCode(500, new { message = "Error al obtener actividades", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene actividades de máquinas (cambios de estado, tiempos)
        /// </summary>
        [HttpGet("machine-activities")]
        public async Task<IActionResult> GetMachineActivities(
            [FromQuery] int? machineId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var query = _context.Activities
                    .Include(a => a.User)
                    .Where(a => a.Module == "MACHINES" && a.EntityType == "Maquina")
                    .AsQueryable();

                if (machineId.HasValue)
                    query = query.Where(a => a.EntityId == machineId.Value);

                if (startDate.HasValue)
                    query = query.Where(a => a.Timestamp >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(a => a.Timestamp <= endDate.Value);

                var activities = await query
                    .OrderByDescending(a => a.Timestamp)
                    .Select(a => new
                    {
                        a.Id,
                        a.Action,
                        a.Description,
                        a.Timestamp,
                        a.EntityId,
                        a.EntityName,
                        a.Duration,
                        a.Details,
                        a.UserId,
                        a.UserCode,
                        User = a.User != null ? new
                        {
                            a.User.UserCode,
                            FullName = $"{a.User.FirstName} {a.User.LastName}"
                        } : null
                    })
                    .ToListAsync();

                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener actividades de máquinas");
                return StatusCode(500, new { message = "Error al obtener actividades", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene actividades de diseños (creación, modificación, eliminación)
        /// </summary>
        [HttpGet("design-activities")]
        public async Task<IActionResult> GetDesignActivities(
            [FromQuery] int? designId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var query = _context.Activities
                    .Include(a => a.User)
                    .Where(a => a.Module == "DESIGNS" && a.EntityType == "Design")
                    .AsQueryable();

                if (designId.HasValue)
                    query = query.Where(a => a.EntityId == designId.Value);

                if (startDate.HasValue)
                    query = query.Where(a => a.Timestamp >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(a => a.Timestamp <= endDate.Value);

                var activities = await query
                    .OrderByDescending(a => a.Timestamp)
                    .Select(a => new
                    {
                        a.Id,
                        a.Action,
                        a.Description,
                        a.Timestamp,
                        a.EntityId,
                        a.EntityName,
                        a.Details,
                        a.OldValues,
                        a.NewValues,
                        a.UserId,
                        a.UserCode,
                        User = a.User != null ? new
                        {
                            a.User.UserCode,
                            FullName = $"{a.User.FirstName} {a.User.LastName}"
                        } : null
                    })
                    .ToListAsync();

                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener actividades de diseños");
                return StatusCode(500, new { message = "Error al obtener actividades", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene actividades de reportes (consultas realizadas)
        /// </summary>
        [HttpGet("report-activities")]
        public async Task<IActionResult> GetReportActivities(
            [FromQuery] int? userId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var query = _context.Activities
                    .Include(a => a.User)
                    .Where(a => a.Module == "REPORTS")
                    .AsQueryable();

                if (userId.HasValue)
                    query = query.Where(a => a.UserId == userId.Value);

                if (startDate.HasValue)
                    query = query.Where(a => a.Timestamp >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(a => a.Timestamp <= endDate.Value);

                var activities = await query
                    .OrderByDescending(a => a.Timestamp)
                    .Select(a => new
                    {
                        a.Id,
                        a.Action,
                        a.Description,
                        a.Timestamp,
                        a.Details,
                        a.UserId,
                        a.UserCode,
                        User = a.User != null ? new
                        {
                            a.User.UserCode,
                            FullName = $"{a.User.FirstName} {a.User.LastName}"
                        } : null
                    })
                    .ToListAsync();

                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener actividades de reportes");
                return StatusCode(500, new { message = "Error al obtener actividades", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene actividades de configuración (cambios de ajustes, usuarios, etc.)
        /// </summary>
        [HttpGet("config-activities")]
        public async Task<IActionResult> GetConfigActivities(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var query = _context.Activities
                    .Include(a => a.User)
                    .Where(a => a.Module == "CONFIG" || a.Module == "SETTINGS")
                    .AsQueryable();

                if (startDate.HasValue)
                    query = query.Where(a => a.Timestamp >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(a => a.Timestamp <= endDate.Value);

                var activities = await query
                    .OrderByDescending(a => a.Timestamp)
                    .Select(a => new
                    {
                        a.Id,
                        a.Action,
                        a.Description,
                        a.Timestamp,
                        a.Details,
                        a.OldValues,
                        a.NewValues,
                        a.UserId,
                        a.UserCode,
                        User = a.User != null ? new
                        {
                            a.User.UserCode,
                            FullName = $"{a.User.FirstName} {a.User.LastName}"
                        } : null
                    })
                    .ToListAsync();

                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener actividades de configuración");
                return StatusCode(500, new { message = "Error al obtener actividades", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene estadísticas de actividades por módulo
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetActivityStats(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var query = _context.Activities.AsQueryable();

                if (startDate.HasValue)
                    query = query.Where(a => a.Timestamp >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(a => a.Timestamp <= endDate.Value);

                var stats = new
                {
                    totalActivities = await query.CountAsync(),
                    byModule = await query
                        .GroupBy(a => a.Module)
                        .Select(g => new { module = g.Key, count = g.Count() })
                        .ToListAsync(),
                    byAction = await query
                        .GroupBy(a => a.Action)
                        .Select(g => new { action = g.Key, count = g.Count() })
                        .OrderByDescending(x => x.count)
                        .Take(10)
                        .ToListAsync(),
                    byUser = await query
                        .GroupBy(a => new { a.UserId, a.UserCode })
                        .Select(g => new { userId = g.Key.UserId, userCode = g.Key.UserCode, count = g.Count() })
                        .OrderByDescending(x => x.count)
                        .Take(10)
                        .ToListAsync(),
                    recentActivities = await query
                        .OrderByDescending(a => a.Timestamp)
                        .Take(10)
                        .Select(a => new
                        {
                            a.Action,
                            a.Description,
                            a.Timestamp,
                            a.Module,
                            a.UserCode
                        })
                        .ToListAsync()
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas de actividades");
                return StatusCode(500, new { message = "Error al obtener estadísticas", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene el historial completo de una entidad específica
        /// </summary>
        [HttpGet("entity-history")]
        public async Task<IActionResult> GetEntityHistory(
            [FromQuery] string entityType,
            [FromQuery] int entityId)
        {
            try
            {
                if (string.IsNullOrEmpty(entityType))
                    return BadRequest(new { message = "EntityType es requerido" });

                var activities = await _context.Activities
                    .Include(a => a.User)
                    .Where(a => a.EntityType == entityType && a.EntityId == entityId)
                    .OrderByDescending(a => a.Timestamp)
                    .Select(a => new
                    {
                        a.Id,
                        a.Action,
                        a.Description,
                        a.Timestamp,
                        a.Details,
                        a.OldValues,
                        a.NewValues,
                        a.Duration,
                        a.UserId,
                        a.UserCode,
                        User = a.User != null ? new
                        {
                            a.User.UserCode,
                            FullName = $"{a.User.FirstName} {a.User.LastName}"
                        } : null
                    })
                    .ToListAsync();

                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener historial de entidad");
                return StatusCode(500, new { message = "Error al obtener historial", error = ex.Message });
            }
        }
    }
}
