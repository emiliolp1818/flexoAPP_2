// ===== MODELO DE ENTIDAD CONDICIÓN ÚNICA =====
// Clase que representa la tabla condicionunica en la base de datos
// Contiene información sobre artículos, referencias y ubicación física

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{
    // Mapea la clase a la tabla "condicionunica" en la base de datos
    [Table("condicionunica")]
    public class CondicionUnica
    {
        // ID único del registro (clave primaria, autoincremental)
        [Key]
        public int Id { get; set; }
        
        // Código del artículo F (ejemplo: F204567)
        // Campo requerido para identificar el artículo
        [Required]
        [Column("farticulo")]
        public string FArticulo { get; set; } = string.Empty;
        
        // Referencia del producto o diseño
        // Información adicional sobre el artículo
        [Required]
        [Column("referencia")]
        public string Referencia { get; set; } = string.Empty;
        
        // Número de estante donde se encuentra físicamente
        // Ubicación en el almacén o área de producción
        [Required]
        [Column("estante")]
        public string Estante { get; set; } = string.Empty;
        
        // Número de carpeta donde está archivado
        // Organización documental del artículo
        [Required]
        [Column("numerocarpeta")]
        public string NumeroCarpeta { get; set; } = string.Empty;
        
        // Fecha de creación del registro
        // Se genera automáticamente al crear el registro
        [Column("createddate")]
        public DateTime? CreatedDate { get; set; }
        
        // Fecha de última modificación
        // Se actualiza automáticamente al editar el registro
        [Column("lastmodified")]
        public DateTime? LastModified { get; set; }
    }
}
