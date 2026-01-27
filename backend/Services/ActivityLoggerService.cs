// ============================================================================
// SERVICIO DE REGISTRO DE ACTIVIDADES
// ============================================================================
// Este servicio registra automáticamente todas las actividades de los usuarios
// en la tabla Activities para generar reportes y auditoría

using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace FlexoAPP.API.Services
{
    /// <summary>
    /// Servicio para registrar actividades de usuarios automáticamente
    /// </summary>
    public interface IActivityLoggerService
    {
        /// <summary>
        /// Registra una actividad de usuario
        /// </summary>
        Task LogActivityAsync(string action, string description, string module, string? details = null);
        
        /// <summary>
        /// Registra una actividad con información completa
        /// </summary>
        Task LogActivityAsync(int userId, string userCode, string action, string description, string module, string? details = null, string? ipAddress = null);
        
        /// <summary>
        /// Registra una actividad con información detallada de auditoría
        /// </summary>
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

    /// <summary>
    /// Implementación del servicio de registro de actividades
    /// </summary>
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

        /// <summary>
        /// Registra una actividad usando el usuario del contexto HTTP actual
        /// </summary>
        public async Task LogActivityAsync(string action, string description, string module, string? details = null)
        {
            try
            {
                // Obtener información del usuario del contexto HTTP
                var httpContext = _httpContextAccessor.HttpContext;
                if (httpContext?.User?.Identity?.IsAuthenticated != true)
                {
                    _logger.LogWarning("Intento de registrar actividad sin usuario autenticado");
                    return;
                }

                // Extraer información del usuario del token JWT
                var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userCodeClaim = httpContext.User.FindFirst("userCode")?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    _logger.LogWarning("No se pudo obtener el ID del usuario del token");
                    return;
                }

                // Obtener dirección IP del cliente
                var ipAddress = GetClientIpAddress(httpContext);

                // Registrar la actividad
                await LogActivityAsync(userId, userCodeClaim ?? "unknown", action, description, module, details, ipAddress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar actividad: {Action} - {Module}", action, module);
            }
        }

        /// <summary>
        /// Registra una actividad con información completa del usuario
        /// </summary>
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
                // Crear registro de actividad
                var activity = new Activity
                {
                    UserId = userId,
                    UserCode = userCode,
                    Action = action,
                    Description = description,
                    Module = module,
                    Details = details,
                    Timestamp = DateTime.Now,
                    IpAddress = ipAddress
                };

                // Guardar en la base de datos
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

        /// <summary>
        /// Registra una actividad con información detallada de auditoría
        /// </summary>
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
                // Obtener información del usuario del contexto HTTP
                var httpContext = _httpContextAccessor.HttpContext;
                if (httpContext?.User?.Identity?.IsAuthenticated != true)
                {
                    _logger.LogWarning("Intento de registrar actividad sin usuario autenticado");
                    return;
                }

                // Extraer información del usuario del token JWT
                var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userCodeClaim = httpContext.User.FindFirst("userCode")?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    _logger.LogWarning("No se pudo obtener el ID del usuario del token");
                    return;
                }

                // Obtener dirección IP del cliente
                var ipAddress = GetClientIpAddress(httpContext);

                // Serializar valores antiguos y nuevos a JSON
                string? oldValuesJson = oldValues != null ? System.Text.Json.JsonSerializer.Serialize(oldValues) : null;
                string? newValuesJson = newValues != null ? System.Text.Json.JsonSerializer.Serialize(newValues) : null;

                // Crear registro de actividad detallado
                var activity = new Activity
                {
                    UserId = userId,
                    UserCode = userCodeClaim ?? "unknown",
                    Action = action,
                    Description = description,
                    Module = module,
                    Details = details,
                    Timestamp = DateTime.Now,
                    IpAddress = ipAddress,
                    EntityType = entityType,
                    EntityId = entityId,
                    EntityName = entityName,
                    Duration = duration,
                    OldValues = oldValuesJson,
                    NewValues = newValuesJson
                };

                // Guardar en la base de datos
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

        /// <summary>
        /// Obtiene la dirección IP del cliente desde el contexto HTTP
        /// </summary>
        private string? GetClientIpAddress(HttpContext httpContext)
        {
            try
            {
                // Intentar obtener IP de headers de proxy (X-Forwarded-For, X-Real-IP)
                var forwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
                if (!string.IsNullOrEmpty(forwardedFor))
                {
                    // X-Forwarded-For puede contener múltiples IPs, tomar la primera
                    return forwardedFor.Split(',')[0].Trim();
                }

                var realIp = httpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
                if (!string.IsNullOrEmpty(realIp))
                {
                    return realIp;
                }

                // Si no hay headers de proxy, usar la IP de conexión directa
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
