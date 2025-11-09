using FlexoAPP.API.Models.DTOs;

namespace FlexoAPP.API.Services
{
    /// <summary>
    /// Interfaz del servicio para la gestión de máquinas flexográficas
    /// Define las operaciones de negocio para el módulo de máquinas
    /// </summary>
    public interface IMaquinaService
    {
        /// <summary>
        /// Obtener todas las máquinas ordenadas por fecha de tinta en máquina (más reciente primero)
        /// </summary>
        /// <returns>Lista de DTOs de máquinas</returns>
        Task<IEnumerable<MaquinaDto>> GetAllAsync();

        /// <summary>
        /// Obtener una máquina por su ID
        /// </summary>
        /// <param name="id">ID de la máquina</param>
        /// <returns>DTO de la máquina encontrada o null si no existe</returns>
        Task<MaquinaDto?> GetByIdAsync(int id);

        /// <summary>
        /// Obtener todas las máquinas de un número específico (11-21)
        /// Ordenadas por fecha de tinta en máquina descendente
        /// </summary>
        /// <param name="numeroMaquina">Número de la máquina (11-21)</param>
        /// <returns>Lista de DTOs de máquinas del número especificado</returns>
        Task<IEnumerable<MaquinaDto>> GetByNumeroMaquinaAsync(int numeroMaquina);

        /// <summary>
        /// Obtener máquinas por estado específico
        /// </summary>
        /// <param name="estado">Estado a filtrar (LISTO, CORRIENDO, SUSPENDIDO, TERMINADO)</param>
        /// <returns>Lista de DTOs de máquinas con el estado especificado</returns>
        Task<IEnumerable<MaquinaDto>> GetByEstadoAsync(string estado);

        /// <summary>
        /// Obtener máquinas por cliente
        /// </summary>
        /// <param name="cliente">Nombre del cliente</param>
        /// <returns>Lista de DTOs de máquinas del cliente especificado</returns>
        Task<IEnumerable<MaquinaDto>> GetByClienteAsync(string cliente);

        /// <summary>
        /// Obtener máquinas por rango de fechas de tinta en máquina
        /// </summary>
        /// <param name="fechaInicio">Fecha de inicio del rango</param>
        /// <param name="fechaFin">Fecha de fin del rango</param>
        /// <returns>Lista de DTOs de máquinas en el rango de fechas</returns>
        Task<IEnumerable<MaquinaDto>> GetByFechaRangeAsync(DateTime fechaInicio, DateTime fechaFin);

        /// <summary>
        /// Obtener números de máquinas que tienen registros activos
        /// </summary>
        /// <returns>Lista de números de máquinas con registros</returns>
        Task<IEnumerable<int>> GetNumerosMaquinasConRegistrosAsync();

        /// <summary>
        /// Crear una nueva máquina
        /// </summary>
        /// <param name="createDto">DTO con datos para crear la máquina</param>
        /// <param name="userId">ID del usuario que crea la máquina</param>
        /// <returns>DTO de la máquina creada</returns>
        Task<MaquinaDto> CreateAsync(CreateMaquinaDto createDto, int userId);

        /// <summary>
        /// Actualizar una máquina existente
        /// </summary>
        /// <param name="id">ID de la máquina a actualizar</param>
        /// <param name="updateDto">DTO con datos actualizados</param>
        /// <param name="userId">ID del usuario que actualiza la máquina</param>
        /// <returns>DTO de la máquina actualizada</returns>
        Task<MaquinaDto> UpdateAsync(int id, CreateMaquinaDto updateDto, int userId);

        /// <summary>
        /// Actualizar solo el estado de una máquina
        /// </summary>
        /// <param name="id">ID de la máquina</param>
        /// <param name="estadoDto">DTO con el nuevo estado y observaciones</param>
        /// <param name="userId">ID del usuario que realiza la acción</param>
        /// <returns>DTO de la máquina actualizada</returns>
        Task<MaquinaDto> UpdateEstadoAsync(int id, UpdateMaquinaEstadoDto estadoDto, int userId);

        /// <summary>
        /// Eliminar una máquina por su ID
        /// </summary>
        /// <param name="id">ID de la máquina a eliminar</param>
        /// <returns>True si se eliminó correctamente</returns>
        Task<bool> DeleteAsync(int id);

        /// <summary>
        /// Obtener estadísticas generales de máquinas
        /// </summary>
        /// <returns>DTO con estadísticas de máquinas</returns>
        Task<MaquinaEstadisticasDto> GetEstadisticasAsync();

        /// <summary>
        /// Validar si una orden SAP ya existe
        /// </summary>
        /// <param name="otSap">Número de orden SAP</param>
        /// <param name="excludeId">ID a excluir de la validación (para actualizaciones)</param>
        /// <returns>True si la orden SAP ya existe</returns>
        Task<bool> ValidateOtSapExistsAsync(string otSap, int? excludeId = null);

        /// <summary>
        /// Cambiar el estado de una máquina con validaciones de negocio
        /// </summary>
        /// <param name="id">ID de la máquina</param>
        /// <param name="nuevoEstado">Nuevo estado</param>
        /// <param name="observaciones">Observaciones (requerido para SUSPENDIDO)</param>
        /// <param name="userId">ID del usuario que realiza la acción</param>
        /// <returns>DTO de la máquina actualizada</returns>
        Task<MaquinaDto> CambiarEstadoAsync(int id, string nuevoEstado, string? observaciones, int userId);
    }

    /// <summary>
    /// DTO para estadísticas de máquinas
    /// </summary>
    public class MaquinaEstadisticasDto
    {
        /// <summary>
        /// Total de máquinas registradas
        /// </summary>
        public int TotalMaquinas { get; set; }

        /// <summary>
        /// Estadísticas por estado
        /// </summary>
        public Dictionary<string, int> PorEstado { get; set; } = new();

        /// <summary>
        /// Estadísticas por número de máquina
        /// </summary>
        public Dictionary<int, int> PorNumeroMaquina { get; set; } = new();

        /// <summary>
        /// Números de máquinas activas (con registros)
        /// </summary>
        public List<int> MaquinasActivas { get; set; } = new();

        /// <summary>
        /// Fecha de la última actualización
        /// </summary>
        public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;
    }
}