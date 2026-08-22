using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;
using FlexoAPP.API.Helpers;

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



                    .FirstOrDefaultAsync(m => m.Articulo == articulo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo máquina con artículo {articulo}");
                throw;
            }
        }

        public async Task<Maquina?> GetByOtSapAsync(string otSap)
        {
            try
            {
                return await _context.Maquinas
                    .FirstOrDefaultAsync(m => m.OtSap == otSap);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo máquina con OT SAP {otSap}");
                throw;
            }
        }

        public async Task<IEnumerable<Maquina>> GetByNumeroMaquinaAsync(int numeroMaquina)
        {
            try
            {
                return await _context.Maquinas



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
                maquina.CreatedAt = DateTimeHelper.Now;
                maquina.UpdatedAt = DateTimeHelper.Now;

                _context.Maquinas.Add(maquina);
                await _context.SaveChangesAsync();


                return await GetByOtSapAsync(maquina.OtSap) ?? maquina;
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
                maquina.UpdatedAt = DateTimeHelper.Now;

                _context.Maquinas.Update(maquina);
                await _context.SaveChangesAsync();


                return await GetByOtSapAsync(maquina.OtSap) ?? maquina;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error actualizando máquina con artículo {maquina.Articulo}");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string otSap)
        {
            try
            {
                var maquina = await _context.Maquinas.FindAsync(otSap);
                if (maquina == null)
                    return false;

                _context.Maquinas.Remove(maquina);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error eliminando máquina con OT SAP {otSap}");
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
