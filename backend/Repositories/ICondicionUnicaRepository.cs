// ===== INTERFAZ DEL REPOSITORIO DE CONDICIÓN ÚNICA =====
// Define el contrato para las operaciones de acceso a datos de Condición Única
// Proporciona métodos CRUD y búsqueda por F Artículo

using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Repositories
{
    /// <summary>
    /// Interfaz del repositorio de Condición Única
    /// Define las operaciones de acceso a datos para la entidad CondicionUnica
    /// </summary>
    public interface ICondicionUnicaRepository
    {
        /// <summary>
        /// Obtener todos los registros de Condición Única
        /// </summary>
        /// <returns>Lista de todos los registros</returns>
        Task<IEnumerable<CondicionUnica>> GetAllAsync();
        
        /// <summary>
        /// Obtener un registro específico por ID
        /// </summary>
        /// <param name="id">ID del registro a buscar</param>
        /// <returns>Registro encontrado o null si no existe</returns>
        Task<CondicionUnica?> GetByIdAsync(int id);
        
        /// <summary>
        /// Buscar registros por F Artículo
        /// </summary>
        /// <param name="fArticulo">Código del artículo F a buscar</param>
        /// <returns>Lista de registros que coinciden con el F Artículo</returns>
        Task<IEnumerable<CondicionUnica>> SearchByFArticuloAsync(string fArticulo);
        
        /// <summary>
        /// Crear un nuevo registro de Condición Única
        /// </summary>
        /// <param name="condicion">Datos del nuevo registro</param>
        /// <returns>Registro creado con ID generado</returns>
        Task<CondicionUnica> CreateAsync(CondicionUnica condicion);
        
        /// <summary>
        /// Actualizar un registro existente
        /// </summary>
        /// <param name="condicion">Datos actualizados del registro</param>
        /// <returns>Registro actualizado</returns>
        Task<CondicionUnica> UpdateAsync(CondicionUnica condicion);
        
        /// <summary>
        /// Eliminar un registro por ID
        /// </summary>
        /// <param name="id">ID del registro a eliminar</param>
        /// <returns>True si se eliminó correctamente, False si no existe</returns>
        Task<bool> DeleteAsync(int id);
    }
}
