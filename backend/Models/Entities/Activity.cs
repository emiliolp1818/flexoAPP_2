using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{
    [Table("Activities")]
    public class Activity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Action { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime Timestamp { get; set; }

        [Required]
        [StringLength(100)]
        public string Module { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Details { get; set; }

        [Required]
        public int UserId { get; set; }

        [StringLength(50)]
        public string? UserCode { get; set; }

        [StringLength(45)]
        public string? IpAddress { get; set; }

        // Campos adicionales para auditoría detallada
        [StringLength(100)]
        public string? EntityType { get; set; } // Tipo de entidad afectada (Maquina, Design, User, etc.)

        public int? EntityId { get; set; } // ID de la entidad afectada

        [StringLength(200)]
        public string? EntityName { get; set; } // Nombre o código de la entidad

        public TimeSpan? Duration { get; set; } // Duración de la operación (para maquinas)

        [StringLength(2000)]
        public string? OldValues { get; set; } // Valores anteriores (JSON)

        [StringLength(2000)]
        public string? NewValues { get; set; } // Valores nuevos (JSON)

        // Navigation property
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}