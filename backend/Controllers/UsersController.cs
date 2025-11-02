using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FlexoAPP.API.Services;
using FlexoAPP.API.Models.DTOs;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IAuthService _authService;

        public UsersController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpGet]
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
                var users = await _authService.GetAllUsersAsync();
                var user = users.FirstOrDefault(u => u.UserCode.Equals(userCode, StringComparison.OrdinalIgnoreCase));
                
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
                var result = await _authService.DeleteUserAsync(id);
                if (result)
                {
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


    }
}