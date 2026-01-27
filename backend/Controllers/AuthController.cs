using Microsoft.AspNetCore.Mvc; 
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FlexoAPP.API.Models.DTOs;
using FlexoAPP.API.Services;
 
namespace FlexoAPP.API.Controllers 
{ 
    [ApiController] 
    [Route("api/[controller]")] 
    public class AuthController : ControllerBase 
    { 
        // Servicio de autenticación para login/logout
        private readonly IAuthService _authService;
        // Servicio de logging para registrar actividades automáticamente
        private readonly IActivityLoggerService _activityLogger;

        // Constructor con inyección de dependencias
        public AuthController(
            IAuthService authService,
            IActivityLoggerService activityLogger)
        {
            _authService = authService;
            _activityLogger = activityLogger;
        }

        [HttpPost("login")] 
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto) 
        { 
            try 
            { 
                Console.WriteLine($"Login attempt: {loginDto?.UserCode}"); 
 
                if (loginDto == null || string.IsNullOrEmpty(loginDto.UserCode) || string.IsNullOrEmpty(loginDto.Password)) 
                { 
                    Console.WriteLine("Login failed: Missing credentials"); 
                    return BadRequest(new { message = "Usuario y contraseña son requeridos" }); 
                } 

                // Intentar autenticar al usuario
                var response = await _authService.LoginAsync(loginDto);
                if (response != null)
                {
                    Console.WriteLine($"Login successful for {loginDto.UserCode}");
                    
                    // ✅ Registrar login exitoso en la tabla Activities
                    try
                    {
                        // Obtener User-Agent del navegador
                        var userAgent = Request.Headers["User-Agent"].ToString();
                        var browser = userAgent.Contains("Chrome") ? "Chrome" : 
                                     userAgent.Contains("Firefox") ? "Firefox" : 
                                     userAgent.Contains("Safari") ? "Safari" : 
                                     userAgent.Contains("Edge") ? "Edge" : "Unknown";
                        
                        // Obtener IP del cliente
                        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                        
                        // Convertir ID de string a int
                        if (int.TryParse(response.User.Id, out int userId))
                        {
                            // Registrar actividad de login
                            await _activityLogger.LogActivityAsync(
                                userId,                              // ID del usuario
                                response.User.UserCode,              // Código del usuario
                                "LOGIN_SUCCESS",                     // Acción realizada
                                "Inicio de sesión exitoso",          // Descripción
                                "AUTH",                              // Módulo
                                $"{{\"browser\":\"{browser}\",\"success\":true}}",    // Detalles en JSON
                                ipAddress                            // IP del cliente
                            );
                        }
                    }
                    catch (Exception logEx)
                    {
                        // Si falla el logging, no afectar el login
                        Console.WriteLine($"Error logging activity: {logEx.Message}");
                    }
                    
                    return Ok(response);
                }
                
                // ✅ Registrar login fallido
                try
                {
                    var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                    
                    // Buscar el usuario para obtener su ID (si existe)
                    var allUsers = await _authService.GetAllUsersAsync();
                    var user = allUsers.FirstOrDefault(u => u.UserCode == loginDto.UserCode);
                    
                    if (user != null && int.TryParse(user.Id, out int userId))
                    {
                        await _activityLogger.LogActivityAsync(
                            userId,
                            loginDto.UserCode,
                            "LOGIN_FAILED",
                            "Intento fallido de inicio de sesión",
                            "AUTH",
                            $"{{\"success\":false,\"reason\":\"Invalid credentials\"}}",
                            ipAddress
                        );
                    }
                }
                catch (Exception logEx)
                {
                    Console.WriteLine($"Error logging failed login: {logEx.Message}");
                }
                
                Console.WriteLine($"Login failed: Invalid credentials for {loginDto.UserCode}"); 
                return Unauthorized(new { message = "Código de usuario o contraseña incorrectos" }); 
            } 
            catch (Exception ex) 
            { 
                Console.WriteLine($"Login error: {ex.Message}"); 
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message }); 
            } 
        }
 
        [HttpGet("me")] 
        public async Task<IActionResult> GetMe() 
        { 
            try
            {
                // For demo purposes, return admin user
                var response = await _authService.GetCurrentUserAsync(1);
                if (response != null)
                {
                    // Optimizar respuesta para evitar ERR_CONNECTION_RESET
                    // Si la imagen es muy grande, solo enviar un indicador
                    if (!string.IsNullOrEmpty(response.ProfileImage) && response.ProfileImage.Length > 100000) // 100KB
                    {
                        // Crear una copia sin la imagen completa para evitar conexiones reset
                        var optimizedResponse = new UserDto
                        {
                            Id = response.Id,
                            UserCode = response.UserCode,
                            FirstName = response.FirstName,
                            LastName = response.LastName,
                            Role = response.Role,
                            Permissions = response.Permissions,
                            ProfileImage = "large_image_available", // Indicador de que hay imagen
                            ProfileImageUrl = response.ProfileImageUrl,
                            IsActive = response.IsActive,
                            CreatedAt = response.CreatedAt
                        };
                        return Ok(optimizedResponse);
                    }
                    
                    return Ok(response);
                }
                
                return NotFound(new { message = "Usuario no encontrado" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetMe error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("profile-photo")]
        public async Task<IActionResult> GetProfilePhoto()
        {
            try
            {
                // For demo purposes, use admin user ID
                var userId = 1;
                var user = await _authService.GetCurrentUserAsync(userId);
                if (user != null && !string.IsNullOrEmpty(user.ProfileImage))
                {
                    return Ok(new { profileImage = user.ProfileImage });
                }
                
                return Ok(new { profileImage = (string?)null });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetProfilePhoto error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPut("profile-photo")]
        public async Task<IActionResult> UpdateProfilePhoto([FromBody] UpdateProfilePhotoDto photoDto)
        {
            try
            {
                // For demo purposes, use admin user ID
                var userId = 1;
                var response = await _authService.UpdateUserPhotoAsync(userId, photoDto.ProfileImage);
                if (response != null)
                {
                    // ✅ Registrar cambio de foto de perfil
                    try
                    {
                        await _activityLogger.LogActivityAsync(
                            userId,
                            response.UserCode,
                            "PROFILE_PHOTO_UPDATED",
                            "Cambio de foto de perfil",
                            "PROFILE",
                            $"{{\"fieldChanged\":\"ProfileImage\",\"hasImage\":{(!string.IsNullOrEmpty(photoDto.ProfileImage)).ToString().ToLower()}}}",
                            HttpContext.Connection.RemoteIpAddress?.ToString()
                        );
                    }
                    catch (Exception logEx)
                    {
                        Console.WriteLine($"Error logging profile photo update: {logEx.Message}");
                    }
                    
                    return Ok(response);
                }
                
                return NotFound(new { message = "Usuario no encontrado" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"UpdateProfilePhoto error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        } 
 
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout() 
        {
            // ✅ Registrar actividad de logout
            try
            {
                await _activityLogger.LogActivityAsync(
                    "LOGOUT",
                    "Cierre de sesión",
                    "AUTH"
                );
            }
            catch (Exception logEx)
            {
                Console.WriteLine($"Error registrando actividad de logout: {logEx.Message}");
            }
            
            return Ok(new { message = "Sesión cerrada exitosamente" }); 
        }

        [HttpGet("validate")]
        [Authorize]
        public IActionResult ValidateSession()
        {
            try
            {
                // If we reach here, the JWT token is valid (due to [Authorize] attribute)
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new { valid = false, message = "Token inválido" });
                }

                return Ok(new { valid = true, message = "Sesión válida" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ValidateSession error: {ex.Message}");
                return Unauthorized(new { valid = false, message = "Error validando sesión" });
            }
        }

        [HttpGet("debug/users")]
        public async Task<IActionResult> DebugUsers()
        {
            try
            {
                var allUsers = await _authService.GetAllUsersAsync();
                return Ok(new { 
                    totalUsers = allUsers.Count,
                    users = allUsers.Select(u => new {
                        u.Id,
                        u.UserCode,
                        u.FullName,
                        u.Role,
                        u.IsActive
                    })
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Debug users error: {ex.Message}");
                return StatusCode(500, new { message = "Error getting users", error = ex.Message });
            }
        }

        [HttpPost("simple-login")]
        public async Task<IActionResult> SimpleLogin([FromBody] LoginDto loginDto)
        {
            try
            {
                Console.WriteLine($"SIMPLE LOGIN: Attempting login for {loginDto.UserCode}");
                
                // Get all users to verify admin exists
                var allUsers = await _authService.GetAllUsersAsync();
                var adminUser = allUsers.FirstOrDefault(u => u.UserCode == "admin");
                
                if (adminUser == null)
                {
                    return BadRequest(new { message = "Admin user not found in database" });
                }
                
                Console.WriteLine($"SIMPLE LOGIN: Admin user found - ID: {adminUser.Id}, Active: {adminUser.IsActive}");
                
                // Try manual password verification
                if (loginDto.UserCode == "admin" && loginDto.Password == "admin123")
                {
                    // Create a simple response without refresh token
                    var response = new
                    {
                        token = "simple-test-token",
                        user = new
                        {
                            id = adminUser.Id,
                            userCode = adminUser.UserCode,
                            firstName = adminUser.FirstName,
                            lastName = adminUser.LastName,
                            fullName = adminUser.FullName,
                            role = adminUser.Role,
                            isActive = adminUser.IsActive
                        },
                        message = "Simple login successful"
                    };
                    
                    Console.WriteLine($"SIMPLE LOGIN: Success for admin");
                    return Ok(response);
                }
                
                return Unauthorized(new { message = "Invalid credentials" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SIMPLE LOGIN ERROR: {ex.Message}");
                Console.WriteLine($"SIMPLE LOGIN STACK: {ex.StackTrace}");
                return StatusCode(500, new { 
                    message = "Simple login error", 
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _authService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetAllUsers error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto createUserDto)
        {
            try
            {
                if (createUserDto == null)
                {
                    return BadRequest(new { message = "Datos de usuario requeridos" });
                }

                var newUser = await _authService.CreateUserAsync(createUserDto);
                if (newUser != null)
                {
                    // ✅ Registrar creación de usuario
                    try
                    {
                        // Obtener usuario administrador del contexto
                        var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        var adminCodeClaim = User.FindFirst("userCode")?.Value;
                        
                        if (!string.IsNullOrEmpty(adminIdClaim) && int.TryParse(adminIdClaim, out int adminId))
                        {
                            await _activityLogger.LogActivityAsync(
                                adminId,
                                adminCodeClaim ?? "system",
                                "USER_CREATED",
                                $"Usuario creado: {createUserDto.UserCode}",
                                "CONFIG",
                                $"{{\"configType\":\"USER_CREATION\",\"affectedUser\":\"{createUserDto.UserCode}\",\"role\":\"{createUserDto.Role}\",\"firstName\":\"{createUserDto.FirstName}\",\"lastName\":\"{createUserDto.LastName}\"}}",
                                HttpContext.Connection.RemoteIpAddress?.ToString()
                            );
                        }
                    }
                    catch (Exception logEx)
                    {
                        Console.WriteLine($"Error logging user creation: {logEx.Message}");
                    }
                    
                    return Ok(newUser);
                }

                return BadRequest(new { message = "No se pudo crear el usuario. El código de usuario puede estar en uso." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"CreateUser error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                if (updateUserDto == null)
                {
                    return BadRequest(new { message = "Datos de usuario requeridos" });
                }

                var updatedUser = await _authService.UpdateUserProfileAsync(id, updateUserDto);
                if (updatedUser != null)
                {
                    return Ok(updatedUser);
                }

                return NotFound(new { message = "Usuario no encontrado" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"UpdateUser error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPatch("users/{id}/status")]
        public async Task<IActionResult> ToggleUserStatus(int id, [FromBody] ToggleUserStatusDto toggleStatusDto)
        {
            try
            {
                if (toggleStatusDto == null)
                {
                    return BadRequest(new { message = "Estado requerido" });
                }

                var updateDto = new UpdateUserDto { IsActive = toggleStatusDto.IsActive };
                var updatedUser = await _authService.UpdateUserProfileAsync(id, updateDto);
                
                if (updatedUser != null)
                {
                    return Ok(updatedUser);
                }

                return NotFound(new { message = "Usuario no encontrado" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ToggleUserStatus error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var result = await _authService.DeleteUserAsync(id);
                if (result)
                {
                    return Ok(new { message = "Usuario eliminado exitosamente" });
                }

                return NotFound(new { message = "Usuario no encontrado" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DeleteUser error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            try
            {
                if (changePasswordDto == null)
                {
                    return BadRequest(new { message = "Datos de cambio de contraseña requeridos" });
                }

                // Get user ID from JWT token claims
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userCodeClaim = User.FindFirst("userCode")?.Value;
                
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }
                
                var result = await _authService.ChangePasswordAsync(userId, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
                
                if (result)
                {
                    // ✅ Registrar cambio de contraseña exitoso
                    try
                    {
                        await _activityLogger.LogActivityAsync(
                            userId,
                            userCodeClaim ?? "unknown",
                            "PROFILE_PASSWORD_UPDATED",
                            "Cambio de contraseña exitoso",
                            "PROFILE",
                            $"{{\"fieldChanged\":\"Password\",\"success\":true}}",
                            HttpContext.Connection.RemoteIpAddress?.ToString()
                        );
                    }
                    catch (Exception logEx)
                    {
                        Console.WriteLine($"Error logging password change: {logEx.Message}");
                    }
                    
                    return Ok(new { message = "Contraseña cambiada exitosamente" });
                }

                // ✅ Registrar intento fallido de cambio de contraseña
                try
                {
                    await _activityLogger.LogActivityAsync(
                        userId,
                        userCodeClaim ?? "unknown",
                        "PROFILE_PASSWORD_UPDATE_FAILED",
                        "Intento fallido de cambio de contraseña",
                        "PROFILE",
                        $"{{\"fieldChanged\":\"Password\",\"success\":false,\"reason\":\"Current password incorrect\"}}",
                        HttpContext.Connection.RemoteIpAddress?.ToString()
                    );
                }
                catch (Exception logEx)
                {
                    Console.WriteLine($"Error logging failed password change: {logEx.Message}");
                }
                
                return BadRequest(new { message = "La contraseña actual es incorrecta" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ChangePassword error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    } 
}