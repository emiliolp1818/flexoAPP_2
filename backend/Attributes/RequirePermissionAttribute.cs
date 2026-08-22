using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using System.Text.Json;

namespace FlexoAPP.API.Attributes
{




    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
    public class RequirePermissionAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string[] _requiredPermissions;
        private readonly bool _requireAll;





        public RequirePermissionAttribute(params string[] permissions)
        {
            _requiredPermissions = permissions;
            _requireAll = true;
        }




        public RequirePermissionAttribute(bool requireAll, params string[] permissions)
        {
            _requiredPermissions = permissions;
            _requireAll = requireAll;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {

            if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedObjectResult(new
                {
                    message = "No autenticado",
                    requiredPermissions = _requiredPermissions
                });
                return;
            }


            var userRole = context.HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;


            if (userRole?.ToLower() == "admin" || userRole?.ToLower() == "administrador")
            {
                return;
            }


            var permissionsClaim = context.HttpContext.User.FindFirst("permissions")?.Value;

            if (string.IsNullOrEmpty(permissionsClaim))
            {
                context.Result = new ForbidResult();
                return;
            }


            List<string> userPermissions;
            try
            {
                userPermissions = JsonSerializer.Deserialize<List<string>>(permissionsClaim) ?? new List<string>();
            }
            catch
            {
                userPermissions = new List<string>();
            }


            bool hasPermission;
            if (_requireAll)
            {

                hasPermission = _requiredPermissions.All(p => userPermissions.Contains(p));
            }
            else
            {

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
