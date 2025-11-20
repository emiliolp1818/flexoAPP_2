using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FlexoAPP.API.Models.DTOs;
using FlexoAPP.API.Services;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ActivitiesController : ControllerBase
    {
        private readonly IActivityService _activityService;

        public ActivitiesController(IActivityService activityService)
        {
            _activityService = activityService;
        }

        [HttpGet("my-activities")]
        public async Task<IActionResult> GetMyActivities([FromQuery] int limit = 50)
        {
            try
            {
                // Get user ID from JWT token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }

                var activities = await _activityService.GetUserActivitiesAsync(userId, limit);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetMyActivities error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("test-activities/{userId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTestActivities(int userId, [FromQuery] int limit = 50)
        {
            try
            {
                var activities = await _activityService.GetUserActivitiesAsync(userId, limit);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetTestActivities error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllActivities([FromQuery] int limit = 100)
        {
            try
            {
                // Only admins can see all activities
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "Admin")
                {
                    return Forbid("Solo los administradores pueden ver todas las actividades");
                }

                var activities = await _activityService.GetAllActivitiesAsync(limit);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetAllActivities error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost("log")]
        public async Task<IActionResult> LogActivity([FromBody] CreateActivityDto createActivityDto)
        {
            try
            {
                if (createActivityDto == null)
                {
                    return BadRequest(new { message = "Datos de actividad requeridos" });
                }

                // Get user ID from JWT token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }

                // Get IP address
                var ipAddress = GetClientIpAddress();

                var activity = await _activityService.LogActivityAsync(
                    userId,
                    createActivityDto.Action,
                    createActivityDto.Description,
                    createActivityDto.Module,
                    createActivityDto.Details,
                    ipAddress
                );

                return Ok(activity);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"LogActivity error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivity(int id)
        {
            try
            {
                // Only admins can delete activities
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "Admin")
                {
                    return Forbid("Solo los administradores pueden eliminar actividades");
                }

                var result = await _activityService.DeleteActivityAsync(id);
                if (result)
                {
                    return Ok(new { message = "Actividad eliminada exitosamente" });
                }

                return NotFound(new { message = "Actividad no encontrada" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DeleteActivity error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        private string GetClientIpAddress()
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            
            // Check for forwarded IP (in case of proxy/load balancer)
            if (HttpContext.Request.Headers.ContainsKey("X-Forwarded-For"))
            {
                ipAddress = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            }
            else if (HttpContext.Request.Headers.ContainsKey("X-Real-IP"))
            {
                ipAddress = HttpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
            }

            return ipAddress ?? "Unknown";
        }
    }
}