using Microsoft.AspNetCore.Http;
using System.Text.Json;
using FlexoAPP.API.Models.DTOs;
using FlexoAPP.API.Models.Entities;
using FlexoAPP.API.Models.Enums;
using FlexoAPP.API.Repositories;

namespace FlexoAPP.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly IRefreshTokenService _refreshTokenService;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        
        public AuthService(
            IUserRepository userRepository, 
            IJwtService jwtService, 
            IRefreshTokenService refreshTokenService,
            IConfiguration configuration,
            IHttpContextAccessor httpContextAccessor)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
            _refreshTokenService = refreshTokenService;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }
        
        public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto)
        {
            Console.WriteLine($"AuthService: Attempting login for user: {loginDto.UserCode}");
            
            var user = await _userRepository.GetByUserCodeAsync(loginDto.UserCode);
            
            if (user == null)
            {
                Console.WriteLine($"AuthService: User not found: {loginDto.UserCode}");
                return null;
            }
            
            Console.WriteLine($"AuthService: User found - ID: {user.Id}, Active: {user.IsActive}, Role: {user.Role}");
            
            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                Console.WriteLine($"AuthService: Password verification failed for user: {loginDto.UserCode}");
                return null;
            }
            
            Console.WriteLine($"AuthService: Password verified successfully for user: {loginDto.UserCode}");
            
            var ipAddress = GetIpAddress();
            var token = _jwtService.GenerateToken(user);
            var refreshToken = await _refreshTokenService.GenerateRefreshTokenAsync(user.Id, ipAddress);
            
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"] ?? "60");
            
            return new LoginResponseDto
            {
                Token = token,
                RefreshToken = refreshToken.Token,
                User = MapToUserDto(user),
                ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
            };
        }
        
        public async Task<LoginResponseDto?> RefreshTokenAsync(string refreshToken)
        {
            var ipAddress = GetIpAddress();
            var token = await _refreshTokenService.GetRefreshTokenAsync(refreshToken);
            
            if (token == null || !token.IsActive)
            {
                return null;
            }
            
            var user = token.User;
            if (user == null || !user.IsActive)
            {
                return null;
            }
            
            // Generate new tokens
            var newJwtToken = _jwtService.GenerateToken(user);
            var newRefreshToken = await _refreshTokenService.GenerateRefreshTokenAsync(user.Id, ipAddress);
            
            // Revoke old refresh token
            await _refreshTokenService.RevokeRefreshTokenAsync(refreshToken, ipAddress, newRefreshToken.Token);
            
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"] ?? "60");
            
            return new LoginResponseDto
            {
                Token = newJwtToken,
                RefreshToken = newRefreshToken.Token,
                User = MapToUserDto(user),
                ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
            };
        }
        
        public async Task<bool> LogoutAsync(string token)
        {
            var ipAddress = GetIpAddress();
            
            // Get user ID from JWT token
            var userId = _jwtService.GetUserIdFromToken(token);
            if (userId.HasValue)
            {
                // Revoke all refresh tokens for this user
                await _refreshTokenService.RevokeAllUserRefreshTokensAsync(userId.Value, ipAddress);
            }
            
            return true;
        }
        
        public async Task<UserDto?> GetCurrentUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            return user != null ? MapToUserDto(user) : null;
        }

        public async Task<UserDto?> UpdateUserPhotoAsync(int userId, string? profileImage)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            // Update the profile image
            user.ProfileImage = profileImage;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            // Log the action with appropriate message
            var actionDescription = profileImage == null ? "Profile image removed" : "Profile image updated";
            var actionName = profileImage == null ? "Eliminar Foto Perfil" : "Actualizar Foto Perfil";
            
            // TODO: Implementar logging cuando se restaure el servicio de auditoría
            // await _auditService.LogActionAsync(
            //     "Users",
            //     userId,
            //     actionName,
            //     actionDescription,
            //     userId
            // );

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

            // Update only provided fields
            if (!string.IsNullOrEmpty(updateUserDto.FirstName))
                user.FirstName = updateUserDto.FirstName;
            
            if (!string.IsNullOrEmpty(updateUserDto.LastName))
                user.LastName = updateUserDto.LastName;
            
            if (updateUserDto.Permissions != null)
                user.Permissions = JsonSerializer.Serialize(updateUserDto.Permissions);
            
            if (!string.IsNullOrEmpty(updateUserDto.Role))
                user.Role = ParseUserRole(updateUserDto.Role);
            
            if (updateUserDto.ProfileImage != null)
                user.ProfileImage = updateUserDto.ProfileImage;
            
            if (updateUserDto.ProfileImageUrl != null)
                user.ProfileImageUrl = updateUserDto.ProfileImageUrl;
            
            if (updateUserDto.Phone != null)
                user.Phone = updateUserDto.Phone;
            
            if (updateUserDto.IsActive.HasValue)
                user.IsActive = updateUserDto.IsActive.Value;

            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
            return MapToUserDto(user);
        }

        public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.Password))
                return false;

            // Update password
            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.UpdatedAt = DateTime.UtcNow;

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
            // Check if user code already exists
            var existingUser = await _userRepository.GetByUserCodeAsync(createUserDto.UserCode);
            if (existingUser != null) return null;

            var user = new User
            {
                UserCode = createUserDto.UserCode,
                Password = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password),
                FirstName = createUserDto.FirstName,
                LastName = createUserDto.LastName,
                Permissions = JsonSerializer.Serialize(createUserDto.Permissions ?? new List<string>()),
                Role = ParseUserRole(createUserDto.Role),
                ProfileImage = createUserDto.ProfileImage,
                ProfileImageUrl = createUserDto.ProfileImageUrl,
                IsActive = createUserDto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
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
            return new UserDto
            {
                Id = user.Id.ToString(),
                UserCode = user.UserCode,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                Permissions = !string.IsNullOrEmpty(user.Permissions) ? 
                    JsonSerializer.Deserialize<List<string>>(user.Permissions) ?? new List<string>() : 
                    new List<string>(),
                Role = user.Role.ToString(),
                ProfileImage = user.ProfileImage,
                ProfileImageUrl = user.ProfileImageUrl,
                Phone = user.Phone,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };
        }

        private static UserRole ParseUserRole(string roleString)
        {
            if (Enum.TryParse<UserRole>(roleString, true, out var role))
            {
                return role;
            }
            return UserRole.Operario; // Default role
        }
    }
}