using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{
    public class Pedido
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MachineNumber { get; set; }

        [Required]
        [StringLength(50)]
        public string NumeroPedido { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Articulo { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Cliente { get; set; } = string.Empty;

        [StringLength(500)]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        public decimal Cantidad { get; set; }

        [StringLength(50)]
        public string Unidad { get; set; } = "kg";

        [Required]
        [StringLength(20)]
        public string Estado { get; set; } = "PENDIENTE"; // PENDIENTE, EN_PROCESO, COMPLETADO, CANCELADO

        [Required]
        public DateTime FechaPedido { get; set; }

        public DateTime? FechaEntrega { get; set; }

        [StringLength(20)]
        public string Prioridad { get; set; } = "NORMAL"; // BAJA, NORMAL, ALTA, URGENTE

        [StringLength(1000)]
        public string? Observaciones { get; set; }

        // Información del operario
        [StringLength(100)]
        public string? AsignadoA { get; set; }
        
        public DateTime? FechaAsignacion { get; set; }

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