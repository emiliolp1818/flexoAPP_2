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
        public string? Descripcion { get; set; }

        [Required]
        [Column(TypeName = "DECIMAL(10,2)")]
        public decimal Cantidad { get; set; }

        [StringLength(50)]
        public string Unidad { get; set; } = "kg";

        [Required]
        [StringLength(20)]
        public string Estado { get; set; } = "PENDIENTE";

        [Required]
        public DateTime FechaPedido { get; set; }

        public DateTime? FechaEntrega { get; set; }

        [StringLength(20)]
        public string Prioridad { get; set; } = "NORMAL";

        [StringLength(1000)]
        public string? Observaciones { get; set; }

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