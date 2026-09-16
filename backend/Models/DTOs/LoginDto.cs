using System.ComponentModel.DataAnnotations;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Models.DTOs
{
    public class LoginDto
    {
        [Required]
        public string UserCode { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public UserDto User { get; set; } = new();
        public DateTime ExpiresAt { get; set; }

        // True cuando el acceso se concedió con la contraseña TEMPORAL. En ese
        // caso la sesión es corta (10 min) y el frontend debe forzar el cambio
        // de contraseña.
        public bool IsTemporaryPassword { get; set; }
        public bool MustChangePassword { get; set; }
    }

    public class RefreshTokenDto
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class RefreshTokenResult
    {
        public string Token { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public User? User { get; set; }
    }
}