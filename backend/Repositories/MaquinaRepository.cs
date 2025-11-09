using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Repositories
{
    /// <summary>
    /// Implementación del repositorio para la entidad Maquina
    /// Maneja todas las operaciones de acceso a datos para la tabla 'maquinas'
    /// </summary>
    public class MaquinaRepository : IMaquinaRepository
    {
        private readonly FlexoAPPDbContext _context;

        /// <summary>
        /// Constructor del repositorio de máquinas
        /// </summary>
        /// <param name="context">Contexto de base de datos</param>
        public MaquinaRepository(FlexoAPPDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtener todas las máquinas ordenadas por fecha de tinta en máquina (más reciente primero)
        /// Incluye información de usuarios que crearon y actualizaron los registros
        /// </summary>
        /// <returns>Lista de todas las máquinas</returns>
        public async Task<IEnumerable<Maquina>> GetAllAsync()
        {
            return await _context.Maquinas
                .Include(m => m.CreatedByUser) // Incluir información del usuario que creó
                .Include(m => m.UpdatedByUser) // Incluir información del usuario que actualizó
                .OrderByDescending(m => m.FechaTintaEnMaquina) // Ordenar por fecha más reciente primero
                .ToListAsync();
        }

        /// <summary>
        /// Obtener una máquina por su ID con información de usuarios relacionados
        /// </summary>
        /// <param name="id">ID de la máquina</param>
        /// <returns>Máquina encontrada o null si no existe</returns>
        public async Task<Maquina?> GetByIdAsync(int id)
        {
            return await _context.Maquinas
                .Include(m => m.CreatedByUser) // Incluir información del usuario que creó
                .Include(m => m.UpdatedByUser) // Incluir información del usuario que actualizó
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        /// <summary>
        /// Obtener todas las máquinas de un número específico (11-21)
        /// Ordenadas por fecha de tinta en máquina descendente
        /// </summary>
        /// <param name="numeroMaquina">Número de la máquina (11-21)</param>
        /// <returns>Lista de máquinas del número especificado</returns>
        public async Task<IEnumerable<Maquina>> GetByNumeroMaquinaAsync(int numeroMaquina)
        {
            return await _context.Maquinas
                .Include(m => m.CreatedByUser) // Incluir información del usuario que creó
                .Include(m => m.UpdatedByUser) // Incluir información del usuario que actualizó
                .Where(m => m.NumeroMaquina == numeroMaquina) // Filtrar por número de máquina
                .OrderByDescending(m => m.FechaTintaEnMaquina) // Ordenar por fecha más reciente primero
                .ToListAsync();
        }

        /// <summary>
        /// Obtener máquinas por estado específico
        /// </summary>
        /// <param name="estado">Estado a filtrar (LISTO, CORRIENDO, SUSPENDIDO, TERMINADO)</param>
        /// <returns>Lista de máquinas con el estado especificado</returns>
        public async Task<IEnumerable<Maquina>> GetByEstadoAsync(string estado)
        {
            return await _context.Maquinas
                .Include(m => m.CreatedByUser) // Incluir información del usuario que creó
                .Include(m => m.UpdatedByUser) // Incluir información del usuario que actualizó
                .Where(m => m.Estado.ToUpper() == estado.ToUpper()) // Filtrar por estado (case insensitive)
                .OrderByDescending(m => m.FechaTintaEnMaquina) // Ordenar por fecha más reciente primero
                .ToListAsync();
        }

        /// <summary>
        /// Obtener máquinas por cliente
        /// </summary>
        /// <param name="cliente">Nombre del cliente</param>
        /// <returns>Lista de máquinas del cliente especificado</returns>
        public async Task<IEnumerable<Maquina>> GetByClienteAsync(string cliente)
        {
            return await _context.Maquinas
                .Include(m => m.CreatedByUser) // Incluir información del usuario que creó
                .Include(m => m.UpdatedByUser) // Incluir información del usuario que actualizó
                .Where(m => m.Cliente.ToLower().Contains(cliente.ToLower())) // Búsqueda parcial case insensitive
                .OrderByDescending(m => m.FechaTintaEnMaquina) // Ordenar por fecha más reciente primero
                .ToListAsync();
        }

        /// <summary>
        /// Obtener máquina por orden SAP específica
        /// </summary>
        /// <param name="otSap">Número de orden SAP</param>
        /// <returns>Máquina con la orden SAP especificada o null</returns>
        public async Task<Maquina?> GetByOtSapAsync(string otSap)
        {
            return await _context.Maquinas
                .Include(m => m.CreatedByUser) // Incluir información del usuario que creó
                .Include(m => m.UpdatedByUser) // Incluir información del usuario que actualizó
                .FirstOrDefaultAsync(m => m.OtSap == otSap); // Búsqueda exacta por orden SAP
        }

        /// <summary>
        /// Obtener máquinas por rango de fechas de tinta en máquina
        /// </summary>
        /// <param name="fechaInicio">Fecha de inicio del rango</param>
        /// <param name="fechaFin">Fecha de fin del rango</param>
        /// <returns>Lista de máquinas en el rango de fechas</returns>
        public async Task<IEnumerable<Maquina>> GetByFechaRangeAsync(DateTime fechaInicio, DateTime fechaFin)
        {
            return await _context.Maquinas
                .Include(m => m.CreatedByUser) // Incluir información del usuario que creó
                .Include(m => m.UpdatedByUser) // Incluir información del usuario que actualizó
                .Where(m => m.FechaTintaEnMaquina >= fechaInicio && m.FechaTintaEnMaquina <= fechaFin) // Filtrar por rango de fechas
                .OrderByDescending(m => m.FechaTintaEnMaquina) // Ordenar por fecha más reciente primero
                .ToListAsync();
        }

        /// <summary>
        /// Obtener números de máquinas que tienen registros activos
        /// </summary>
        /// <returns>Lista de números de máquinas con registros</returns>
        public async Task<IEnumerable<int>> GetNumerosMaquinasConRegistrosAsync()
        {
            return await _context.Maquinas
                .Select(m => m.NumeroMaquina) // Seleccionar solo el número de máquina
                .Distinct() // Eliminar duplicados
                .OrderBy(n => n) // Ordenar ascendente (11, 12, 13, ...)
                .ToListAsync();
        }

        /// <summary>
        /// Crear una nueva máquina en la base de datos
        /// </summary>
        /// <param name="maquina">Entidad máquina a crear</param>
        /// <returns>Máquina creada con ID asignado</returns>
        public async Task<Maquina> CreateAsync(Maquina maquina)
        {
            // Establecer fechas de auditoría
            maquina.CreatedAt = DateTime.UtcNow;
            maquina.UpdatedAt = DateTime.UtcNow;
            maquina.LastActionAt = DateTime.UtcNow;

            // Agregar la entidad al contexto
            _context.Maquinas.Add(maquina);
            
            // Guardar cambios en la base de datos
            await _context.SaveChangesAsync();
            
            // Recargar la entidad con las propiedades de navegación
            await _context.Entry(maquina)
                .Reference(m => m.CreatedByUser)
                .LoadAsync();
            await _context.Entry(maquina)
                .Reference(m => m.UpdatedByUser)
                .LoadAsync();

            return maquina;
        }

        /// <summary>
        /// Actualizar una máquina existente
        /// </summary>
        /// <param name="maquina">Entidad máquina con datos actualizados</param>
        /// <returns>Máquina actualizada</returns>
        public async Task<Maquina> UpdateAsync(Maquina maquina)
        {
            // Actualizar fecha de modificación
            maquina.UpdatedAt = DateTime.UtcNow;
            maquina.LastActionAt = DateTime.UtcNow;

            // Marcar la entidad como modificada
            _context.Entry(maquina).State = EntityState.Modified;
            
            // Guardar cambios en la base de datos
            await _context.SaveChangesAsync();
            
            // Recargar la entidad con las propiedades de navegación
            await _context.Entry(maquina)
                .Reference(m => m.CreatedByUser)
                .LoadAsync();
            await _context.Entry(maquina)
                .Reference(m => m.UpdatedByUser)
                .LoadAsync();

            return maquina;
        }

        /// <summary>
        /// Actualizar solo el estado de una máquina
        /// Método optimizado para cambios de estado frecuentes
        /// </summary>
        /// <param name="id">ID de la máquina</param>
        /// <param name="nuevoEstado">Nuevo estado</param>
        /// <param name="observaciones">Observaciones adicionales (opcional)</param>
        /// <param name="userId">ID del usuario que realiza la acción</param>
        /// <returns>Máquina actualizada</returns>
        public async Task<Maquina> UpdateEstadoAsync(int id, string nuevoEstado, string? observaciones, int? userId)
        {
            // Buscar la máquina por ID
            var maquina = await GetByIdAsync(id);
            if (maquina == null)
            {
                throw new ArgumentException($"No se encontró la máquina con ID {id}");
            }

            // Actualizar solo los campos necesarios
            maquina.Estado = nuevoEstado.ToUpper();
            maquina.Observaciones = observaciones;
            maquina.UpdatedBy = userId;
            maquina.UpdatedAt = DateTime.UtcNow;
            maquina.LastActionAt = DateTime.UtcNow;

            // Guardar cambios
            await _context.SaveChangesAsync();

            // Recargar la entidad con las propiedades de navegación actualizadas
            await _context.Entry(maquina)
                .Reference(m => m.UpdatedByUser)
                .LoadAsync();

            return maquina;
        }

        /// <summary>
        /// Eliminar una máquina por su ID
        /// </summary>
        /// <param name="id">ID de la máquina a eliminar</param>
        /// <returns>True si se eliminó correctamente</returns>
        public async Task<bool> DeleteAsync(int id)
        {
            // Buscar la máquina por ID
            var maquina = await _context.Maquinas.FindAsync(id);
            if (maquina == null)
            {
                return false; // No se encontró la máquina
            }

            // Remover la entidad del contexto
            _context.Maquinas.Remove(maquina);
            
            // Guardar cambios en la base de datos
            await _context.SaveChangesAsync();
            
            return true; // Eliminación exitosa
        }

        /// <summary>
        /// Verificar si existe una máquina con una orden SAP específica
        /// Útil para validar duplicados antes de crear o actualizar
        /// </summary>
        /// <param name="otSap">Número de orden SAP</param>
        /// <param name="excludeId">ID a excluir de la búsqueda (para actualizaciones)</param>
        /// <returns>True si existe una máquina con esa orden SAP</returns>
        public async Task<bool> ExistsOtSapAsync(string otSap, int? excludeId = null)
        {
            var query = _context.Maquinas.Where(m => m.OtSap == otSap);
            
            // Excluir un ID específico si se proporciona (útil para actualizaciones)
            if (excludeId.HasValue)
            {
                query = query.Where(m => m.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        /// <summary>
        /// Obtener estadísticas de máquinas por estado
        /// Útil para dashboards y reportes
        /// </summary>
        /// <returns>Diccionario con conteo por estado</returns>
        public async Task<Dictionary<string, int>> GetEstadisticasPorEstadoAsync()
        {
            return await _context.Maquinas
                .GroupBy(m => m.Estado) // Agrupar por estado
                .Select(g => new { Estado = g.Key, Cantidad = g.Count() }) // Contar por grupo
                .ToDictionaryAsync(x => x.Estado, x => x.Cantidad); // Convertir a diccionario
        }

        /// <summary>
        /// Obtener estadísticas de máquinas por número de máquina
        /// Útil para ver la carga de trabajo por máquina
        /// </summary>
        /// <returns>Diccionario con conteo por número de máquina</returns>
        public async Task<Dictionary<int, int>> GetEstadisticasPorNumeroMaquinaAsync()
        {
            return await _context.Maquinas
                .GroupBy(m => m.NumeroMaquina) // Agrupar por número de máquina
                .Select(g => new { NumeroMaquina = g.Key, Cantidad = g.Count() }) // Contar por grupo
                .ToDictionaryAsync(x => x.NumeroMaquina, x => x.Cantidad); // Convertir a diccionario
        }
    }
}