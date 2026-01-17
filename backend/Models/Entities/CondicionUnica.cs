// ===== MODELO DE ENTIDAD CONDICIÓN ÚNICA =====
// Clase que representa la tabla condicionunica en la base de datos
// Contiene información sobre artículos, descripción y ubicación física

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{
    // Mapea la clase a la tabla "condicionunica" en la base de datos
    [Table("condicionunica")]
    public class CondicionUnica
    {
        // ===== COLUMNA: ID (Clave Primaria) =====
        // ID único del registro (clave primaria, autoincremental)
        // Se genera automáticamente al insertar un nuevo registro
        [Key]
        public int Id { get; set; }
        
        // ===== COLUMNA: FARTICULO (Código del Artículo) =====
        // Código del artículo F (ejemplo: F204567)
        // Campo requerido para identificar el artículo de forma única
        [Required]
        [Column("farticulo")]
        public string FArticulo { get; set; } = string.Empty;
        
        // ===== COLUMNA: DESCRIPCION (Descripción del Producto) =====
        // Descripción del producto o diseño
        // Se carga automáticamente desde la tabla designs si el artículo existe
        // Si no existe en designs, se ingresa manualmente
        // NOTA: Antes se llamaba "Referencia", ahora es "Descripcion" para mayor claridad
        [Required]
        [Column("descripcion")]
        public string Descripcion { get; set; } = string.Empty;
        
        // ===== COLUMNA: ESTANTE (Ubicación Física) =====
        // Número de estante donde se encuentra físicamente el artículo
        // Ubicación en el almacén o área de producción
        [Required]
        [Column("estante")]
        public string Estante { get; set; } = string.Empty;
        
        // ===== COLUMNA: NUMEROCARPETA (Organización Documental) =====
        // Número de carpeta donde está archivado el documento del artículo
        // Organización documental del artículo
        [Required]
        [Column("numerocarpeta")]
        public string NumeroCarpeta { get; set; } = string.Empty;
        
        // ===== COLUMNA: ESTADO (Estado del Registro) =====
        // Estado actual del registro (ej: "ACTIVO", "INACTIVO", "EN REVISIÓN", etc.)
        // Permite gestionar el ciclo de vida del registro
        // Valor por defecto: "ACTIVO"
        [Column("estado")]
        public string? Estado { get; set; } = "ACTIVO";
        
        // ===== COLUMNA: CREATEDDATE (Fecha de Creación) =====
        // Fecha de creación del registro
        // Se genera automáticamente al crear el registro
        [Column("createddate")]
        public DateTime? CreatedDate { get; set; }
        
        // ===== COLUMNA: LASTMODIFIED (Fecha de Última Modificación) =====
        // Fecha de última modificación
        // Se actualiza automáticamente al editar el registro
        [Column("lastmodified")]
        public DateTime? LastModified { get; set; }
    }
}
