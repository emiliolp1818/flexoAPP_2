using FlexoAPP.API.Models.DTOs;

namespace FlexoAPP.API.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginDto loginDto);
        Task<LoginResponseDto?> RefreshTokenAsync(string refreshToken);
        Task<bool> LogoutAsync(string token);
        Task<UserDto?> GetCurrentUserAsync(int userId);
        Task<UserDto?> GetByUserCodeAsync(string userCode);
        Task<UserDto?> UpdateUserPhotoAsync(int userId, string? profileImage);
        Task<UserDto?> UpdateUserProfileAsync(int userId, UpdateUserDto updateUserDto);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
        // Genera una contraseña temporal (válida por expiryMinutes) sin invalidar
        // la contraseña original. Devuelve la temporal en texto plano para mostrarla.
        Task<string?> ResetTempPasswordAsync(int userId, int expiryMinutes = 30);
        Task<List<UserDto>> GetAllUsersAsync();
        Task<UserDto?> CreateUserAsync(CreateUserDto createUserDto);
        Task<bool> DeleteUserAsync(int userId);
    }
}