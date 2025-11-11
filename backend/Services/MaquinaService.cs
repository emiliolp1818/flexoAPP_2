using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Services
{
    public class MaquinaService
    {
        private readonly FlexoAPPDbContext _context;

        public MaquinaService(FlexoAPPDbContext context)
        {
            _context = context;
        }

        public async Task<List<Maquina>> GetAllMaquinasAsync()
        {
            return await _context.Maquinas
                .Include(m => m.CreatedByUser)
                .Include(m => m.UpdatedByUser)
                .OrderBy(m => m.NumeroMaquina)
                .ToListAsync();
        }

        public async Task<Maquina?> GetMaquinaByArticuloAsync(string articulo)
        {
            return await _context.Maquinas
                .Include(m => m.CreatedByUser)
                .Include(m => m.UpdatedByUser)
                .FirstOrDefaultAsync(m => m.Articulo == articulo);
        }
    }
}