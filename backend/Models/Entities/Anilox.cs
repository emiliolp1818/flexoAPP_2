using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{



    [Table("anilox")]
    public class Anilox
    {



        [Key]
        [Column("id")]
        public int Id { get; set; }




        [Required]
        [MaxLength(50)]
        [Column("codigo")]
        public string Codigo { get; set; } = string.Empty;




        [Required]
        [Column("maquina")]
        public int Maquina { get; set; }




        [Required]
        [Column("bcm")]
        public int Bcm { get; set; }




        [Required]
        [Column("lineatura")]
        public int Lineatura { get; set; }




        [Required]
        [MaxLength(50)]
        [Column("marca")]
        public string Marca { get; set; } = string.Empty;




        [Required]
        [Column("volumen_real")]
        public decimal VolumenReal { get; set; }




        [Column("factor_eficiencia", TypeName = "DECIMAL(5,2)")]
        public decimal? FactorEficiencia { get; set; }




        [Column("densidad", TypeName = "DECIMAL(5,3)")]
        public decimal? Densidad { get; set; }




        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;




        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
