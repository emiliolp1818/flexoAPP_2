using System.ComponentModel.DataAnnotations;

namespace FlexoAPP.API.Models.DTOs
{



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





    public class ImportAniloxDto
    {
        public string Codigo { get; set; } = string.Empty;
        public int Maquina { get; set; }
        public int Lineatura { get; set; }
        public int AporteTeorico { get; set; }
        public string? Proveedor { get; set; }
        public decimal Aporte { get; set; }
        public decimal? FactorEficiencia { get; set; } = 35.00m;
        public decimal? Densidad { get; set; } = 0.885m;
    }
}
