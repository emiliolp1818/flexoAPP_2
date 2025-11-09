using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{
    public class MachineProgram
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MachineNumber { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Articulo { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string OtSap { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Cliente { get; set; } = string.Empty;

        [StringLength(500)]
        public string Referencia { get; set; } = string.Empty;

        [StringLength(3)]
        public string Td { get; set; } = string.Empty;

        [Required]
        public int NumeroColores { get; set; } // Número total de colores

        [Required]
        public string Colores { get; set; } = string.Empty; // JSON array as string

        [StringLength(200)]
        public string Sustrato { get; set; } = string.Empty;

        [Required]
        public decimal Kilos { get; set; }

        [Required]
        [StringLength(20)]
        public string Estado { get; set; } = "LISTO"; // LISTO, SUSPENDIDO, CORRIENDO, TERMINADO

        [Required]
        public DateTime FechaInicio { get; set; }

        [Required]
        public DateTime FechaTintaEnMaquina { get; set; } // Fecha cuando se aplicó la tinta en la máquina

        public DateTime? FechaFin { get; set; }

        [Range(0, 100)]
        public int Progreso { get; set; } = 0;

        [StringLength(1000)]
        public string? Observaciones { get; set; }

        // Información del operario
        [StringLength(100)]
        public string? LastActionBy { get; set; }
        
        public DateTime? LastActionAt { get; set; }
        
        [StringLength(200)]
        public string? LastAction { get; set; }
        
        [StringLength(100)]
        public string? OperatorName { get; set; }

        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("CreatedBy")]
        public virtual User? CreatedByUser { get; set; }

        [ForeignKey("UpdatedBy")]
        public virtual User? UpdatedByUser { get; set; }
    }
}