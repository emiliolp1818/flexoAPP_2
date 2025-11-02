using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;
using FlexoAPP.API.Models.DTOs;
using System.Text.Json;

namespace FlexoAPP.API.Repositories
{
    public class DesignRepository : IDesignRepository
    {
        private readonly FlexoAPPDbContext _context;

        public DesignRepository(FlexoAPPDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Design>> GetAllDesignsAsync()
        {
            try
            {
                return await _context.Designs
                    .OrderByDescending(d => d.LastModified)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error accessing database: {ex.Message}");
                // Return empty list if database has issues
                return new List<Design>();
            }
        }

        public async Task<Design?> GetDesignByIdAsync(int id)
        {
            return await _context.Designs
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<Design?> GetDesignByArticleFAsync(string articleF)
        {
            return await _context.Designs
                .FirstOrDefaultAsync(d => d.ArticleF == articleF);
        }

        public async Task<Design> CreateDesignAsync(Design design)
        {
            design.CreatedDate = DateTime.UtcNow;
            design.LastModified = DateTime.UtcNow;
            
            _context.Designs.Add(design);
            await _context.SaveChangesAsync();
            
            // Reload with navigation properties
            return await GetDesignByIdAsync(design.Id) ?? design;
        }

        public async Task<Design> UpdateDesignAsync(Design design)
        {
            design.LastModified = DateTime.UtcNow;
            
            _context.Entry(design).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            
            // Reload with navigation properties
            return await GetDesignByIdAsync(design.Id) ?? design;
        }

        public async Task<bool> DeleteDesignAsync(int id)
        {
            var design = await _context.Designs.FindAsync(id);
            if (design == null)
                return false;

            _context.Designs.Remove(design);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DesignExistsAsync(int id)
        {
            return await _context.Designs.AnyAsync(d => d.Id == id);
        }

        public async Task<bool> ArticleFExistsAsync(string articleF, int? excludeId = null)
        {
            var query = _context.Designs.Where(d => d.ArticleF == articleF);
            
            if (excludeId.HasValue)
                query = query.Where(d => d.Id != excludeId.Value);
                
            return await query.AnyAsync();
        }

        public async Task<(IEnumerable<Design> designs, int totalCount)> SearchDesignsAsync(DesignSearchDto searchDto)
        {
            var query = _context.Designs.Include(d => d.CreatedBy).AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(searchDto.SearchTerm))
            {
                var searchTerm = searchDto.SearchTerm.ToLower();
                query = query.Where(d => 
                    (d.ArticleF ?? "").ToLower().Contains(searchTerm) ||
                    (d.Client ?? "").ToLower().Contains(searchTerm) ||
                    (d.Description ?? "").ToLower().Contains(searchTerm) ||
                    (d.Substrate ?? "").ToLower().Contains(searchTerm));
            }

            if (!string.IsNullOrEmpty(searchDto.Status))
            {
                query = query.Where(d => d.Status == searchDto.Status);
            }

            if (!string.IsNullOrEmpty(searchDto.Type))
            {
                query = query.Where(d => d.Type == searchDto.Type);
            }

            // Get total count before pagination
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = searchDto.SortBy?.ToLower() switch
            {
                "articlef" => searchDto.SortDirection?.ToLower() == "asc" 
                    ? query.OrderBy(d => d.ArticleF) 
                    : query.OrderByDescending(d => d.ArticleF),
                "client" => searchDto.SortDirection?.ToLower() == "asc" 
                    ? query.OrderBy(d => d.Client) 
                    : query.OrderByDescending(d => d.Client),
                "createddate" => searchDto.SortDirection?.ToLower() == "asc" 
                    ? query.OrderBy(d => d.CreatedDate) 
                    : query.OrderByDescending(d => d.CreatedDate),
                "substrate" => searchDto.SortDirection?.ToLower() == "asc" 
                    ? query.OrderBy(d => d.Substrate) 
                    : query.OrderByDescending(d => d.Substrate),
                _ => searchDto.SortDirection?.ToLower() == "asc" 
                    ? query.OrderBy(d => d.LastModified) 
                    : query.OrderByDescending(d => d.LastModified)
            };

            // Apply pagination
            var designs = await query
                .Skip((searchDto.Page - 1) * searchDto.PageSize)
                .Take(searchDto.PageSize)
                .ToListAsync();

            return (designs, totalCount);
        }

        public async Task<DesignStatsDto> GetDesignStatsAsync()
        {
            var totalDesigns = await _context.Designs.CountAsync();
            var activeDesigns = await _context.Designs.CountAsync(d => d.Status == "ACTIVO");
            var inactiveDesigns = await _context.Designs.CountAsync(d => d.Status == "INACTIVO");
            var laminaDesigns = await _context.Designs.CountAsync(d => d.Type == "LAMINA");
            var tubularDesigns = await _context.Designs.CountAsync(d => d.Type == "TUBULAR");
            var semitubularDesigns = await _context.Designs.CountAsync(d => d.Type == "SEMITUBULAR");
            var averageColors = totalDesigns > 0 
                ? await _context.Designs.AverageAsync(d => (double)(d.ColorCount ?? 0)) 
                : 0;

            return new DesignStatsDto
            {
                TotalDesigns = totalDesigns,
                ActiveDesigns = activeDesigns,
                InactiveDesigns = inactiveDesigns,
                LaminaDesigns = laminaDesigns,
                TubularDesigns = tubularDesigns,
                SemitubularDesigns = semitubularDesigns,
                AverageColors = Math.Round(averageColors, 2)
            };
        }

        public async Task<IEnumerable<Design>> CreateMultipleDesignsAsync(IEnumerable<Design> designs)
        {
            var designList = designs.ToList();
            var now = DateTime.UtcNow;
            
            foreach (var design in designList)
            {
                design.CreatedDate = now;
                design.LastModified = now;
            }
            
            _context.Designs.AddRange(designList);
            await _context.SaveChangesAsync();
            
            return designList;
        }

        public async Task<bool> UpdateDesignStatusAsync(int id, string status, int modifiedBy)
        {
            var design = await _context.Designs.FindAsync(id);
            if (design == null)
                return false;

            design.Status = status;
            design.LastModified = DateTime.UtcNow;
            design.CreatedByUserId = modifiedBy; // This should be ModifiedBy when we add that field
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Design>> GetDesignsByClientAsync(string client)
        {
            return await _context.Designs
                .Include(d => d.CreatedBy)
                .Where(d => (d.Client ?? "").ToLower().Contains(client.ToLower()))
                .OrderByDescending(d => d.LastModified)
                .ToListAsync();
        }



        public async Task<IEnumerable<Design>> GetDesignsByTypeAsync(string type)
        {
            return await _context.Designs
                .Include(d => d.CreatedBy)
                .Where(d => d.Type == type)
                .OrderByDescending(d => d.LastModified)
                .ToListAsync();
        }

        public async Task<IEnumerable<Design>> GetRecentDesignsAsync(int count = 10)
        {
            return await _context.Designs
                .Include(d => d.CreatedBy)
                .OrderByDescending(d => d.LastModified)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<string>> GetUniqueClientsAsync()
        {
            return await _context.Designs
                .Where(d => d.Client != null)
                .Select(d => d.Client!)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();
        }



        public async Task<IEnumerable<string>> GetUniqueSubstratesAsync()
        {
            return await _context.Designs
                .Where(d => d.Substrate != null)
                .Select(d => d.Substrate!)
                .Distinct()
                .OrderBy(s => s)
                .ToListAsync();
        }

        public async Task<IEnumerable<Design>> GetTestDesignsAsync()
        {
            return await _context.Designs
                .Where(d => (d.ArticleF ?? "").StartsWith("SIMPLE") || (d.ArticleF ?? "").StartsWith("TEST"))
                .ToListAsync();
        }

        public async Task BulkInsertDesignsAsync(IEnumerable<Design> designs)
        {
            try
            {
                var designsList = designs.ToList();
                
                // Obtener IDs existentes para evitar duplicados
                var idsToCheck = designsList.Where(d => d.Id > 0).Select(d => d.Id).ToList();
                var existingIds = new HashSet<int>();
                
                if (idsToCheck.Any())
                {
                    existingIds = (await _context.Designs
                        .Where(d => idsToCheck.Contains(d.Id))
                        .Select(d => d.Id)
                        .ToListAsync()).ToHashSet();
                }

                var designsToInsert = new List<Design>();
                var designsToUpdate = new List<Design>();

                foreach (var design in designsList)
                {
                    if (design.Id > 0 && existingIds.Contains(design.Id))
                    {
                        // Actualizar diseño existente
                        designsToUpdate.Add(design);
                    }
                    else
                    {
                        // Insertar nuevo diseño
                        designsToInsert.Add(design);
                    }
                }

                // Insertar nuevos diseños
                if (designsToInsert.Any())
                {
                    await _context.Designs.AddRangeAsync(designsToInsert);
                }

                // Actualizar diseños existentes
                foreach (var design in designsToUpdate)
                {
                    var existingDesign = await _context.Designs.FindAsync(design.Id);
                    if (existingDesign != null)
                    {
                        _context.Entry(existingDesign).CurrentValues.SetValues(design);
                    }
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error during bulk insert: {ex.Message}", ex);
            }
        }

        public async Task<int> ClearAllDesignsAsync()
        {
            try
            {
                var allDesigns = await _context.Designs.ToListAsync();
                var count = allDesigns.Count;
                
                if (count > 0)
                {
                    _context.Designs.RemoveRange(allDesigns);
                    await _context.SaveChangesAsync();
                }
                
                return count;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error clearing all designs: {ex.Message}", ex);
            }
        }
    }
}