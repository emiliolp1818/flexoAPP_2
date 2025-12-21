using System.ComponentModel.DataAnnotations;

namespace FlexoAPP.API.Models.DTOs
{
    /// <summary>
    /// DTO para el formato FF459 - Formato de impresión de máquinas
    /// </summary>
    public class FF459FormatDto
    {
        public string Articulo { get; set; } = string.Empty;
        public int NumeroMaquina { get; set; }
        public string OtSap { get; set; } = string.Empty;
        public string Cliente { get; set; } = string.Empty;
        public string? Referencia { get; set; }
        public string? Td { get; set; }
        public int NumeroColores { get; set; }
        public List<string> Colores { get; set; } = new List<string>();
        public decimal Kilos { get; set; }
        public DateTime FechaTintaEnMaquina { get; set; }
        public string Sustrato { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string? Observaciones { get; set; }
        public DateTime FechaImpresion { get; set; }
        public string UsuarioImpresion { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request para generar el formato FF459
    /// </summary>
    public class GenerateFF459Request
    {
        [Required(ErrorMessage = "El artículo es requerido")]
        public string Articulo { get; set; } = string.Empty;
    }
}
