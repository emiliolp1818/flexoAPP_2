using System.ComponentModel.DataAnnotations;

namespace FlexoAPP.API.Models.DTOs
{
    public class ActivityDto
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Module { get; set; } = string.Empty;
        public string? Details { get; set; }
        public int UserId { get; set; }
        public string? UserCode { get; set; }
        public string? IpAddress { get; set; }
        public int DaysRemaining { get; set; }
        public DateTime ExpirationDate { get; set; }
        public bool IsExpiringSoon { get; set; } // Menos de 7 días
    }

    public class CreateActivityDto
    {
        [Required(ErrorMessage = "La acción es requerida")]
        public string Action { get; set; } = string.Empty;

        [Required(ErrorMessage = "La descripción es requerida")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "El módulo es requerido")]
        public string Module { get; set; } = string.Empty;

        public string? Details { get; set; }
    }
}