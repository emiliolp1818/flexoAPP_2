using FlexoAPP.API.Models.DTOs;

namespace FlexoAPP.API.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginDto loginDto);
        Task<LoginResponseDto?> RefreshTokenAsync(string refreshToken);
        Task<bool> LogoutAsync(string token);
        Task<UserDto?> GetCurrentUserAsync(int userId);
        Task<UserDto?> UpdateUserPhotoAsync(int userId, string? profileImage);
        Task<UserDto?> UpdateUserProfileAsync(int userId, UpdateUserDto updateUserDto);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
        Task<List<UserDto>> GetAllUsersAsync();
        Task<UserDto?> CreateUserAsync(CreateUserDto createUserDto);
        Task<bool> DeleteUserAsync(int userId);
    }
}