using System.ComponentModel.DataAnnotations;

namespace FlexoAPP.API.Models.DTOs
{
    /// <summary>
    /// DTO para transferir datos de máquinas entre el frontend y backend
    /// Representa la información de una máquina flexográfica
    /// </summary>
    public class MaquinaDto
    {
        /// <summary>
        /// ID único de la máquina (opcional para creación)
        /// </summary>
        public int? Id { get; set; }

        /// <summary>
        /// Número de la máquina (11-21) - Campo principal para identificar máquina
        /// </summary>
        [Required(ErrorMessage = "El número de máquina es requerido")]
        [Range(11, 21, ErrorMessage = "El número de máquina debe estar entre 11 y 21")]
        public int NumeroMaquina { get; set; }

        /// <summary>
        /// Código del artículo a producir (ej: F204567)
        /// </summary>
        [Required(ErrorMessage = "El artículo es requerido")]
        [MaxLength(50, ErrorMessage = "El artículo no puede exceder 50 caracteres")]
        public string Articulo { get; set; } = string.Empty;

        /// <summary>
        /// Número de orden de trabajo SAP (ej: OT123456)
        /// </summary>
        [Required(ErrorMessage = "La orden SAP es requerida")]
        [MaxLength(50, ErrorMessage = "La orden SAP no puede exceder 50 caracteres")]
        public string OtSap { get; set; } = string.Empty;

        /// <summary>
        /// Nombre del cliente (ej: ABSORBENTES DE COLOMBIA S.A)
        /// </summary>
        [Required(ErrorMessage = "El cliente es requerido")]
        [MaxLength(200, ErrorMessage = "El cliente no puede exceder 200 caracteres")]
        public string Cliente { get; set; } = string.Empty;

        /// <summary>
        /// Referencia del producto (ej: REF-001)
        /// </summary>
        [MaxLength(100, ErrorMessage = "La referencia no puede exceder 100 caracteres")]
        public string Referencia { get; set; } = string.Empty;

        /// <summary>
        /// Código TD (Tipo de Diseño) (ej: TD-ABC)
        /// </summary>
        [MaxLength(10, ErrorMessage = "El código TD no puede exceder 10 caracteres")]
        public string Td { get; set; } = string.Empty;

        /// <summary>
        /// Número total de colores utilizados en la impresión
        /// </summary>
        [Required(ErrorMessage = "El número de colores es requerido")]
        [Range(1, 10, ErrorMessage = "El número de colores debe estar entre 1 y 10")]
        public int NumeroColores { get; set; }

        /// <summary>
        /// Array de colores para la impresión
        /// Ejemplo: ["CYAN", "MAGENTA", "AMARILLO", "NEGRO"]
        /// </summary>
        [Required(ErrorMessage = "Los colores son requeridos")]
        public string[] Colores { get; set; } = Array.Empty<string>();

        /// <summary>
        /// Cantidad en kilogramos a producir
        /// </summary>
        [Required(ErrorMessage = "Los kilos son requeridos")]
        [Range(0.01, 99999.99, ErrorMessage = "Los kilos deben ser mayor a 0")]
        public decimal Kilos { get; set; }

        /// <summary>
        /// Fecha y hora cuando se aplicó la tinta en la máquina
        /// </summary>
        [Required(ErrorMessage = "La fecha de tinta en máquina es requerida")]
        public DateTime FechaTintaEnMaquina { get; set; }

        /// <summary>
        /// Fecha de tinta en máquina formateada (dd/mm/aaaa: HH:mm)
        /// Solo lectura - calculada automáticamente
        /// </summary>
        public string FechaTintaFormateada => FechaTintaEnMaquina.ToString("dd/MM/yyyy: HH:mm");

        /// <summary>
        /// Tipo de material base (ej: BOPP, PE, PET)
        /// </summary>
        [Required(ErrorMessage = "El sustrato es requerido")]
        [MaxLength(100, ErrorMessage = "El sustrato no puede exceder 100 caracteres")]
        public string Sustrato { get; set; } = string.Empty;

        /// <summary>
        /// Estado actual del programa de la máquina
        /// Valores: LISTO, CORRIENDO, SUSPENDIDO, TERMINADO
        /// </summary>
        [Required(ErrorMessage = "El estado es requerido")]
        [MaxLength(20, ErrorMessage = "El estado no puede exceder 20 caracteres")]
        public string Estado { get; set; } = "LISTO";

