using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
        /// Obtener todos los permisos del sistema
        /// GET: api/permissions
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Permission>>> GetAllPermissions()
        {
            try
            {
                var permissions = await _context.Permissions
                    .Where(p => p.IsActive)
                    .OrderBy(p => p.Category)
                    .ThenBy(p => p.Name)
                    .ToListAsync();

                _logger.LogInformation($"📋 {permissions.Count} permisos obtenidos");
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error obteniendo permisos");
                return StatusCode(500, new { message = "Error al obtener permisos", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener permisos por categoría
        /// GET: api/permissions/category/{category}
        /// </summary>
        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<Permission>>> GetPermissionsByCategory(string category)
        {
            try
            {
                var permissions = await _context.Permissions
                    .Where(p => p.Category == category && p.IsActive)
                    .OrderBy(p => p.Name)
                    .ToListAsync();

                _logger.LogInformation($"📋 {permissions.Count} permisos obtenidos para categoría '{category}'");
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error obteniendo permisos de categoría '{category}'");
                return StatusCode(500, new { message = "Error al obtener permisos", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener permisos de un usuario específico
        /// GET: api/permissions/user/{userId}
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<ActionResult> GetUserPermissions(int userId)
        {
            try
            {
                // Verificar que el usuario existe
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = $"Usuario con ID {userId} no encontrado" });
                }

                // Obtener todos los permisos del sistema
                var allPermissions = await _context.Permissions
                    .Where(p => p.IsActive)
                    .OrderBy(p => p.Category)
                    .ThenBy(p => p.Name)
                    .ToListAsync();

                // Obtener permisos concedidos al usuario
                var userPermissions = await _context.UserPermissions
                    .Where(up => up.UserId == userId && up.IsGranted)
                    .Select(up => up.PermissionCode)
                    .ToListAsync();

                _logger.LogInformation($"👤 Usuario {userId}: {userPermissions.Count}/{allPermissions.Count} permisos concedidos");

                return Ok(new
                {
                    userId = userId,
                    userCode = user.UserCode,
                    userName = $"{user.FirstName} {user.LastName}",
                    role = user.Role,
                    permissions = userPermissions,
                    allPermissions = allPermissions,
                    grantedCount = userPermissions.Count,
                    totalCount = allPermissions.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error obteniendo permisos del usuario {userId}");
                return StatusCode(500, new { message = "Error al obtener permisos del usuario", error = ex.Message });
            }
        }

        /// <summary>
        /// Actualizar permiso de un usuario
        /// PUT: api/permissions/user/{userId}
        /// </summary>
        [HttpPut("user/{userId}")]
        public async Task<ActionResult> UpdateUserPermission(int userId, [FromBody] UpdatePermissionRequest request)
        {
            try
            {
                _logger.LogInformation($"🔧 Actualizando permiso '{request.PermissionCode}' para usuario {userId}: {request.IsGranted}");

                // Verificar que el usuario existe
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = $"Usuario con ID {userId} no encontrado" });
                }

                // Verificar que el permiso existe
                var permission = await _context.Permissions
                    .FirstOrDefaultAsync(p => p.Code == request.PermissionCode);
                
                if (permission == null)
                {
                    return NotFound(new { message = $"Permiso '{request.PermissionCode}' no encontrado" });
                }

                // Buscar si ya existe el registro de permiso del usuario
                var userPermission = await _context.UserPermissions
                    .FirstOrDefaultAsync(up => up.UserId == userId && up.PermissionCode == request.PermissionCode);

                if (userPermission == null)
                {
                    // Crear nuevo registro
                    userPermission = new UserPermission
                    {
                        UserId = userId,
                        PermissionCode = request.PermissionCode,
                        IsGranted = request.IsGranted,
                        GrantedAt = DateTime.Now,
                        GrantedBy = request.GrantedBy,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    };
                    _context.UserPermissions.Add(userPermission);
                    _logger.LogInformation($"➕ Creando nuevo permiso para usuario {userId}");
                }
                else
                {
                    // Actualizar registro existente
                    userPermission.IsGranted = request.IsGranted;
                    userPermission.GrantedAt = DateTime.Now;
                    userPermission.GrantedBy = request.GrantedBy;
                    userPermission.UpdatedAt = DateTime.Now;
                    _logger.LogInformation($"🔄 Actualizando permiso existente para usuario {userId}");
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ Permiso '{request.PermissionCode}' {(request.IsGranted ? "concedido" : "revocado")} para usuario {userId}");

                return Ok(new
                {
                    message = $"Permiso '{permission.Name}' {(request.IsGranted ? "concedido" : "revocado")} exitosamente",
                    userId = userId,
                    permissionCode = request.PermissionCode,
                    isGranted = request.IsGranted,
                    updatedAt = userPermission.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error actualizando permiso del usuario {userId}");
                return StatusCode(500, new { message = "Error al actualizar permiso", error = ex.Message });
            }
        }

        /// <summary>
        /// Verificar si un usuario tiene un permiso específico
        /// GET: api/permissions/user/{userId}/check/{permissionCode}
        /// </summary>
        [HttpGet("user/{userId}/check/{permissionCode}")]
        public async Task<ActionResult> CheckUserPermission(int userId, string permissionCode)
        {
            try
            {
                var hasPermission = await _context.UserPermissions
                    .AnyAsync(up => up.UserId == userId && 
                                   up.PermissionCode == permissionCode && 
                                   up.IsGranted);

                return Ok(new
                {
                    userId = userId,
                    permissionCode = permissionCode,
                    hasPermission = hasPermission
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error verificando permiso del usuario {userId}");
                return StatusCode(500, new { message = "Error al verificar permiso", error = ex.Message });
            }
        }

        /// <summary>
        /// Conceder todos los permisos a un usuario (útil para admins)
        /// POST: api/permissions/user/{userId}/grant-all
        /// </summary>
        [HttpPost("user/{userId}/grant-all")]
        public async Task<ActionResult> GrantAllPermissions(int userId, [FromBody] GrantAllRequest request)
        {
            try
            {
                _logger.LogInformation($"🔓 Concediendo todos los permisos al usuario {userId}");

                // Verificar que el usuario existe
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = $"Usuario con ID {userId} no encontrado" });
                }

                // Obtener todos los permisos activos
                var allPermissions = await _context.Permissions
                    .Where(p => p.IsActive)
                    .ToListAsync();

                int granted = 0;
                foreach (var permission in allPermissions)
                {
                    var userPermission = await _context.UserPermissions
                        .FirstOrDefaultAsync(up => up.UserId == userId && up.PermissionCode == permission.Code);

                    if (userPermission == null)
                    {
                        _context.UserPermissions.Add(new UserPermission
                        {
                            UserId = userId,
                            PermissionCode = permission.Code,
                            IsGranted = true,
                            GrantedAt = DateTime.Now,
                            GrantedBy = request.GrantedBy,
                            CreatedAt = DateTime.Now,
                            UpdatedAt = DateTime.Now
                        });
                        granted++;
                    }
                    else if (!userPermission.IsGranted)
                    {
                        userPermission.IsGranted = true;
                        userPermission.GrantedAt = DateTime.Now;
                        userPermission.GrantedBy = request.GrantedBy;
                        userPermission.UpdatedAt = DateTime.Now;
                        granted++;
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ {granted} permisos concedidos al usuario {userId}");

                return Ok(new
                {
                    message = $"Todos los permisos concedidos exitosamente",
                    userId = userId,
                    totalPermissions = allPermissions.Count,
                    grantedPermissions = granted
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error concediendo todos los permisos al usuario {userId}");
                return StatusCode(500, new { message = "Error al conceder permisos", error = ex.Message });
            }
        }

        /// <summary>
        /// Revocar todos los permisos de un usuario
        /// POST: api/permissions/user/{userId}/revoke-all
        /// </summary>
        [HttpPost("user/{userId}/revoke-all")]
        public async Task<ActionResult> RevokeAllPermissions(int userId)
        {
            try
            {
                _logger.LogInformation($"🔒 Revocando todos los permisos del usuario {userId}");

                var userPermissions = await _context.UserPermissions
                    .Where(up => up.UserId == userId && up.IsGranted)
                    .ToListAsync();

                foreach (var up in userPermissions)
                {
                    up.IsGranted = false;
                    up.UpdatedAt = DateTime.Now;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ {userPermissions.Count} permisos revocados del usuario {userId}");

                return Ok(new
                {
                    message = "Todos los permisos revocados exitosamente",
                    userId = userId,
                    revokedPermissions = userPermissions.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error revocando permisos del usuario {userId}");
                return StatusCode(500, new { message = "Error al revocar permisos", error = ex.Message });
            }
        }
    }

    // DTOs para las peticiones
    public class UpdatePermissionRequest
    {
        public string PermissionCode { get; set; } = string.Empty;
        public bool IsGranted { get; set; }
        public int? GrantedBy { get; set; }
    }

    public class GrantAllRequest
    {
        public int? GrantedBy { get; set; }
    }
}
