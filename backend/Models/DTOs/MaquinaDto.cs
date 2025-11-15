namespace flexoAPP.Models.DTOs
{
    public class MaquinaDto
    {
        public string Articulo { get; set; } = string.Empty;
        public int NumeroMaquina { get; set; }
        public string OtSap { get; set; } = string.Empty;
        public string Cliente { get; set; } = string.Empty;
        public string Referencia { get; set; } = string.Empty;
        public string Td { get; set; } = string.Empty;
        public int NumeroColores { get; set; }
        public List<string> Colores { get; set; } = new();
        public decimal Kilos { get; set; }
        public DateTime FechaTintaEnMaquina { get; set; }
        public string Sustrato { get; set; } = string.Empty;
        public string Estado { get; set; } = "LISTO";
        public string? Observaciones { get; set; }
        public string? LastActionBy { get; set; }
        public DateTime? LastActionAt { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateMaquinaDto
    {
        public string Articulo { get; set; } = string.Empty;
        public int NumeroMaquina { get; set; }
        public string OtSap { get; set; } = string.Empty;
        public string Cliente { get; set; } = string.Empty;
        public string Referencia { get; set; } = string.Empty;
        public string Td { get; set; } = string.Empty;
        public List<string> Colores { get; set; } = new();
        public decimal Kilos { get; set; }
        public DateTime? FechaTintaEnMaquina { get; set; }
        public string Sustrato { get; set; } = string.Empty;
        public string Estado { get; set; } = "PREPARANDO";
        public string? Observaciones { get; set; }
    }

    public class UpdateMaquinaDto
    {
        public int? NumeroMaquina { get; set; }
        public string? OtSap { get; set; }
        public string? Cliente { get; set; }
        public string? Referencia { get; set; }
        public string? Td { get; set; }
        public List<string>? Colores { get; set; }
        public decimal? Kilos { get; set; }
        public DateTime? FechaTintaEnMaquina { get; set; }
        public string? Sustrato { get; set; }
        public string? Estado { get; set; }
        public string? Observaciones { get; set; }
    }

    public class ExcelProcessResultDto
    {
        public bool Success { get; set; }
        public int ProcessedCount { get; set; }
        public List<MaquinaDto>? Programs { get; set; }
        public string? ErrorMessage { get; set; }
        public List<string>? ValidationErrors { get; set; }
    }
}
