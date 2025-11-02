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
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
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

                var response = await _authService.LoginAsync(loginDto);
                if (response != null)
                {
                    Console.WriteLine($"Login successful for {loginDto.UserCode}");
                    return Ok(response);
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
        public IActionResult Logout() 
        { 
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
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }
                
                var result = await _authService.ChangePasswordAsync(userId, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
                
                if (result)
                {
                    return Ok(new { message = "Contraseña cambiada exitosamente" });
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