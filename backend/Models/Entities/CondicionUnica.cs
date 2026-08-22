



using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{

    [Table("condicionunica")]
    public class CondicionUnica
    {



        [Key]
        public int Id { get; set; }




        [Required]
        [Column("farticulo")]
        public string FArticulo { get; set; } = string.Empty;






        [Required]
        [Column("descripcion")]
        public string Descripcion { get; set; } = string.Empty;




        [Required]
        [Column("estante")]
        public string Estante { get; set; } = string.Empty;




        [Required]
        [Column("numerocarpeta")]
        public string NumeroCarpeta { get; set; } = string.Empty;





        [Column("estado")]
        public string? Estado { get; set; } = "ACTIVO";




        [Column("createddate")]
        public DateTime? CreatedDate { get; set; }




        [Column("lastmodified")]
        public DateTime? LastModified { get; set; }
    }
}