        /// <summary>
        /// Observaciones adicionales (opcional)
        /// </summary>
        [MaxLength(1000, ErrorMessage = "Las observaciones no pueden exceder 1000 caracteres")]
        public string? Observaciones { get; set; }

        /// <summary>
        /// Usuario que realizó la última acción (opcional)
        /// </summary>
        public string? LastActionBy { get; set; }

        /// <summary>
        /// Fecha de la última acción (opcional)
        /// </summary>
        public DateTime? LastActionAt { get; set; }

        /// <summary>
        /// Fecha de creación del registro
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Fecha de última actualización del registro
        /// </summary>
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// Información del usuario que creó el registro
        /// </summary>
        public UserBasicDto? CreatedByUser { get; set; }

        /// <summary>
        /// Información del usuario que actualizó el registro
        /// </summary>
        public UserBasicDto? UpdatedByUser { get; set; }
    }

    /// <summary>
    /// DTO simplificado para crear o actualizar una máquina
    /// Contiene solo los campos esenciales para operaciones CRUD
    /// </summary>
    public class CreateMaquinaDto
    {
        /// <summary>
        /// Número de la máquina (11-21)
        /// </summary>
        [Required(ErrorMessage = "El número de máquina es requerido")]
        [Range(11, 21, ErrorMessage = "El número de máquina debe estar entre 11 y 21")]
        public int NumeroMaquina { get; set; }

        /// <summary>
        /// Código del artículo a producir
        /// </summary>
        [Required(ErrorMessage = "El artículo es requerido")]
        [MaxLength(50)]
        public string Articulo { get; set; } = string.Empty;

        /// <summary>
        /// Número de orden de trabajo SAP
        /// </summary>
        [Required(ErrorMessage = "La orden SAP es requerida")]
        [MaxLength(50)]
        public string OtSap { get; set; } = string.Empty;

        /// <summary>
        /// Nombre del cliente
        /// </summary>
        [Required(ErrorMessage = "El cliente es requerido")]
        [MaxLength(200)]
        public string Cliente { get; set; } = string.Empty;

        /// <summary>
        /// Referencia del producto
        /// </summary>
        [MaxLength(100)]
        public string Referencia { get; set; } = string.Empty;

        /// <summary>
        /// Código TD (Tipo de Diseño)
        /// </summary>
        [MaxLength(10)]
        public string Td { get; set; } = string.Empty;

        /// <summary>
        /// Array de colores para la impresión
        /// </summary>
        [Required(ErrorMessage = "Los colores son requeridos")]
        public string[] Colores { get; set; } = Array.Empty<string>();

        /// <summary>
        /// Cantidad en kilogramos a producir
        /// </summary>
        [Required(ErrorMessage = "Los kilos son requeridos")]
        [Range(0.01, 99999.99)]
        public decimal Kilos { get; set; }

        /// <summary>
        /// Fecha y hora cuando se aplicó la tinta en la máquina
        /// </summary>
        [Required(ErrorMessage = "La fecha de tinta en máquina es requerida")]
        public DateTime FechaTintaEnMaquina { get; set; }

        /// <summary>
        /// Tipo de material base
        /// </summary>
        [Required(ErrorMessage = "El sustrato es requerido")]
        [MaxLength(100)]
        public string Sustrato { get; set; } = string.Empty;

        /// <summary>
        /// Estado inicial del programa (opcional, por defecto LISTO)
        /// </summary>
        [MaxLength(20)]
        public string Estado { get; set; } = "LISTO";

        /// <summary>
        /// Observaciones adicionales (opcional)
        /// </summary>
        [MaxLength(1000)]
        public string? Observaciones { get; set; }
    }

    /// <summary>
    /// DTO para actualizar solo el estado de una máquina
    /// Usado para las acciones de cambio de estado
    /// </summary>
    public class UpdateMaquinaEstadoDto
    {
        /// <summary>
        /// Nuevo estado del programa
        /// Valores: LISTO, CORRIENDO, SUSPENDIDO, TERMINADO
        /// </summary>
        [Required(ErrorMessage = "El estado es requerido")]
        [MaxLength(20)]
        public string Estado { get; set; } = string.Empty;

        /// <summary>
        /// Observaciones adicionales (requerido para estado SUSPENDIDO)
        /// </summary>
        [MaxLength(1000)]
        public string? Observaciones { get; set; }
    }
}