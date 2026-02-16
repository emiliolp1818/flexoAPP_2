using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FlexoAPP.API.Services;
using System.Security.Claims;

namespace FlexoAPP.API.Controllers
{



    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ActivitiesController : ControllerBase
    {
        private readonly IActivityService _activityService;
        private readonly ILogger<ActivitiesController> _logger;

        public ActivitiesController(
            IActivityService activityService,
            ILogger<ActivitiesController> logger)
        {
            _activityService = activityService;
            _logger = logger;
        }





        [HttpGet("me")]
        public async Task<IActionResult> GetMyActivities([FromQuery] int limit = 50)
        {
            try
            {

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }

                var activities = await _activityService.GetUserActivitiesAsync(userId, limit);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo actividades del usuario");
                return StatusCode(500, new { message = "Error al obtener actividades", error = ex.Message });
            }
        }





        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserActivities(int userId, [FromQuery] int limit = 50)
        {
            try
            {
                var activities = await _activityService.GetUserActivitiesAsync(userId, limit);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo actividades del usuario {UserId}", userId);
                return StatusCode(500, new { message = "Error al obtener actividades", error = ex.Message });
            }
        }





        [HttpGet]
        public async Task<IActionResult> GetAllActivities([FromQuery] int limit = 100)
        {
            try
            {
                var activities = await _activityService.GetAllActivitiesAsync(limit);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo todas las actividades");
                return StatusCode(500, new { message = "Error al obtener actividades", error = ex.Message });
            }
        }





        [HttpPost]
        public async Task<IActionResult> LogActivity([FromBody] LogActivityRequest request)
        {
            try
            {

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }


                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

                var activity = await _activityService.LogActivityAsync(
                    userId,
                    request.Action,
                    request.Description,
                    request.Module,
                    request.Details,
                    ipAddress
                );

                return Ok(activity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registrando actividad");
                return StatusCode(500, new { message = "Error al registrar actividad", error = ex.Message });
            }
        }





        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivity(int id)
        {
            try
            {
                var result = await _activityService.DeleteActivityAsync(id);
                if (result)
                {
                    return Ok(new { message = "Actividad eliminada exitosamente" });
                }

                return NotFound(new { message = "Actividad no encontrada" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error eliminando actividad {ActivityId}", id);
                return StatusCode(500, new { message = "Error al eliminar actividad", error = ex.Message });
            }
        }
    }




    public class LogActivityRequest
    {
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public string? Details { get; set; }
    }
}
