using FlexoAPP.API.Models.Entities;
using FlexoAPP.API.Models.DTOs;

namespace FlexoAPP.API.Repositories
{
    public interface IDesignRepository
    {
        Task<IEnumerable<Design>> GetAllDesignsAsync();
        Task<Design?> GetDesignByIdAsync(int id);
        Task<Design?> GetDesignByArticleFAsync(string articleF);
        Task<Design> CreateDesignAsync(Design design);
        Task<Design> UpdateDesignAsync(Design design);
        Task<bool> DeleteDesignAsync(int id);
        Task<bool> DesignExistsAsync(int id);
        Task<bool> ArticleFExistsAsync(string articleF, int? excludeId = null);
        
        // Search and filtering
        Task<(IEnumerable<Design> designs, int totalCount)> SearchDesignsAsync(DesignSearchDto searchDto);
        Task<DesignStatsDto> GetDesignStatsAsync();
        
        // Bulk operations
        Task<IEnumerable<Design>> CreateMultipleDesignsAsync(IEnumerable<Design> designs);
        Task<bool> UpdateDesignStatusAsync(int id, string status, int modifiedBy);
        
        // Advanced queries
        Task<IEnumerable<Design>> GetDesignsByClientAsync(string client);

        Task<IEnumerable<Design>> GetDesignsByTypeAsync(string type);
        Task<IEnumerable<Design>> GetRecentDesignsAsync(int count = 10);
        Task<IEnumerable<string>> GetUniqueClientsAsync();

        Task<IEnumerable<string>> GetUniqueSubstratesAsync();
        Task<IEnumerable<Design>> GetTestDesignsAsync();
        
        // Massive data operations
        Task BulkInsertDesignsAsync(IEnumerable<Design> designs);
        Task<int> ClearAllDesignsAsync();
    }
}