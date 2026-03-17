namespace FlexoAPP.API.Models.DTOs
{
    /// <summary>
    /// DTO para un color con sus datos de tinta
    /// </summary>
    public class ColorTintaDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string CodTinta { get; set; } = string.Empty;
        public decimal? Cobertura { get; set; }
        public string CodAnilox { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO para crear un registro de código de tintas
    /// </summary>
    public class CreateCodTintaDto
    {
        public string Articulo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public List<ColorTintaDto> Colores { get; set; } = new();
    }

    /// <summary>
    /// DTO para actualizar un registro de código de tintas
    /// </summary>
    public class UpdateCodTintaDto
    {
        public string? Descripcion { get; set; }
        public List<ColorTintaDto> Colores { get; set; } = new();
    }

    /// <summary>
    /// DTO de respuesta para código de tintas
    /// </summary>
    public class CodTintaResponseDto
    {
        public int Id { get; set; }
        public string Articulo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public List<ColorTintaDto> Colores { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
    }
}
