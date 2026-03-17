using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{
    /// <summary>
    /// Entidad para códigos de tintas por diseño
    /// </summary>
    [Table("cod_tintas")]
    public class CodTinta
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("articulo")]
        [MaxLength(50)]
        public string Articulo { get; set; } = string.Empty;

        [Column("descripcion")]
        [MaxLength(200)]
        public string? Descripcion { get; set; }

        [Required]
        [Column("colores_data", TypeName = "json")]
        public string ColoresData { get; set; } = "[]";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by")]
        [MaxLength(100)]
        public string? CreatedBy { get; set; }

        [Column("updated_by")]
        [MaxLength(100)]
        public string? UpdatedBy { get; set; }
    }
}
