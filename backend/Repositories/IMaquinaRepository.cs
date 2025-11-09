using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Repositories
{
    /// <summary>
    /// Interfaz del repositorio para la entidad Maquina
    /// Define las operaciones de acceso a datos para la tabla 'maquinas'
    /// </summary>
    public interface IMaquinaRepository
    {
        /// <summary>
        /// Obtener todas las máquinas ordenadas por fecha de tinta en máquina (más reciente primero)
        /// </summary>
        /// <returns>Lista de todas las máquinas</returns>
        Task<IEnumerable<Maquina>> GetAllAsync();

        /// <summary>
        /// Obtener una máquina por su ID
        /// </summary>
        /// <param name="id">ID de la máquina</param>
        /// <returns>Máquina encontrada o null si no existe</returns>
        Task<Maquina?> GetByIdAsync(int id);

        /// <summary>
        /// Obtener todas las máquinas de un número específico (11-21)
        /// Ordenadas por fecha de tinta en máquina descendente
        /// </summary>
        /// <param name="numeroMaquina">Número de la máquina (11-21)</param>
        /// <returns>Lista de máquinas del número especificado</returns>
        Task<IEnumerable<Maquina>> GetByNumeroMaquinaAsync(int numeroMaquina);

        /// <summary>
        /// Obtener máquinas por estado específico
        /// </summary>
        /// <param name="estado">Estado a filtrar (LISTO, CORRIENDO, SUSPENDIDO, TERMINADO)</param>
        /// <returns>Lista de máquinas con el estado especificado</returns>
        Task<IEnumerable<Maquina>> GetByEstadoAsync(string estado);

        /// <summary>
        /// Obtener máquinas por cliente
        /// </summary>
        /// <param name="cliente">Nombre del cliente</param>
        /// <returns>Lista de máquinas del cliente especificado</returns>
        Task<IEnumerable<Maquina>> GetByClienteAsync(string cliente);

        /// <summary>
        /// Obtener máquinas por orden SAP
        /// </summary>
        /// <param name="otSap">Número de orden SAP</param>
        /// <returns>Máquina con la orden SAP especificada o null</returns>
        Task<Maquina?> GetByOtSapAsync(string otSap);

        /// <summary>
        /// Obtener máquinas por rango de fechas de tinta en máquina
        /// </summary>
        /// <param name="fechaInicio">Fecha de inicio del rango</param>
        /// <param name="fechaFin">Fecha de fin del rango</param>
        /// <returns>Lista de máquinas en el rango de fechas</returns>
        Task<IEnumerable<Maquina>> GetByFechaRangeAsync(DateTime fechaInicio, DateTime fechaFin);

        /// <summary>
        /// Obtener números de máquinas que tienen registros activos
        /// </summary>
        /// <returns>Lista de números de máquinas con registros</returns>
        Task<IEnumerable<int>> GetNumerosMaquinasConRegistrosAsync();

        /// <summary>
        /// Crear una nueva máquina
        /// </summary>
        /// <param name="maquina">Entidad máquina a crear</param>
        /// <returns>Máquina creada con ID asignado</returns>
        Task<Maquina> CreateAsync(Maquina maquina);

        /// <summary>
        /// Actualizar una máquina existente
        /// </summary>
        /// <param name="maquina">Entidad máquina con datos actualizados</param>
        /// <returns>Máquina actualizada</returns>
        Task<Maquina> UpdateAsync(Maquina maquina);

        /// <summary>
        /// Actualizar solo el estado de una máquina
        /// </summary>
        /// <param name="id">ID de la máquina</param>
        /// <param name="nuevoEstado">Nuevo estado</param>
        /// <param name="observaciones">Observaciones adicionales (opcional)</param>
        /// <param name="userId">ID del usuario que realiza la acción</param>
        /// <returns>Máquina actualizada</returns>
        Task<Maquina> UpdateEstadoAsync(int id, string nuevoEstado, string? observaciones, int? userId);

        /// <summary>
        /// Eliminar una máquina por su ID
        /// </summary>
        /// <param name="id">ID de la máquina a eliminar</param>
        /// <returns>True si se eliminó correctamente</returns>
        Task<bool> DeleteAsync(int id);

        /// <summary>
        /// Verificar si existe una máquina con una orden SAP específica
        /// </summary>
        /// <param name="otSap">Número de orden SAP</param>
        /// <param name="excludeId">ID a excluir de la búsqueda (para actualizaciones)</param>
        /// <returns>True si existe una máquina con esa orden SAP</returns>
        Task<bool> ExistsOtSapAsync(string otSap, int? excludeId = null);

        /// <summary>
        /// Obtener estadísticas de máquinas por estado
        /// </summary>
        /// <returns>Diccionario con conteo por estado</returns>
        Task<Dictionary<string, int>> GetEstadisticasPorEstadoAsync();

        /// <summary>
        /// Obtener estadísticas de máquinas por número de máquina
        /// </summary>
        /// <returns>Diccionario con conteo por número de máquina</returns>
        Task<Dictionary<int, int>> GetEstadisticasPorNumeroMaquinaAsync();
    }
}