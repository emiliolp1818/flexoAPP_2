// =====================================================
// ENTIDAD DOCUMENTO - FLEXOAPP
// Propósito: Modelo de datos para documentos del sistema
// =====================================================

// Importar namespace para anotaciones de datos
using System.ComponentModel.DataAnnotations;
// Importar namespace para anotaciones de esquema de base de datos
using System.ComponentModel.DataAnnotations.Schema;

// Namespace de entidades del proyecto
namespace FlexoAPP.API.Models.Entities
{
    /// <summary>
    /// Entidad que representa un documento en el sistema
    /// Mapea a la tabla Documento en MySQL
    /// </summary>
    // Atributo que especifica el nombre de la tabla en la base de datos
    [Table("Documento")]
    public class Documento
    {
        // ===== IDENTIFICACIÓN =====
        
        /// <summary>
        /// ID único del documento (clave primaria)
        /// </summary>
        // Atributo que marca esta propiedad como clave primaria
        [Key]
        // Atributo que especifica el nombre de la columna en la BD
        [Column("DocumentoID")]
        // Propiedad pública con getter y setter automáticos
        public int DocumentoID { get; set; }
        
        // ===== INFORMACIÓN BÁSICA =====
        
        /// <summary>
        /// Nombre descriptivo del documento
        /// </summary>
        // Atributo que marca el campo como requerido (NOT NULL en BD)
        [Required]
        // Atributo que especifica la longitud máxima (VARCHAR(255))
        [MaxLength(255)]
        // Atributo que especifica el nombre de la columna
        [Column("Nombre")]
        public string Nombre { get; set; } = string.Empty;
        
        /// <summary>
        /// Tipo de documento (PDF, Word, Excel, etc.)
        /// </summary>
        [Required]
        [MaxLength(50)]
        [Column("Tipo")]
        public string Tipo { get; set; } = string.Empty;
        
        /// <summary>
        /// Categoría del documento (reportes, formatos, tecnicos, otros)
        /// </summary>
        [Required]
        [MaxLength(100)]
        [Column("Categoria")]
        public string Categoria { get; set; } = string.Empty;
        
        /// <summary>
        /// Descripción detallada del documento (opcional)
        /// </summary>
        [Column("Descripcion")]
        public string? Descripcion { get; set; }
        
        // ===== INFORMACIÓN DEL ARCHIVO =====
        
        /// <summary>
        /// Nombre del archivo físico almacenado
        /// </summary>
        [MaxLength(255)]
        [Column("NombreArchivo")]
        public string? NombreArchivo { get; set; }
        
        /// <summary>
        /// Ruta o URL donde se encuentra el archivo
        /// </summary>
        [MaxLength(500)]
        [Column("RutaArchivo")]
        public string? RutaArchivo { get; set; }
        
        /// <summary>
        /// Tamaño del archivo en bytes
        /// </summary>
        [Column("TamanoBytes")]
        public long? TamanoBytes { get; set; }
        
        /// <summary>
        /// Tamaño formateado legible (ej: "2.5 MB")
        /// </summary>
        [MaxLength(50)]
        [Column("TamanoFormateado")]
        public string? TamanoFormateado { get; set; }
        
        /// <summary>
        /// Extensión del archivo (pdf, docx, xlsx, etc.)
        /// </summary>
        [MaxLength(20)]
        [Column("Extension")]
        public string? Extension { get; set; }
        
        /// <summary>
        /// Hash MD5 del archivo para verificación de integridad
        /// </summary>
        [MaxLength(32)]
        [Column("HashMD5")]
        public string? HashMD5 { get; set; }
        
        // ===== ESTADO Y CONTROL =====
        
        /// <summary>
        /// Estado del documento (active, draft, archived)
        /// </summary>
        [Required]
        [MaxLength(20)]
        [Column("Estado")]
        public string Estado { get; set; } = "draft";
        
        /// <summary>
        /// Versión del documento
        /// </summary>
        [MaxLength(20)]
        [Column("Version")]
        public string? Version { get; set; }
        
        // ===== METADATOS =====
        
        /// <summary>
        /// Etiquetas del documento separadas por comas
        /// </summary>
        [MaxLength(500)]
        [Column("Etiquetas")]
        public string? Etiquetas { get; set; }
        
        /// <summary>
        /// Palabras clave para búsqueda
        /// </summary>
        [MaxLength(500)]
        [Column("PalabrasClave")]
        public string? PalabrasClave { get; set; }
        
        // ===== AUDITORÍA =====
        
        /// <summary>
        /// Usuario que creó el documento
        /// </summary>
        [MaxLength(100)]
        [Column("CreadoPor")]
        public string? CreadoPor { get; set; }
        
        /// <summary>
        /// Fecha y hora de creación
        /// </summary>
        [Column("FechaCreacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// Usuario que modificó por última vez
        /// </summary>
        [MaxLength(100)]
        [Column("ModificadoPor")]
        public string? ModificadoPor { get; set; }
        
        /// <summary>
        /// Fecha y hora de última modificación
        /// </summary>
        [Column("FechaModificacion")]
        public DateTime? FechaModificacion { get; set; }
        
        // ===== CONTROL DE ACCESO =====
        
        /// <summary>
        /// Indica si el documento es público
        /// </summary>
        [Column("EsPublico")]
        public bool EsPublico { get; set; } = false;
        
        /// <summary>
        /// Nivel de acceso requerido (0=público, 1=usuario, 2=admin)
        /// </summary>
        [Column("NivelAcceso")]
        public int NivelAcceso { get; set; } = 1;
        
        // ===== ESTADÍSTICAS =====
        
        /// <summary>
        /// Número de veces que se ha visualizado
        /// </summary>
        [Column("NumeroVistas")]
        public int NumeroVistas { get; set; } = 0;
        
        /// <summary>
        /// Número de veces que se ha descargado
        /// </summary>
        [Column("NumeroDescargas")]
        public int NumeroDescargas { get; set; } = 0;
        
        /// <summary>
        /// Fecha de último acceso al documento
        /// </summary>
        [Column("FechaUltimoAcceso")]
        public DateTime? FechaUltimoAcceso { get; set; }
    }
}
