using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{
    /// <summary>
    /// Entidad que representa una máquina flexográfica en el sistema
    /// Tabla: maquinas (base de datos: flexoapp_bd)
    /// CLAVE PRIMARIA: OtSap (Orden de Trabajo SAP - único por programación)
    /// PERMITE DUPLICADOS: El mismo artículo puede estar varias veces en la misma máquina
    /// </summary>
    [Table("maquinas")] // Nombre de la tabla en MySQL
    public class Maquina
    {
        // ID eliminado - OtSap es la clave primaria

        /// <summary>
        /// Orden de Trabajo SAP (Identificador único de la programación)
        /// Clave Primaria
        /// Columna: ot_sap VARCHAR(50) NOT NULL PRIMARY KEY
        /// </summary>
        [Key]
        [Required]
        [MaxLength(50)]
        [Column("ot_sap")]
        public string OtSap { get; set; } = string.Empty;

        /// <summary>
        /// Código del artículo a producir (ej: F204567, F204568)
        /// Puede repetirse (mismo artículo en diferentes OTs)
        /// Columna: articulo VARCHAR(50) NOT NULL
        /// </summary>
        [Required] // Campo obligatorio, no puede ser nulo
        [MaxLength(50)] // Longitud máxima de 50 caracteres
        public string Articulo { get; set; } = string.Empty; // Valor por defecto: cadena vacía

        /// <summary>
        /// Número de la máquina flexográfica (11-21)
        /// Campo principal para identificar en qué máquina se ejecutará el programa
        /// Columna: numero_maquina INT NOT NULL
        /// </summary>
        [Required] // Campo obligatorio
        [Range(11, 21, ErrorMessage = "El número de máquina debe estar entre 11 y 21")] // Validación: solo valores 11-21
        public int NumeroMaquina { get; set; } // Número de máquina


        /// <summary>
        /// Nombre del cliente (ej: ABSORBENTES DE COLOMBIA S.A)
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string Cliente { get; set; } = string.Empty;

        /// <summary>
        /// Referencia del producto (ej: REF-001)
        /// </summary>
        [MaxLength(100)]
        public string Referencia { get; set; } = string.Empty;

        /// <summary>
        /// Código TD (Tipo de Diseño) (ej: TD-ABC)
        /// </summary>
        [MaxLength(10)]
        public string Td { get; set; } = string.Empty;

        /// <summary>
        /// Número total de colores utilizados en la impresión
        /// </summary>
        [Required]
        [Range(1, 10, ErrorMessage = "El número de colores debe estar entre 1 y 10")]
        public int NumeroColores { get; set; }

        /// <summary>
        /// Array de colores para la impresión en formato JSON
        /// Ejemplo: ["CYAN", "MAGENTA", "AMARILLO", "NEGRO"]
        /// </summary>
        [Required]
        [Column(TypeName = "JSON")]
        public string Colores { get; set; } = "[]";

        /// <summary>
        /// Cantidad en kilogramos a producir
        /// </summary>
        [Required]
        [Column(TypeName = "DECIMAL(10,3)")]
        [Range(0.001, 99999.999, ErrorMessage = "Los kilos deben ser mayor a 0")]
        public decimal Kilos { get; set; }

        /// <summary>
        /// Fecha y hora cuando se aplicó la tinta en la máquina
        /// Formato: dd/mm/aaaa: hora
        /// </summary>
        [Required]
        public DateTime FechaTintaEnMaquina { get; set; }

        /// <summary>
        /// Tipo de material base (ej: BOPP, PE, PET)
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string Sustrato { get; set; } = string.Empty;

        /// <summary>
        /// Estado actual del programa de la máquina
        /// Valores: PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO
        /// NULL o vacío = Sin asignar (programa nuevo)
        /// </summary>
        [MaxLength(20)]
        public string? Estado { get; set; } = null; // NULL por defecto - El operario debe asignar

        /// <summary>
        /// Observaciones adicionales (opcional)
        /// </summary>
        [MaxLength(1000)]
        public string? Observaciones { get; set; }

        /// <summary>
        /// Usuario que realizó la última acción (opcional)
        /// </summary>
        [MaxLength(100)]
        public string? LastActionBy { get; set; }

        /// <summary>
        /// Fecha de la última acción (opcional)
        /// </summary>
        public DateTime? LastActionAt { get; set; }

        /// <summary>
        /// Fecha y hora cuando se marcó como PREPARANDO
        /// Se guarda solo cuando el estado cambia a PREPARANDO
        /// Se usa para calcular el tiempo transcurrido hasta LISTO
        /// </summary>
        [Column("preparando_started_at")]
        public DateTime? PreparandoStartedAt { get; set; }

        /// <summary>
        /// ID del usuario que creó el registro
        /// </summary>
        public int? CreatedBy { get; set; }

        /// <summary>
        /// ID del usuario que actualizó el registro por última vez
        /// </summary>
        public int? UpdatedBy { get; set; }

        /// <summary>
        /// Fecha de creación del registro
        /// </summary>
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Fecha de última actualización del registro
        /// </summary>
        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Propiedades de navegación para las relaciones con `User` (creador / actualizador)
        [ForeignKey("CreatedBy")]
        [InverseProperty("CreatedMaquinas")]
        public virtual User? CreatedByUser { get; set; }

        [ForeignKey("UpdatedBy")]
        [InverseProperty("UpdatedMaquinas")]
        public virtual User? UpdatedByUser { get; set; }

        /// <summary>
        /// Método para obtener los colores como array de strings
        /// Parsea el JSON almacenado en la propiedad Colores
        /// </summary>
        /// <returns>Array de strings con los colores</returns>
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

        /// <summary>
        /// Método para establecer los colores desde un array de strings
        /// Convierte el array a JSON para almacenar en la base de datos
        /// </summary>
        /// <param name="colores">Array de strings con los colores</param>
        public void SetColoresArray(string[] colores)
        {
            Colores = System.Text.Json.JsonSerializer.Serialize(colores ?? Array.Empty<string>());
            NumeroColores = colores?.Length ?? 0;
        }

        /// <summary>
        /// Método para formatear la fecha de tinta en máquina
        /// Formato: dd/mm/aaaa: HH:mm
        /// </summary>
        /// <returns>Fecha formateada como string</returns>
        public string GetFechaTintaFormateada()
        {
            return FechaTintaEnMaquina.ToString("dd/MM/yyyy: HH:mm");
        }

        /// <summary>
        /// Método para validar si el estado es válido
        /// </summary>
        /// <returns>True si el estado es válido</returns>
        public bool IsEstadoValido()
        {
            // NULL o vacío es válido (programa nuevo sin estado asignado)
            if (string.IsNullOrWhiteSpace(Estado))
                return true;
                
            var estadosValidos = new[] { "PREPARANDO", "LISTO", "CORRIENDO", "SUSPENDIDO", "TERMINADO" };
            return estadosValidos.Contains(Estado?.ToUpper());
        }
    }
}