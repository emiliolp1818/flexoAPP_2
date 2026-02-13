using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{
    /// <summary>
    /// Entidad que representa un anilox en el inventario
    /// </summary>
    [Table("anilox")]
    public class Anilox
    {
        /// <summary>
        /// ID único del anilox
        /// </summary>
        [Key]
        [Column("id")]
        public int Id { get; set; }

        /// <summary>
        /// Código único del anilox
        /// </summary>
        [Required]
        [MaxLength(50)]
        [Column("codigo")]
        public string Codigo { get; set; } = string.Empty;

        /// <summary>
        /// Número de máquina (11-21)
        /// </summary>
        [Required]
        [Column("maquina")]
        public int Maquina { get; set; }

        /// <summary>
        /// BCM (Billion Cubic Microns)
        /// </summary>
        [Required]
        [Column("bcm")]
        public int Bcm { get; set; }

        /// <summary>
        /// Lineatura en LPI (Lines Per Inch)
        /// </summary>
        [Required]
        [Column("lineatura")]
        public int Lineatura { get; set; }

        /// <summary>
        /// Marca del anilox (APEX, ZECHER, HARPER)
        /// </summary>
        [Required]
        [MaxLength(50)]
        [Column("marca")]
        public string Marca { get; set; } = string.Empty;

        /// <summary>
        /// Volumen real medido
        /// </summary>
        [Required]
        [Column("volumen_real")]
        public decimal VolumenReal { get; set; }

        /// <summary>
        /// Factor de eficiencia del anilox (valor entre 0 y 1, por defecto 0.35 = 35%)
        /// </summary>
        [Column("factor_eficiencia", TypeName = "DECIMAL(5,2)")]
        public decimal? FactorEficiencia { get; set; }

        /// <summary>
        /// Densidad del anilox (por defecto 0.885)
        /// </summary>
        [Column("densidad", TypeName = "DECIMAL(5,3)")]
        public decimal? Densidad { get; set; }

        /// <summary>
        /// Fecha de creación
        /// </summary>
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Fecha de última actualización
        /// </summary>
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
