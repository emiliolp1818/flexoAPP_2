using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Permissions;
using FlexoAPP.API.Attributes;
using System.Text.Json;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/permissions")]
    [Authorize]
    public class PermissionsController : ControllerBase
    {
        private readonly FlexoAPPDbContext _context;
        private readonly ILogger<PermissionsController> _logger;

        public PermissionsController(FlexoAPPDbContext context, ILogger<PermissionsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todos los permisos disponibles
        /// GET: api/permissions
        /// </summary>
        [HttpGet]
        [RequirePermission(Permission.ViewUsers)]
        public IActionResult GetAllPermissions()
        {
            try
            {
                var permissions = Permission.GetAllPermissions();
                
                var permissionsWithDetails = permissions.Select(p => new
                {
                    id = p,
                    name = Permission.GetPermissionDescription(p),
                    category = Permission.GetPermissionCategory(p)
                }).GroupBy(p => p.category)
                .Select(g => new
                {
                    category = g.Key,
                    permissions = g.ToList()
                });

                return Ok(permissionsWithDetails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo permisos");
                return StatusCode(500, new { message = "Error al obtener permisos" });
            }
        }

        /// <summary>
        /// Obtener permisos de un usuario específico
        /// GET: api/permissions/user/{userId}
        /// </summary>
        [HttpGet("user/{userId}")]
        [RequirePermission(Permission.ViewUsers)]
        public async Task<IActionResult> GetUserPermissions(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                List<string> permissions;
                if (!string.IsNullOrEmpty(user.Permissions))
                {
                    try
                    {
                        permissions = JsonSerializer.Deserialize<List<string>>(user.Permissions) ?? new List<string>();
                    }
                    catch
                    {
                        permissions = new List<string>();
                    }
                }
                else
                {
                    // Si no tiene permisos, usar los permisos por defecto del rol
                    permissions = Permission.GetDefaultPermissionsByRole(user.Role.ToString());
                }

                return Ok(new
                {
                    userId = user.Id,
                    userCode = user.UserCode,
                    role = user.Role.ToString(),
                    permissions = permissions.Select(p => new
                    {
                        id = p,
                        name = Permission.GetPermissionDescription(p),
                        category = Permission.GetPermissionCategory(p)
                    })
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo permisos del usuario {UserId}", userId);
                return StatusCode(500, new { message = "Error al obtener permisos del usuario" });
            }
        }

        /// <summary>
        /// Actualizar permisos de un usuario
        /// PUT: api/permissions/user/{userId}
        /// </summary>
        [HttpPut("user/{userId}")]
        [RequirePermission(Permission.ManagePermissions)]
        public async Task<IActionResult> UpdateUserPermissions(int userId, [FromBody] UpdatePermissionsRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                // Validar que los permisos existen
                var allPermissions = Permission.GetAllPermissions();
                var invalidPermissions = request.Permissions.Where(p => !allPermissions.Contains(p)).ToList();
                
                if (invalidPermissions.Any())
                {
                    return BadRequest(new
                    {
                        message = "Permisos inválidos",
                        invalidPermissions = invalidPermissions
                    });
                }

                // Actualizar permisos
                user.Permissions = JsonSerializer.Serialize(request.Permissions);
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Permisos actualizados para usuario {UserCode}: {Permissions}", 
                    user.UserCode, string.Join(", ", request.Permissions));

                return Ok(new
                {
                    message = "Permisos actualizados correctamente",
                    userId = user.Id,
                    permissions = request.Permissions
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error actualizando permisos del usuario {UserId}", userId);
                return StatusCode(500, new { message = "Error al actualizar permisos" });
            }
        }

        /// <summary>
        /// Restablecer permisos de un usuario a los valores por defecto de su rol
        /// POST: api/permissions/user/{userId}/reset
        /// </summary>
        [HttpPost("user/{userId}/reset")]
        [RequirePermission(Permission.ManagePermissions)]
        public async Task<IActionResult> ResetUserPermissions(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                // Obtener permisos por defecto del rol
                var defaultPermissions = Permission.GetDefaultPermissionsByRole(user.Role.ToString());
                
                // Actualizar permisos
                user.Permissions = JsonSerializer.Serialize(defaultPermissions);
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Permisos restablecidos para usuario {UserCode} al rol {Role}", 
                    user.UserCode, user.Role);

                return Ok(new
                {
                    message = "Permisos restablecidos a los valores por defecto del rol",
                    userId = user.Id,
                    role = user.Role.ToString(),
                    permissions = defaultPermissions
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restableciendo permisos del usuario {UserId}", userId);
                return StatusCode(500, new { message = "Error al restablecer permisos" });
            }
        }

        /// <summary>
        /// Verificar si un usuario tiene un permiso específico
        /// GET: api/permissions/user/{userId}/check/{permission}
        /// </summary>
        [HttpGet("user/{userId}/check/{permission}")]
        public async Task<IActionResult> CheckUserPermission(int userId, string permission)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                // Admin tiene todos los permisos
                if (user.Role.ToString().ToLower() == "admin")
                {
                    return Ok(new { hasPermission = true, reason = "Usuario administrador" });
                }

                List<string> permissions;
                if (!string.IsNullOrEmpty(user.Permissions))
                {
                    try
                    {
                        permissions = JsonSerializer.Deserialize<List<string>>(user.Permissions) ?? new List<string>();
                    }
                    catch
                    {
                        permissions = Permission.GetDefaultPermissionsByRole(user.Role.ToString());
                    }
                }
                else
                {
                    permissions = Permission.GetDefaultPermissionsByRole(user.Role.ToString());
                }

                var hasPermission = permissions.Contains(permission);

                return Ok(new
                {
                    hasPermission = hasPermission,
                    permission = permission,
                    permissionName = Permission.GetPermissionDescription(permission)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verificando permiso {Permission} del usuario {UserId}", permission, userId);
                return StatusCode(500, new { message = "Error al verificar permiso" });
            }
        }
    }

    public class UpdatePermissionsRequest
    {
        public List<string> Permissions { get; set; } = new List<string>();
    }
}
