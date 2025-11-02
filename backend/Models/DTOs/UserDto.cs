using System.ComponentModel.DataAnnotations;

namespace FlexoAPP.API.Models.DTOs
{
    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserCode { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public List<string> Permissions { get; set; } = new List<string>();
        public string? ProfileImage { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? Phone { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Computed property for full name
        public string FullName => $"{FirstName} {LastName}".Trim();
    }
    
    public class CreateUserDto
    {
        [Required(ErrorMessage = "El código de usuario es requerido")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "El código de usuario debe tener entre 3 y 50 caracteres")]
        public string UserCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es requerida")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 50 caracteres")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "El apellido es requerido")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "El apellido debe tener entre 2 y 50 caracteres")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "El rol es requerido")]
        public string Role { get; set; } = string.Empty;

        public List<string>? Permissions { get; set; }
        public string? ProfileImage { get; set; }
        public string? ProfileImageUrl { get; set; }
        [Phone(ErrorMessage = "Teléfono inválido")]
        public string? Phone { get; set; }
        public bool IsActive { get; set; } = true;
    }
    
    public class UpdateUserDto
    {
        [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
        public string? Password { get; set; }

        [StringLength(50, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 50 caracteres")]
        public string? FirstName { get; set; }

        [StringLength(50, MinimumLength = 2, ErrorMessage = "El apellido debe tener entre 2 y 50 caracteres")]
        public string? LastName { get; set; }

        public string? Role { get; set; }
        public List<string>? Permissions { get; set; }
        public string? ProfileImage { get; set; }
        public string? ProfileImageUrl { get; set; }
        [Phone(ErrorMessage = "Teléfono inválido")]
        public string? Phone { get; set; }
        public bool? IsActive { get; set; }
    }

    public class ToggleUserStatusDto
    {
        [Required(ErrorMessage = "El estado es requerido")]
        public bool IsActive { get; set; }
    }

    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "La contraseña actual es requerida")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "La nueva contraseña es requerida")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
        public string NewPassword { get; set; } = string.Empty;

        public string? ConfirmPassword { get; set; }
    }
}