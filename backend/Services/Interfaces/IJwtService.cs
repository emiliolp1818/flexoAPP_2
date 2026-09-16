using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Services
{
    public interface IJwtService
    {
        string GenerateToken(User user, int? expiryMinutesOverride = null);
        string GenerateRefreshToken();
        bool ValidateToken(string token);
        int? GetUserIdFromToken(string token);
    }
}