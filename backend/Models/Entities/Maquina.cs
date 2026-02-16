using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{






    [Table("maquinas")]
    public class Maquina
    {







        [Key]
        [Required]
        [MaxLength(50)]
        [Column("ot_sap")]
        public string OtSap { get; set; } = string.Empty;






        [Required]
        [MaxLength(50)]
        public string Articulo { get; set; } = string.Empty;






        [Required]
        [Range(11, 21, ErrorMessage = "El número de máquina debe estar entre 11 y 21")]
        public int NumeroMaquina { get; set; }





        [Required]
        [MaxLength(200)]
        public string Cliente { get; set; } = string.Empty;




        [MaxLength(100)]
        public string Referencia { get; set; } = string.Empty;




        [MaxLength(10)]
        public string Td { get; set; } = string.Empty;





        [MaxLength(50)]
        [Column("tipo_impresion")]
        public string? TipoImpresion { get; set; }




        [Required]
        [Range(1, 10, ErrorMessage = "El número de colores debe estar entre 1 y 10")]
        public int NumeroColores { get; set; }





        [Required]
        [Column(TypeName = "JSON")]
        public string Colores { get; set; } = "[]";




        [Required]
        [Column(TypeName = "DECIMAL(10,3)")]
        [Range(0.001, 99999.999, ErrorMessage = "Los kilos deben ser mayor a 0")]
        public decimal Kilos { get; set; }





        [Column(TypeName = "DECIMAL(10,2)")]
        public decimal? Metros { get; set; }





        [Required]
        public DateTime FechaTintaEnMaquina { get; set; }




        [Required]
        [MaxLength(100)]
        public string Sustrato { get; set; } = string.Empty;






        [MaxLength(20)]
        public string? Estado { get; set; } = null;




        [MaxLength(1000)]
        public string? Observaciones { get; set; }




        [MaxLength(100)]
        public string? LastActionBy { get; set; }




        public DateTime? LastActionAt { get; set; }






        [Column("preparando_started_at")]
        public DateTime? PreparandoStartedAt { get; set; }




        public int? CreatedBy { get; set; }




        public int? UpdatedBy { get; set; }




        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;




        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.Now;


        [ForeignKey("CreatedBy")]
        [InverseProperty("CreatedMaquinas")]
        public virtual User? CreatedByUser { get; set; }

        [ForeignKey("UpdatedBy")]
        [InverseProperty("UpdatedMaquinas")]
        public virtual User? UpdatedByUser { get; set; }






        public string[] GetColoresArray()
        {
            try
            {
                if (string.IsNullOrEmpty(Colores) || Colores == "[]")
                    return Array.Empty<string>();

                return System.Text.Json.JsonSerializer.Deserialize<string[]>(Colores) ?? Array.Empty<string>();
            }
            catch
            {
                return Array.Empty<string>();
            }
        }






        public void SetColoresArray(string[] colores)
        {
            Colores = System.Text.Json.JsonSerializer.Serialize(colores ?? Array.Empty<string>());
            NumeroColores = colores?.Length ?? 0;
        }






        public string GetFechaTintaFormateada()
        {
            return FechaTintaEnMaquina.ToString("dd/MM/yyyy: HH:mm");
        }





        public bool IsEstadoValido()
        {

            if (string.IsNullOrWhiteSpace(Estado))
                return true;

            var estadosValidos = new[] { "PREPARANDO", "LISTO", "CORRIENDO", "SUSPENDIDO", "TERMINADO" };
            return estadosValidos.Contains(Estado?.ToUpper());
        }
    }
}