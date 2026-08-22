





using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;
using FlexoAPP.API.Helpers;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace FlexoAPP.API.Services
{



    public interface IActivityLoggerService
    {



        Task LogActivityAsync(string action, string description, string module, string? details = null);




        Task LogActivityAsync(int userId, string userCode, string action, string description, string module, string? details = null, string? ipAddress = null);




        Task LogDetailedActivityAsync(
            string action,
            string description,
            string module,
            string? entityType = null,
            int? entityId = null,
            string? entityName = null,
            TimeSpan? duration = null,
            object? oldValues = null,
            object? newValues = null,
            string? details = null);
    }




    public class ActivityLoggerService : IActivityLoggerService
    {
        private readonly FlexoAPPDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<ActivityLoggerService> _logger;

        public ActivityLoggerService(
            FlexoAPPDbContext context,
            IHttpContextAccessor httpContextAccessor,
            ILogger<ActivityLoggerService> logger)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }




        public async Task LogActivityAsync(string action, string description, string module, string? details = null)
        {
            try
            {

                var httpContext = _httpContextAccessor.HttpContext;
                if (httpContext?.User?.Identity?.IsAuthenticated != true)
                {
                    _logger.LogWarning("Intento de registrar actividad sin usuario autenticado");
                    return;
                }


                var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userCodeClaim = httpContext.User.FindFirst("userCode")?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    _logger.LogWarning("No se pudo obtener el ID del usuario del token");
                    return;
                }


                var ipAddress = GetClientIpAddress(httpContext);


                await LogActivityAsync(userId, userCodeClaim ?? "unknown", action, description, module, details, ipAddress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar actividad: {Action} - {Module}", action, module);
            }
        }




        public async Task LogActivityAsync(
            int userId,
            string userCode,
            string action,
            string description,
            string module,
            string? details = null,
            string? ipAddress = null)
        {
            try
            {

                var activity = new Activity
                {
                    UserId = userId,
                    UserCode = userCode,
                    Action = action,
                    Description = description,
                    Module = module,
                    Details = details,
                    Timestamp = DateTimeHelper.Now,
                    IpAddress = ipAddress
                };


                _context.Activities.Add(activity);
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "Actividad registrada: Usuario={UserCode}, Acción={Action}, Módulo={Module}",
                    userCode, action, module);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error al guardar actividad en BD: Usuario={UserCode}, Acción={Action}, Módulo={Module}",
                    userCode, action, module);
            }
        }




        public async Task LogDetailedActivityAsync(
            string action,
            string description,
            string module,
            string? entityType = null,
            int? entityId = null,
            string? entityName = null,
            TimeSpan? duration = null,
            object? oldValues = null,
            object? newValues = null,
            string? details = null)
        {
            try
            {

                var httpContext = _httpContextAccessor.HttpContext;
                if (httpContext?.User?.Identity?.IsAuthenticated != true)
                {
                    _logger.LogWarning("Intento de registrar actividad sin usuario autenticado");
                    return;
                }


                var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userCodeClaim = httpContext.User.FindFirst("userCode")?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    _logger.LogWarning("No se pudo obtener el ID del usuario del token");
                    return;
                }


                var ipAddress = GetClientIpAddress(httpContext);


                string? oldValuesJson = oldValues != null ? System.Text.Json.JsonSerializer.Serialize(oldValues) : null;
                string? newValuesJson = newValues != null ? System.Text.Json.JsonSerializer.Serialize(newValues) : null;


                var activity = new Activity
                {
                    UserId = userId,
                    UserCode = userCodeClaim ?? "unknown",
                    Action = action,
                    Description = description,
                    Module = module,
                    Details = details,
                    Timestamp = DateTimeHelper.Now,
                    IpAddress = ipAddress,
                    EntityType = entityType,
                    EntityId = entityId,
                    EntityName = entityName,
                    Duration = duration,
                    OldValues = oldValuesJson,
                    NewValues = newValuesJson
                };


                _context.Activities.Add(activity);
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "Actividad detallada registrada: Usuario={UserCode}, Acción={Action}, Módulo={Module}, Entidad={EntityType}/{EntityId}",
                    userCodeClaim, action, module, entityType, entityId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error al guardar actividad detallada en BD: Acción={Action}, Módulo={Module}",
                    action, module);
            }
        }




        private string? GetClientIpAddress(HttpContext httpContext)
        {
            try
            {

                var forwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
                if (!string.IsNullOrEmpty(forwardedFor))
                {

                    return forwardedFor.Split(',')[0].Trim();
                }

                var realIp = httpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
                if (!string.IsNullOrEmpty(realIp))
                {
                    return realIp;
                }


                return httpContext.Connection.RemoteIpAddress?.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al obtener dirección IP del cliente");
                return null;
            }
        }
    }
}
