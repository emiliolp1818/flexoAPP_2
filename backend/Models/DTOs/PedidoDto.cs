using System.ComponentModel.DataAnnotations;

namespace flexoAPP.Models.DTOs
{
    public class PedidoDto
    {
        public int Id { get; set; }
        public int MachineNumber { get; set; }
        public string NumeroPedido { get; set; } = string.Empty;
        public string Articulo { get; set; } = string.Empty;
        public string Cliente { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public decimal Cantidad { get; set; }
        public string Unidad { get; set; } = "kg";
        public string Estado { get; set; } = "PENDIENTE";
        public DateTime FechaPedido { get; set; }
        public DateTime? FechaEntrega { get; set; }
        public string Prioridad { get; set; } = "NORMAL";
        public string? Observaciones { get; set; }
        public string? AsignadoA { get; set; }
        public DateTime? FechaAsignacion { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreatePedidoDto
    {
        [Required]
        [Range(11, 21, ErrorMessage = "El número de máquina debe estar entre 11 y 21")]
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
        [Range(0.01, double.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
        public decimal Cantidad { get; set; }

        [StringLength(50)]
        public string Unidad { get; set; } = "kg";

        public DateTime? FechaEntrega { get; set; }

        [StringLength(20)]
        public string Prioridad { get; set; } = "NORMAL";

        [StringLength(1000)]
        public string? Observaciones { get; set; }
    }

    public class UpdatePedidoDto
    {
        [StringLength(50)]
        public string? NumeroPedido { get; set; }

        [StringLength(50)]
        public string? Articulo { get; set; }

        [StringLength(200)]
        public string? Cliente { get; set; }

        [StringLength(500)]
        public string? Descripcion { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
        public decimal? Cantidad { get; set; }

        [StringLength(50)]
        public string? Unidad { get; set; }

        [StringLength(20)]
        public string? Estado { get; set; }

        public DateTime? FechaEntrega { get; set; }

        [StringLength(20)]
        public string? Prioridad { get; set; }

        [StringLength(1000)]
        public string? Observaciones { get; set; }

        [StringLength(100)]
        public string? AsignadoA { get; set; }
    }

    public class ChangeEstadoPedidoDto
    {
        [Required]
        [StringLength(20)]
        public string Estado { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Observaciones { get; set; }

        [StringLength(100)]
        public string? AsignadoA { get; set; }
    }

    public class PedidoStatisticsDto
    {
        public int TotalPedidos { get; set; }
        public int PedidosPendientes { get; set; }
        public int PedidosEnProceso { get; set; }
        public int PedidosCompletados { get; set; }
        public int PedidosCancelados { get; set; }
        public decimal CantidadTotalPendiente { get; set; }
        public decimal CantidadTotalCompletada { get; set; }
        public Dictionary<int, int> PedidosPorMaquina { get; set; } = new();
        public Dictionary<string, int> PedidosPorPrioridad { get; set; } = new();
    }
}