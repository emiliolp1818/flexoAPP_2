using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;

namespace flexoAPP.Repositories
{
    public class MaquinaRepository : IMaquinaRepository
    {
        private readonly FlexoAPPDbContext _context;
        private readonly ILogger<MaquinaRepository> _logger;

        public MaquinaRepository(FlexoAPPDbContext context, ILogger<MaquinaRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Maquina>> GetAllAsync()
        {
            try
            {
                return await _context.Maquinas
                    // NOTA: Include comentado - no hay propiedades de navegación
                    // .Include(m => m.CreatedByUser)
                    // .Include(m => m.UpdatedByUser)
                    .OrderBy(m => m.NumeroMaquina)
                    .ThenBy(m => m.FechaTintaEnMaquina)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo todas las máquinas");
                throw;
            }
        }

        public async Task<Maquina?> GetByArticuloAsync(string articulo)
        {
            try
            {
                return await _context.Maquinas
                    // NOTA: Include comentado - no hay propiedades de navegación
                    // .Include(m => m.CreatedByUser)
                    // .Include(m => m.UpdatedByUser)
                    .FirstOrDefaultAsync(m => m.Articulo == articulo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo máquina con artículo {articulo}");
                throw;
            }
        }

        public async Task<IEnumerable<Maquina>> GetByNumeroMaquinaAsync(int numeroMaquina)
        {
            try
            {
                return await _context.Maquinas
                    // NOTA: Include comentado - no hay propiedades de navegación
                    // .Include(m => m.CreatedByUser)
                    // .Include(m => m.UpdatedByUser)
                    .Where(m => m.NumeroMaquina == numeroMaquina)
                    .OrderBy(m => m.FechaTintaEnMaquina)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo máquinas con número {numeroMaquina}");
                throw;
            }
        }

        public async Task<IEnumerable<Maquina>> GetByEstadoAsync(string estado)
        {
            try
            {
                return await _context.Maquinas
                    // NOTA: Include comentado - no hay propiedades de navegación
                    // .Include(m => m.CreatedByUser)
                    // .Include(m => m.UpdatedByUser)
                    .Where(m => m.Estado == estado)
                    .OrderBy(m => m.NumeroMaquina)
                    .ThenBy(m => m.FechaTintaEnMaquina)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo máquinas con estado {estado}");
                throw;
            }
        }

        public async Task<Maquina> CreateAsync(Maquina maquina)
        {
            try
            {
                maquina.CreatedAt = DateTime.UtcNow;
                maquina.UpdatedAt = DateTime.UtcNow;

                _context.Maquinas.Add(maquina);
                await _context.SaveChangesAsync();

                // Recargar con las relaciones
                return await GetByArticuloAsync(maquina.Articulo) ?? maquina;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creando máquina con artículo {maquina.Articulo}");
                throw;
            }
        }

        public async Task<Maquina> UpdateAsync(Maquina maquina)
        {
            try
            {
                maquina.UpdatedAt = DateTime.UtcNow;

                _context.Maquinas.Update(maquina);
                await _context.SaveChangesAsync();

                // Recargar con las relaciones
                return await GetByArticuloAsync(maquina.Articulo) ?? maquina;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error actualizando máquina con artículo {maquina.Articulo}");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string articulo)
        {
            try
            {
                var maquina = await _context.Maquinas.FindAsync(articulo);
                if (maquina == null)
                    return false;

                _context.Maquinas.Remove(maquina);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error eliminando máquina con artículo {articulo}");
                throw;
            }
        }

        public async Task<bool> ExistsByArticuloAsync(string articulo)
        {
            try
            {
                return await _context.Maquinas.AnyAsync(m => m.Articulo == articulo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error verificando existencia de máquina con artículo {articulo}");
                throw;
            }
        }
    }
}
