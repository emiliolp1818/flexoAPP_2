using System.ComponentModel.DataAnnotations;

namespace flexoAPP.Models.DTOs
{
    public class MachineProgramDto
    {
        public int Id { get; set; }
        public int MachineNumber { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Articulo { get; set; } = string.Empty;
        public string OtSap { get; set; } = string.Empty;
        public string Cliente { get; set; } = string.Empty;
        public string Referencia { get; set; } = string.Empty;
        public string Td { get; set; } = string.Empty;
        public List<string> Colores { get; set; } = new();
        public string Sustrato { get; set; } = string.Empty;
        public decimal Kilos { get; set; }
        public string Estado { get; set; } = string.Empty;
        public DateTime FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public int Progreso { get; set; }
        public string? Observaciones { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateMachineProgramDto
    {
        [Required]
        [Range(11, 21, ErrorMessage = "El número de máquina debe estar entre 11 y 21")]
        public int MachineNumber { get; set; }

        [StringLength(200, ErrorMessage = "El nombre no puede exceder 200 caracteres")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50, ErrorMessage = "El artículo no puede exceder 50 caracteres")]
        public string Articulo { get; set; } = string.Empty;

        [Required]
        [StringLength(50, ErrorMessage = "El OT SAP no puede exceder 50 caracteres")]
        public string OtSap { get; set; } = string.Empty;

        [Required]
        [StringLength(200, ErrorMessage = "El cliente no puede exceder 200 caracteres")]
        public string Cliente { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La referencia no puede exceder 500 caracteres")]
        public string Referencia { get; set; } = string.Empty;

        [StringLength(3, ErrorMessage = "El TD no puede exceder 3 caracteres")]
        public string Td { get; set; } = string.Empty;

        [Required]
        public List<string> Colores { get; set; } = new();

        [StringLength(200, ErrorMessage = "El sustrato no puede exceder 200 caracteres")]
        public string Sustrato { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Los kilos deben ser mayor a 0")]
        public decimal Kilos { get; set; }

        public DateTime? FechaInicio { get; set; }

        public DateTime? FechaTintaEnMaquina { get; set; }

        [RegularExpression("^(PREPARANDO|LISTO|SUSPENDIDO|CORRIENDO|TERMINADO)$", ErrorMessage = "Estado inválido")]
        public string Estado { get; set; } = "PREPARANDO";

        [StringLength(1000, ErrorMessage = "Las observaciones no pueden exceder 1000 caracteres")]
        public string? Observaciones { get; set; }
    }

    public class UpdateMachineProgramDto
    {
        [StringLength(200, ErrorMessage = "El nombre no puede exceder 200 caracteres")]
        public string? Name { get; set; }

        [StringLength(50, ErrorMessage = "El artículo no puede exceder 50 caracteres")]
        public string? Articulo { get; set; }

        [StringLength(50, ErrorMessage = "El OT SAP no puede exceder 50 caracteres")]
        public string? OtSap { get; set; }

        [StringLength(200, ErrorMessage = "El cliente no puede exceder 200 caracteres")]
        public string? Cliente { get; set; }

        [StringLength(500, ErrorMessage = "La referencia no puede exceder 500 caracteres")]
        public string? Referencia { get; set; }

        [StringLength(3, ErrorMessage = "El TD no puede exceder 3 caracteres")]
        public string? Td { get; set; }

        public List<string>? Colores { get; set; }

        [StringLength(200, ErrorMessage = "El sustrato no puede exceder 200 caracteres")]
        public string? Sustrato { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Los kilos deben ser mayor a 0")]
        public decimal? Kilos { get; set; }

        [RegularExpression("^(LISTO|SUSPENDIDO|CORRIENDO|TERMINADO)$", ErrorMessage = "Estado inválido")]
        public string? Estado { get; set; }

        public DateTime? FechaInicio { get; set; }

        public DateTime? FechaFin { get; set; }

        [Range(0, 100, ErrorMessage = "El progreso debe estar entre 0 y 100")]
        public int? Progreso { get; set; }

        [StringLength(1000, ErrorMessage = "Las observaciones no pueden exceder 1000 caracteres")]
        public string? Observaciones { get; set; }
    }

    public class ChangeStatusDto
    {
        [Required]
        [RegularExpression("^(LISTO|SUSPENDIDO|CORRIENDO|TERMINADO)$", ErrorMessage = "Estado inválido")]
        public string Estado { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Las observaciones no pueden exceder 1000 caracteres")]
        public string? Observaciones { get; set; }
    }

    public class MachineProgramStatisticsDto
    {
        public List<StatusStatDto> StatusStats { get; set; } = new();
        public int TotalPrograms { get; set; }
        public int ActiveMachines { get; set; }
        public int TotalMachines { get; set; }
        public int CompletedPrograms { get; set; }
        public int PendingPrograms { get; set; }
        public int SuspendedPrograms { get; set; }
        public int RunningPrograms { get; set; }
    }

    public class StatusStatDto
    {
        public string Estado { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}