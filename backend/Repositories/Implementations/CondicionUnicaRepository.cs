



using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Helpers;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Repositories
{




    public class CondicionUnicaRepository : ICondicionUnicaRepository
    {

        private readonly FlexoAPPDbContext _context;





        public CondicionUnicaRepository(FlexoAPPDbContext context)
        {
            _context = context;
        }






        public async Task<IEnumerable<CondicionUnica>> GetAllAsync()
        {
            try
            {

                return await _context.CondicionUnica
                    .OrderByDescending(c => c.LastModified)
                    .ToListAsync();
            }
            catch (Exception ex)
            {

                // Console.WriteLine($"Error accessing condicionunica table: {ex.Message}");
                return new List<CondicionUnica>();
            }
        }






        public async Task<CondicionUnica?> GetByIdAsync(int id)
        {

            return await _context.CondicionUnica
                .FirstOrDefaultAsync(c => c.Id == id);
        }







        public async Task<IEnumerable<CondicionUnica>> SearchByFArticuloAsync(string fArticulo)
        {
            try
            {

                var searchTerm = fArticulo.ToLower();


                return await _context.CondicionUnica
                    .Where(c => c.FArticulo.ToLower().Contains(searchTerm))
                    .OrderByDescending(c => c.LastModified)
                    .ToListAsync();
            }
            catch (Exception ex)
            {

                // Console.WriteLine($"Error searching condicionunica: {ex.Message}");
                return new List<CondicionUnica>();
            }
        }







        public async Task<CondicionUnica> CreateAsync(CondicionUnica condicion)
        {

            condicion.CreatedDate = DateTimeHelper.Now;
            condicion.LastModified = DateTimeHelper.Now;


            _context.CondicionUnica.Add(condicion);


            await _context.SaveChangesAsync();


            return condicion;
        }







        public async Task<CondicionUnica> UpdateAsync(CondicionUnica condicion)
        {

            condicion.LastModified = DateTimeHelper.Now;


            var existingEntity = _context.ChangeTracker.Entries<CondicionUnica>()
                .FirstOrDefault(e => e.Entity.Id == condicion.Id);
            if (existingEntity != null)
            {
                existingEntity.State = EntityState.Detached;
            }


            _context.Entry(condicion).State = EntityState.Modified;


            await _context.SaveChangesAsync();


            return condicion;
        }






        public async Task<bool> DeleteAsync(int id)
        {

            var condicion = await _context.CondicionUnica.FindAsync(id);


            if (condicion == null)
                return false;


            _context.CondicionUnica.Remove(condicion);


            await _context.SaveChangesAsync();


            return true;
        }








        public async Task<bool> ExistsByFArticuloAsync(string fArticulo, int? excludeId = null)
        {
            try
            {

                var normalizedFArticulo = fArticulo.Trim().ToUpper();


                var query = _context.CondicionUnica
                    .Where(c => c.FArticulo.ToUpper() == normalizedFArticulo);


                if (excludeId.HasValue)
                {
                    query = query.Where(c => c.Id != excludeId.Value);
                }


                return await query.AnyAsync();
            }
            catch (Exception ex)
            {

                // Console.WriteLine($"Error checking if F Artículo exists: {ex.Message}");
                return false;
            }
        }
    }
}

