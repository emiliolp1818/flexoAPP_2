using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FlexoAPP.API.Services;
using FlexoAPP.API.Models.DTOs;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous] // Temporal para pruebas - cambiar a [Authorize] en producción
    public class UsersController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IActivityLoggerService _activityLogger;

        public UsersController(
            IAuthService authService,
            IActivityLoggerService activityLogger)
        {
            _authService = authService;
            _activityLogger = activityLogger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _authService.GetAllUsersAsync();
                
                // ✅ Registrar actividad de consulta de usuarios
                try
                {
                    await _activityLogger.LogActivityAsync(
                        "VIEW_USERS",
                        "Consulta de lista de usuarios",
                        "SETTINGS",
                        $"{{\"count\":{users.Count}}}"
                    );
                }
                catch (Exception logEx)
                {
                    Console.WriteLine($"Error registrando actividad: {logEx.Message}");
                }
                
                return Ok(users);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetAllUsers error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var user = await _authService.GetCurrentUserAsync(id);
                if (user != null)
                {
                    return Ok(user);
                }
                
                return NotFound(new { message = "Usuario no encontrado" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetUserById error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("code/{userCode}")]
        public async Task<IActionResult> GetUserByCode(string userCode)
        {
            try
            {
                var user = await _authService.GetByUserCodeAsync(userCode);
                if (user != null)
                {
                    return Ok(user);
                }
                return NotFound(new { message = "Usuario no encontrado" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetUserByCode error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPut("code/{userCode}")]
        public async Task<IActionResult> UpdateUserByCode(string userCode, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                var user = await _authService.GetByUserCodeAsync(userCode);
                if (user == null) return NotFound(new { message = "Usuario no encontrado" });

                if (!int.TryParse(user.Id, out var id))
                    return StatusCode(500, new { message = "ID de usuario inválido en el servidor" });

                var updatedUser = await _authService.UpdateUserProfileAsync(id, updateUserDto);
                if (updatedUser != null)
                    return Ok(updatedUser);

                return BadRequest(new { message = "No se pudo actualizar el usuario" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"UpdateUserByCode error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpDelete("code/{userCode}")]
        public async Task<IActionResult> DeleteUserByCode(string userCode)
        {
            try
            {
                var user = await _authService.GetByUserCodeAsync(userCode);
                if (user == null) return NotFound(new { message = "Usuario no encontrado" });

                if (!int.TryParse(user.Id, out var id))
                    return StatusCode(500, new { message = "ID de usuario inválido en el servidor" });

                var result = await _authService.DeleteUserAsync(id);
                if (result) return NoContent();

                return NotFound(new { message = "Usuario no encontrado" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DeleteUserByCode error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost("code/{userCode}/profile-image")]
        public async Task<IActionResult> UploadProfileImageByCode(string userCode, IFormFile profileImage)
        {
            try
            {
                if (profileImage == null || profileImage.Length == 0)
                {
                    return BadRequest(new { message = "No se ha seleccionado ninguna imagen" });
                }

                var user = await _authService.GetByUserCodeAsync(userCode);
                if (user == null) return NotFound(new { message = "Usuario no encontrado" });

                if (!int.TryParse(user.Id, out var id))
                    return StatusCode(500, new { message = "ID de usuario inválido en el servidor" });
                // Validar tipo de archivo
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
                if (!allowedTypes.Contains(profileImage.ContentType.ToLower()))
                {
                    return BadRequest(new { message = "Solo se permiten archivos de imagen (JPEG, PNG, GIF)" });
                }

                // Validar tamaño (máximo 5MB)
                if (profileImage.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "La imagen no debe superar los 5MB" });
                }

                // Crear directorio si no existe
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                // Generar nombre único para el archivo
                var fileExtension = Path.GetExtension(profileImage.FileName);
                var fileName = $"user_{id}_{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Guardar archivo
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await profileImage.CopyToAsync(stream);
                }

                // Actualizar usuario con la URL de la imagen en ProfileImage
                var imageUrl = $"/uploads/profiles/{fileName}";
                var updateDto = new UpdateUserDto
                {
                    ProfileImage = imageUrl  // Guardar URL en ProfileImage
                };

                var updatedUser = await _authService.UpdateUserProfileAsync(id, updateDto);
                if (updatedUser != null)
                {
                    return Ok(new {
                        message = "Imagen de perfil actualizada exitosamente",
                        profileImage = imageUrl,  // Retornar como profileImage
                        user = updatedUser
                    });
                }

                return BadRequest(new { message = "No se pudo actualizar la imagen de perfil" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"UploadProfileImageByCode error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string q)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(q))
                {
                    return BadRequest(new { message = "Término de búsqueda requerido" });
                }

                var allUsers = await _authService.GetAllUsersAsync();
                var searchTerm = q.ToLower().Trim();
                
                var filteredUsers = allUsers.Where(user =>
                    user.UserCode.ToLower().Contains(searchTerm) ||
                    user.FullName.ToLower().Contains(searchTerm) ||
                    (user.FirstName != null && user.FirstName.ToLower().Contains(searchTerm)) ||
                    (user.LastName != null && user.LastName.ToLower().Contains(searchTerm)) ||
                    (user.Role != null && user.Role.ToLower().Contains(searchTerm))
                ).ToList();

                return Ok(filteredUsers);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SearchUsers error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto createUserDto)
        {
            try
            {
                var newUser = await _authService.CreateUserAsync(createUserDto);
                if (newUser != null)
                {
                    // ✅ Registrar actividad de creación de usuario
                    try
                    {
                        await _activityLogger.LogActivityAsync(
                            "CREATE_USER",
                            $"Creación de nuevo usuario: {createUserDto.UserCode}",
                            "SETTINGS",
                            $"{{\"userCode\":\"{createUserDto.UserCode}\",\"role\":\"{createUserDto.Role}\"}}"
                        );
                    }
                    catch (Exception logEx)
                    {
                        Console.WriteLine($"Error registrando actividad: {logEx.Message}");
                    }
                    
                    return CreatedAtAction(nameof(GetUserById), new { id = newUser.Id }, newUser);
                }
                
                return BadRequest(new { message = "No se pudo crear el usuario. El código de usuario ya existe." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"CreateUser error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                var updatedUser = await _authService.UpdateUserProfileAsync(id, updateUserDto);
                if (updatedUser != null)
                {
                    // ✅ Registrar actividad de actualización de usuario
                    try
                    {
                        await _activityLogger.LogActivityAsync(
                            "UPDATE_USER",
                            $"Actualización de usuario ID: {id}",
                            "SETTINGS",
                            $"{{\"userId\":{id},\"userCode\":\"{updatedUser.UserCode}\"}}"
                        );
                    }
                    catch (Exception logEx)
                    {
                        Console.WriteLine($"Error registrando actividad: {logEx.Message}");
                    }
                    
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                // Obtener información del usuario antes de eliminarlo
                var user = await _authService.GetCurrentUserAsync(id);
                var userCode = user?.UserCode ?? "unknown";
                
                var result = await _authService.DeleteUserAsync(id);
                if (result)
                {
                    // ✅ Registrar actividad de eliminación de usuario
                    try
                    {
                        await _activityLogger.LogActivityAsync(
                            "DELETE_USER",
                            $"Eliminación de usuario: {userCode}",
                            "SETTINGS",
                            $"{{\"userId\":{id},\"userCode\":\"{userCode}\"}}"
                        );
                    }
                    catch (Exception logEx)
                    {
                        Console.WriteLine($"Error registrando actividad: {logEx.Message}");
                    }
                    
                    return NoContent();
                }
                
                return NotFound(new { message = "Usuario no encontrado" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DeleteUser error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ToggleUserStatus(int id, [FromBody] ToggleUserStatusDto statusDto)
        {
            try
            {
                var user = await _authService.GetCurrentUserAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                var updateDto = new UpdateUserDto
                {
                    IsActive = statusDto.IsActive
                };

                var updatedUser = await _authService.UpdateUserProfileAsync(id, updateDto);
                if (updatedUser != null)
                {
                    return Ok(updatedUser);
                }
                
                return BadRequest(new { message = "No se pudo actualizar el estado del usuario" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ToggleUserStatus error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }



        [HttpGet("stats")]
        public async Task<IActionResult> GetUserStats()
        {
            try
            {
                var users = await _authService.GetAllUsersAsync();
                
                var stats = new
                {
                    totalUsers = users.Count,
                    activeUsers = users.Count(u => u.IsActive),
                    inactiveUsers = users.Count(u => !u.IsActive),
                    roleDistribution = users.GroupBy(u => u.Role)
                        .Select(g => new { role = g.Key, count = g.Count() })
                        .ToList(),
                    recentUsers = users.Where(u => u.CreatedAt >= DateTime.Now.AddDays(-30))
                        .Count()
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetUserStats error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost("{id}/profile-image")]
        public async Task<IActionResult> UploadProfileImage(int id, IFormFile profileImage)
        {
            try
            {
                if (profileImage == null || profileImage.Length == 0)
                {
                    return BadRequest(new { message = "No se ha seleccionado ninguna imagen" });
                }

                // Validar tipo de archivo
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
                if (!allowedTypes.Contains(profileImage.ContentType.ToLower()))
                {
                    return BadRequest(new { message = "Solo se permiten archivos de imagen (JPEG, PNG, GIF)" });
                }

                // Validar tamaño (máximo 5MB)
                if (profileImage.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "La imagen no debe superar los 5MB" });
                }

                // Verificar que el usuario existe
                var user = await _authService.GetCurrentUserAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                // Crear directorio si no existe
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                // Generar nombre único para el archivo
                var fileExtension = Path.GetExtension(profileImage.FileName);
                var fileName = $"user_{id}_{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Guardar archivo
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await profileImage.CopyToAsync(stream);
                }

                // Actualizar usuario con la URL de la imagen en ProfileImage
                var imageUrl = $"/uploads/profiles/{fileName}";
                var updateDto = new UpdateUserDto
                {
                    ProfileImage = imageUrl  // Guardar URL en ProfileImage (no ProfileImageUrl)
                };

                var updatedUser = await _authService.UpdateUserProfileAsync(id, updateDto);
                if (updatedUser != null)
                {
                    return Ok(new { 
                        message = "Imagen de perfil actualizada exitosamente",
                        profileImage = imageUrl,  // Retornar como profileImage
                        user = updatedUser
                    });
                }

                return BadRequest(new { message = "No se pudo actualizar la imagen de perfil" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"UploadProfileImage error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpDelete("{id}/profile-image")]
        public async Task<IActionResult> DeleteProfileImage(int id)
        {
            try
            {
                var user = await _authService.GetCurrentUserAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                // Eliminar archivo físico si existe
                if (!string.IsNullOrEmpty(user.ProfileImage) && user.ProfileImage.StartsWith("/uploads/"))
                {
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.ProfileImage.TrimStart('/'));
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }

                // Actualizar usuario removiendo la imagen
                var updateDto = new UpdateUserDto
                {
                    ProfileImage = null  // Limpiar ProfileImage
                };

                var updatedUser = await _authService.UpdateUserProfileAsync(id, updateDto);
                if (updatedUser != null)
                {
                    return Ok(new { 
                        message = "Imagen de perfil eliminada exitosamente",
                        user = updatedUser
                    });
                }

                return BadRequest(new { message = "No se pudo eliminar la imagen de perfil" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DeleteProfileImage error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetUserPassword(int id)
        {
            try
            {
                var user = await _authService.GetCurrentUserAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                // Generar contraseña temporal
                var temporaryPassword = GenerateTemporaryPassword();

                // Actualizar contraseña del usuario
                var updateDto = new UpdateUserDto
                {
                    Password = temporaryPassword
                };

                var updatedUser = await _authService.UpdateUserProfileAsync(id, updateDto);
                if (updatedUser != null)
                {
                    // En un entorno real, aquí se enviaría un email con la nueva contraseña
                    Console.WriteLine($"Nueva contraseña temporal para {user.UserCode}: {temporaryPassword}");

                    return Ok(new { 
                        message = "Contraseña restablecida exitosamente",
                        temporaryPassword = temporaryPassword, // Solo para desarrollo
                        user = updatedUser
                    });
                }

                return BadRequest(new { message = "No se pudo restablecer la contraseña" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ResetUserPassword error: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        private string GenerateTemporaryPassword()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 8)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        /// <summary>
        /// Cambiar contraseña del usuario
        /// Valida la contraseña actual y actualiza a la nueva contraseña
        /// </summary>
        [HttpPut("{id}/change-password")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordDto changePasswordDto)
        {
            try
            {
                // Validar que se proporcionaron las contraseñas
                if (string.IsNullOrWhiteSpace(changePasswordDto.CurrentPassword) || 
                    string.IsNullOrWhiteSpace(changePasswordDto.NewPassword))
                {
                    return BadRequest(new { 
                        success = false,
                        message = "La contraseña actual y la nueva contraseña son requeridas" 
                    });
                }

                // Validar longitud mínima de la nueva contraseña
                if (changePasswordDto.NewPassword.Length < 6)
                {
                    return BadRequest(new { 
                        success = false,
                        message = "La nueva contraseña debe tener al menos 6 caracteres" 
                    });
                }

                // Obtener el usuario
                var user = await _authService.GetCurrentUserAsync(id);
                if (user == null)
                {
                    return NotFound(new { 
                        success = false,
                        message = "Usuario no encontrado" 
                    });
                }

                // Validar la contraseña actual usando el servicio de autenticación
                var loginRequest = new LoginDto 
                { 
                    UserCode = user.UserCode, 
                    Password = changePasswordDto.CurrentPassword 
                };

                var loginResult = await _authService.LoginAsync(loginRequest);
                
                // Si el login falla, la contraseña actual es incorrecta
                if (loginResult == null || string.IsNullOrEmpty(loginResult.Token))
                {
                    return Unauthorized(new { 
                        success = false,
                        message = "La contraseña actual es incorrecta" 
                    });
                }

                // Actualizar a la nueva contraseña
                var updateDto = new UpdateUserDto
                {
                    Password = changePasswordDto.NewPassword
                };

                var updatedUser = await _authService.UpdateUserProfileAsync(id, updateDto);
                if (updatedUser != null)
                {
                    Console.WriteLine($"✅ Contraseña actualizada exitosamente para el usuario: {user.UserCode}");
                    
                    // ✅ Registrar actividad de cambio de contraseña
                    try
                    {
                        await _activityLogger.LogActivityAsync(
                            "CHANGE_PASSWORD",
                            "Cambio de contraseña",
                            "PROFILE",
                            $"{{\"userId\":{id},\"userCode\":\"{user.UserCode}\"}}"
                        );
                    }
                    catch (Exception logEx)
                    {
                        Console.WriteLine($"Error registrando actividad: {logEx.Message}");
                    }
                    
                    return Ok(new { 
                        success = true,
                        message = "Contraseña actualizada exitosamente" 
                    });
                }

                return BadRequest(new { 
                    success = false,
                    message = "No se pudo actualizar la contraseña" 
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ChangePassword error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { 
                    success = false,
                    message = "Error interno del servidor al cambiar la contraseña", 
                    error = ex.Message 
                });
            }
        }
    }
}