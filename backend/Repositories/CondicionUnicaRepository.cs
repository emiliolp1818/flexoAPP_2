// ===== IMPLEMENTACIÓN DEL REPOSITORIO DE CONDICIÓN ÚNICA =====
// Implementa las operaciones de acceso a datos para Condición Única
// Utiliza Entity Framework Core para interactuar con la base de datos

using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Repositories
{
    /// <summary>
    /// Implementación del repositorio de Condición Única
    /// Proporciona acceso a datos para la entidad CondicionUnica
    /// </summary>
    public class CondicionUnicaRepository : ICondicionUnicaRepository
    {
        // Contexto de base de datos inyectado
        private readonly FlexoAPPDbContext _context;

        /// <summary>
        /// Constructor del repositorio
        /// </summary>
        /// <param name="context">Contexto de base de datos</param>
        public CondicionUnicaRepository(FlexoAPPDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtener todos los registros de Condición Única
        /// Ordenados por fecha de última modificación descendente
        /// </summary>
        /// <returns>Lista de todos los registros</returns>
        public async Task<IEnumerable<CondicionUnica>> GetAllAsync()
        {
            try
            {
                // Obtener todos los registros ordenados por última modificación
                return await _context.CondicionUnica
                    .OrderByDescending(c => c.LastModified)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                // Log del error y retornar lista vacía en caso de fallo
                Console.WriteLine($"Error accessing condicionunica table: {ex.Message}");
                return new List<CondicionUnica>();
            }
        }

        /// <summary>
        /// Obtener un registro específico por ID
        /// </summary>
        /// <param name="id">ID del registro a buscar</param>
        /// <returns>Registro encontrado o null si no existe</returns>
        public async Task<CondicionUnica?> GetByIdAsync(int id)
        {
            // Buscar registro por ID
            return await _context.CondicionUnica
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        /// <summary>
        /// Buscar registros por F Artículo
        /// Búsqueda case-insensitive que contiene el término
        /// </summary>
        /// <param name="fArticulo">Código del artículo F a buscar</param>
        /// <returns>Lista de registros que coinciden con el F Artículo</returns>
        public async Task<IEnumerable<CondicionUnica>> SearchByFArticuloAsync(string fArticulo)
        {
            try
            {
                // Convertir término de búsqueda a minúsculas para búsqueda case-insensitive
                var searchTerm = fArticulo.ToLower();
                
                // Buscar registros que contengan el término en F Artículo
                return await _context.CondicionUnica
                    .Where(c => c.FArticulo.ToLower().Contains(searchTerm))
                    .OrderByDescending(c => c.LastModified)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                // Log del error y retornar lista vacía en caso de fallo
                Console.WriteLine($"Error searching condicionunica: {ex.Message}");
                return new List<CondicionUnica>();
            }
        }

        /// <summary>
        /// Crear un nuevo registro de Condición Única
        /// Establece automáticamente las fechas de creación y modificación
        /// </summary>
        /// <param name="condicion">Datos del nuevo registro</param>
        /// <returns>Registro creado con ID generado</returns>
        public async Task<CondicionUnica> CreateAsync(CondicionUnica condicion)
        {
            // Establecer fechas de creación y modificación
            condicion.CreatedDate = DateTime.UtcNow;
            condicion.LastModified = DateTime.UtcNow;
            
            // Agregar registro al contexto
            _context.CondicionUnica.Add(condicion);
            
            // Guardar cambios en la base de datos
            await _context.SaveChangesAsync();
            
            // Retornar el registro creado con ID generado
            return condicion;
        }

        /// <summary>
        /// Actualizar un registro existente
        /// Actualiza automáticamente la fecha de última modificación
        /// </summary>
        /// <param name="condicion">Datos actualizados del registro</param>
        /// <returns>Registro actualizado</returns>
        public async Task<CondicionUnica> UpdateAsync(CondicionUnica condicion)
        {
            // Actualizar fecha de última modificación
            condicion.LastModified = DateTime.UtcNow;
            
            // Marcar entidad como modificada
            _context.Entry(condicion).State = EntityState.Modified;
            
            // Guardar cambios en la base de datos
            await _context.SaveChangesAsync();
            
            // Retornar el registro actualizado
            return condicion;
        }

        /// <summary>
        /// Eliminar un registro por ID
        /// </summary>
        /// <param name="id">ID del registro a eliminar</param>
        /// <returns>True si se eliminó correctamente, False si no existe</returns>
        public async Task<bool> DeleteAsync(int id)
        {
            // Buscar el registro por ID
            var condicion = await _context.CondicionUnica.FindAsync(id);
            
            // Si no existe, retornar false
            if (condicion == null)
                return false;

            // Eliminar el registro del contexto
            _context.CondicionUnica.Remove(condicion);
            
            // Guardar cambios en la base de datos
            await _context.SaveChangesAsync();
            
            // Retornar true indicando eliminación exitosa
            return true;
        }
    }
}
