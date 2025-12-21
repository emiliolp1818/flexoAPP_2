using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using System.Text.Json;

namespace FlexoAPP.API.Attributes
{
    /// <summary>
    /// Atributo para requerir permisos específicos en endpoints
    /// Uso: [RequirePermission("users.create")]
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
    public class RequirePermissionAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string[] _requiredPermissions;
        private readonly bool _requireAll;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="permissions">Permisos requeridos</param>
        /// <param name="requireAll">Si es true, requiere TODOS los permisos. Si es false, requiere AL MENOS UNO</param>
        public RequirePermissionAttribute(params string[] permissions)
        {
            _requiredPermissions = permissions;
            _requireAll = true; // Por defecto requiere todos
        }

        /// <summary>
        /// Constructor con opción de requerir todos o al menos uno
        /// </summary>
        public RequirePermissionAttribute(bool requireAll, params string[] permissions)
        {
            _requiredPermissions = permissions;
            _requireAll = requireAll;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // Verificar si el usuario está autenticado
            if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedObjectResult(new
                {
                    message = "No autenticado",
                    requiredPermissions = _requiredPermissions
                });
                return;
            }

            // Obtener el rol del usuario
            var userRole = context.HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            
            // Los administradores tienen todos los permisos
            if (userRole?.ToLower() == "admin" || userRole?.ToLower() == "administrador")
            {
                return; // Permitir acceso
            }

            // Obtener permisos del usuario desde los claims
            var permissionsClaim = context.HttpContext.User.FindFirst("permissions")?.Value;
            
            if (string.IsNullOrEmpty(permissionsClaim))
            {
                context.Result = new ForbidResult();
                return;
            }

            // Parsear permisos JSON
            List<string> userPermissions;
            try
            {
                userPermissions = JsonSerializer.Deserialize<List<string>>(permissionsClaim) ?? new List<string>();
            }
            catch
            {
                userPermissions = new List<string>();
            }

            // Verificar permisos
            bool hasPermission;
            if (_requireAll)
            {
                // Requiere TODOS los permisos
                hasPermission = _requiredPermissions.All(p => userPermissions.Contains(p));
            }
            else
            {
                // Requiere AL MENOS UNO de los permisos
                hasPermission = _requiredPermissions.Any(p => userPermissions.Contains(p));
            }

            if (!hasPermission)
            {
                context.Result = new ObjectResult(new
                {
                    message = "No tienes permisos suficientes para realizar esta acción",
                    requiredPermissions = _requiredPermissions,
                    userPermissions = userPermissions
                })
                {
                    StatusCode = 403
                };
            }
        }
    }
}
