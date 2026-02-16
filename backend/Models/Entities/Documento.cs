





using System.ComponentModel.DataAnnotations;

using System.ComponentModel.DataAnnotations.Schema;


namespace FlexoAPP.API.Models.Entities
{





    [Table("Documento")]
    public class Documento
    {






        [Key]

        [Column("DocumentoID")]

        public int DocumentoID { get; set; }







        [Required]

        [MaxLength(255)]

        [Column("Nombre")]
        public string Nombre { get; set; } = string.Empty;




        [Required]
        [MaxLength(50)]
        [Column("Tipo")]
        public string Tipo { get; set; } = string.Empty;




        [Required]
        [MaxLength(100)]
        [Column("Categoria")]
        public string Categoria { get; set; } = string.Empty;




        [Column("Descripcion")]
        public string? Descripcion { get; set; }






        [MaxLength(255)]
        [Column("NombreArchivo")]
        public string? NombreArchivo { get; set; }




        [MaxLength(500)]
        [Column("RutaArchivo")]
        public string? RutaArchivo { get; set; }




        [Column("TamanoBytes")]
        public long? TamanoBytes { get; set; }




        [MaxLength(50)]
        [Column("TamanoFormateado")]
        public string? TamanoFormateado { get; set; }




        [MaxLength(20)]
        [Column("Extension")]
        public string? Extension { get; set; }




        [MaxLength(32)]
        [Column("HashMD5")]
        public string? HashMD5 { get; set; }






        [Required]
        [MaxLength(20)]
        [Column("Estado")]
        public string Estado { get; set; } = "draft";




        [MaxLength(20)]
        [Column("Version")]
        public string? Version { get; set; }






        [MaxLength(500)]
        [Column("Etiquetas")]
        public string? Etiquetas { get; set; }




        [MaxLength(500)]
        [Column("PalabrasClave")]
        public string? PalabrasClave { get; set; }






        [MaxLength(100)]
        [Column("CreadoPor")]
        public string? CreadoPor { get; set; }




        [Column("FechaCreacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;




        [MaxLength(100)]
        [Column("ModificadoPor")]
        public string? ModificadoPor { get; set; }




        [Column("FechaModificacion")]
        public DateTime? FechaModificacion { get; set; }






        [Column("EsPublico")]
        public bool EsPublico { get; set; } = false;




        [Column("NivelAcceso")]
        public int NivelAcceso { get; set; } = 1;






        [Column("NumeroVistas")]
        public int NumeroVistas { get; set; } = 0;




        [Column("NumeroDescargas")]
        public int NumeroDescargas { get; set; } = 0;




        [Column("FechaUltimoAcceso")]
        public DateTime? FechaUltimoAcceso { get; set; }
    }
}
