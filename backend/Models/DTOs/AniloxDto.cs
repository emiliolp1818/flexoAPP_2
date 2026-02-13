using System.ComponentModel.DataAnnotations;

namespace FlexoAPP.API.Models.DTOs
{
    /// <summary>
    /// DTO para mostrar información de un anilox
    /// </summary>
    public class AniloxDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public int Maquina { get; set; }
        public int Bcm { get; set; }
        public int Lineatura { get; set; }
        public string Marca { get; set; } = string.Empty;
        public decimal VolumenReal { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>
    /// DTO para crear un nuevo anilox
    /// </summary>
    public class CreateAniloxDto
    {
        [Required(ErrorMessage = "El código es requerido")]
        [MaxLength(50, ErrorMessage = "El código no puede exceder 50 caracteres")]
        public string Codigo { get; set; } = string.Empty;

        [Required(ErrorMessage = "El número de máquina es requerido")]
        [Range(11, 21, ErrorMessage = "El número de máquina debe estar entre 11 y 21")]
        public int Maquina { get; set; }

        [Required(ErrorMessage = "El BCM es requerido")]
        [Range(1, 10000, ErrorMessage = "El BCM debe ser un valor positivo")]
        public int Bcm { get; set; }

        [Required(ErrorMessage = "La lineatura es requerida")]
        [Range(1, 1000, ErrorMessage = "La lineatura debe ser un valor positivo")]
        public int Lineatura { get; set; }

        [Required(ErrorMessage = "La marca es requerida")]
        [MaxLength(50, ErrorMessage = "La marca no puede exceder 50 caracteres")]
        public string Marca { get; set; } = string.Empty;

        [Required(ErrorMessage = "El volumen real es requerido")]
        [Range(0.01, 1000, ErrorMessage = "El volumen real debe ser un valor positivo")]
        public decimal VolumenReal { get; set; }
    }

    /// <summary>
    /// DTO para actualizar un anilox existente
    /// </summary>
    public class UpdateAniloxDto
    {
        [Required(ErrorMessage = "El código es requerido")]
        [MaxLength(50, ErrorMessage = "El código no puede exceder 50 caracteres")]
        public string Codigo { get; set; } = string.Empty;

        [Required(ErrorMessage = "El número de máquina es requerido")]
        [Range(11, 21, ErrorMessage = "El número de máquina debe estar entre 11 y 21")]
        public int Maquina { get; set; }

        [Required(ErrorMessage = "El BCM es requerido")]
        [Range(1, 10000, ErrorMessage = "El BCM debe ser un valor positivo")]
        public int Bcm { get; set; }

        [Required(ErrorMessage = "La lineatura es requerida")]
        [Range(1, 1000, ErrorMessage = "La lineatura debe ser un valor positivo")]
        public int Lineatura { get; set; }

        [Required(ErrorMessage = "La marca es requerida")]
        [MaxLength(50, ErrorMessage = "La marca no puede exceder 50 caracteres")]
        public string Marca { get; set; } = string.Empty;

        [Required(ErrorMessage = "El volumen real es requerido")]
        [Range(0.01, 1000, ErrorMessage = "El volumen real debe ser un valor positivo")]
        public decimal VolumenReal { get; set; }
    }

    /// <summary>
    /// DTO para importar anilox desde Excel
    /// Estructura: C=Codigo, D=Maquina, E=Lineatura, F=AporteTeorico, G=Proveedor, H=Aporte, I=FactorEficiencia, J=Densidad
    /// </summary>
    public class ImportAniloxDto
    {
        public string Codigo { get; set; } = string.Empty;
        public int Maquina { get; set; }
        public int Lineatura { get; set; }
        public int AporteTeorico { get; set; }
        public string? Proveedor { get; set; }
        public decimal Aporte { get; set; }
        public decimal? FactorEficiencia { get; set; } = 35.00m; // Columna I - Valor por defecto 35%
        public decimal? Densidad { get; set; } = 0.885m; // Columna J - Valor por defecto 0.885
    }
}
