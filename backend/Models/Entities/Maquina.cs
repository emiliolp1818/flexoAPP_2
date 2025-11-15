using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{
    /// <summary>
    /// Entidad que representa una máquina flexográfica en el sistema
    /// Tabla: maquinas (base de datos: flexoapp_bd)
    /// CLAVE PRIMARIA: Articulo (código único del artículo)
    /// SIN campo Id - articulo es suficiente como identificador único
    /// </summary>
    [Table("maquinas")] // Nombre de la tabla en MySQL
    public class Maquina
    {
        /// <summary>
        /// Código del artículo a producir (ej: F204567, F204568)
        /// CLAVE PRIMARIA (PRIMARY KEY) - Identifica de forma única cada registro
        /// Se usará para cargar información de otra base de datos
        /// Columna: articulo VARCHAR(50) PRIMARY KEY
        /// </summary>
        [Key] // Atributo que indica que este campo es la clave primaria
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
        /// Número de orden de trabajo SAP (ej: OT123456)
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string OtSap { get; set; } = string.Empty;

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
        [Column(TypeName = "DECIMAL(10,2)")]
        [Range(0.01, 99999.99, ErrorMessage = "Los kilos deben ser mayor a 0")]
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
        /// Valores: LISTO, CORRIENDO, SUSPENDIDO, TERMINADO
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string Estado { get; set; } = "LISTO";

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

        // NOTA: Propiedades de navegación comentadas temporalmente para evitar problemas con Entity Framework
        // [ForeignKey("CreatedBy")]
        // public virtual User? CreatedByUser { get; set; }
        // [ForeignKey("UpdatedBy")]
        // public virtual User? UpdatedByUser { get; set; }

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
            var estadosValidos = new[] { "LISTO", "CORRIENDO", "SUSPENDIDO", "TERMINADO" };
            return estadosValidos.Contains(Estado?.ToUpper());
        }
    }
}