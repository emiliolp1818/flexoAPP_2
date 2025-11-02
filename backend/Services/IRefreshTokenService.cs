namespace FlexoAPP.API.Services
{
    public interface IRefreshTokenService
    {
        Task<RefreshTokenResult> GenerateRefreshTokenAsync(int userId, string ipAddress);
        Task<RefreshTokenResult?> GetRefreshTokenAsync(string token);
        Task RevokeRefreshTokenAsync(string token, string ipAddress, string replacedByToken);
        Task RevokeAllUserRefreshTokensAsync(int userId, string ipAddress);
    }

    public class RefreshTokenResult
    {
        public string Token { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public FlexoAPP.API.Models.Entities.User? User { get; set; }
    }
}