using Microsoft.AspNetCore.Http;
using System.Text.Json;
using FlexoAPP.API.Models.DTOs;
using FlexoAPP.API.Models.Entities;
using FlexoAPP.API.Models.Enums;
using FlexoAPP.API.Helpers;
using FlexoAPP.API.Repositories;

namespace FlexoAPP.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuthService(
            IUserRepository userRepository,
            IJwtService jwtService,
            IConfiguration configuration,
            IHttpContextAccessor httpContextAccessor)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto)
        {
            // Console.WriteLine($"AuthService: Attempting login for user: {loginDto.UserCode}");

            var user = await _userRepository.GetByUserCodeAsync(loginDto.UserCode);

            if (user == null)
            {
                // Console.WriteLine($"AuthService: User not found: {loginDto.UserCode}");
                return null;
            }

            // Console.WriteLine($"AuthService: User found - ID: {user.Id}, Active: {user.IsActive}, Role: {user.Role}");

            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                // Console.WriteLine($"AuthService: Password verification failed for user: {loginDto.UserCode}");
                return null;
            }

            // Console.WriteLine($"AuthService: Password verified successfully for user: {loginDto.UserCode}");

            var ipAddress = GetIpAddress();
            var token = _jwtService.GenerateToken(user);

            var jwtSettings = _configuration.GetSection("JwtSettings");
            var expiryMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "1440");

            return new LoginResponseDto
            {
                Token = token,
                RefreshToken = string.Empty,
                User = MapToUserDto(user),
                ExpiresAt = DateTimeHelper.Now.AddMinutes(expiryMinutes)
            };
        }

        public async Task<LoginResponseDto?> RefreshTokenAsync(string refreshToken)
        {
            // Refresh tokens no implementados — retorna null
            return await Task.FromResult<LoginResponseDto?>(null);
        }

        public async Task<bool> LogoutAsync(string token)
        {
            // Simplemente invalida la sesión del lado del cliente
            return await Task.FromResult(true);
        }

        public async Task<UserDto?> GetCurrentUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            return user != null ? MapToUserDto(user) : null;
        }

        public async Task<UserDto?> GetByUserCodeAsync(string userCode)
        {
            var user = await _userRepository.GetByUserCodeAsync(userCode);
            return user != null ? MapToUserDto(user) : null;
        }

        public async Task<UserDto?> UpdateUserPhotoAsync(int userId, string? profileImage)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return null;
            }


            user.ProfileImage = profileImage;
            user.UpdatedAt = DateTimeHelper.Now;

            await _userRepository.UpdateAsync(user);


            var actionDescription = profileImage == null ? "Profile image removed" : "Profile image updated";
            var actionName = profileImage == null ? "Eliminar Foto Perfil" : "Actualizar Foto Perfil";










            return MapToUserDto(user);
        }

        private string GetIpAddress()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context?.Request.Headers.ContainsKey("X-Forwarded-For") == true)
            {
                return context.Request.Headers["X-Forwarded-For"].ToString().Split(',')[0].Trim();
            }

            return context?.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }

        public async Task<UserDto?> UpdateUserProfileAsync(int userId, UpdateUserDto updateUserDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return null;


            if (!string.IsNullOrEmpty(updateUserDto.FirstName))
                user.FirstName = updateUserDto.FirstName;

            if (!string.IsNullOrEmpty(updateUserDto.LastName))
                user.LastName = updateUserDto.LastName;

            if (updateUserDto.Permissions != null)
            {
                // Permisos ahora se gestionan en user_permissions, no aquí
            }

            if (!string.IsNullOrEmpty(updateUserDto.Role))
                user.Role = ParseUserRole(updateUserDto.Role);

            if (updateUserDto.ProfileImage != null)
                user.ProfileImage = updateUserDto.ProfileImage;

            if (updateUserDto.Email != null)
                user.Email = updateUserDto.Email;

            if (updateUserDto.Phone != null)
                user.Phone = updateUserDto.Phone;

            if (updateUserDto.IsActive.HasValue)
                user.IsActive = updateUserDto.IsActive.Value;


            if (!string.IsNullOrEmpty(updateUserDto.Password))
            {
                // Console.WriteLine($"🔐 Actualizando contraseña para usuario {user.UserCode}");
                user.Password = BCrypt.Net.BCrypt.HashPassword(updateUserDto.Password);
            }

            user.UpdatedAt = DateTimeHelper.Now;

            await _userRepository.UpdateAsync(user);
            return MapToUserDto(user);
        }

        public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;


            if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.Password))
                return false;


            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.UpdatedAt = DateTimeHelper.Now;

            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Select(MapToUserDto).ToList();
        }

        public async Task<UserDto?> CreateUserAsync(CreateUserDto createUserDto)
        {

            var existingUser = await _userRepository.GetByUserCodeAsync(createUserDto.UserCode);
            if (existingUser != null) return null;

            var user = new User
            {
                UserCode = createUserDto.UserCode,
                Password = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password),
                FirstName = createUserDto.FirstName,
                LastName = createUserDto.LastName,
                Email = createUserDto.Email,
                Phone = createUserDto.Phone,
                // Permisos se gestionan en tabla user_permissions
                Role = ParseUserRole(createUserDto.Role),
                ProfileImage = createUserDto.ProfileImage,
                IsActive = createUserDto.IsActive,
                CreatedAt = DateTimeHelper.Now,
                UpdatedAt = DateTimeHelper.Now
            };

            var createdUser = await _userRepository.CreateAsync(user);
            return MapToUserDto(createdUser);
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            return await _userRepository.DeleteAsync(userId);
        }

        private static UserDto MapToUserDto(User user)
        {
            // Siempre exponer la URL del endpoint para servir la imagen.
            // El endpoint GET /api/users/{id}/profile-image maneja tanto base64 como legacy.
            string? profileImageRef = null;
            if (!string.IsNullOrWhiteSpace(user.ProfileImage))
            {
                profileImageRef = $"/api/users/{user.Id}/profile-image";
            }

            return new UserDto
            {
                Id = user.Id.ToString(),
                UserCode = user.UserCode,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                Permissions = new List<string>(), // Los permisos se gestionan en la tabla user_permissions
                Role = user.Role.ToString(),
                ProfileImage = profileImageRef,
                Phone = user.Phone,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLogin = user.LastLogin
            };
        }

        private static UserRole ParseUserRole(string roleString)
        {
            if (Enum.TryParse<UserRole>(roleString, true, out var role))
            {
                return role;
            }
            return UserRole.Operario;
        }
    }
}
